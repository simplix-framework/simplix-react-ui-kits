import { describe, expect, it } from "vitest";

import { peekTargetOf, sortFieldOf, startingValue, textValueOf } from "./record-contract";
import { statedOrNothing } from "./screen-words";

describe("a column over a translated name", () => {
  const field = { sortAlias: { en: "positionNameSortEn", ko: "positionNameSortKo" } };

  it("sorts by the sort key of the reader's language", () => {
    expect(sortFieldOf(field, "ko")).toBe("positionNameSortKo");
    expect(sortFieldOf(field, "en-US")).toBe("positionNameSortEn");
  });

  it("has no sort key of its own without an alias, or for a language the alias does not name", () => {
    expect(sortFieldOf({}, "en")).toBeUndefined();
    expect(sortFieldOf(field, "ja")).toBeUndefined();
  });
});

describe("a screen's description", () => {
  it("is the catalog's sentence, and nothing when the catalog answers with the key", () => {
    expect(statedOrNothing("Ranks and titles.", "_description")).toBe("Ranks and titles.");
    expect(statedOrNothing("_description", "_description")).toBeUndefined();
    expect(statedOrNothing("entity/jobPosition:_description", "_description")).toBeUndefined();
    expect(statedOrNothing("", "_description")).toBeUndefined();
  });
});

describe("a text value the contract marks as a code", () => {
  it("is drawn as code, and plain text without the mark", () => {
    expect(textValueOf({ code: true }, "ROLE_ADMIN")).toEqual({ text: "ROLE_ADMIN", code: true });
    expect(textValueOf({}, "Administrator")).toBe("Administrator");
  });
});

describe("a form field's starting value", () => {
  const field = { name: "active", defaultValue: true };

  it("is the contract's default for a new record", () => {
    expect(startingValue(field, undefined)).toBe(true);
  });

  it("is the record's own value, absent included, for one being edited", () => {
    expect(startingValue(field, { active: false })).toBe(false);
    expect(startingValue(field, {})).toBeUndefined();
  });
});

describe("the record a reference opens", () => {
  it("names the field its value matches where the contract states one", () => {
    expect(peekTargetOf({ peekBy: "voiceCode" }, "warm-01", "Warm")).toEqual({ id: "warm-01", name: "Warm", by: "voiceCode" });
  });

  it("is the referenced identifier otherwise", () => {
    expect(peekTargetOf({}, "u-1", "Kim")).toEqual({ id: "u-1", name: "Kim" });
  });
});
