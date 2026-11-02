import { describe, expect, it } from "vitest";

import { confirmDestructive, confirmSentence } from "./action-confirm";

interface Grant {
  readonly revoked: boolean;
}

describe("confirmSentence", () => {
  it("returns a fixed sentence whether or not a record is held", () => {
    expect(confirmSentence("Revoke", { revoked: false })).toBe("Revoke");
    expect(confirmSentence("Revoke", null)).toBe("Revoke");
  });

  it("writes a sentence from the record held, so one confirmation words both directions", () => {
    const label = (grant: Grant) => (grant.revoked ? "Reinstate" : "Revoke");
    expect(confirmSentence(label, { revoked: true })).toBe("Reinstate");
    expect(confirmSentence(label, { revoked: false })).toBe("Revoke");
  });

  it("draws nothing while no record is held, so a function is never handed null", () => {
    expect(confirmSentence(() => "never", null)).toBe("");
  });
});

describe("confirmDestructive", () => {
  it("keeps the boolean form: absent is plain, true is danger", () => {
    expect(confirmDestructive(undefined, null)).toBe(false);
    expect(confirmDestructive(true, null)).toBe(true);
    expect(confirmDestructive(false, { revoked: false })).toBe(false);
  });

  it("decides from the record held, and is plain while none is held", () => {
    const danger = (grant: Grant) => !grant.revoked;
    expect(confirmDestructive(danger, { revoked: false })).toBe(true);
    expect(confirmDestructive(danger, { revoked: true })).toBe(false);
    expect(confirmDestructive(danger, null)).toBe(false);
  });
});
