import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { installedFramework, PACKAGES } from "../../console-core/tests/installed-framework";

/**
 * The idle sort arrow of a table head stays readable in every console screen.
 *
 * <p>The framework draws an unsorted column's arrow in the muted ink at full opacity (`@simplix-react/ui`,
 * `design/clarity/list.ts`), because a fade of the muted ink lands under the 3:1 an icon needs on the
 * table head, in both themes. The kit takes that rule as it is, so the arrow can fail here in two ways,
 * and this file holds both:
 *
 * <ol>
 *   <li>the installed framework does not carry the unfaded rule, so every table in the console draws
 *       a faded arrow;
 *   <li>a kit design restyles the arrow, which would be a second place that decides its contrast and
 *       that has to be kept in step with the framework's.
 * </ol>
 *
 * <p>The contrast of the ink itself is held where the tokens are, by the framework's own tests.
 */

/** The opening of the rule that draws an unsorted column's arrow, as the design stylesheet spells it. */
const IDLE_ARROW = '[data-slot="crud-list-sort-icon"][data-sorted="false"]';

/** A class that fades what it styles: an opacity below 100, bare or behind any variants. */
const FADED = /(?:^|\s)(?:\S+:)?opacity-(?!100(?:\s|$))\d+(?:\s|$)/;

/** The classes applied by every rule whose selector line holds `selector`, in file order. */
function appliedBy(css: string, selector: string): string[] {
  const lines = css.split("\n");
  const found: string[] = [];
  lines.forEach((line, at) => {
    if (!line.trim().endsWith("{") || !line.includes(selector)) return;
    const applied = /^\s*@apply\s+(.+);$/.exec(lines[at + 1] ?? "");
    if (applied?.[1]) found.push(applied[1]);
  });
  return found;
}

describe("the idle sort arrow in the installed framework", () => {
  const frameworkClarity = () => readFileSync(join(installedFramework(), "dist/theme/designs/clarity.css"), "utf8");

  it("is drawn in the muted ink at full opacity at rest, and in the strong ink under the pointer", () => {
    const rules = appliedBy(frameworkClarity(), IDLE_ARROW);
    expect(rules, "the installed @simplix-react/ui has no idle arrow rule; build or update it").toHaveLength(2);
    const [rest, pointer] = rules;
    expect(rest).toMatch(/(?:^|\s)opacity-100(?:\s|$)/);
    expect(rest).toMatch(/(?:^|\s)text-muted-foreground(?:\s|$)/);
    expect(pointer).toMatch(/(?:^|\s)\[button:hover>&\]:text-foreground(?:\s|$)/);
  });

  it("fades the arrow in no rule", () => {
    for (const applied of appliedBy(frameworkClarity(), IDLE_ARROW)) expect(applied).not.toMatch(FADED);
  });
});

describe("the kit's own clarity design", () => {
  it("holds no rule for the sort arrow", () => {
    const kit = readFileSync(join(PACKAGES, "console-clarity/src/styles/designs/clarity.css"), "utf8");
    expect(kit).not.toContain("crud-list-sort-icon");
  });
});

describe("the fade matcher", () => {
  it("reads an opacity below 100, bare or behind a variant", () => {
    expect(FADED.test("opacity-45")).toBe(true);
    expect(FADED.test("text-muted-foreground [button:hover>&]:opacity-90")).toBe(true);
    expect(FADED.test("opacity-5 text-foreground")).toBe(true);
  });

  it("leaves full opacity and a class that only contains the word", () => {
    expect(FADED.test("opacity-100 text-muted-foreground")).toBe(false);
    expect(FADED.test("[button:hover>&]:opacity-100 [button:hover>&]:text-foreground")).toBe(false);
    expect(FADED.test("text-muted-foreground")).toBe(false);
  });
});
