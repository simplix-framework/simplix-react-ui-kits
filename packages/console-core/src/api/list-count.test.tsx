import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { useListCount, type ListCountHook, type ListCountOptions } from "./list-count";

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
    expect(hook).toHaveBeenCalledWith({ "status.in": ["FAILED"], page: 0, size: 1 }, { query: { enabled: true } });
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
    expect(hook).toHaveBeenCalledWith({ "state.equals": "OPEN", page: 0, size: 1 }, { query: { enabled: true, refetchInterval: 60_000 } });
  });

  it("takes enabled from the options as from the flag", () => {
    expect(count(() => ({ data: { content: [], totalElements: 9 } }), {}, { enabled: false, refetchInterval: 60_000 })).toBeNull();
  });
});
