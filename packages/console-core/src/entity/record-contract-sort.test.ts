import { describe, expect, it } from "vitest";

import { sortFieldOf } from "./record-contract";
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
