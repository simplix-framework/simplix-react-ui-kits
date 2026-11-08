import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

// A part that eases its colours must take a change of scheme in the same frame as the ground it
// stands on: console-core marks the document element for that instant and the tokens file nils every
// transition under the mark. These checks hold the two halves to each other: the rule names the mark
// console-core sets and covers the element, its descendants and their pseudo-elements, and nils both
// the duration and the delay.

const root = join(__dirname, "../..");
const read = (path: string) => readFileSync(join(root, path), "utf8");

/** The mark console-core sets, read from its declaration: this package's tests do not resolve console-core's exports. */
const SCHEME_SWITCH_ATTRIBUTE = /export const SCHEME_SWITCH_ATTRIBUTE = "([^"]+)";/.exec(read("console-core/src/shell/scheme-switch.ts"))?.[1] ?? "";

/** The selectors and declarations of every rule that is under `:root[<attribute>]`, or none where the tokens file has no such rule. */
function switchRules(tokens: string, attribute: string): { selectors: string[]; body: string }[] {
  const mark = attribute.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const bare = tokens.replace(/\/\*[\s\S]*?\*\//g, "");
  return [...bare.matchAll(/([^{}]*:root\[[^\]]*\][^{}]*)\{([^}]*)\}/g)]
    .filter((m) => new RegExp(`:root\\[${mark}\\]`).test(m[1] ?? ""))
    .map((m) => ({ selectors: (m[1] ?? "").split(",").map((s) => s.trim()), body: m[2] ?? "" }));
}

/** Whether the rules nil the duration and the delay for the element, its descendants and their pseudo-elements. */
function nilsEveryTransition(rules: { selectors: string[]; body: string }[], attribute: string): boolean {
  const covered = [`:root[${attribute}]`, `:root[${attribute}] *`, `:root[${attribute}] *::before`, `:root[${attribute}] *::after`];
  return rules.some(
    (rule) =>
      covered.every((selector) => rule.selectors.includes(selector)) &&
      /transition-duration:\s*0s\s*!important/.test(rule.body) &&
      /transition-delay:\s*0s\s*!important/.test(rule.body),
  );
}

describe("the scheme change in the console stylesheet", () => {
  it("reads the mark from console-core", () => {
    expect(SCHEME_SWITCH_ATTRIBUTE).toBe("data-console-scheme-switch");
  });

  it("nils every transition under the mark console-core sets", () => {
    const rules = switchRules(read("console-core/src/styles/console-tokens.css"), SCHEME_SWITCH_ATTRIBUTE);
    expect(rules, `console-tokens.css has no :root[${SCHEME_SWITCH_ATTRIBUTE}] rule`).not.toHaveLength(0);
    expect(nilsEveryTransition(rules, SCHEME_SWITCH_ATTRIBUTE)).toBe(true);
  });
});

describe("the reader the check uses", () => {
  const good = ":root[data-x],\n:root[data-x] *,\n:root[data-x] *::before,\n:root[data-x] *::after { transition-duration: 0s !important; transition-delay: 0s !important; }";
  it("finds a rule that nils every transition, and refuses one that misses a selector, the delay or the override", () => {
    expect(nilsEveryTransition(switchRules(good, "data-x"), "data-x")).toBe(true);
    expect(nilsEveryTransition(switchRules(good.replace(":root[data-x] *::after", ":root[data-x] a"), "data-x"), "data-x")).toBe(false);
    expect(nilsEveryTransition(switchRules(good.replace("transition-delay: 0s !important;", ""), "data-x"), "data-x")).toBe(false);
    expect(nilsEveryTransition(switchRules(good.replaceAll(" !important", ""), "data-x"), "data-x")).toBe(false);
    expect(switchRules(":root { --a: 1; }", "data-x")).toEqual([]);
  });
});
