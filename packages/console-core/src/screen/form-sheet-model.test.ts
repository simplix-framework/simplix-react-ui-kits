import { describe, expect, it } from "vitest";

import { cellAccess, derivedText, editableCells, hasStagePassed, missingForTransition, sheetBlocks, type FormSheetField } from "./form-sheet-model";

const stages = ["DRAFT", "REQUESTED", "CHECKED", "ISSUED"];

const text = (sourceId: string, order: number, stage: string | null, writerRoles: string[], extra: Partial<FormSheetField> = {}): FormSheetField => ({
  sourceId,
  order,
  label: sourceId,
  mode: "input",
  stage,
  writerRoles,
  control: { kind: "text", key: "", label: "" },
  ...extra,
});

const fields: FormSheetField[] = [
  { sourceId: "title", order: 1, label: "Title", mode: "static", stage: null, writerRoles: [] },
  text("issuer", 2, "REQUESTED", ["ISSUER"]),
  text("checker", 3, "CHECKED", ["CHECKER"]),
  { sourceId: "total", order: 4, label: "Total", mode: "derived", stage: null, writerRoles: [] },
  text("patrol", 5, "PATROL", ["SUPERVISOR"]),
];

describe("hasStagePassed", () => {
  it("counts the current transition and earlier ones as passed", () => {
    expect(hasStagePassed("REQUESTED", "REQUESTED", stages)).toBe(true);
    expect(hasStagePassed("DRAFT", "CHECKED", stages)).toBe(true);
    expect(hasStagePassed("CHECKED", "REQUESTED", stages)).toBe(false);
  });

  it("never passes a null stage or one outside the lifecycle order", () => {
    expect(hasStagePassed(null, "ISSUED", stages)).toBe(false);
    expect(hasStagePassed("PATROL", "ISSUED", stages)).toBe(false);
  });
});

describe("cellAccess", () => {
  const at = (stage: string, viewerRoles: string[], readOnly = false) => ({ stage, stages, viewerRoles, readOnly });

  it("lets the checker enter a CHECKED cell while the form is REQUESTED, and locks it once CHECKED", () => {
    expect(cellAccess(fields[2], at("REQUESTED", ["CHECKER"]))).toEqual({ kind: "editable" });
    expect(cellAccess(fields[2], at("CHECKED", ["CHECKER"]))).toEqual({ kind: "locked", because: "stagePassed" });
  });

  it("names the writer roles to a viewer who holds none of them", () => {
    expect(cellAccess(fields[2], at("REQUESTED", ["ISSUER"]))).toEqual({ kind: "notWriter", roles: ["CHECKER"] });
  });

  it("locks every input cell when read-only and never edits static or derived cells", () => {
    expect(cellAccess(fields[1], at("DRAFT", ["ISSUER"], true))).toEqual({ kind: "locked", because: "readOnly" });
    expect(cellAccess(fields[0], at("DRAFT", ["ISSUER"]))).toEqual({ kind: "static" });
    expect(cellAccess(fields[3], at("DRAFT", ["ISSUER"]))).toEqual({ kind: "derived" });
  });

  it("lists the editable cells for a viewer holding several roles", () => {
    expect(editableCells(fields, at("DRAFT", ["ISSUER", "SUPERVISOR"]))).toEqual(["issuer", "patrol"]);
  });
});

describe("missingForTransition", () => {
  it("checks only the cells whose stage is the transition, so a cell required later is not missing", () => {
    expect(missingForTransition(fields, {}, "REQUESTED")).toEqual({ issuer: "required" });
    expect(missingForTransition(fields, { issuer: "Kim" }, "REQUESTED")).toEqual({});
  });

  it("reads a cell without a control as missing only when blank", () => {
    const bare = [{ ...fields[1], control: undefined }];
    expect(missingForTransition(bare, { issuer: "  " }, "REQUESTED")).toEqual({ issuer: "required" });
    expect(missingForTransition(bare, { issuer: 0 }, "REQUESTED")).toEqual({});
  });

  it("applies the control's own rule, such as range order", () => {
    const range = [text("period", 1, "REQUESTED", ["ISSUER"], { control: { kind: "range", key: "", label: "", granularity: "date" } })];
    expect(missingForTransition(range, { period: { from: "2026-05-02", to: "2026-05-01" } }, "REQUESTED")).toEqual({ period: "rangeOrder" });
  });
});

describe("derivedText", () => {
  it("holds a missing value rather than drawing 0", () => {
    expect(derivedText(null)).toEqual({ kind: "held" });
    expect(derivedText(undefined)).toEqual({ kind: "held" });
    expect(derivedText(Number.NaN)).toEqual({ kind: "held" });
    expect(derivedText([])).toEqual({ kind: "held" });
  });

  it("draws a computed zero as 0", () => {
    expect(derivedText(0)).toEqual({ kind: "value", text: "0" });
    expect(derivedText(["Kim", "Lee"])).toEqual({ kind: "value", text: "Kim, Lee" });
  });
});

describe("sheetBlocks", () => {
  it("keeps source order, places a table at its first cell and sorts its cells by row and column", () => {
    const cell = (row: number, column: number) => ({ table: "t", row, column });
    const blocks = sheetBlocks([
      text("b", 3, null, [], { cell: cell(1, 2) }),
      text("a", 2, null, [], { cell: cell(1, 1) }),
      text("before", 1, null, []),
      text("c", 4, null, [], { cell: cell(2, 1) }),
      text("after", 5, null, []),
    ]);
    expect(blocks.map((block) => block.kind)).toEqual(["flow", "table", "flow"]);
    const table = blocks[1];
    expect(table.kind === "table" && table.rows.map((row) => row.cells.map((one) => one.sourceId))).toEqual([["a", "b"], ["c"]]);
  });
});
