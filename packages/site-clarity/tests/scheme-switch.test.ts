import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

// A part that eases its colours must take a change of scheme in the same frame as the ground it
// stands on: site-core marks the document element for that instant and the tokens file zeroes the
// motion durations under the mark. These checks hold the two halves to each other: the rule names the
// mark site-core sets, it zeroes every duration token a part reads, and every transition a part draws
// reads one of those tokens (a literal duration would keep easing and bring the light ink back).

const root = join(import.meta.dirname, "..");
const read = (path: string) => readFileSync(join(root, path), "utf8");

/** The mark site-core sets, read from its declaration: this package's tests do not resolve site-core's exports. */
const SCHEME_SWITCH_ATTRIBUTE = /export const SCHEME_SWITCH_ATTRIBUTE = "([^"]+)";/.exec(read("../site-core/src/shell/site-scheme.ts"))?.[1] ?? "";

/** The declarations of the rule `:root[<attribute>]`, or undefined where the tokens file has none. */
function switchRule(tokens: string): string | undefined {
  return new RegExp(`:root\\[${SCHEME_SWITCH_ATTRIBUTE}\\]\\s*\\{([^}]*)\\}`).exec(tokens)?.[1];
}

/** The duration tokens a rule zeroes, each declared `0s !important` so a product's value cannot win by specificity. */
function zeroedDurations(rule: string): string[] {
  return [...rule.matchAll(/(--site-duration-[a-z0-9-]+)\s*:\s*0s\s*!important\s*;/g)].map((m) => m[1] ?? "").sort();
}

/** Every duration token a text reads, as `duration-(--site-duration-x)` or `var(--site-duration-x)`. */
function readDurations(text: string): string[] {
  return [...new Set([...text.matchAll(/(?:duration-\(|var\()(--site-duration-[a-z0-9-]+)/g)].map((m) => m[1] ?? ""))].sort();
}

/** The `@apply` lines of a stylesheet that start a transition but name no duration token. */
function transitionsWithoutToken(css: string): string[] {
  return css
    .split("\n")
    .filter((line) => /^\s*@apply\s/.test(line) && /(?:^|\s)(?:\S+:)?transition(?:-\S+)?(?:\s|;|$)/.test(line) && !/duration-\(--site-duration-[a-z0-9-]+\)/.test(line))
    .map((line) => line.trim().slice(0, 100));
}

describe("the scheme change in the site stylesheet", () => {
  it("reads the mark from site-core", () => {
    expect(SCHEME_SWITCH_ATTRIBUTE).toBe("data-site-scheme-switch");
  });

  const tokens = read("src/styles/site-tokens.css");
  const css = read("src/styles/designs/clarity.css");
  const rule = switchRule(tokens);

  it("has a rule on the document element under the mark site-core sets", () => {
    expect(rule, `site-tokens.css has no :root[${SCHEME_SWITCH_ATTRIBUTE}] rule`).toBeDefined();
  });

  it("zeroes every duration token the parts read, and no other", () => {
    expect(zeroedDurations(rule ?? "")).toEqual(readDurations(css));
  });

  it("leaves no transition to a literal duration that the rule could not zero", () => {
    expect(transitionsWithoutToken(css)).toEqual([]);
  });
});

/** Whether a rule under the mark lists no transition property for the element, its descendants and their pseudo-elements. */
function cancelsEveryTransition(tokens: string, attribute: string): boolean {
  const bare = tokens.replace(/\/\*[\s\S]*?\*\//g, "");
  const covered = [`:root[${attribute}]`, `:root[${attribute}] *`, `:root[${attribute}] *::before`, `:root[${attribute}] *::after`];
  return [...bare.matchAll(/([^{}]*:root\[[^\]]*\][^{}]*)\{([^}]*)\}/g)].some((m) => {
    const selectors = (m[1] ?? "").split(",").map((one) => one.trim());
    return covered.every((selector) => selectors.includes(selector)) && /transition-property:\s*none\s*!important/.test(m[2] ?? "");
  });
}

describe("a transition that is already running when the scheme changes", () => {
  const tokens = read("src/styles/site-tokens.css");

  it("is cancelled under the mark, which a nil duration alone does not do for a fill whose end value is the same in both schemes", () => {
    expect(cancelsEveryTransition(tokens, SCHEME_SWITCH_ATTRIBUTE)).toBe(true);
  });

  it("is the case of the switch option just left: it eases its fill and ink on the duration token the mark nils, and its chosen fill is one it eases", () => {
    const option = read("../site-core/src/pricing/pricing.style.ts");
    const declaration = /export const siteSwitchOptionStyle = defineSlotStyle\(\{[\s\S]*?\n\}\);/.exec(option)?.[0] ?? "";
    expect(declaration).toMatch(/transition-colors duration-\(--site-duration-fast\)/);
    expect(declaration).toMatch(/true: "bg-\(--site-surface\)/);
    expect(zeroedDurations(switchRule(tokens) ?? "")).toContain("--site-duration-fast");
  });

  it("is found by a check that refuses a rule that only nils the duration, or leaves out a pseudo-element", () => {
    const rule = (selectors: string, body: string) => `${selectors} { ${body} }`;
    const all = ":root[data-x],\n:root[data-x] *,\n:root[data-x] *::before,\n:root[data-x] *::after";
    expect(cancelsEveryTransition(rule(all, "transition-property: none !important;"), "data-x")).toBe(true);
    expect(cancelsEveryTransition(rule(all, "transition-duration: 0s !important;"), "data-x")).toBe(false);
    expect(cancelsEveryTransition(rule(all, "transition-property: none;"), "data-x")).toBe(false);
    expect(cancelsEveryTransition(rule(all.replace(",\n:root[data-x] *::after", ""), "transition-property: none !important;"), "data-x")).toBe(false);
  });
});

describe("the readers the checks use", () => {
  it("find a rule that zeroes a token without the override, and a transition with a literal duration", () => {
    expect(switchRule(":root { --a: 1; }")).toBeUndefined();
    expect(zeroedDurations(`--site-duration-fast: 0s !important;\n--site-duration-base: 0s;`)).toEqual(["--site-duration-fast"]);
    expect(readDurations("@apply transition-colors duration-(--site-duration-fast); x: var(--site-duration-base);")).toEqual(["--site-duration-base", "--site-duration-fast"]);
    expect(transitionsWithoutToken("  @apply transition-colors duration-200;")).toHaveLength(1);
    expect(transitionsWithoutToken("  @apply transition-colors duration-(--site-duration-fast) hover:bg-red-500;")).toEqual([]);
    expect(transitionsWithoutToken("  @apply bg-(--site-surface) text-(--site-ink);")).toEqual([]);
  });
});
