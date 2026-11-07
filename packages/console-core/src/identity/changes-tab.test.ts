import { describe, expect, it } from "vitest";

import { CHANGES_TAB_KEY, changesTabOf, type ChangeHistoryRead } from "./change-history";

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
