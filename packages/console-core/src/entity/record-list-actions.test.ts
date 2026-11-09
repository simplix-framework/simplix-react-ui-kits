import { describe, expect, it } from "vitest";

import { isValidElement } from "react";

import { actionGlyph, actionLabelFor, actionsNeedLabels, actionTypeFor, orderUpdates, toRowAction, type RecordAction, type RecordVerbType } from "./record-list";

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
    expect(actionsNeedLabels([{ type: "view" }, { type: "retry" }, { type: "reset" }, { type: "test" }, { type: "reprocess" }, { type: "enable" }, { type: "disable" }, { type: "suspend" }, { type: "reinstate" }, { type: "cancel" }, { type: "revoke" }, { type: "upload" }, { type: "grant" }, { type: "adjust" }, { type: "approve" }, { type: "reject" }])).toBe(false);
  });

  it("still labels two actions that both draw their type's icon", () => {
    expect(actionsNeedLabels([{ type: "view" }, { type: "view" }, { type: "view", icon: "users" }])).toBe(true);
  });
});

describe("actionGlyph", () => {
  const verbs: RecordVerbType[] = ["retry", "reset", "test", "reprocess", "enable", "disable", "suspend", "reinstate", "cancel", "revoke", "upload", "grant", "adjust", "approve", "reject"];

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

interface Switchable {
  readonly id: string;
  readonly on: boolean;
}

const toggle: RecordAction<Switchable> = {
  type: (row) => (row.on ? "disable" : "enable"),
  label: (row) => (row.on ? "Disable" : "Enable"),
  onClick: () => undefined,
};

describe("one action named from the row", () => {
  const on: Switchable = { id: "a", on: true };
  const off: Switchable = { id: "b", on: false };

  it("reads the type and the label from the row", () => {
    expect(actionTypeFor(toggle, on)).toBe("disable");
    expect(actionTypeFor(toggle, off)).toBe("enable");
    expect(actionLabelFor(toggle, on)).toBe("Disable");
    expect(actionLabelFor(toggle, off)).toBe("Enable");
  });

  it("leaves a fixed type and label as they were", () => {
    const fixed: RecordAction<Switchable> = { type: "edit", label: "Edit" };
    expect(actionTypeFor(fixed, on)).toBe("edit");
    expect(actionLabelFor(fixed, on)).toBe("Edit");
  });

  it("draws the glyph of the verb the row answers, so the two states differ", () => {
    const icon = actionGlyph(toggle).icon as (row: Switchable) => unknown;
    expect(typeof icon).toBe("function");
    const glyphOn = icon(on);
    const glyphOff = icon(off);
    expect(isValidElement(glyphOn) && isValidElement(glyphOff) ? glyphOn.type !== glyphOff.type : false).toBe(true);
  });

  it("lets an icon the screen passes win on every row", () => {
    const icon = actionGlyph({ ...toggle, icon: "own" }).icon as (row: Switchable) => unknown;
    expect(icon(on)).toBe("own");
    expect(icon(off)).toBe("own");
  });

  it("stays in the icon strip beside a plain action, since its glyph is a verb's", () => {
    expect(actionsNeedLabels([toggle, { type: "view" }, { type: "edit" }])).toBe(false);
  });

  it("hands the framework the label function and the same glyph function", () => {
    const def = toRowAction(toggle);
    expect(def.type).toBe("view");
    expect(typeof def.label).toBe("function");
    expect(typeof def.icon).toBe("function");
  });
});
