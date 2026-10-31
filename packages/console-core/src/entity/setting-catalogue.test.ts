import { describe, expect, it } from "vitest";

import { changedSettings, settingField, settingOptions, settingSection, type SettingCatalogueRow } from "./setting-catalogue";

const words = { label: (key: string) => `label:${key}`, readOnly: () => "reported by the installation" };

describe("settingField", () => {
  it("draws each type with its own editor", () => {
    expect(settingField({ id: "1", key: "a", type: "NUMBER", value: "20" }, words)).toMatchObject({ kind: "number", value: 20 });
    expect(settingField({ id: "1", key: "a", type: "NUMBER", value: "" }, words)).toMatchObject({ kind: "number", value: null });
    expect(settingField({ id: "1", key: "a", type: "CHOICE", value: "B", options: ["A", "B"] }, words)).toMatchObject({
      kind: "select",
      options: [{ value: "A" }, { value: "B" }],
    });
    expect(settingField({ id: "1", key: "a", type: "TEXT", value: "x" }, words)).toMatchObject({ kind: "text", value: "x" });
    expect(settingField({ id: "1", key: "a", type: "SOMETHING_NEW", value: "x" }, words)).toMatchObject({ kind: "text" });
  });

  it("offers the stored value even when the options do not list it", () => {
    const field = settingField({ id: "1", key: "a", type: "CHOICE", value: "Z", options: ["A"] }, words);
    expect(field.kind === "select" && field.options.map((o) => o.value)).toEqual(["Z", "A"]);
  });

  it("locks a row the screen cannot change and says why", () => {
    expect(settingField({ id: "1", key: "a", editable: false }, words).disabled).toBe("reported by the installation");
    expect(settingField({ id: "1", key: "a", editable: true }, words).disabled).toBeUndefined();
  });
});

describe("settingSection", () => {
  it("keeps only the group's rows, in their order", () => {
    const rows: SettingCatalogueRow[] = [
      { id: "1", key: "a", group: "G" },
      { id: "2", key: "b", group: "H" },
      { id: "3", key: "c", group: "G" },
    ];
    expect(settingSection(rows, "G", words).fields.map((f) => f.key)).toEqual(["a", "c"]);
  });
});

describe("changedSettings", () => {
  const rows: SettingCatalogueRow[] = [
    { id: "1", key: "a", value: "20" },
    { id: "2", key: "b", value: "x" },
    { id: "3", key: "c", value: "y", editable: false },
  ];

  it("writes only the editable rows whose value moved", () => {
    expect(changedSettings(rows, { a: 20, b: "z", c: "q" }).map((c) => [c.row.id, c.value])).toEqual([["2", "z"]]);
  });

  it("writes a cleared number as an empty value", () => {
    expect(changedSettings(rows, { a: null }).map((c) => c.value)).toEqual([""]);
  });
});

describe("settingOptions", () => {
  it("splits on the separator the product names", () => {
    expect(settingOptions("1,000.00|1.000,00| ", "|")).toEqual(["1,000.00", "1.000,00"]);
    expect(settingOptions(null, "|")).toEqual([]);
  });
});
