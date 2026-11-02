import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { UIProvider } from "@simplix-react/ui";
import { describe, expect, it, vi } from "vitest";

import type { SettingsTile } from "./settings-tiles";

// The tiles' import graph reads the browser's storage when it loads, and this suite renders on the server.
vi.hoisted(() => {
  const items = new Map<string, string>();
  Object.assign(globalThis, {
    localStorage: { getItem: (key: string) => items.get(key) ?? null, setItem: (key: string, value: string) => void items.set(key, value), removeItem: (key: string) => void items.delete(key) },
  });
});
const { SettingsTiles } = await import("./settings-tiles");

const tiles: SettingsTile[] = [
  { key: "failed", label: "Failed jobs", value: 2, counted: true, href: "/jobs" },
  { key: "errors", label: "Server errors", value: 5, counted: true, href: "/errors" },
];
const row = (props: { collapsible?: boolean; folded?: boolean }) =>
  renderToStaticMarkup(createElement(UIProvider, { children: createElement(SettingsTiles, { tiles, title: "Needs attention", ...props }) }));

describe("a tile row that does not fold", () => {
  it("draws no fold control, no strip and no chips, and its tiles open even when asked to start folded", () => {
    const html = row({ collapsible: false, folded: true });
    expect(html).not.toContain("aria-expanded");
    expect(html).not.toContain("tiles-fold");
    expect(html).not.toContain("console-tile-chips");
    expect(html).toContain("Needs attention");
    expect(html).toContain("Failed jobs");
  });

  it("is the row's choice: by default the row folds and carries its control", () => {
    const html = row({});
    expect(html).toContain("aria-expanded");
    expect(html).toContain("tiles-fold");
  });
});
