import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { useListCount, type ListCountHook } from "./list-count";

function count<P extends object>(hook: ListCountHook<P>, params: P, enabled?: boolean): number | null {
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
});
