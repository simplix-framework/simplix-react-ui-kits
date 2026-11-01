import { describe, expect, it } from "vitest";

import { ALWAYS_DRAWN_COLUMNS } from "./record-contract";
import { keepColumnsDrawn, type PrioritisedColumn } from "./column-priority";

/** Eight columns the way the generator tiers them: the first four always draw, the rest by running width. */
function generated(widths: readonly number[], names: readonly string[]): PrioritisedColumn[] {
  let running = 0;
  return widths.map((width, index) => {
    running += width;
    return { key: names[index]!, field: names[index]!, width, ...(index < ALWAYS_DRAWN_COLUMNS ? {} : { minTableWidth: running }) };
  });
}

const names = ["who", "kind", "vendor", "model", "credits", "cost", "outcome", "at"];
const widths = [160, 120, 100, 100, 100, 100, 100, 180];

/** The keys drawn in a pane of `pane` px: a column with no tier always, the rest when the pane holds the tier. */
function drawn(columns: readonly PrioritisedColumn[], pane: number): string[] {
  return columns.filter((column) => column.minTableWidth === undefined || pane >= column.minTableWidth).map((column) => column.key);
}

describe("keepColumnsDrawn", () => {
  it("keeps the sort column drawn in a pane that drops every other tiered column", () => {
    const columns = generated(widths, names);
    expect(drawn(columns, 700)).not.toContain("at");
    expect(drawn(keepColumnsDrawn(columns, "at"), 700)).toContain("at");
  });

  it("drops the remaining tiered columns from the end, and never into a table wider than the pane", () => {
    const kept = keepColumnsDrawn(generated(widths, names), "at");
    const widthOf = (keys: readonly string[]) => keys.reduce((sum, key) => sum + widths[names.indexOf(key)]!, 0);
    for (const pane of [560, 640, 700, 760, 820, 900, 1000, 1200]) {
      const shown = drawn(kept, pane);
      // The pane holds everything drawn, except where even the always-drawn set does not fit.
      expect(widthOf(shown) <= pane || shown.length === ALWAYS_DRAWN_COLUMNS + 1).toBe(true);
      // Columns drop from the end: what is drawn among the tiered ones is a prefix of them.
      const tiered = shown.filter((key) => !["who", "kind", "vendor", "model", "at"].includes(key));
      expect(tiered).toEqual(["credits", "cost", "outcome"].slice(0, tiered.length));
    }
  });

  it("keeps a sort column that sits in the middle and still drops the ones after it", () => {
    const columns = generated(widths, names);
    const kept = keepColumnsDrawn(columns, "cost");
    expect(drawn(kept, 650)).toEqual(["who", "kind", "vendor", "model", "cost"]);
    expect(drawn(kept, 2000)).toEqual(names);
    // Credits sits before the sort column and draws only where it fits beside it (480 + 100 + 100).
    expect(drawn(kept, 679)).toEqual(["who", "kind", "vendor", "model", "cost"]);
    expect(drawn(kept, 680)).toEqual(["who", "kind", "vendor", "model", "credits", "cost"]);
  });

  it("matches the sort column by key as well as by field", () => {
    const columns = generated(widths, names).map((column) => (column.key === "at" ? { ...column, field: "occurredAt" } : column));
    expect(drawn(keepColumnsDrawn(columns, "at"), 700)).toContain("at");
    expect(drawn(keepColumnsDrawn(columns, "occurredAt"), 700)).toContain("at");
  });

  it("keeps the leading column even when a hand-set tier gave it one", () => {
    const columns: PrioritisedColumn[] = [
      { key: "name", field: "name", minWidth: 160, minTableWidth: 900 },
      { key: "state", field: "state", width: 96, minTableWidth: 620 },
    ];
    expect(drawn(keepColumnsDrawn(columns, null), 300)).toEqual(["name"]);
  });

  it("leaves the set alone when nothing is sorted and nothing is tiered after the lead", () => {
    const columns = generated(widths, names);
    expect(keepColumnsDrawn(columns, null)).toEqual(columns);
    expect(keepColumnsDrawn(columns, "absent")).toEqual(columns);
    const flat: PrioritisedColumn[] = [{ key: "a" }, { key: "b" }];
    expect(keepColumnsDrawn(flat, "b")).toEqual(flat);
  });

  it("uses the fluid minimum for a kept column that declared no width", () => {
    const columns: PrioritisedColumn[] = [
      { key: "a", width: 100 },
      { key: "b", width: 100, minTableWidth: 200 },
      { key: "c", minTableWidth: 400 },
    ];
    const kept = keepColumnsDrawn(columns, "c");
    expect(kept[1]!.minTableWidth).toBe(200 + 200);
    expect(kept[2]!.minTableWidth).toBeUndefined();
  });
});
