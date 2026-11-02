import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { render, typecheck, virtualRoot } from "./template-typecheck";

/**
 * Each shell template holds its own parts (menu, brand, top bar, the routes drawn without the
 * window, the pages drawn for a refused self read) and compiles on its own, before and after a page
 * is named for a refusal.
 */

const context = { namespace: "shell", nameKebab: "shell", NamePascal: "Shell" };
const layout = join(virtualRoot, "apps", "app", "src", "app", "layouts", "root-layout.tsx");
const check = (source: string) => typecheck({ [layout]: source }, [layout]);

const variants = [
  { name: "console shell", template: "app-shell.hbs", namedAt: "export const SHELL_FRAME: ShellFrame = {\n", entry: "  refusalPages: { AUTH_IDENTITY_CONFLICT: HeldPage },\n", before: "export const SHELL_FRAME" },
  { name: "top-bar shell", template: "app-shell.top-bar.hbs", namedAt: "    wrap: (screen) => screen,\n", entry: "    refusalPages: { AUTH_IDENTITY_CONFLICT: HeldPage },\n", before: "export function useShellParts" },
] as const;

describe.each(variants)("the generated $name", ({ template, namedAt, entry, before }) => {
  it("compiles alone and reads no blocks file", () => {
    const source = render(template, context);
    expect(source).not.toContain(".blocks");
    expect(check(source)).toEqual([]);
  });

  it("compiles with a page named for a refused self read", () => {
    const source = render(template, context)
      .replace(namedAt, `${namedAt}${entry}`)
      .replace(before, `function HeldPage() {\n  return null;\n}\n\n${before}`);
    expect(source).toContain("AUTH_IDENTITY_CONFLICT: HeldPage");
    expect(check(source)).toEqual([]);
  });
});

describe.each(["auth-page.hbs", "error-page.hbs", "record-page.hbs", "dashboard-page.hbs", "static-page.hbs"])("the generated %s", (template) => {
  it("compiles alone as the whole page", () => {
    const page = join(virtualRoot, "apps", "app", "src", "pages", "thing", "page.tsx");
    const source = render(template, { NamePascal: "Thing", nameCamel: "thing", nameKebab: "thing", namespace: "common" });
    expect(source).not.toContain(".blocks");
    expect(typecheck({ [page]: source }, [page])).toEqual([]);
  });
});

describe("the generated dashboard-page.hbs and its story", () => {
  it("lets the page be as tall as its cards, in the page and in the frame", () => {
    const context = { NamePascal: "Thing", nameCamel: "thing", nameKebab: "thing", namespace: "common", storyTitle: "App/Thing" };
    expect(render("dashboard-page.hbs", context)).toContain('layout: "flow"');
    expect(render("dashboard-page.stories.hbs", context)).toContain('layout: "flow"');
  });

  it("lays the cards out in the span grid, in the page and in the frame", () => {
    const context = { NamePascal: "Thing", nameCamel: "thing", nameKebab: "thing", namespace: "common", storyTitle: "App/Thing" };
    for (const template of ["dashboard-page.hbs", "dashboard-page.stories.hbs"]) {
      const source = render(template, context);
      expect(source).toContain("<DashboardGrid>");
      expect(source).not.toContain("DashboardColumns");
    }
  });
});
