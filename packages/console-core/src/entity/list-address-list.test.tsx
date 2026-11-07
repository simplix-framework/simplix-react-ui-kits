import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { adaptForcedList, adaptOrvalList, filtersToRequestParams, forcedScope, UIProvider, useCrudList, withForced, type UseCrudListResult } from "@simplix-react/ui";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { declareListAddress, type ListAddress } from "./list-address";
import type { ContractFilter } from "./record-contract";
import { RecordList, type RecordColumn, type RecordFilter } from "./record-list";

/**
 * The generated list hands `useCrudList` the option its declaration builds from the page's address.
 * These tests run that composition on the framework's own list state, with a stand-in for the
 * generated read, so what the address does to the first request is observed rather than read off
 * the template.
 */

interface Row {
  readonly id: string;
  readonly status: string;
}

const DEFS: readonly ContractFilter[] = [
  { kind: "choice", field: "status", options: ["FAILED", "PAUSED"] },
  { kind: "toggle", field: "retried" },
  { kind: "number", field: "attempts" },
];
const declaration = declareListAddress(DEFS);

/** The generated list read: records the parameters each request carries. */
const read = vi.fn((_params: Record<string, unknown>, _options: unknown) => ({ data: { content: [] as Row[], totalElements: 0 }, isLoading: false, error: null }));
beforeEach(() => read.mockClear());

/** The parameters of the latest request, without its page window. */
function lastRequest(): Record<string, unknown> {
  const { page: _page, size: _size, ...rest } = read.mock.calls.at(-1)?.[0] ?? {};
  return rest;
}

const address = (value: ListAddress["value"]): ListAddress => ({ value, onChange: vi.fn() });

/** Renders a list the way a generated hook builds it, once, and returns what the first render holds. */
function firstRender(value: ListAddress["value"], forced?: Record<string, unknown>) {
  let held: UseCrudListResult<Row> | undefined;
  function Probe() {
    const useList = forced ? adaptForcedList<Row>(read, forced) : adaptOrvalList<Row>(read);
    held = useCrudList<Row>(useList, {
      stateMode: "server",
      filterMode: "immediate",
      scopeKey: forced ? forcedScope(forced) : undefined,
      addressedFilters: declaration.addressed(address(value), forced),
    });
    return null;
  }
  renderToStaticMarkup(createElement(Probe));
  if (!held) throw new Error("the probe did not render");
  return held;
}

describe("a list opened on its page's address", () => {
  it("starts on the filters the address carries and sends them in its first request", () => {
    const list = firstRender({ "status.in": "FAILED", "retried.equals": "true", "attempts.greaterThanOrEqualTo": "3" });
    expect(list.filters.committedValues).toEqual({ "status.in": ["FAILED"], "retried.equals": true, "attempts.greaterThanOrEqualTo": 3 });
    expect(lastRequest()).toEqual({ "status.in": ["FAILED"], "retried.equals": true, "attempts.greaterThanOrEqualTo": 3 });
  });

  it("sends nothing for a key the entity does not declare, so the server is never asked a parameter it refuses", () => {
    const list = firstRender({ "status.in": "FAILED", "ghost.in": "x", "status.contains": "F" });
    expect(list.filters.committedValues).toEqual({ "status.in": ["FAILED"] });
    expect(lastRequest()).toEqual({ "status.in": ["FAILED"] });
    expect(Object.keys(lastRequest()).join(" ")).not.toContain("ghost");
  });

  it("opens an address with only stale keys as one with no filters", () => {
    const list = firstRender({ "ghost.in": "x" });
    expect(list.filters.committedValues).toEqual({});
    expect(lastRequest()).toEqual({});
  });

  it("sends what the tile of a count sends for the same filters, since both read the filters the same way", () => {
    const tile = { "status.in": ["FAILED"], "retried.equals": "true" };
    firstRender(tile);
    expect(lastRequest()).toEqual(filtersToRequestParams(declaration.narrow(tile), { controls: declaration.controls }));
  });
});

describe("a list a tab pins a field of", () => {
  const pinned = { "status.equals": "FAILED" };

  it("applies no filter over the pinned field, and the request carries the pin", () => {
    const list = firstRender({ "status.in": ["PAUSED"], "retried.equals": "true" }, pinned);
    expect(list.filters.committedValues).toEqual({ "retried.equals": true });
    expect(lastRequest()).toEqual({ "retried.equals": true, "status.equals": "FAILED" });
  });

  it("applies the same filter on a tab that pins another field", () => {
    const list = firstRender({ "status.in": ["PAUSED"] }, { "retried.equals": "true" });
    expect(list.filters.committedValues).toEqual({ "status.in": ["PAUSED"] });
  });
});

const columns: readonly RecordColumn<Row>[] = [{ key: "status", header: "Status", field: "status", minWidth: 160 }];
const filters: readonly RecordFilter<Row>[] = [
  { kind: "choice", field: "status", label: "Status", options: [{ value: "FAILED", label: "Failed" }] },
  { kind: "toggle", field: "retried" as never, label: "Retried" },
];

/** A list whose committed filters hold a value over each of the fields, drawn as a record list. */
function drawn(forced?: Record<string, unknown>): string {
  const list = firstRender({ "status.in": ["FAILED"], "retried.equals": "true" });
  const carried = forced ? withForced(list, forced) : list;
  return renderToStaticMarkup(createElement(UIProvider, { children: createElement(RecordList<Row>, { rows: [], list: carried, columns, rowId: (row) => row.id, filters }) }));
}

describe("a record list under a tab that pins a field", () => {
  it("draws the active badge of every filter while nothing is pinned", () => {
    const out = drawn();
    expect(out).toContain("Status:");
    expect(out).toContain("Retried:");
  });

  it("leaves out the control and the badge of the pinned field, which could change no row", () => {
    const out = drawn({ "status.equals": "FAILED" });
    expect(out).not.toContain("Status:");
    expect(out).toContain("Retried:");
  });

  it("keeps the control of a field the tab narrows by a set, which the reader can still narrow inside", () => {
    expect(drawn({ "status.in": ["FAILED"] })).toContain("Status:");
  });
});
