import { describe, expect, it } from "vitest";

import clarity from "../src/styles/designs/clarity-stylesheet";
import { paletteFieldStyle } from "../../console-core/src/shell/command-palette.style";

// The palette's field holds the keys for as long as the palette stands open, so no design draws a
// ring or a box around it: the open panel and the caret say where focus is. Every design is written
// from the slot style's classes, so the classes are read here, and the compiled clarity design is
// read as the browser gets it.
/** Every rule of a compiled stylesheet whose selector names the palette's field, with its body. */
function fieldRules(css: string): { selector: string; body: string }[] {
  const rules: { selector: string; body: string }[] = [];
  for (const match of css.matchAll(/([^{}]*console-palette-field[^{}]*)\{([^{}]*)\}/g)) rules.push({ selector: match[1]!.trim(), body: match[2]! });
  return rules;
}

describe("the palette's field", () => {
  it("names no focus ring in its slot style", () => {
    expect(paletteFieldStyle.base).not.toMatch(/focus-halo|ring-|focus-visible:shadow/);
  });

  it("is drawn with no outline and no shadow by the compiled clarity design", () => {
    const input = fieldRules(clarity).filter((rule) => /\sinput$/.test(rule.selector));
    expect(input.length).toBeGreaterThan(0);
    for (const rule of input) {
      expect(rule.body).toMatch(/outline-style:\s*none/);
      expect(rule.body).not.toMatch(/focus-halo/);
      expect(rule.body).toMatch(/--tw-shadow:\s*0 0 #0000/);
    }
  });

  it("keeps the one bottom rule on the header row, not on the framework's search row inside it", () => {
    const rules = fieldRules(clarity);
    expect(rules.some((rule) => !/\[cmdk-input-wrapper\]|\sinput$/.test(rule.selector) && /border-bottom-width:\s*1px/.test(rule.body))).toBe(true);
    expect(rules.some((rule) => /\[cmdk-input-wrapper\]/.test(rule.selector) && /border-bottom-width:\s*0/.test(rule.body))).toBe(true);
  });

  it("asks every design for no outline and no shadow on the field", () => {
    expect(paletteFieldStyle.base).toMatch(/\[&_input\]:outline-none/);
    expect(paletteFieldStyle.base).toMatch(/\[&_input\]:shadow-none/);
  });
});
