import { describe, expect, it } from "vitest";

import { listTotal, type ListTotalSource } from "./list-total";

const answered = (over: Partial<ListTotalSource> = {}): ListTotalSource => ({
  isLoading: false,
  error: null,
  isPaused: false,
  failureCount: 0,
  data: [],
  pagination: { page: 1, pageSize: 20, total: 0, totalPages: 1, setPage: () => undefined, setPageSize: () => undefined },
  ...over,
});

describe("listTotal", () => {
  it("states the server's total once the read has answered, zero included", () => {
    expect(listTotal(answered())).toBe(0);
    expect(listTotal(answered({ data: [{}], pagination: { ...answered().pagination, total: 41 } }))).toBe(41);
  });

  it("knows no total while the first page is in flight", () => {
    expect(listTotal(answered({ isLoading: true }))).toBeUndefined();
  });

  it("knows no total while the read is failing", () => {
    expect(listTotal(answered({ error: new Error("HTTP 500") }))).toBeUndefined();
  });

  it("knows no total while a stalled or retrying read has returned nothing", () => {
    expect(listTotal(answered({ isPaused: true }))).toBeUndefined();
    expect(listTotal(answered({ failureCount: 1 }))).toBeUndefined();
  });

  it("keeps a known total through a refetch that already has rows", () => {
    expect(listTotal(answered({ data: [{}], failureCount: 1, pagination: { ...answered().pagination, total: 3 } }))).toBe(3);
  });

  it("knows no total for a list the screen holds back, whatever the idle state reports", () => {
    expect(listTotal(answered(), { enabled: false })).toBeUndefined();
    expect(listTotal(answered({ data: [{}], pagination: { ...answered().pagination, total: 5 } }), { enabled: false })).toBeUndefined();
  });

  it("states the total of a list the screen reads", () => {
    expect(listTotal(answered(), { enabled: true })).toBe(0);
    expect(listTotal(answered())).toBe(0);
  });
});
