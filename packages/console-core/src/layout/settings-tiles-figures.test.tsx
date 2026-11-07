import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { I18nextAdapter } from "@simplix-react/i18n";
import { I18nProvider } from "@simplix-react/i18n/react";
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
const { SettingsTiles, tileFigure } = await import("./settings-tiles");

/**
 * A count over 999 reads grouped on a tile, as the list's total badge writes it, so a figure row and
 * the badge under it never say 「1156」 and 「1,188」 about the same list.
 */
const tiles: SettingsTile[] = [
  { key: "active", label: "Active", value: 1156, counted: true, href: "/active" },
  { key: "invited", label: "Invited", value: 12, counted: true, href: "/invited" },
  { key: "rate", label: "Rate", value: "4%", counted: false },
  { key: "days", label: "Window", value: 1200, unit: "d", counted: false },
];

async function render(locale: "en" | "ko", folded: boolean): Promise<string> {
  const adapter = new I18nextAdapter({
    defaultLocale: locale,
    fallbackLocale: "en",
    locales: [
      { code: "en", name: "English", englishName: "English" },
      { code: "ko", name: "한국어", englishName: "Korean" },
    ],
    resources: { en: {}, ko: {} },
  });
  await adapter.initialize();
  return renderToStaticMarkup(
    createElement(I18nProvider, { adapter, children: createElement(UIProvider, { children: createElement(SettingsTiles, { tiles, folded, title: "Summary" }) }) }),
  );
}

describe.each(["en", "ko"] as const)("a tile's figure in %s", (locale) => {
  it("groups a count over 999 on the card", async () => {
    const html = await render(locale, false);
    expect(html).toContain('aria-label="1,156"');
    expect(html).toContain('aria-label="12"');
    expect(html).not.toContain('aria-label="1156"');
  });

  it("groups it on the folded row's chips", async () => {
    const html = await render(locale, true);
    expect(html).toMatch(/data-slot="console-tile-chip"[^>]*>(?:(?!<\/span><\/span>).)*1,156/s);
    expect(html).toMatch(/data-slot="console-tile-chip"[^>]*>(?:(?!<\/span><\/span>).)*1,200d/s);
    expect(html).not.toMatch(/\b1156\b/);
  });

  it("groups it where the figure is composed, which the strip and its spoken line share", () => {
    expect(tileFigure({ key: "k", label: "K", value: 1188, counted: true, href: "/k" }, locale)).toBe("1,188");
    expect(tileFigure({ key: "k", label: "K", value: 1200, unit: "d", counted: true, href: "/k" }, locale)).toBe("1,200d");
  });
});

describe("a tile's figure that is not a number", () => {
  it("is drawn as the screen worded it", () => {
    expect(tileFigure({ key: "k", label: "K", value: "1156 of 2000", counted: false }, "en")).toBe("1156 of 2000");
  });
});
