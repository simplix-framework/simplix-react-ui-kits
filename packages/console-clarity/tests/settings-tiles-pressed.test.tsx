import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { UIProvider } from "@simplix-react/ui";
import { describe, expect, it, vi } from "vitest";

import type { SettingsTile, TileFilters } from "../../console-core/src/layout/settings-tiles";
import type { SlotStyle } from "@simplix-react/ui/design";

// The tiles' import graph reads the browser's storage when it loads, and this suite renders on the server.
vi.hoisted(() => {
  const items = new Map<string, string>();
  Object.assign(globalThis, {
    localStorage: { getItem: (key: string) => items.get(key) ?? null, setItem: (key: string, value: string) => void items.set(key, value), removeItem: (key: string) => void items.delete(key) },
  });
});
const { SettingsTiles } = await import("../../console-core/src/layout/settings-tiles");
const { default: clarityCss } = await import("../src/styles/designs/clarity-stylesheet");
const styles = await import("../../console-core/src/layout/settings-tiles.style");

const tiles: SettingsTile[] = [
  { key: "failed", label: "Failed", value: 2, counted: true, filter: { field: "status", value: "FAILED" } },
  { key: "open", label: "Open", value: 5, counted: true, filter: { field: "status", value: "OPEN" } },
];

/** The folded row's chip markup, the list standing on `committedValues`. */
function chips(committedValues: Record<string, unknown>): string[] {
  const filters: TileFilters = { committedValues, commitValues: () => undefined };
  const out = renderToStaticMarkup(createElement(UIProvider, { children: createElement(SettingsTiles, { tiles, folded: true, title: "Summary", filters }) }));
  return [...out.matchAll(/<button[^>]*data-slot="console-tile-chip"[^>]*>/g)].map((m) => m[0]);
}

describe("a folded chip the list stands on", () => {
  it("carries the pressed attribute a design draws its ring from, and only that chip", () => {
    const [failed, open] = chips({ "status.in": ["FAILED"] });
    expect(failed).toContain('aria-pressed="true"');
    expect(failed).toContain('data-pressed="true"');
    expect(open).toContain('aria-pressed="false"');
    expect(open).toContain('data-pressed="false"');
  });

  it("differs from the same chip unpressed in its markup", () => {
    const [pressed] = chips({ "status.in": ["FAILED"] });
    const [unpressed] = chips({});
    expect(pressed).not.toEqual(unpressed);
  });
});

/**
 * The slots in `declared` that draw no pressed look: a slot whose declaration has no `pressed` axis
 * or an empty pressed look, or, where a stylesheet is given, that holds no
 * `[data-slot="<slot>"][data-pressed="true"]` rule for it.
 */
function slotsWithoutPressedLook(declared: readonly SlotStyle[], css?: string): string[] {
  return declared
    .filter((style) => {
      const pressed = style.variants.pressed;
      if (!pressed || !pressed.true || pressed.true === pressed.false) return true;
      return css !== undefined && !css.includes(`[data-slot="${style.slot}"][data-pressed="true"]`);
    })
    .map((style) => style.slot);
}

describe("every pressable tile control draws a pressed look", () => {
  // A tile control is a card press or a folded chip: the controls that carry `aria-pressed` in this file.
  const controls = [styles.tilePressStyle, styles.tileChipStyle] as readonly SlotStyle[];

  // The classic stylesheet is generated from these declarations (`design:check` fails on drift), so the
  // declaration is what classic draws; the clarity stylesheet is read as compiled.
  it("declares one in the slot style the classic design draws from", () => {
    expect(slotsWithoutPressedLook(controls)).toEqual([]);
  });

  it("is in the compiled clarity stylesheet", () => {
    expect(slotsWithoutPressedLook(controls, clarityCss)).toEqual([]);
  });

  it("names a chip family that declares no pressed look, and one the stylesheet never draws", () => {
    const bare = { slot: "console-x-chip", base: "", variants: { pressable: { true: "", false: "" } }, defaultVariants: {} } satisfies SlotStyle;
    const empty = { ...bare, variants: { pressed: { true: "", false: "" } } } satisfies SlotStyle;
    const declared = { ...bare, variants: { pressed: { true: "ring-2", false: "" } } } satisfies SlotStyle;
    expect(slotsWithoutPressedLook([bare])).toEqual(["console-x-chip"]);
    expect(slotsWithoutPressedLook([empty])).toEqual(["console-x-chip"]);
    expect(slotsWithoutPressedLook([declared], "")).toEqual(["console-x-chip"]);
    expect(slotsWithoutPressedLook([declared], '[data-slot="console-x-chip"][data-pressed="true"] { }')).toEqual([]);
  });
});
