import { describe, expect, it } from "vitest";

import clarity from "../styles/designs/clarity-stylesheet";

/** Every `selector { body }` of a compiled stylesheet, nested at-rule bodies included. */
function rules(css: string): { selector: string; props: Map<string, string> }[] {
  const out: { selector: string; props: Map<string, string> }[] = [];
  for (const match of css.matchAll(/([^{};]+)\{([^{}]*)\}/g)) {
    const props = new Map<string, string>();
    for (const decl of match[2]!.split(";")) {
      const at = decl.indexOf(":");
      if (at > 0) props.set(decl.slice(0, at).trim(), decl.slice(at + 1).trim());
    }
    out.push({ selector: match[1]!.trim(), props });
  }
  return out;
}

// The compiled design writes `revert-layer` for each property the classic declaration sets and the
// design leaves unset. A rule that nests an `@supports` (a colour mixed in sRGB) once hid the
// declarations after it from that comparison, so the band's inset was reverted to nothing and the
// focus halo of the row inside it was cut by the column.
describe("the related services band in the compiled clarity design", () => {
  const band = rules(clarity).filter((rule) => rule.selector.includes('data-part="console-service-links"'));

  it("keeps the inset that holds the row's focus halo inside the column", () => {
    const drawn = new Map<string, string>();
    for (const rule of band) for (const [prop, value] of rule.props) if (value !== "revert-layer") drawn.set(prop, value);
    expect(drawn.get("padding-inline")).toMatch(/2\.5/);
    expect(drawn.get("padding-top")).toBeDefined();
    expect(drawn.get("padding-bottom")).toBeDefined();
  });
});
