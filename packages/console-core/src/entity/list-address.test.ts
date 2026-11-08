import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { SearchOperator, type AddressedFilters, type EntityFacet, type FilterDef } from "@simplix-react/ui";
import { describe, expect, it, vi } from "vitest";

import { filterDef, type RecordFilter } from "./record-list";
import { recordFilterOf, type ContractFilter } from "./record-contract";
import { windowKeysOf } from "../datetime/window-keys";
import { declareListAddress, declaredFilterKeys, filterControlsOf, narrowAddressedFilters, type ListAddress } from "./list-address";

/** A declaration of every kind, as a generated list states its filters. */
const DEFS: readonly ContractFilter[] = [
  { kind: "choice", field: "status", enumName: "JobStatus", options: ["FAILED", "PAUSED"] },
  { kind: "toggle", field: "retried" },
  { kind: "text", field: "provider" },
  { kind: "text", field: "planCode", operators: ["equals"] },
  { kind: "number", field: "attempts" },
  { kind: "dateRange", field: "startedAt" },
  { kind: "reference", field: "ownerId" },
];

const FACETED = { facetFields: ["ownerId"] };

describe("the filters an address may carry for a list", () => {
  it("keeps a declared key and drops a key the entity does not declare", () => {
    expect(narrowAddressedFilters(DEFS, { "status.in": ["FAILED"], "oldField.in": "x", "status.contains": "F" })).toEqual({ "status.in": ["FAILED"] });
  });

  it("drops every key of a stale link, and answers nothing rather than an empty object", () => {
    expect(narrowAddressedFilters(DEFS, { "gone.in": "x" })).toBeUndefined();
    expect(narrowAddressedFilters(DEFS, {})).toBeUndefined();
    expect(narrowAddressedFilters(DEFS, undefined)).toBeUndefined();
  });

  it("keeps the value of a kept key as it came, a string staying a string and an array an array", () => {
    expect(narrowAddressedFilters(DEFS, { "status.in": "FAILED", "retried.equals": "true" })).toEqual({ "status.in": "FAILED", "retried.equals": "true" });
    expect(narrowAddressedFilters(DEFS, { "status.in": ["FAILED", "PAUSED"] })).toEqual({ "status.in": ["FAILED", "PAUSED"] });
  });

  describe("by the kind of control", () => {
    it("lets a choice carry its membership key only", () => {
      expect(declaredFilterKeys([DEFS[0]!])).toEqual(new Set(["status.in"]));
      expect(narrowAddressedFilters([DEFS[0]!], { "status.equals": "FAILED", "status.notIn": "FAILED" })).toBeUndefined();
    });

    it("lets a toggle carry its equals key only", () => {
      expect(declaredFilterKeys([DEFS[1]!])).toEqual(new Set(["retried.equals"]));
      expect(narrowAddressedFilters([DEFS[1]!], { "retried.in": "true" })).toBeUndefined();
    });

    it("lets a text carry contains and equals when it names no operator", () => {
      expect(declaredFilterKeys([DEFS[2]!])).toEqual(new Set(["provider.contains", "provider.equals"]));
      expect(narrowAddressedFilters([DEFS[2]!], { "provider.startsWith": "a" })).toBeUndefined();
    });

    it("lets a text carry the operators it declares, and not the default pair", () => {
      expect(declaredFilterKeys([DEFS[3]!])).toEqual(new Set(["planCode.equals"]));
      expect(narrowAddressedFilters([DEFS[3]!], { "planCode.contains": "a", "planCode.equals": "pro" })).toEqual({ "planCode.equals": "pro" });
    });

    it("falls back to the default pair for a text whose declared operators the bar does not know", () => {
      const declared: ContractFilter = { kind: "text", field: "name", operators: ["soundsLike"] };
      expect(declaredFilterKeys([declared])).toEqual(new Set(["name.contains", "name.equals"]));
    });

    it("lets a number carry equals and the two bounds the control offers", () => {
      expect(declaredFilterKeys([DEFS[4]!])).toEqual(new Set(["attempts.equals", "attempts.greaterThanOrEqualTo", "attempts.lessThanOrEqualTo"]));
      expect(narrowAddressedFilters([DEFS[4]!], { "attempts.greaterThan": "3" })).toBeUndefined();
    });

    it("lets a period carry its two bounds and nothing else", () => {
      expect(declaredFilterKeys([DEFS[5]!])).toEqual(new Set(["startedAt.greaterThanOrEqualTo", "startedAt.lessThanOrEqualTo"]));
      expect(narrowAddressedFilters([DEFS[5]!], { "startedAt.equals": "2026-11-01", "startedAt.lessThanOrEqualTo": "2026-11-08" })).toEqual({ "startedAt.lessThanOrEqualTo": "2026-11-08" });
    });
  });

  describe("a reference filter", () => {
    it("is dropped with its key when the list supplies no facet, since it draws no control", () => {
      expect(declaredFilterKeys([DEFS[6]!])).toEqual(new Set());
      expect(filterControlsOf([DEFS[6]!])).toEqual([]);
      expect(narrowAddressedFilters([DEFS[6]!], { "ownerId.in": "u1" })).toBeUndefined();
    });

    it("carries its membership key once the list supplies a facet for the field", () => {
      expect(narrowAddressedFilters([DEFS[6]!], { "ownerId.in": ["u1"], "ownerId.equals": "u1" }, FACETED)).toEqual({ "ownerId.in": ["u1"] });
    });

    it("is not given a facet by another field's", () => {
      expect(declaredFilterKeys([DEFS[6]!], { facetFields: ["somethingElse"] })).toEqual(new Set());
    });
  });
});

describe("the controls a list reads its address with", () => {
  it("names each control's field and type, so a toggle reads back as a boolean and a number as a number", () => {
    expect(filterControlsOf(DEFS, FACETED)).toEqual([
      { field: "status", type: "faceted" },
      { field: "retried", type: "toggle" },
      { field: "provider", type: "text" },
      { field: "planCode", type: "text" },
      { field: "attempts", type: "number" },
      { field: "startedAt", type: "dateRange" },
      { field: "ownerId", type: "faceted" },
    ]);
  });
});

/** The keys the filter bar's own control commits, read off the control definition the list draws. */
function keysOfControl(def: FilterDef): string[] {
  switch (def.type) {
    case "faceted":
    case "country":
    case "timezone":
      return [`${def.field}.${SearchOperator.IN}`];
    case "toggle":
      return [`${def.field}.${SearchOperator.EQUALS}`];
    case "dateRange":
      return [`${def.field}.${SearchOperator.GREATER_THAN_OR_EQUAL}`, `${def.field}.${SearchOperator.LESS_THAN_OR_EQUAL}`];
    case "text":
    case "number":
      return def.operators.map((operator) => `${def.field}.${operator}`);
  }
}

describe("the narrowing against the controls the list draws", () => {
  const facet: EntityFacet = { options: [], loading: false, selectedOptions: [], onSearch: vi.fn() };

  /** The control the list draws for a declaration, built the way the generated list builds it. */
  function drawn(def: ContractFilter): FilterDef | undefined {
    const filter: RecordFilter<Record<string, unknown>> | undefined = recordFilterOf(def, def.field, (_enumName, value) => value, { [def.field]: facet });
    return filter ? filterDef(filter) : undefined;
  }

  for (const def of DEFS) {
    it(`commits for a ${def.kind} filter exactly the keys its drawn control commits`, () => {
      const control = drawn(def);
      if (!control) throw new Error(`no control is drawn for ${def.field}`);
      expect(declaredFilterKeys([def], { facetFields: [def.field] })).toEqual(new Set(keysOfControl(control)));
      expect(filterControlsOf([def], { facetFields: [def.field] })).toEqual([{ field: control.field, type: control.type }]);
    });
  }

  it("reads a declared text operator the control would offer", () => {
    const control = drawn({ kind: "text", field: "planCode", operators: ["equals", "startsWith"] });
    expect(control).toMatchObject({ type: "text", operators: ["equals", "startsWith"] });
    expect(declaredFilterKeys([{ kind: "text", field: "planCode", operators: ["equals", "startsWith"] }])).toEqual(new Set(["planCode.equals", "planCode.startsWith"]));
  });
});

describe("a list's declared address", () => {
  const declaration = declareListAddress(DEFS, FACETED);

  /** What the declaration hands `useCrudList` for an address, read in one render, since it is a hook. */
  function addressedBy(address: ListAddress | undefined, forced?: Readonly<Record<string, unknown>>): AddressedFilters | undefined {
    let handed: AddressedFilters | undefined;
    function Probe() {
      handed = declaration.useAddressed(address, forced);
      return null;
    }
    renderToStaticMarkup(createElement(Probe));
    return handed;
  }

  it("offers the controls and keys the functions above answer, and narrows as they do", () => {
    expect(declaration.controls).toEqual(filterControlsOf(DEFS, FACETED));
    expect(declaration.keys).toEqual(declaredFilterKeys(DEFS, FACETED));
    expect(declaration.narrow({ "status.in": "FAILED", "gone.in": "x" })).toEqual({ "status.in": "FAILED" });
    expect(declaration.narrow(undefined)).toBeUndefined();
  });

  it("hands the list the narrowed address, the controls and the forced request", () => {
    const forced = { "standing.equals": "ACTIVE" };
    const addressed = addressedBy({ value: { "status.in": "FAILED", "gone.in": "x" }, onChange: vi.fn() }, forced);
    expect(addressed).toMatchObject({ value: { "status.in": "FAILED" }, controls: declaration.controls, forced });
  });

  it("passes the list's write on to the page's address", () => {
    const onChange = vi.fn();
    addressedBy({ value: undefined, onChange })?.onChange({ "status.in": ["PAUSED"] });
    expect(onChange).toHaveBeenCalledWith({ "status.in": ["PAUSED"] });
  });

  it("hands nothing to a list that has no address, which then keeps its filters to itself", () => {
    expect(addressedBy(undefined, { "standing.equals": "ACTIVE" })).toBeUndefined();
  });

  it("answers an address that names no declared key as one that names none, so the list's defaults apply", () => {
    expect(addressedBy({ value: { "gone.in": "x" }, onChange: vi.fn() })?.value).toBeUndefined();
  });
});

describe("the time range a page draws over a field", () => {
  const WITH_RANGE = { ...FACETED, timeRangeField: "occurredAt" };

  it("makes the strip's keys and the bar's bounds keys the address may carry, and no control of them", () => {
    const keys = declaredFilterKeys(DEFS, WITH_RANGE);
    for (const key of windowKeysOf("occurredAt")) expect(keys.has(key)).toBe(true);
    expect(filterControlsOf(DEFS, WITH_RANGE)).toEqual(filterControlsOf(DEFS, FACETED));
  });

  it("keeps a link's window on the field and drops the same keys where the page draws no time range", () => {
    const link = { "occurredAt.between": "2026-11-08T00:00:00Z,2026-11-09T00:00:00Z", "status.in": "FAILED" };
    expect(narrowAddressedFilters(DEFS, link, WITH_RANGE)).toEqual(link);
    expect(narrowAddressedFilters(DEFS, link, FACETED)).toEqual({ "status.in": "FAILED" });
  });

  it("keeps the window of the named field only, not another field's", () => {
    expect(narrowAddressedFilters(DEFS, { "other.between": "a,b", "occurredAt.greaterThanOrEqualTo": "2026-11-08T00:00:00Z" }, WITH_RANGE)).toEqual({
      "occurredAt.greaterThanOrEqualTo": "2026-11-08T00:00:00Z",
    });
  });

  it("is handed to the list through the declaration, so an arriving window is applied and not silently dropped", () => {
    const declaration = declareListAddress(DEFS, WITH_RANGE);
    let handed: AddressedFilters | undefined;
    function Probe() {
      handed = declaration.useAddressed({ value: { "occurredAt.between": "a,b", "gone.in": "x" }, onChange: vi.fn() });
      return null;
    }
    renderToStaticMarkup(createElement(Probe));
    expect(handed?.value).toEqual({ "occurredAt.between": "a,b" });
  });
});

describe("an address declared over the set a list draws", () => {
  const DRAWN = DEFS.filter((def) => def.field === "status");

  it("carries no key of a filter the list does not draw, which a declaration over the whole contract would", () => {
    const link = { "status.in": "FAILED", "retried.equals": "true" };
    expect(narrowAddressedFilters(DRAWN, link)).toEqual({ "status.in": "FAILED" });
    expect(narrowAddressedFilters(DEFS, link, FACETED)).toEqual(link);
  });
});
