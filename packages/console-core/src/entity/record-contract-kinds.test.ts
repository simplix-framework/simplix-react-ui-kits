import { describe, expect, it } from "vitest";
import { peekKindOf } from "./record-contract";

/**
 * A reference whose target a sibling field picks opens the peek of the row's own kind, and a kind
 * with no peek is drawn by name alone rather than opening another kind's record.
 */
describe("peekKindOf", () => {
  const owner = { peekKinds: { field: "ownerType", kinds: { USER: "userAccount" } } };

  it("opens the peek the row's kind names", () => {
    expect(peekKindOf(owner, { ownerType: "USER" })).toBe("userAccount");
    // A boot enum arrives as a labelled object.
    expect(peekKindOf(owner, { ownerType: { value: "USER", label: "User" } })).toBe("userAccount");
  });

  it("opens nothing for a kind no peek is served for", () => {
    expect(peekKindOf(owner, { ownerType: "TEAM" })).toBeUndefined();
    expect(peekKindOf(owner, undefined)).toBeUndefined();
  });

  it("keeps a plain reference's own peek", () => {
    expect(peekKindOf({ peekKind: "plan" }, { ownerType: "TEAM" })).toBe("plan");
  });
});
