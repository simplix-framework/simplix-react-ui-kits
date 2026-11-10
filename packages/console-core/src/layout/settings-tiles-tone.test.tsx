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
const { SettingsTiles } = await import("./settings-tiles");

/**
 * A figure drawn as words takes its tone's text grade, never the colour of the tone's icon, and a
 * figure nobody has counted takes no tone at all (an unread tile is not a warning).
 */
const tiles: SettingsTile[] = [
  { key: "ok", label: "Healthy", value: 12, counted: true, href: "/ok", tone: "success" },
  { key: "info", label: "Queued", value: 4, counted: true, href: "/info", tone: "info" },
  { key: "unread", label: "Failing", value: undefined, counted: true, href: "/failing", tone: "danger" },
  { key: "none", label: "Failed", value: 0, counted: true, href: "/none", tone: "danger" },
];

async function render(folded: boolean): Promise<string> {
  const adapter = new I18nextAdapter({
    defaultLocale: "en",
    fallbackLocale: "en",
    locales: [{ code: "en", name: "English", englishName: "English" }],
    resources: { en: {} },
  });
  await adapter.initialize();
  return renderToStaticMarkup(
    createElement(I18nProvider, { adapter, children: createElement(UIProvider, { children: createElement(SettingsTiles, { tiles, folded, title: "Summary" }) }) }),
  );
}

/** The figure of the chip labelled `label`, as the markup draws it. */
function chipFigure(html: string, label: string): string {
  const chip = new RegExp(`<span>${label}</span>(<span[^>]*>.*?</span>)`, "s").exec(html);
  return chip?.[1] ?? "";
}

describe("a folded row's chip figures", () => {
  it("draw a tone's text grade, not its icon colour", async () => {
    const html = await render(true);
    const success = chipFigure(html, "Healthy");
    expect(success).toContain("text-emerald-700");
    expect(success).not.toContain("text-emerald-500");
    const info = chipFigure(html, "Queued");
    expect(info).toContain("text-blue-700");
    expect(info).not.toContain("text-blue-500");
  });

  it("draw no tone for a figure nobody has counted, nor for a zero", async () => {
    const html = await render(true);
    for (const label of ["Failing", "Failed"]) {
      const figure = chipFigure(html, label);
      expect(figure, label).toContain('data-part-tone="none"');
      expect(figure, label).not.toMatch(/text-red-/);
    }
  });
});

describe("a card whose figure nobody has counted", () => {
  it("is not tinted, though the tile names a tone", async () => {
    const html = await render(false);
    expect(html).not.toMatch(/data-tinted="true"[^>]*>(?:(?!<\/div><\/div>).)*Failing/s);
    expect(html).toContain("Failing");
  });
});

describe("a card whose figure carries a unit", () => {
  it("draws the unit in the framework's own unit slot and adds no class of its own to keep it whole", async () => {
    const withUnit: SettingsTile[] = [{ key: "credits", label: "Credits", value: 126640, unit: "credits", counted: false }];
    const adapter = new I18nextAdapter({ defaultLocale: "en", fallbackLocale: "en", locales: [{ code: "en", name: "English", englishName: "English" }], resources: { en: {} } });
    await adapter.initialize();
    const html = renderToStaticMarkup(
      createElement(I18nProvider, { adapter, children: createElement(UIProvider, { children: createElement(SettingsTiles, { tiles: withUnit, title: "Summary" }) }) }),
    );
    // The unit stays in one piece through the framework's slot (see tests/kit/stat-card-unit.test.ts).
    expect(html).toMatch(/<span[^>]*data-slot="stat-card-unit"[^>]*>credits<\/span>/);
    expect(html).not.toContain("stat-card-unit]]:whitespace-nowrap");
  });
});
