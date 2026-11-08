import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { UIProvider, type CrudListFilters } from "@simplix-react/ui";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { ListTimeRange, windowClear, windowCommit } from "./list-time-range";

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
/** The preset button of a window; no catalog is loaded here, so a preset reads as its key. */
const pressed = (el: HTMLElement, window: string) =>
  [...el.querySelectorAll<HTMLButtonElement>('[data-slot="time-range-preset"]')].find((one) => one.textContent === `timeRange.presets.${window}`);
const pressedPresets = (el: HTMLElement) => [...el.querySelectorAll("button")].filter((one) => one.getAttribute("aria-pressed") === "true");
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

  it("commits the strip's own pair, and clears every other bound of the field in the same commit, when a window is pressed while none is selected", () => {
    const commit = vi.fn();
    const el = mount(filtersOf({}, commit));
    act(() => pressed(el, "1d")?.click());
    expect(commit).toHaveBeenCalledTimes(1);
    const written = commit.mock.calls[0]?.[0] as Record<string, string | undefined>;
    expect(typeof written[`${FIELD}.between`]).toBe("string");
    expect(written[`${FIELD}.greaterThan`]).toBeUndefined();
    expect(Object.keys(written)).toEqual(Object.keys(windowCommit(FIELD, new Date(), new Date())));
  });
});

describe("turning the strip off", () => {
  const hour = 3_600_000;
  /** A selection inside the default window, with a bound of the filter bar beside the strip's own pair. */
  const selected = () => {
    const from = new Date(Date.now() - 3 * hour).toISOString();
    const to = new Date(Date.now() - 1 * hour).toISOString();
    return { [`${FIELD}.between`]: `${from},${to}`, [`${FIELD}.greaterThan`]: "2026-10-01T00:00:00Z" };
  };
  /** Every key of the field's window, each committed as undefined and none left out. */
  const cleared = (commit: ReturnType<typeof vi.fn>) => {
    expect(commit).toHaveBeenCalledTimes(1);
    const written = commit.mock.calls[0]?.[0] as Record<string, unknown>;
    expect(written).toEqual(windowClear(FIELD));
    expect(Object.values(written).every((value) => value === undefined)).toBe(true);
    expect(Object.keys(written)).toEqual(Object.keys(windowCommit(FIELD, new Date(), new Date())));
  };

  it("clears every window key of the field on a second press of the lit window, instead of selecting the visible one", () => {
    const commit = vi.fn();
    const el = mount(filtersOf(selected(), commit));
    expect(pressed(el, "1d")?.getAttribute("aria-pressed")).toBe("true");
    act(() => pressed(el, "1d")?.click());
    cleared(commit);
  });

  it("clears every window key of the field with the clear control beside the selection", () => {
    const commit = vi.fn();
    const el = mount(filtersOf(selected(), commit));
    expect(badge(el)).not.toBeNull();
    act(() => clear(el)?.click());
    cleared(commit);
  });

  it("clears every window key of the field on Escape over the strip", () => {
    const commit = vi.fn();
    const el = mount(filtersOf(selected(), commit));
    act(() => {
      el.querySelector('[role="group"]')?.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    });
    cleared(commit);
  });

  it("writes nothing on Escape while no bound is committed, and passes the strip no selection", () => {
    const commit = vi.fn();
    const el = mount(filtersOf({}, commit));
    expect(badge(el)).toBeNull();
    expect(pressedPresets(el)).toHaveLength(0);
    act(() => {
      el.querySelector('[role="group"]')?.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    });
    expect(commit).not.toHaveBeenCalled();
  });

  it("lights a window on the first press and does not clear", () => {
    const commit = vi.fn();
    const el = mount(filtersOf({}, commit));
    act(() => pressed(el, "7d")?.click());
    expect(commit).toHaveBeenCalledTimes(1);
    const written = commit.mock.calls[0]?.[0] as Record<string, unknown>;
    expect(typeof written[`${FIELD}.between`]).toBe("string");
  });
});
