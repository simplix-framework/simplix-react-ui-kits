import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

/**
 * The keyboard stays visible under forced colors (Windows High Contrast) in every console part.
 *
 * <p>Forced colors replaces backgrounds with system colours and drops box-shadow, so the kit's
 * focus halo and the tints some parts use for focus disappear. The framework draws one outline on
 * every focused element for that case (`@simplix-react/ui`, `theme/base.css`), and a kit part that
 * removes the browser outline for its own halo is covered by it without saying so. The rule has two
 * ways to fail here, and this file holds both:
 *
 * <ol>
 *   <li>the kit's stylesheet no longer reaches the framework theme that carries the rule, or the
 *       installed framework does not carry it;
 *   <li>a kit declaration marks an outline important, which is the only thing a rule of that weight
 *       could lose to.
 * </ol>
 */

/** The kit's `packages` directory, found from this file rather than from the working directory. */
const PACKAGES = fileURLToPath(new URL("../../", import.meta.url));
const APP_CSS = join(PACKAGES, "console-core/src/styles/app.css");

/**
 * A class that makes the outline important: an outline utility with the important bang in front or
 * behind, with or without a variant before it, or an arbitrary outline property carrying the bang.
 */
const IMPORTANT_OUTLINE_CLASS =
  /(?<![\w-])(?:[\w[\]=&.:%()-]+:)*(?:!outline(?:-[\w[\]#%./()-]+)?|outline(?:-[\w[\]#%./()-]+)?!|\[outline[\w-]*:[^\]]*\]!|!\[outline[\w-]*:[^\]]*\])(?![\w-])/;

/** A stylesheet declaration of any outline property marked important. */
const IMPORTANT_OUTLINE_DECLARATION = /outline[\w-]*\s*:[^;}]*!important/;

/** Every `.ts`, `.tsx` and `.css` file under each kit package's `src`, tests excluded. */
function kitSources(): string[] {
  const out: string[] = [];
  const walk = (dir: string) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name !== "node_modules") walk(path);
      } else if (/\.(?:tsx?|css)$/.test(entry.name) && !/\.test\.tsx?$/.test(entry.name)) {
        out.push(path);
      }
    }
  };
  for (const pkg of readdirSync(PACKAGES, { withFileTypes: true })) {
    if (pkg.isDirectory() && existsSync(join(PACKAGES, pkg.name, "src"))) walk(join(PACKAGES, pkg.name, "src"));
  }
  return out;
}

/** The installed `@simplix-react/ui`, found by walking up from the kit to the nearest install. */
function installedFramework(): string {
  for (let dir = PACKAGES; dir !== dirname(dir); dir = dirname(dir)) {
    const candidate = join(dir, "node_modules/@simplix-react/ui");
    if (existsSync(join(candidate, "package.json"))) return candidate;
  }
  throw new Error("@simplix-react/ui is not installed above the kit");
}

/** The clarity design as the page receives it, decoded from its generated module. */
function compiledClarity(): string {
  const module = readFileSync(join(PACKAGES, "console-core/src/styles/designs/clarity-stylesheet.ts"), "utf8");
  const encoded = module.match(/const encoded = "([^"]+)"/)?.[1];
  if (!encoded) throw new Error("clarity-stylesheet.ts no longer holds its stylesheet as `const encoded = \"...\"`");
  return Buffer.from(encoded, "base64").toString("utf8");
}

/** The text between the braces of the block whose opening matches `opening`, or `null` when none does. */
function blockAfter(css: string, opening: RegExp): string | null {
  const open = opening.exec(css);
  if (!open) return null;
  let depth = 1;
  for (let at = open.index + open[0].length; at < css.length; at += 1) {
    if (css[at] === "{") depth += 1;
    else if (css[at] === "}" && (depth -= 1) === 0) return css.slice(open.index + open[0].length, at);
  }
  return null;
}

describe("the console keeps focus visible under forced colors", () => {
  it("imports the framework theme that carries the outline rule, and the installed one carries it", () => {
    expect(readFileSync(APP_CSS, "utf8")).toMatch(/@import\s+['"]@simplix-react\/ui\/theme\.css['"]/);
    const framework = installedFramework();
    const entry = readFileSync(join(framework, "dist/theme.css"), "utf8");
    expect(entry, "the framework theme no longer imports its base tokens").toMatch(/@import\s+["']\.\/theme\/base\.css["']/);
    const base = readFileSync(join(framework, "dist/theme/base.css"), "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
    const forced = blockAfter(base, /@media\s*\(\s*forced-colors\s*:\s*active\s*\)\s*\{/);
    expect(forced, "the installed @simplix-react/ui has no forced-colors block; build or update it").not.toBeNull();
    expect(forced).toMatch(/(?:^|[}\s]):focus-visible\s*\{[^}]*outline\s*:\s*\d+px solid (?:Highlight|CanvasText)\s*!important/);
  });

  it("declares no important outline, in a part, in a design or in a stylesheet", () => {
    const beaten: string[] = [];
    for (const file of kitSources()) {
      readFileSync(file, "utf8")
        .split("\n")
        .forEach((line: string, index: number) => {
          if (/^\s*(?:\/\/|\*|\/\*)/.test(line)) return;
          if (IMPORTANT_OUTLINE_CLASS.test(line) || IMPORTANT_OUTLINE_DECLARATION.test(line)) {
            beaten.push(`${relative(PACKAGES, file)}:${index + 1}`);
          }
        });
    }
    expect(beaten).toEqual([]);
    // The clarity stylesheet is generated from the same declarations, so it is read as shipped.
    expect(compiledClarity()).not.toMatch(IMPORTANT_OUTLINE_DECLARATION);
  });
});

describe("the patterns that look for an important outline", () => {
  // The examples are joined at run time. Tailwind reads every `.ts` file under the kit as a class
  // source, so a whole important outline utility written out here would make it emit that utility
  // into the stylesheet of every app that consumes the kit.
  const bang = "!";
  const none = "outline-none";
  const hits = [`focus-visible:${bang}${none}`, `${none}${bang}`, `${bang}outline-0`, `[outline:none]${bang}`, `outline: none ${bang}important;`];
  const misses = [`focus-visible:${none}`, "outline-offset-2", `focus-visible:border-[var(--ring)]${bang}`, `focus-visible:shadow-none${bang}`, "outline: 2px solid Highlight;"];

  it.each(hits)("flags %s", (text) => {
    expect(IMPORTANT_OUTLINE_CLASS.test(text) || IMPORTANT_OUTLINE_DECLARATION.test(text)).toBe(true);
  });

  it.each(misses)("leaves %s alone", (text) => {
    expect(IMPORTANT_OUTLINE_CLASS.test(text) || IMPORTANT_OUTLINE_DECLARATION.test(text)).toBe(false);
  });
});
