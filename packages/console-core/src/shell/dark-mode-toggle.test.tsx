import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { UIProvider } from "@simplix-react/ui";
import { describe, expect, it, vi } from "vitest";

const scheme = vi.hoisted(() => ({ dark: false }));
vi.mock("./use-theme", () => ({ useTheme: () => ({ isDark: scheme.dark, toggleDarkMode: () => undefined }) }));

const { DarkModeToggle } = await import("./dark-mode-toggle");

const html = (dark: boolean) => {
  scheme.dark = dark;
  return renderToStaticMarkup(createElement(UIProvider, { children: createElement(DarkModeToggle) }));
};

describe("DarkModeToggle", () => {
  it("says whether the dark scheme is on, under a name that does not change", () => {
    const light = html(false);
    const dark = html(true);
    expect(light).toContain('aria-pressed="false"');
    expect(dark).toContain('aria-pressed="true"');
    const label = (out: string) => /aria-label="([^"]*)"/.exec(out)?.[1];
    expect(label(light)).toBe(label(dark));
  });
});
