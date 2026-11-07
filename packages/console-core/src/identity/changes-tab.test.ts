import { describe, expect, it } from "vitest";

import { CONTRACT_COLUMN_SIZE } from "../entity/record-contract";
import { CHANGE_HISTORY_COLUMNS, CHANGES_TAB_KEY, changesTabOf, type ChangeHistoryRead } from "./change-history";

const read = (readable: boolean, total: number | undefined) => ({ readable, total }) as unknown as ChangeHistoryRead;

describe("changesTabOf", () => {
  it("is one tab under the kit's key and word, counted by the read", () => {
    const history = read(true, 4);
    expect(changesTabOf(history, "Changes", "Nothing changed")).toEqual([{ key: CHANGES_TAB_KEY, label: "Changes", count: 4, changes: { history, emptyBody: "Nothing changed" } }]);
  });

  it("is no tab at all for a reader who may not read the audit log, so nobody opens a tab onto a refusal", () => {
    expect(changesTabOf(read(false, undefined), "Changes")).toEqual([]);
  });
});

describe("the changes tab's date and person columns", () => {
  it("are as wide as a generated list draws an instant and a reference, so neither is cut", () => {
    expect(CHANGE_HISTORY_COLUMNS.when.width).toBe(CONTRACT_COLUMN_SIZE.instant.width);
    expect(CHANGE_HISTORY_COLUMNS.who.width).toBe(CONTRACT_COLUMN_SIZE.reference.minWidth);
  });

  it("are not narrower than a datetime and a person's name take in a list", () => {
    expect(CHANGE_HISTORY_COLUMNS.when.width).toBeGreaterThanOrEqual(176);
    expect(CHANGE_HISTORY_COLUMNS.who.width).toBeGreaterThanOrEqual(160);
  });
});
