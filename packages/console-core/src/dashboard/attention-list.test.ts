import { describe, expect, it } from "vitest";

import { raisedAttention } from "./attention-list";

describe("raisedAttention", () => {
  const entries = [
    { key: "voices", kind: "info" as const, title: "Voices awaiting consent", when: true },
    { key: "breaker", kind: "danger" as const, title: "A cost breaker is open", when: false },
    { key: "jobs", kind: "warning" as const, title: "Jobs failed", when: true },
    { key: "payments", kind: "danger" as const, title: "Payment events failed", when: true },
  ];
  it("lists only the notices whose state holds", () => {
    expect(raisedAttention(entries).map((entry) => entry.key)).not.toContain("breaker");
  });
  it("lists act-now first, then act-soon, then the rest in their order", () => {
    expect(raisedAttention(entries).map((entry) => entry.key)).toEqual(["payments", "jobs", "voices"]);
  });
});
