import { describe, expect, it } from "vitest";

import { shellSlots } from "./shell";

/**
 * Marks the clarity shell fades must stay readable.
 *
 * <p>A fade multiplies the colour by an opacity, so a mark drawn in the muted text colour at 45%
 * or 60% lands under the 3:1 an icon needs and the 4.5:1 a label needs on a light ground, in the
 * muted colour any product gives it. Nothing else fails when the opacity drops: the colour and the
 * ground are each a correct token. This file holds the two fades that reach the reader:
 *
 * <ol>
 *   <li>the idle sort arrow of a table head, which the framework draws at 45% and the content
 *       column lifts to 80% (90% under the pointer);
 *   <li>the top bar's search drawn before anything stands behind it, which would otherwise sit
 *       under the unbuilt wrapper's 60% fade.
 * </ol>
 */

const opacityOf = (value: string, selector: string): number | undefined => {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const found = new RegExp(`(?:^|\\s)${escaped}:opacity-(\\d+)(?:\\s|$)`).exec(value);
  return found ? Number(found[1]) : undefined;
};

describe("the opacity matcher", () => {
  it("reads the opacity a descendant rule sets", () => {
    expect(opacityOf("px-8 [&_a]:opacity-80 pt-6", "[&_a]")).toBe(80);
  });

  it("leaves a rule for another selector, and a plain opacity", () => {
    expect(opacityOf("[&_b]:opacity-80", "[&_a]")).toBeUndefined();
    expect(opacityOf("opacity-80", "[&_a]")).toBeUndefined();
  });
});

describe("the idle sort arrow", () => {
  const column = shellSlots["console-content-column"] ?? "";
  const idle = opacityOf(column, "[&_[data-slot=crud-list-sort-icon][data-sorted=false]]");
  const hovered = opacityOf(column, "[&_button:hover_[data-slot=crud-list-sort-icon][data-sorted=false]]");

  it("is lifted by the content column", () => {
    expect(idle).toBeDefined();
  });

  it("keeps at least 80% of the muted colour, the least that reaches 3:1 on a light table head", () => {
    expect(idle ?? 0).toBeGreaterThanOrEqual(80);
  });

  it("is stronger under the pointer than at rest", () => {
    expect(hovered ?? 0).toBeGreaterThan(idle ?? 100);
  });
});

describe("the unbuilt search picture", () => {
  it("is not faded by the unbuilt wrapper", () => {
    const wrapper = shellSlots["console-preview-unbuilt"] ?? "";
    expect(opacityOf(wrapper, "has-[[data-slot=console-bar-search]]")).toBe(100);
  });

  it("draws its label in the muted text colour, not a translucent one", () => {
    const search = shellSlots["console-bar-search"] ?? "";
    expect(search).toMatch(/(?:^|\s)text-muted-foreground(?:\s|$)/);
    expect(search).not.toMatch(/text-muted-foreground\/\d+/);
  });
});
