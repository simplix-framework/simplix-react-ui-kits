import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { render, typecheck, virtualRoot } from "./template-typecheck";

/**
 * An app's `root-layout.blocks.tsx` is written once, so a key the kit's shell contract gains later
 * reaches a blocks file that never declared it, and the root layout that reads it must still
 * compile. These tests render both app-shell templates with their blocks templates and check them
 * with the compiler against the kit's own sources, with blocks files written before `refusalPages`
 * existed and with one that names a page.
 */

const context = { namespace: "shell", nameKebab: "shell", NamePascal: "Shell" };
const layoutDir = join(virtualRoot, "apps", "app", "src", "app", "layouts");

/**
 * Where each variant reads the key: the console shell from the blocks file's `SHELL_FRAME`, before
 * any of its blocks run; the top-bar shell from the blocks hook itself.
 */
const variants = [
  {
    name: "console shell",
    layout: "app-shell.hbs",
    blocks: "app-shell.blocks.hbs",
    widened: /const frame: [^=]+= SHELL_FRAME/,
    unwidened: "const frame = SHELL_FRAME",
    namedAt: "export const SHELL_FRAME: ShellFrame = {\n",
  },
  {
    name: "top-bar shell",
    layout: "app-shell.top-bar.hbs",
    blocks: "app-shell.top-bar.blocks.hbs",
    widened: /const blocks: [^=]+= useShellBlocks/,
    unwidened: "const blocks = useShellBlocks",
    namedAt: "    wrap: (",
  },
] as const;

/** The shipped blocks as they were before the key: no import of its type, no declaration of it. */
function blocksBeforeRefusalPages(blocksTemplate: string): string {
  const source = render(blocksTemplate, context)
    .replace(", type ShellRefusalPages", "")
    .replace(/\n {2}\/\*\*\n(?: {3}\*[^\n]*\n)+? {3}\*\/\n {2}readonly refusalPages\?: ShellRefusalPages;\n/, "\n");
  expect(source).not.toContain("refusalPages");
  return source;
}

/** The shipped blocks, with the one key a page needs filled in. */
function blocksNamingAPage(blocksTemplate: string, namedAt: string): string {
  const source = render(blocksTemplate, context)
    .replace(namedAt, `${namedAt}${namedAt.startsWith(" ") ? "" : "  "}refusalPages: { AUTH_IDENTITY_CONFLICT: HeldPage },\n${namedAt.startsWith(" ") ? namedAt : ""}`)
    .replace(namedAt.startsWith(" ") ? `${namedAt}${namedAt}` : "\u0000", namedAt);
  const held = source.includes("export const SHELL_FRAME") ? "export const SHELL_FRAME" : "export function useShellBlocks";
  return withHeldPage(source, held);
}

function withHeldPage(source: string, before: string): string {
  const named = source.replace(before, `function HeldPage() {\n  return null;\n}\n\n${before}`);
  expect(named).toContain("refusalPages: {");
  return named;
}

function check(layoutSource: string, blocksSource: string): string[] {
  const layout = join(layoutDir, "root-layout.tsx");
  return typecheck({ [layout]: layoutSource, [join(layoutDir, "root-layout.blocks.tsx")]: blocksSource }, [layout]);
}

describe.each(variants)("the generated $name root layout", ({ layout, blocks, widened, unwidened, namedAt }) => {
  it("type-checks against the blocks stub the kit ships beside it", () => {
    expect(check(render(layout, context), render(blocks, context))).toEqual([]);
  });

  it("type-checks against a blocks file written before refusalPages existed", () => {
    expect(check(render(layout, context), blocksBeforeRefusalPages(blocks))).toEqual([]);
  });

  it("type-checks against a blocks file that names a page for a refusal", () => {
    expect(check(render(layout, context), blocksNamingAPage(blocks, namedAt))).toEqual([]);
  });

  it("is told apart from a layout that reads the key without widening the blocks type", () => {
    const source = render(layout, context);
    const narrowed = source.replace(widened, unwidened);
    expect(narrowed).not.toBe(source);

    const messages = check(narrowed, blocksBeforeRefusalPages(blocks));
    expect(messages.some((line) => line.includes("refusalPages"))).toBe(true);
  });

  it("returns the refusal screen before it picks a shell", () => {
    const source = render(layout, context);
    const refusal = source.indexOf("if (refusal) return refusal;");
    expect(refusal).toBeGreaterThan(0);
    expect(source.indexOf("<AuthLayout />")).toBeGreaterThan(refusal);
  });
});

describe("the generated console shell", () => {
  const source = render("app-shell.hbs", context);

  it("reads its blocks once, and only after the sign-in and refusal branches", () => {
    const calls = source.match(/useShellBlocks\(\)/g) ?? [];
    expect(calls).toHaveLength(1);
    expect(source.indexOf("useShellBlocks()")).toBeGreaterThan(source.indexOf("<AuthLayout />"));
  });

  it("draws the entries outside the groups in the column, on the rail and in the phone sheet", () => {
    expect(source).toContain("{blocks.tail?.map((entry) => (\n                <EntryRow");
    expect(source).toContain("entries: [entry] }} route={route} />");
    expect(source).toContain("const entries = [...blocks.menu.flatMap((group) => group.entries), ...tail];");
  });

  it("type-checks against blocks that name a tail entry and an inactive entry's mark", () => {
    const blocks = render("app-shell.blocks.hbs", context)
      .replace("    menu: [],", '    menu: [{ key: "g", label: "G", icon: Icon, entries: [{ key: "x", label: "X", icon: Icon, inactiveReason: "Not built", inactiveMark: null }] }],\n    tail: [{ key: "me", label: "Me", icon: Icon, href: "/me", phoneTab: "circle-user" }],')
      .replace("export function useShellBlocks", "function Icon() {\n  return null;\n}\n\nexport function useShellBlocks");
    expect(blocks).toContain("tail: [");
    expect(check(source, blocks)).toEqual([]);
  });
});
