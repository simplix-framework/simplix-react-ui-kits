import { describe, expect, it } from "vitest";

import { raisedRecordNotices } from "./record-blocks";

describe("raisedRecordNotices", () => {
  it("draws a notice whose state holds and leaves out one whose state does not", () => {
    const notices = [
      { key: "suspended", tone: "warning" as const, title: "This account is suspended", when: true },
      { key: "never", tone: "info" as const, title: "Has not signed in yet", when: false },
      { key: "standing", tone: "info" as const, title: "Always" },
    ];
    expect(raisedRecordNotices(notices).map((notice) => notice.key)).toEqual(["suspended", "standing"]);
  });
  it("draws nothing for no notices", () => {
    expect(raisedRecordNotices(undefined)).toEqual([]);
  });
});
