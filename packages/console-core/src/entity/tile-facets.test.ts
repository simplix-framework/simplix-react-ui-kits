import { describe, expect, it } from "vitest";
import { missingTileFacets, tileFacets } from "./tile-facets";

describe("tileFacets", () => {
  it("collects the one-value tiles by field, in order, labelled by their tiles", () => {
    const tiles = [
      { label: "Active", filter: { field: "standing", value: "ACTIVE", fieldLabel: "Standing" } },
      { label: "Invited", filter: { field: "standing", value: "INVITE_PENDING", fieldLabel: "Standing" } },
      { label: "Rows" },
    ];
    expect(tileFacets(tiles)).toEqual([
      { field: "standing", label: "Standing", options: [{ value: "ACTIVE", label: "Active" }, { value: "INVITE_PENDING", label: "Invited" }] },
    ]);
  });
  it("leaves a tile that writes several keys to the filters owning them", () => {
    expect(tileFacets([{ label: "Last hour", filter: { values: { "occurredAt.greaterThanOrEqualTo": "x" } } }])).toEqual([]);
  });
  it("labels a field by its key where no tile states a label", () => {
    expect(tileFacets([{ label: "Failed", filter: { field: "status", value: "FAILED" } }])[0]?.label).toBe("status");
  });
});

describe("missingTileFacets", () => {
  const facet = { field: "standing", label: "Standing", options: [{ value: "ACTIVE", label: "Active" }] };
  it("keeps a facet the list has no way to narrow by", () => {
    expect(missingTileFacets([facet], { filterFields: ["nativeName"] })).toEqual([facet]);
  });
  it("drops a facet the list filters by, chips or narrows already", () => {
    expect(missingTileFacets([facet], { filterFields: ["standing"] })).toEqual([]);
    expect(missingTileFacets([facet], { filterFields: [], chipField: "standing" })).toEqual([]);
    expect(missingTileFacets([facet], { filterFields: [], narrowingKey: "standing.in" })).toEqual([]);
  });
});
