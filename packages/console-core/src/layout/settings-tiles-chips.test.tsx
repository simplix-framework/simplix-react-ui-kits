import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { UIProvider } from "@simplix-react/ui";
import { describe, expect, it, vi } from "vitest";

import type { SettingsTile, TileFilters } from "./settings-tiles";

// The tiles' import graph reads the browser's storage when it loads, and this suite renders on the server.
vi.hoisted(() => {
  const items = new Map<string, string>();
  Object.assign(globalThis, {
    localStorage: { getItem: (key: string) => items.get(key) ?? null, setItem: (key: string, value: string) => void items.set(key, value), removeItem: (key: string) => void items.delete(key) },
  });
});
const { SettingsTiles } = await import("./settings-tiles");

const tiles: SettingsTile[] = [
  { key: "failed", label: "Failed", value: 2, counted: true, filter: { field: "status", value: "FAILED" } },
  { key: "open", label: "Open", value: 5, counted: true, href: "/open-list" },
  { key: "rate", label: "Rate", value: "4%", counted: false },
];
const filters: TileFilters = { committedValues: {}, commitValues: () => undefined };

/** The folded row's chips: `folded` starts the row folded, and the chips are drawn whether or not they are reachable. */
function chips(withFilters: TileFilters | undefined): string {
  const out = renderToStaticMarkup(
    createElement(UIProvider, { children: createElement(SettingsTiles, { tiles, folded: true, title: "Summary", filters: withFilters }) }),
  );
  const start = out.indexOf('data-slot="console-tile-chips"');
  const end = out.indexOf("</div></div>", start);
  return out.slice(start, end);
}

describe("folded tile chips", () => {
  it("draws a chip that narrows the list as a pressed-state button, like its card", () => {
    const html = chips(filters);
    expect(html).toMatch(/<button[^>]*aria-pressed="false"[^>]*data-slot="console-tile-chip"[^>]*>(?:(?!<\/button>).)*Failed/s);
  });

  it("draws a chip that leads to a list as a link, like its card", () => {
    expect(chips(filters)).toMatch(/<a[^>]*href="\/open-list"[^>]*>(?:(?!<\/a>).)*Open/s);
  });

  it("draws a chip that is only a figure as plain text, not a control", () => {
    const html = chips(filters);
    expect(html).toMatch(/<span[^>]*data-slot="console-tile-chip"[^>]*>(?:(?!<\/span><\/span>).)*Rate/s);
    expect(html).not.toMatch(/<button[^>]*>(?:(?!<\/button>).)*Rate/s);
  });

  it("never draws a chip as a button that only unfolds the row", () => {
    const buttons = [...chips(undefined).matchAll(/<button\b/g)];
    // Without the list's filter state the narrowing tile has nothing to write, so no chip is a control.
    expect(buttons).toHaveLength(0);
  });

  it("marks only a chip that does nothing as unpressable, which a design draws with a not-allowed cursor", () => {
    const html = chips(filters);
    expect(html).toMatch(/<span[^>]*data-pressable="false"[^>]*>(?:(?!<\/span><\/span>).)*Rate/s);
    expect(html).not.toMatch(/<button[^>]*data-pressable="false"/);
    expect(html).not.toMatch(/<a[^>]*data-pressable="false"/);
  });
});

describe("tile cards", () => {
  /** The unfolded row's cards: the tile wrapper carries whether pressing it does anything. */
  function cards(withFilters: TileFilters | undefined): string {
    return renderToStaticMarkup(createElement(UIProvider, { children: createElement(SettingsTiles, { tiles, title: "Summary", filters: withFilters }) }));
  }

  it("marks a card that does nothing when pressed as unpressable", () => {
    const html = cards(filters);
    const wrappers = [...html.matchAll(/data-slot="console-tile"[^>]*/g)].map((m) => m[0]);
    expect(wrappers.filter((w) => w.includes('data-pressable="false"'))).toHaveLength(1);
    expect(wrappers.filter((w) => w.includes('data-pressable="true"'))).toHaveLength(2);
  });

  it("marks a narrowing card unpressable when the list's filter state is not handed in", () => {
    const wrappers = [...cards(undefined).matchAll(/data-slot="console-tile"[^>]*/g)].map((m) => m[0]);
    expect(wrappers.filter((w) => w.includes('data-pressable="false"'))).toHaveLength(2);
  });
});

describe("folds that are out of the keyboard's path", () => {
  /** The two fold wrappers of a titled row in document order: the chips' fold, then the cards' fold. */
  function folds(folded: boolean): string[] {
    const out = renderToStaticMarkup(
      createElement(UIProvider, { children: createElement(SettingsTiles, { tiles, folded, title: "Summary", filters }) }),
    );
    return [...out.matchAll(/<div[^>]*class="tiles-fold"[^>]*>/g)].map((m) => m[0]);
  }

  it("makes the hidden cards inert and leaves the chips reachable while the row is folded", () => {
    const [chipsFold, cardsFold] = folds(true);
    expect(chipsFold).not.toMatch(/\binert\b/);
    expect(cardsFold).toMatch(/\binert\b/);
    expect(cardsFold).toContain('aria-hidden="true"');
  });

  it("makes the hidden chips inert and leaves the cards reachable while the row is open", () => {
    const [chipsFold, cardsFold] = folds(false);
    expect(chipsFold).toMatch(/\binert\b/);
    expect(cardsFold).not.toMatch(/\binert\b/);
    expect(chipsFold).toContain('aria-hidden="true"');
  });
});

describe("the folded row's scroller", () => {
  it("leaves the keyboard halo of a chip room beside it, with a margin that keeps the row in place", () => {
    const html = renderToStaticMarkup(
      createElement(UIProvider, { children: createElement(SettingsTiles, { tiles, folded: true, title: "Summary", filters }) }),
    );
    const scroller = /<div class="([^"]*)"[^>]*data-slot="console-tile-chips"/.exec(html)?.[1] ?? "";
    expect(scroller).toContain("overflow-x-auto");
    expect(scroller).toContain("p-[var(--focus-gutter)]");
    expect(scroller).toContain("-m-[var(--focus-gutter)]");
  });
});
