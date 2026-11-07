import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { I18nextAdapter } from "@simplix-react/i18n";
import { I18nProvider } from "@simplix-react/i18n/react";
import { UIProvider } from "@simplix-react/ui";
import { describe, expect, it } from "vitest";

import features from "./locales/features/en.json";
import { booleanBadge, useRecordContract, type ContractField } from "./record-contract";

type Contract = ReturnType<typeof useRecordContract>;

/**
 * A boolean drawn as a badge (a header's "offered", a list's "enabled") is worded by the entity's own
 * words for its two values and toned as SimpliX Meta declares, so the header badge a design names on
 * a boolean says 「Offered」 in the entity's tone rather than 「Yes」 in the kit's.
 */
async function probe<T>(read: (contract: Contract) => T, entity = "catalogVoice"): Promise<T> {
  const adapter = new I18nextAdapter({
    defaultLocale: "en",
    fallbackLocale: "en",
    locales: [{ code: "en", name: "English", englishName: "English" }],
    resources: {
      en: {
        "console-entity-ui/features": features as Record<string, unknown>,
        "entity/catalogVoice": { fields: { active: "Offered", sizeBytes: "Size (bytes)", count: "Count (bytes)" }, values: { active: { true: "Offered", false: "Withdrawn" } } },
      },
    },
  });
  await adapter.initialize();
  function Probe() {
    const contract = useRecordContract(entity);
    return createElement("pre", null, JSON.stringify(read(contract)));
  }
  const html = renderToStaticMarkup(createElement(I18nProvider, { adapter, children: createElement(UIProvider, { children: createElement(Probe) }) }));
  const json = /<pre>([\s\S]*)<\/pre>/.exec(html)?.[1] ?? "null";
  return JSON.parse(json.replace(/&quot;/g, '"').replace(/&amp;/g, "&").replace(/&#x27;/g, "'")) as T;
}

const active: ContractField = { name: "active", kind: "boolean", tones: { true: "success", false: "warning" } };
const plain: ContractField = { name: "featured", kind: "boolean" };

describe("a boolean drawn by the record contract", () => {
  it("takes the entity's words for each value and the tones Meta declares", async () => {
    const [on, off] = await probe((contract) => [contract.value(active, { active: true }), contract.value(active, { active: false })]);
    expect(on).toEqual({ badge: { label: "Offered", tone: "success" } });
    expect(off).toEqual({ badge: { label: "Withdrawn", tone: "warning" } });
  });

  it("says yes or no, success or neutral, where the entity names no word and Meta no tone", async () => {
    const [on, off] = await probe((contract) => [contract.value(plain, { featured: true }), contract.value(plain, { featured: false })]);
    expect(on).toEqual({ badge: { label: "Yes", tone: "success" } });
    expect(off).toEqual({ badge: { label: "No", tone: "neutral" } });
  });
});

describe("booleanBadge", () => {
  const words = { word: (key: string) => (key === "values.active.false" ? "Withdrawn" : undefined), yes: "Yes", no: "No" };

  it("lets the screen's tone win over the one Meta declares", () => {
    expect(booleanBadge(false, active, { false: "danger" }, words)).toEqual({ label: "Withdrawn", tone: "danger" });
  });

  it("falls back per value: a word the entity names for one value only leaves the other yes or no", () => {
    expect(booleanBadge(true, active, undefined, words)).toEqual({ label: "Yes", tone: "success" });
  });
});

describe("a boolean column on a card", () => {
  const worded: ContractField = { name: "active", kind: "boolean" };
  const generic: ContractField = { name: "featured", kind: "boolean" };
  const mark: ContractField = { name: "recommended", kind: "boolean", markWhenTrue: true };

  it("is a labelled line where the badge says only yes or no, and a badge where the entity words both values", async () => {
    const places = await probe((contract) => [contract.column(worded).cardPlace ?? null, contract.column(generic).cardPlace ?? null, contract.column(mark).cardPlace ?? null]);
    expect(places).toEqual([null, "lines", null]);
  });
});

describe("a size field's label", () => {
  const size: ContractField = { name: "sizeBytes", kind: "bytes" };
  const count: ContractField = { name: "count", kind: "number" };

  it("names no unit of its own, since the value is written in the unit that fits it", async () => {
    const labels = await probe((contract) => [contract.column(size).header, contract.detailField(size, { sizeBytes: 10 }).label, contract.headFigures([size], { sizeBytes: 10 })[0]?.label]);
    expect(labels).toEqual(["Size", "Size", "Size"]);
  });

  it("keeps the label of a field that is not a size as the catalog states it", async () => {
    expect(await probe((contract) => contract.column(count).header)).toBe("Count (bytes)");
  });
});

describe("the columns of a contract", () => {
  const fields: ContractField[] = [
    { name: "account", kind: "text" },
    { name: "role", kind: "enum", enumName: "Role", options: ["A", "B"] },
    { name: "status", kind: "enum", enumName: "Standing", options: ["ACTIVE", "REVOKED"], tones: { ACTIVE: "success", REVOKED: "danger" } },
    { name: "channel", kind: "enum", enumName: "Channel", options: ["MAIL", "SMS"], tones: { MAIL: "info", SMS: "info" } },
    { name: "validTo", kind: "date" },
  ];

  it("keeps the first field that carries the rows' state at every width, and no other", async () => {
    const kept = await probe((contract) => contract.columns(fields).filter((column) => column.keep === true).map((column) => column.key));
    expect(kept).toEqual(["status"]);
  });

  it("leaves a field the screen decided alone, either way", async () => {
    const dropped = await probe((contract) => contract.columns(fields.map((field) => (field.name === "status" ? { ...field, keep: false } : field))).filter((column) => column.keep === true).map((column) => column.key));
    expect(dropped).toEqual(["channel"]);
    const own = await probe((contract) => contract.columns(fields.map((field) => (field.name === "validTo" ? { ...field, keep: true } : field))).filter((column) => column.keep === true).map((column) => column.key));
    expect(own).toEqual(["status", "validTo"]);
  });
});
