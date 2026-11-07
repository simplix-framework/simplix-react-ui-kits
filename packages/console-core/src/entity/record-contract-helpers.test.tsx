import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { UIProvider } from "@simplix-react/ui";
import { describe, expect, it } from "vitest";

import { badgeOf, CONTRACT_COLUMN_SIZE, enumColumnWidth, ladderColumns, recordNameOf, useRecordContract, type ContractField, type ContractSectionSpec } from "./record-contract";

type Contract = ReturnType<typeof useRecordContract>;

/** Renders `read(contract)` inside the providers the contract needs and parses what it wrote. */
function probe<T>(read: (contract: Contract) => T, entity = "role-scope-grant"): T {
  function Probe() {
    const contract = useRecordContract(entity);
    return createElement("pre", null, JSON.stringify(read(contract)));
  }
  const html = renderToStaticMarkup(createElement(UIProvider, { children: createElement(Probe) }));
  const json = /<pre>([\s\S]*)<\/pre>/.exec(html)?.[1] ?? "null";
  return JSON.parse(json.replace(/&quot;/g, '"').replace(/&amp;/g, "&").replace(/&#x27;/g, "'")) as T;
}

const grantFields: ContractField[] = [
  { name: "scope", kind: "text" },
  { name: "validFrom", kind: "date" },
  { name: "validTo", kind: "date" },
  { name: "reason", kind: "longText" },
  { name: "revokedAt", kind: "instant" },
  { name: "revokedReason", kind: "longText" },
];
const grant = { scope: "ALL", validFrom: "2026-01-01", validTo: "2026-11-30", reason: "audit", revokedAt: null, revokedReason: "left the team" };

describe("detailFields", () => {
  it("draws the fields a screen names by name, in its order, where an index into the table draws others", () => {
    const named = probe((contract) => contract.detailFields(grantFields, ["revokedReason", "reason"], grant).map((field) => field.label));
    const byName = probe((contract) => [contract.fieldLabel("revokedReason"), contract.fieldLabel("reason")]);
    expect(named).toEqual(byName);
    // The hand form this replaces read the table by position, which drew `validTo` and `reason` here.
    const byIndex = probe((contract) => [grantFields[2], grantFields[3]].map((field) => contract.fieldLabel((field as ContractField).name)));
    expect(named).not.toEqual(byIndex);
  });

  it("skips a name the table does not carry", () => {
    expect(probe((contract) => contract.detailFields(grantFields, ["gone", "scope"], grant).length)).toBe(1);
  });
});

describe("detailSections", () => {
  const spec: ContractSectionSpec = [
    { key: "period", title: "section.period", fields: ["validFrom", "validTo"] },
    { key: "withdrawal", title: "section.withdrawal", fields: ["revokedAt"] },
  ];

  it("titles each section through the caller's translator and keeps every field by default", () => {
    const sections = probe((contract) => contract.detailSections(spec, grantFields, grant, { title: (key) => `T:${key}` }));
    expect(sections.map((section) => [section.key, section.title, section.fields.length])).toEqual([
      ["period", "T:section.period", 2],
      ["withdrawal", "T:section.withdrawal", 1],
    ]);
  });

  it("drops the empty fields and then the empty sections when asked", () => {
    const sections = probe((contract) => contract.detailSections(spec, grantFields, grant, { title: (key) => key, omitEmpty: true }));
    expect(sections.map((section) => section.key)).toEqual(["period"]);
  });
});

describe("instantText and dateText", () => {
  it("write an instant as the instant column draws it, and nothing for none", () => {
    const [text, drawn, none] = probe((contract) => [contract.instantText("2026-11-07T01:02:03Z"), contract.value({ name: "at", kind: "instant" }, { at: "2026-11-07T01:02:03Z" }), contract.instantText(undefined)]);
    expect(text).toBe(drawn);
    expect(text).not.toBe("2026-11-07T01:02:03Z");
    expect(none).toBe("");
  });

  it("write a calendar day as a date label, never the raw value a notice showed", () => {
    const [day, drawn] = probe((contract) => [contract.dateText("2026-11-30"), contract.value({ name: "d", kind: "date" }, { d: "2026-11-30" })]);
    expect(day).toBe(drawn);
    expect(day).not.toBe("2026-11-30");
  });
});

describe("tones SimpliX Meta declares", () => {
  const status: ContractField = { name: "status", kind: "enum", options: ["FAILED", "DONE"], tones: { FAILED: "danger" } };

  it("draw an enum value's badge in the tone its field declares, where the old contract drew it neutral", () => {
    expect(probe((contract) => contract.value(status, { status: "FAILED" }))).toMatchObject({ badge: { tone: "danger" } });
    expect(probe((contract) => contract.value(status, { status: "DONE" }))).toMatchObject({ badge: { tone: "neutral" } });
  });

  it("give way to the screen's own tone for the field", () => {
    function Override() {
      const contract = useRecordContract("job", { tones: { status: { FAILED: "warning" } } });
      return createElement("pre", null, JSON.stringify(contract.value(status, { status: "FAILED" })));
    }
    const html = renderToStaticMarkup(createElement(UIProvider, { children: createElement(Override) }));
    expect(html).toContain("warning");
  });
});

describe("recordName and text", () => {
  const nameFields: ContractField[] = [
    { name: "title", kind: "text" },
    { name: "language", kind: "text" },
  ];

  it("joins the name with the separator the header uses, so the delete dialog names the record the same way", () => {
    expect(probe((contract) => contract.recordName(nameFields, { title: "Kim", language: "Polish" }, { separator: " · " }))).toBe("Kim · Polish");
    expect(probe((contract) => contract.recordName(nameFields, { title: "Kim", language: "Polish" }))).toBe("Kim Polish");
    expect(recordNameOf(["Kim", null, "Polish"], " · ")).toBe("Kim · Polish");
  });

  it("writes an enum's text as its label, where String() of the drawn value printed an object", () => {
    const field: ContractField = { name: "state", kind: "enum", options: ["OPEN"] };
    const [text, cast] = probe((contract) => [contract.text(field, { state: "OPEN" }), String(contract.value(field, { state: "OPEN" }))]);
    expect(text).toBe("OPEN");
    expect(cast).toBe("[object Object]");
  });
});

describe("ladderColumns", () => {
  it("gives the columns after the leading block the table width they need, as the generated list does", () => {
    const laddered = ladderColumns([{ width: 100 }, { minWidth: 50 }, { width: 10 }, { width: 10 }, { width: 30 }]);
    expect(laddered.map((column) => column.minTableWidth)).toEqual([undefined, undefined, undefined, undefined, 200]);
  });

  it("agrees with the contract's own columns", () => {
    const fields: ContractField[] = ["a", "b", "c", "d", "e", "f"].map((name) => ({ name, kind: "number" }));
    const widths = probe((contract) => contract.columns(fields).map((column) => (column as { minTableWidth?: number }).minTableWidth ?? null));
    const ladder = ladderColumns(fields.map(() => ({ width: CONTRACT_COLUMN_SIZE.number.width }))).map((column) => column.minTableWidth ?? null);
    expect(widths).toEqual(ladder);
  });
});

describe("enumColumnWidth", () => {
  it("keeps the enum kind's standard width for short labels", () => {
    expect(enumColumnWidth(["On", "Off"])).toBe(CONTRACT_COLUMN_SIZE.enum.width);
  });

  it("widens for the longest label, so a long one is not cut", () => {
    expect(enumColumnWidth(["Google Cloud TTS", "Azure"])).toBeGreaterThan(CONTRACT_COLUMN_SIZE.enum.width ?? 0);
    expect(enumColumnWidth(["프리미엄 음성 합성 모델"])).toBeGreaterThan(enumColumnWidth(["Premium"]));
  });
});

describe("badgeOf", () => {
  it("takes the badge a value is drawn as, and nothing from a value that is not one", () => {
    expect(badgeOf({ badge: { label: "Note", tone: "info" } })).toEqual({ label: "Note", tone: "info" });
    expect(badgeOf("text")).toBeUndefined();
    expect(badgeOf(null)).toBeUndefined();
  });
});
