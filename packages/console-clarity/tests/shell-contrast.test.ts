import { describe, expect, it } from "vitest";

import { shellSlots } from "../src/styles/designs/clarity/shell";

/**
 * A mark the clarity shell fades must stay readable.
 *
 * <p>A fade multiplies the colour by an opacity, so a mark drawn in the muted text colour at 60%
 * lands under the 3:1 an icon needs and the 4.5:1 a label needs on a light ground, in the muted
 * colour any product gives it. Nothing else fails when the opacity drops: the colour and the
 * ground are each a correct token. This file holds the one fade that reaches the reader from the
 * shell: the top bar's search drawn before anything stands behind it, which would otherwise sit
 * under the unbuilt wrapper's 60% fade.
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
