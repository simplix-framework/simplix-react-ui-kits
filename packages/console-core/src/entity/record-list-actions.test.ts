import { describe, expect, it } from "vitest";

import { actionsNeedLabels } from "./record-list";

describe("actionsNeedLabels", () => {
  it("asks for labels when two actions share a type, so they never share one icon", () => {
    expect(actionsNeedLabels([{ type: "view" }, { type: "edit" }, { type: "edit" }])).toBe(true);
  });
  it("keeps icons when every type is distinct", () => {
    expect(actionsNeedLabels([{ type: "view" }, { type: "edit" }])).toBe(false);
    expect(actionsNeedLabels([])).toBe(false);
  });

  it("labels every action once one asks for its label", () => {
    expect(actionsNeedLabels([{ type: "edit", labelled: true }])).toBe(true);
    expect(actionsNeedLabels([{ type: "view" }, { type: "edit", labelled: false }])).toBe(false);
  });

  it("keeps an action that carries its own icon in the icon strip", () => {
    expect(actionsNeedLabels([{ type: "view" }, { type: "view", icon: "users" }, { type: "edit" }, { type: "delete" }])).toBe(false);
    expect(actionsNeedLabels([{ type: "view", icon: "a" }, { type: "view", icon: "b" }])).toBe(false);
  });

  it("still labels two actions that both draw their type's icon", () => {
    expect(actionsNeedLabels([{ type: "view" }, { type: "view" }, { type: "view", icon: "users" }])).toBe(true);
  });
});
