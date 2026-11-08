import { act, createElement, useState, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { adaptOrvalList, useCrudList, type CrudSearchFilters, type UseCrudListResult } from "@simplix-react/ui";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { declareListAddress, type ListAddress } from "./list-address";
import type { ContractFilter } from "./record-contract";

/**
 * The address and the list's own state are two copies of one set of filters, and the framework keeps
 * them equal by comparing them. A key the list commits that the declaration does not know (a time
 * range over a stamp, a pressed tile, a chip row) is in the list's copy; if the address were read
 * back without it the two copies would differ, the list would take the address's copy as somebody
 * else's change, and the reader's key would vanish at their next filter change.
 *
 * <p>These tests mount the list under a real React root and a DOM, since the loop runs through
 * effects, which a static render never reaches. The DOM is the framework checkout's own `jsdom`.
 */

interface Row {
  readonly id: string;
}

const DEFS: readonly ContractFilter[] = [
  { kind: "choice", field: "status", options: ["FAILED", "PAUSED"] },
  { kind: "toggle", field: "retried" },
];
const declaration = declareListAddress(DEFS);
/** The same list on a page that draws a time range over `startedAt`. */
const withRange = declareListAddress(DEFS, { timeRangeField: "startedAt" });

const read = vi.fn((_params: Record<string, unknown>, _options: unknown) => ({ data: { content: [] as Row[], totalElements: 0 }, isLoading: false, error: null }));
const useJobs = adaptOrvalList<Row>(read);

/** What the latest render of the harness held: the list, the filters its address carries and the way to move that address. */
const held: { list?: UseCrudListResult<Row>; address?: CrudSearchFilters; move?: (next: CrudSearchFilters | undefined) => void } = {};

/** A page with no router: the address is a state, written the way a route's `navigate` writes it. */
function Harness({ initial, forced, declared = declaration }: { initial?: CrudSearchFilters; forced?: Record<string, unknown>; declared?: typeof declaration }): ReactNode {
  const [address, setAddress] = useState<CrudSearchFilters | undefined>(initial);
  const where: ListAddress = { value: address, onChange: setAddress };
  const list = useCrudList<Row>(useJobs, {
    stateMode: "server",
    filterMode: "immediate",
    addressedFilters: declared.useAddressed(where, forced),
  });
  held.list = list;
  held.address = address;
  // The address can also be moved by something other than the list: a link, Back.
  held.move = setAddress;
  return null;
}

let root: Root | undefined;

beforeAll(() => {
  // React's `act` is quiet only in a test environment that says so.
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
});

afterEach(() => {
  act(() => root?.unmount());
  root = undefined;
  read.mockClear();
});

function mount(props: { initial?: CrudSearchFilters; forced?: Record<string, unknown>; declared?: typeof declaration } = {}): void {
  root = createRoot(document.createElement("div"));
  act(() => root?.render(createElement(Harness, props)));
}

const committed = () => held.list?.filters.committedValues;

describe("a list and its address, both ways, when the list commits a key the declaration does not know", () => {
  it("keeps the key the list committed when the reader then changes a filter the declaration knows", () => {
    mount();
    act(() => held.list?.filters.commitValue("startedAt.between", "2026-11-01T00:00:00Z,2026-11-02T00:00:00Z"));
    expect(committed()).toEqual({ "startedAt.between": "2026-11-01T00:00:00Z,2026-11-02T00:00:00Z" });
    act(() => held.list?.filters.commitValue("status.in", ["FAILED"]));
    expect(committed()).toEqual({ "startedAt.between": "2026-11-01T00:00:00Z,2026-11-02T00:00:00Z", "status.in": ["FAILED"] });
    expect(held.address).toEqual({ "startedAt.between": "2026-11-01T00:00:00Z,2026-11-02T00:00:00Z", "status.in": ["FAILED"] });
  });

  it("lets the key go once the list clears it, so it does not come back from the address", () => {
    mount();
    act(() => held.list?.filters.commitValues({ "ghost.in": ["x"], "status.in": ["FAILED"] }));
    act(() => held.list?.filters.commitValue("ghost.in", undefined));
    expect(committed()).toEqual({ "status.in": ["FAILED"] });
    expect(held.address).toEqual({ "status.in": ["FAILED"] });
  });
});

describe("a list opened or moved by an address it did not write", () => {
  it("applies the keys it declares and drops the others, which it never wrote", () => {
    mount({ initial: { "status.in": "FAILED", "ghost.in": "x" } });
    expect(committed()).toEqual({ "status.in": ["FAILED"] });
  });

  it("adopts a declared filter that arrives later, and still drops a key it did not write", () => {
    mount();
    act(() => held.move?.({ "retried.equals": "true", "ghost.in": "x" }));
    expect(committed()).toEqual({ "retried.equals": true });
  });
});

describe("a list opened on a window of the field its page draws a time range over", () => {
  const WINDOW = "2026-11-01T00:00:00Z,2026-11-02T00:00:00Z";

  it("applies the window the address carries, though no filter control is drawn for the field", () => {
    mount({ initial: { "startedAt.between": WINDOW, "ghost.in": "x" }, declared: withRange });
    expect(committed()).toEqual({ "startedAt.between": WINDOW });
  });

  it("keeps that window when the reader then changes a filter", () => {
    mount({ initial: { "startedAt.between": WINDOW }, declared: withRange });
    act(() => held.list?.filters.commitValue("status.in", ["FAILED"]));
    expect(committed()).toEqual({ "startedAt.between": WINDOW, "status.in": ["FAILED"] });
    expect(held.address).toEqual({ "startedAt.between": WINDOW, "status.in": ["FAILED"] });
  });

  it("adopts a window that arrives later", () => {
    mount({ declared: withRange });
    act(() => held.move?.({ "startedAt.between": WINDOW }));
    expect(committed()).toEqual({ "startedAt.between": WINDOW });
  });

  it("drops the same window where the page draws no time range, so no key narrows with nothing to show it", () => {
    mount({ initial: { "startedAt.between": WINDOW } });
    expect(committed()).toEqual({});
  });
});
