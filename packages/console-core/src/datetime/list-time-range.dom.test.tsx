import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { UIProvider, type CrudListFilters } from "@simplix-react/ui";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { ListTimeRange, windowCommit } from "./list-time-range";

let root: Root | undefined;
let host: HTMLElement | undefined;

beforeAll(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.stubGlobal("matchMedia", (query: string) => ({ matches: false, media: query, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} }));
  vi.stubGlobal("ResizeObserver", class { observe() {} unobserve() {} disconnect() {} });
});

afterEach(() => {
  act(() => root?.unmount());
  host?.remove();
  root = undefined;
  host = undefined;
});

const FIELD = "occurredAt";

function filtersOf(committedValues: Record<string, unknown>, commitValues = vi.fn()): CrudListFilters {
  return { committedValues, commitValues } as unknown as CrudListFilters;
}

function mount(filters: CrudListFilters) {
  const element = createElement(UIProvider, { children: createElement(ListTimeRange, { filters, field: FIELD, fetchCounts: async () => [] }) });
  if (!root) {
    host = document.createElement("div");
    document.body.append(host);
    root = createRoot(host);
  }
  act(() => root?.render(element));
  return host as HTMLElement;
}

const badge = (el: HTMLElement) => el.querySelector('[data-slot="time-range-badge"]');
const clear = (el: HTMLElement) => el.querySelector<HTMLButtonElement>('[data-slot="time-range-action"][data-kind="clear"]');

describe("the time strip over a list", () => {
  it("draws nothing selected while the list carries no bound on the field, and writes nothing", () => {
    const commit = vi.fn();
    const el = mount(filtersOf({}, commit));
    expect(badge(el)).toBeNull();
    expect(clear(el)).toBeNull();
    expect(commit).not.toHaveBeenCalled();
  });

  it("draws the window the list is committed to, whichever control committed it", () => {
    const el = mount(filtersOf({ [`${FIELD}.greaterThanOrEqualTo`]: "2026-11-01T00:00:00Z", [`${FIELD}.lessThan`]: "2026-11-02T00:00:00Z" }));
    expect(badge(el)).not.toBeNull();
  });

  it("goes back to nothing selected when the filter bar clears the bounds, which is the one clear that unselects", () => {
    const el = mount(filtersOf({ [`${FIELD}.between`]: "2026-11-01T00:00:00Z,2026-11-02T00:00:00Z" }));
    expect(badge(el)).not.toBeNull();
    mount(filtersOf({}));
    expect(badge(el)).toBeNull();
    expect(clear(el)).toBeNull();
  });

  it("commits the strip's own pair, and clears every other bound of the field in the same commit, when the strip's clear writes the visible window", () => {
    const commit = vi.fn();
    // A selection inside the default window, where the strip draws its clear control.
    const hour = 3_600_000;
    const from = new Date(Date.now() - 3 * hour).toISOString();
    const to = new Date(Date.now() - 1 * hour).toISOString();
    const el = mount(filtersOf({ [`${FIELD}.between`]: `${from},${to}`, [`${FIELD}.greaterThan`]: "2026-10-01T00:00:00Z" }, commit));
    expect(badge(el)).not.toBeNull();
    act(() => clear(el)?.click());
    expect(commit).toHaveBeenCalledTimes(1);
    const written = commit.mock.calls[0]?.[0] as Record<string, string | undefined>;
    // The whole visible window is the selection now (the framework's clear), never an unselected strip.
    expect(typeof written[`${FIELD}.between`]).toBe("string");
    expect(written[`${FIELD}.greaterThan`]).toBeUndefined();
    expect(Object.keys(written)).toEqual(Object.keys(windowCommit(FIELD, new Date(), new Date())));
  });
});
