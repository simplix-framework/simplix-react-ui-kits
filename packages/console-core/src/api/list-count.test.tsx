import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { RECORD_READ_META } from "../entity/record-read-meta";
import { useListCount, useListCountRead, type ListCountHook, type ListCountOptions, type ListCountRead } from "./list-count";

function count<P extends object>(hook: ListCountHook<P>, params: P, enabled?: boolean | ListCountOptions): number | null {
  let out: number | undefined;
  function Probe() {
    out = useListCount(hook, params, enabled);
    return null;
  }
  renderToStaticMarkup(createElement(Probe));
  return out ?? null;
}

describe("useListCount", () => {
  it("reads a one-row page under the list's conditions and answers its total", () => {
    const hook = vi.fn(() => ({ data: { content: [{}], totalElements: 42 } }));
    expect(count(hook, { "status.in": ["FAILED"] })).toBe(42);
    expect(hook).toHaveBeenCalledWith({ "status.in": ["FAILED"], page: 0, size: 1 }, { query: { enabled: true, meta: RECORD_READ_META } });
  });

  it("answers nothing while unread, after a failure and when not asked, never a zero nobody counted", () => {
    expect(count(() => ({ data: undefined }), {})).toBeNull();
    expect(count(() => ({ data: { content: [], totalElements: 0 }, isError: true }), {})).toBeNull();
    expect(count(() => ({ data: { content: [], totalElements: 9 } }), {}, false)).toBeNull();
    expect(count(() => ({ data: { content: [], totalElements: 0 } }), {})).toBe(0);
  });

  it("reads the count again on the interval a figure that follows the minute asks for", () => {
    const hook = vi.fn(() => ({ data: { content: [{}], totalElements: 3 } }));
    expect(count(hook, { "state.equals": "OPEN" }, { refetchInterval: 60_000 })).toBe(3);
    expect(hook).toHaveBeenCalledWith({ "state.equals": "OPEN", page: 0, size: 1 }, { query: { enabled: true, refetchInterval: 60_000, meta: RECORD_READ_META } });
  });

  it("takes enabled from the options as from the flag", () => {
    expect(count(() => ({ data: { content: [], totalElements: 9 } }), {}, { enabled: false, refetchInterval: 60_000 })).toBeNull();
  });
});

function read<P extends object>(hook: ListCountHook<P>, params: P, options?: boolean | ListCountOptions): ListCountRead {
  let out: ListCountRead | undefined;
  function Probe() {
    out = useListCountRead(hook, params, options);
    return null;
  }
  renderToStaticMarkup(createElement(Probe));
  if (!out) throw new Error("the probe did not render");
  return out;
}

describe("a count read's own failure", () => {
  it("leaves the error dialog to the page, which says the figure is unread itself", () => {
    const hook = vi.fn(() => ({ data: undefined }));
    count(hook, {});
    expect(hook).toHaveBeenCalledWith({ page: 0, size: 1 }, { query: { enabled: true, meta: { suppressErrorDialog: true } } });
  });

  it("is unread only for a read that was asked for and failed", () => {
    expect(read(() => ({ data: undefined, isError: true }), {})).toEqual({ count: undefined, unread: true });
    expect(read(() => ({ data: undefined, isError: true }), {}, false)).toEqual({ count: undefined, unread: false });
    expect(read(() => ({ data: undefined }), {})).toEqual({ count: undefined, unread: false });
    expect(read(() => ({ data: { content: [], totalElements: 4 } }), {})).toEqual({ count: 4, unread: false });
  });
});
