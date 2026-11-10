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

describe("the generated top-bar shell on a phone", () => {
  const action = '  const actions: readonly BarAction[] = [{ key: "account", label: "Account", onSelect: () => undefined }];\n';
  const declared = "  const actions: readonly BarAction[] = [];\n";

  it("links the mark to the first screen and hands the band its phone menu", () => {
    const source = render("app-shell.top-bar.hbs", context);
    expect(source).toContain('home={{ href: "/", label: t("shell.home") }}');
    expect(source).toContain("phoneMenu={");
  });

  it("draws an action as a row in the phone sheet and as a button in the wide bar from the one declaration", () => {
    const source = render("app-shell.top-bar.hbs", context);
    expect(source).toContain(declared);
    expect(source.match(/actions\.map\(/g)).toHaveLength(2);
    const withAction = source.replace(declared, action);
    expect(check(withAction)).toEqual([]);
  });

  it("is a shape only the top-bar shell has: the menu-column shell draws the console's own phone shell", () => {
    const menuColumn = render("app-shell.hbs", context);
    expect(menuColumn).not.toContain("phoneMenu");
    expect(menuColumn).not.toContain("BarAction");
  });

  it("links the board frame's mark to the first screen as well", () => {
    const story = render("app-shell.top-bar.stories.hbs", { NamePascal: "Shell", storyTitle: "App/Shell" });
    expect(story).toContain('home={{ href: "/", label: "Go to the first screen" }}');
  });
});

describe("the generated console shell's services", () => {
  const parts = "    wrap: (shell) => shell,\n";
  const service =
    '    services: { title: "Related services", links: [{ key: "portal", label: "Portal", href: "https://portal.example.test/" }, { key: "mail", label: "Mail", href: undefined }] },\n';

  it("draws the services at the foot of the column, the rail and the phone sheet", () => {
    const source = render("app-shell.hbs", context);
    expect(source).toContain("readonly services?: ShellServices;");
    for (const layout of ["column", "rail", "sheet"]) {
      expect(source).toContain(`<ConsoleServiceLinks layout="${layout}" {...parts.services} />`);
    }
    expect(source.match(/foot=\{parts\.services \?/g)).toHaveLength(2);
  });

  it("compiles with a service declared, one of them unset", () => {
    const source = render("app-shell.hbs", context);
    expect(source).toContain(parts);
    const withService = source.replace(parts, `${parts}${service}`);
    expect(withService).toContain('key: "portal"');
    expect(check(withService)).toEqual([]);
  });

  it("is a shape only the menu-column shell has: the top-bar shell has no column to stand at the foot of", () => {
    const topBar = render("app-shell.top-bar.hbs", context);
    expect(topBar).not.toContain("ConsoleServiceLinks");
    expect(topBar).not.toContain("services");
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
