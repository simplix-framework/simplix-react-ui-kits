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

const variants = [
  { name: "console shell", layout: "app-shell.hbs", blocks: "app-shell.blocks.hbs" },
  { name: "top-bar shell", layout: "app-shell.top-bar.hbs", blocks: "app-shell.top-bar.blocks.hbs" },
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
function blocksNamingAPage(blocksTemplate: string): string {
  const source = render(blocksTemplate, context).replace(
    "    wrap: (",
    "    refusalPages: { AUTH_IDENTITY_CONFLICT: HeldPage },\n    wrap: (",
  ).replace("export function useShellBlocks", "function HeldPage() {\n  return null;\n}\n\nexport function useShellBlocks");
  expect(source).toContain("refusalPages: {");
  return source;
}

function check(layoutSource: string, blocksSource: string): string[] {
  const layout = join(layoutDir, "root-layout.tsx");
  return typecheck({ [layout]: layoutSource, [join(layoutDir, "root-layout.blocks.tsx")]: blocksSource }, [layout]);
}

describe.each(variants)("the generated $name root layout", ({ layout, blocks }) => {
  it("type-checks against the blocks stub the kit ships beside it", () => {
    expect(check(render(layout, context), render(blocks, context))).toEqual([]);
  });

  it("type-checks against a blocks file written before refusalPages existed", () => {
    expect(check(render(layout, context), blocksBeforeRefusalPages(blocks))).toEqual([]);
  });

  it("type-checks against a blocks file that names a page for a refusal", () => {
    expect(check(render(layout, context), blocksNamingAPage(blocks))).toEqual([]);
  });

  it("is told apart from a layout that reads the key without widening the blocks type", () => {
    const widened = render(layout, context);
    const unwidened = widened.replace(/const blocks: [^=]+= useShellBlocks/, "const blocks = useShellBlocks");
    expect(unwidened).not.toBe(widened);

    const messages = check(unwidened, blocksBeforeRefusalPages(blocks));
    expect(messages.some((line) => line.includes("refusalPages"))).toBe(true);
  });

  it("returns the refusal screen before it picks a shell", () => {
    const source = render(layout, context);
    const refusal = source.indexOf("if (refusal) return refusal;");
    expect(refusal).toBeGreaterThan(0);
    expect(source.indexOf("<AuthLayout />")).toBeGreaterThan(refusal);
  });
});
