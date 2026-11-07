import { describe, expect, it, vi } from "vitest";

// The detail's import graph reads the browser's storage when it loads.
vi.hoisted(() => {
  const items = new Map<string, string>();
  Object.assign(globalThis, {
    localStorage: { getItem: (key: string) => items.get(key) ?? null, setItem: (key: string, value: string) => void items.set(key, value), removeItem: (key: string) => void items.delete(key) },
  });
});
const { rowDialogVerbs } = await import("./record-detail");

interface Row {
  readonly id: string;
}
const row: Row = { id: "u1" };

describe("the verbs of a row opened over its record", () => {
  it("is read-only with nothing to lead on to where the list names no destination and no action", () => {
    expect(rowDialogVerbs(row, [], undefined, () => undefined)).toEqual({ danger: [], plain: [] });
  });

  it("leads on to the row's own record first, and closes the dialog after it runs", () => {
    const opened = vi.fn();
    const closed = vi.fn();
    const { plain, danger } = rowDialogVerbs(row, [{ type: "view", label: "Details", onClick: () => undefined }], { label: "Open", onOpen: opened }, closed);
    expect(plain.map((verb) => verb.label)).toEqual(["Open", "Details"]);
    expect(danger).toEqual([]);
    plain[0]?.onClick?.();
    expect(opened).toHaveBeenCalledWith(row);
    expect(closed).toHaveBeenCalledTimes(1);
  });

  it("keeps a destructive action at the start, apart from the way on", () => {
    const { plain, danger } = rowDialogVerbs(row, [{ type: "delete", label: "Remove", onClick: () => undefined }], { label: "Open", onOpen: () => undefined }, () => undefined);
    expect(danger.map((verb) => verb.label)).toEqual(["Remove"]);
    expect(plain.map((verb) => verb.label)).toEqual(["Open"]);
  });
});
