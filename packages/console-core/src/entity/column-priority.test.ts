import { describe, expect, it } from "vitest";

import { ALWAYS_DRAWN_COLUMNS } from "./record-contract";
import { keepColumnsDrawn, ladderColumns, tableColumnsOf, type PrioritisedColumn } from "./column-priority";

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

describe("ladderColumns", () => {
  // A subscription list: four leading columns, a sorted period end and a screen's own renewal marker.
  const subscription: PrioritisedColumn[] = [
    { key: "owner", field: "ownerId", minWidth: 160 },
    { key: "plan", field: "planId", minWidth: 160 },
    { key: "status", field: "status", width: 120 },
    { key: "provider", field: "provider", width: 120 },
    { key: "seats", field: "seats", width: 112, minTableWidth: 672 },
    { key: "end", field: "currentPeriodEnd", width: 176, minTableWidth: 848 },
    { key: "renewal", field: "cancelAtPeriodEnd", width: 120 },
  ];
  const widthOf = (columns: readonly PrioritisedColumn[], keys: readonly string[]) =>
    keys.reduce((sum, key) => sum + (columns.find((column) => column.key === key)!.width ?? columns.find((column) => column.key === key)!.minWidth ?? 0), 0);

  it("gives a screen's own column after the leading ones the tier its place gives it", () => {
    const laddered = ladderColumns(subscription, ALWAYS_DRAWN_COLUMNS);
    expect(laddered.find((column) => column.key === "renewal")!.minTableWidth).toBe(968);
    // Stated tiers and the leading columns are left alone.
    expect(laddered.slice(0, 6)).toEqual(subscription.slice(0, 6));
  });

  it("keeps the narrowest table of a list with a screen's own column inside a tablet pane", () => {
    const pane = 889;
    const before = drawn(keepColumnsDrawn(subscription, "currentPeriodEnd"), 0);
    const after = drawn(keepColumnsDrawn(ladderColumns(subscription, ALWAYS_DRAWN_COLUMNS), "currentPeriodEnd"), 0);
    // Before, the always-drawn set (856 px and the row actions) outgrew the pane and the list fell to cards.
    expect(before).toContain("renewal");
    expect(widthOf(subscription, after)).toBeLessThan(pane - 64);
    expect(after).toEqual(["owner", "plan", "status", "provider", "end"]);
    expect(drawn(keepColumnsDrawn(ladderColumns(subscription, ALWAYS_DRAWN_COLUMNS), "currentPeriodEnd"), 1200)).toContain("renewal");
  });

  it("leaves a column the screen keeps drawn at every width", () => {
    const consent: PrioritisedColumn[] = [
      { key: "type", width: 120 },
      { key: "version", minWidth: 140 },
      { key: "granted", width: 96 },
      { key: "channel", width: 120 },
      { key: "recordedAt", field: "recordedAt", width: 176, minTableWidth: 652 },
      { key: "withdrawnAt", field: "withdrawnAt", width: 176, minTableWidth: 828, keep: true },
    ];
    const shown = drawn(keepColumnsDrawn(ladderColumns(consent, ALWAYS_DRAWN_COLUMNS), "recordedAt"), 650);
    expect(shown).toContain("withdrawnAt");
    expect(drawn(keepColumnsDrawn(consent.map(({ keep: _keep, ...column }) => column), "recordedAt"), 650)).not.toContain("withdrawnAt");
  });
});

describe("tableColumnsOf over the leading block", () => {
  // A release list: four leading columns as the contract tiers them, a size column, the sorted
  // publication time and an offered marker. Its row actions take 168 px.
  const release: PrioritisedColumn[] = [
    { key: "name", field: "artifactName", minWidth: 140 },
    { key: "version", field: "releaseVersion", width: 104 },
    { key: "kind", field: "kind", width: 144 },
    { key: "platform", field: "platform", width: 154 },
    { key: "size", field: "sizeBytes", width: 136, minTableWidth: 678 },
    { key: "published", field: "publishedAt", width: 176, minTableWidth: 854 },
    { key: "active", field: "active", width: 96, minTableWidth: 950 },
  ];
  const actions = 168;
  const widthOf = (keys: readonly string[]) => keys.reduce((sum, key) => sum + (release.find((column) => column.key === key)!.width ?? release.find((column) => column.key === key)!.minWidth ?? 0), 0);
  /** What a pane draws as a table, or `null` where the untiered set and the actions do not fit and the list is cards. */
  const table = (columns: readonly PrioritisedColumn[], pane: number) => {
    const untiered = columns.filter((column) => column.minTableWidth === undefined).map((column) => column.key);
    return widthOf(untiered) + actions > pane ? null : drawn(columns, pane - actions);
  };

  it("falls to cards a pane a classic scrollbar narrows, while the leading block never drops", () => {
    const fixed = keepColumnsDrawn(release, "publishedAt");
    expect(table(fixed, 887)).toEqual(["name", "version", "kind", "platform", "published"]);
    expect(table(fixed, 872)).toBeNull();
  });

  it("drops the leading block's last column instead, and stays a table", () => {
    const laddered = tableColumnsOf(release, "publishedAt");
    expect(table(laddered, 887)).toEqual(["name", "version", "kind", "platform", "published"]);
    expect(table(laddered, 872)).toEqual(["name", "version", "kind", "published"]);
    // Later columns still drop first: the size returns before the platform is ever given up.
    expect(table(laddered, 1200)).toEqual(["name", "version", "kind", "platform", "size", "published", "active"]);
  });

  it("leaves cards to a pane that cannot hold the name, the sorted column and the actions", () => {
    const laddered = tableColumnsOf(release, "publishedAt");
    expect(table(laddered, 500)).toEqual(["name", "published"]);
    expect(table(laddered, 483)).toBeNull();
    for (const pane of [490, 560, 640, 720, 800, 872, 887, 960, 1100]) {
      const shown = table(laddered, pane);
      expect(shown === null || widthOf(shown) + actions <= pane).toBe(true);
    }
  });
});
