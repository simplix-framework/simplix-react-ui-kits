import { describe, expect, it, vi } from "vitest";

import { countNotice } from "./count-notice";

const t = ((key: string, values?: { count?: number }) => (values?.count === undefined ? key : `${key}:${values.count}`)) as Parameters<typeof countNotice>[0]["words"]["t"];

describe("countNotice", () => {
  it("is raised only while its count is above zero, and not while the count is being read", () => {
    const filters = { commitValue: vi.fn(), commitValues: vi.fn() };
    const spec = { key: "failed", kind: "danger" as const, narrow: { field: "status.in", value: ["FAILED"] }, words: { t, prefix: "failedNotice" } };
    expect(countNotice({ ...spec, count: 3 }, filters).when).toBe(true);
    expect(countNotice({ ...spec, count: 0 }, filters).when).toBe(false);
    expect(countNotice({ ...spec, count: undefined }, filters).when).toBe(false);
  });

  it("says the count in its title, takes its words from one prefix, and narrows the list to what it counts", () => {
    const filters = { commitValue: vi.fn(), commitValues: vi.fn() };
    const notice = countNotice({ key: "failed", kind: "danger", count: 3, narrow: { field: "status.in", value: ["FAILED"] }, words: { t, prefix: "failedNotice" } }, filters);
    expect([notice.title, notice.hint, notice.actionLabel]).toEqual(["failedNotice.title:3", "failedNotice.hint", "failedNotice.action"]);
    notice.onAction?.();
    expect(filters.commitValue).toHaveBeenCalledWith("status.in", ["FAILED"]);
  });

  it("writes several keys at once where the rows are counted under two conditions", () => {
    const filters = { commitValue: vi.fn(), commitValues: vi.fn() };
    countNotice({ key: "server", kind: "danger", count: 1, narrow: { values: { "occurredAt.greaterThanOrEqualTo": "x", "httpStatus.greaterThanOrEqualTo": 500 } }, words: { t, prefix: "n" } }, filters).onAction?.();
    expect(filters.commitValues).toHaveBeenCalledWith({ "occurredAt.greaterThanOrEqualTo": "x", "httpStatus.greaterThanOrEqualTo": 500 });
  });

  it("raises an unread warning, under a key of its own and with no action, where the count could not be read", () => {
    const filters = { commitValue: vi.fn(), commitValues: vi.fn() };
    const notice = countNotice({ key: "failed", kind: "danger", count: undefined, unread: true, narrow: { field: "status.in", value: ["FAILED"] }, words: { t, prefix: "failedNotice" } }, filters);
    expect(notice).toEqual({ key: "failed-unread", kind: "warning", when: true, title: "failedNotice.unreadTitle", hint: "failedNotice.unreadHint" });
  });

  it("raises the count notice, not the unread one, where the read answered", () => {
    const filters = { commitValue: vi.fn(), commitValues: vi.fn() };
    const notice = countNotice({ key: "failed", kind: "danger", count: 2, unread: false, narrow: { field: "status.in", value: ["FAILED"] }, words: { t, prefix: "failedNotice" } }, filters);
    expect(notice.key).toBe("failed");
    expect(notice.when).toBe(true);
  });
});
