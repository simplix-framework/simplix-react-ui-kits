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
});
