import { describe, expect, it } from "vitest";

import { isValidElement } from "react";

import { actionGlyph, actionsNeedLabels, orderUpdates, type RecordVerbType } from "./record-list";

describe("actionsNeedLabels", () => {
  it("asks for labels when two actions share a type, so they never share one icon", () => {
    expect(actionsNeedLabels([{ type: "view" }, { type: "edit" }, { type: "edit" }])).toBe(true);
  });
  it("keeps icons when every type is distinct", () => {
    expect(actionsNeedLabels([{ type: "view" }, { type: "edit" }])).toBe(false);
    expect(actionsNeedLabels([])).toBe(false);
  });

  it("keeps an action that carries its own icon in the icon strip", () => {
    expect(actionsNeedLabels([{ type: "view" }, { type: "view", icon: "users" }, { type: "edit" }, { type: "delete" }])).toBe(false);
    expect(actionsNeedLabels([{ type: "view", icon: "a" }, { type: "view", icon: "b" }])).toBe(false);
  });

  it("keeps the kit's own verbs in the icon strip, each with its glyph", () => {
    expect(actionsNeedLabels([{ type: "view" }, { type: "retry" }, { type: "reset" }, { type: "test" }, { type: "reprocess" }, { type: "enable" }, { type: "disable" }])).toBe(false);
  });

  it("still labels two actions that both draw their type's icon", () => {
    expect(actionsNeedLabels([{ type: "view" }, { type: "view" }, { type: "view", icon: "users" }])).toBe(true);
  });
});

describe("actionGlyph", () => {
  const verbs: RecordVerbType[] = ["retry", "reset", "test", "reprocess", "enable", "disable"];

  it("draws every kit verb through the view type with a glyph of its own", () => {
    const glyphs = verbs.map((verb) => actionGlyph({ type: verb }));
    for (const glyph of glyphs) {
      expect(glyph.type).toBe("view");
      expect(isValidElement(glyph.icon)).toBe(true);
    }
    const components = glyphs.map((glyph) => (isValidElement(glyph.icon) ? glyph.icon.type : null));
    expect(new Set(components).size).toBe(verbs.length);
  });

  it("lets an icon the screen passes win over the verb's glyph, and leaves a framework type alone", () => {
    expect(actionGlyph({ type: "reprocess", icon: "own" })).toEqual({ type: "view", icon: "own" });
    expect(actionGlyph({ type: "edit" })).toEqual({ type: "edit", icon: undefined });
  });
});

describe("the order a drag writes", () => {
  const rows = [
    { id: "a", order: 10 },
    { id: "b", order: 20 },
    { id: "c", order: 30 },
  ];

  it("hands the rows' own order values out again in the new sequence, and sends only the rows that moved", () => {
    expect(orderUpdates(rows, [rows[2]!, rows[0]!, rows[1]!], "id", "order")).toEqual([
      { id: "c", order: 10 },
      { id: "a", order: 20 },
      { id: "b", order: 30 },
    ]);
    expect(orderUpdates(rows, [rows[0]!, rows[2]!, rows[1]!], "id", "order")).toEqual([
      { id: "c", order: 20 },
      { id: "b", order: 30 },
    ]);
  });

  it("spreads tied values so the new sequence is strict", () => {
    const tied = [{ id: "a", order: 1 }, { id: "b", order: 1 }];
    expect(orderUpdates(tied, [tied[1]!, tied[0]!], "id", "order")).toEqual([{ id: "a", order: 2 }]);
  });
});
