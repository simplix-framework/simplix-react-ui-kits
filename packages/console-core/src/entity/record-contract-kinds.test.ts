import { describe, expect, it } from "vitest";
import { peekKindOf, recordNameIsCode } from "./record-contract";

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

describe("recordNameIsCode", () => {
  it("is true when every field the record is named by is drawn as code", () => {
    expect(recordNameIsCode([{ name: "eventType", kind: "text", code: true }])).toBe(true);
  });

  it("is false for a name with a field drawn as prose, or with no name field", () => {
    expect(recordNameIsCode([{ name: "eventType", kind: "text", code: true }, { name: "createdAt", kind: "instant" }])).toBe(false);
    expect(recordNameIsCode([{ name: "name", kind: "text" }])).toBe(false);
    expect(recordNameIsCode([])).toBe(false);
  });
});
