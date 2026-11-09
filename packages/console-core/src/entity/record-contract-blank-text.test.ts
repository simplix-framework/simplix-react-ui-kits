import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { UIProvider } from "@simplix-react/ui";
import { describe, expect, it } from "vitest";

import { isBlankOptionalText, useRecordContract, type ContractField } from "./record-contract";

describe("isBlankOptionalText", () => {
  it("is true for an optional text left empty or blank", () => {
    expect(isBlankOptionalText({ kind: "text" }, "")).toBe(true);
    expect(isBlankOptionalText({ kind: "text", required: false }, "   ")).toBe(true);
    expect(isBlankOptionalText({ kind: "longText" }, "")).toBe(true);
  });

  it("is false for a text with a value, a required text and every other kind", () => {
    expect(isBlankOptionalText({ kind: "text" }, "pri_1")).toBe(false);
    expect(isBlankOptionalText({ kind: "text", required: true }, "")).toBe(false);
    expect(isBlankOptionalText({ kind: "number" }, "")).toBe(false);
    expect(isBlankOptionalText({ kind: "text" }, null)).toBe(false);
    expect(isBlankOptionalText({ kind: "text" }, undefined)).toBe(false);
  });
});

const fields: ContractField[] = [
  { name: "paddlePriceId", kind: "text" },
  { name: "planCode", kind: "text", required: true },
  { name: "tossProductCode", kind: "text" },
  { name: "monthlyCredits", kind: "number" },
];

/** The request the form's values make, as JSON, so the blank optional texts show as null. */
function Probe({ values }: { readonly values: Readonly<Record<string, unknown>> }) {
  const contract = useRecordContract("plan");
  return createElement("pre", null, JSON.stringify(contract.request(fields, values)));
}

function requestFor(values: Readonly<Record<string, unknown>>): Record<string, unknown> {
  const html = renderToStaticMarkup(createElement(UIProvider, { children: createElement(Probe, { values }) }));
  return JSON.parse((/<pre>([\s\S]*)<\/pre>/.exec(html)?.[1] ?? "{}").replace(/&quot;/g, '"'));
}

describe("the request a form's values make", () => {
  it("carries null for an optional text left blank and the value for one that has it", () => {
    expect(requestFor({ paddlePriceId: "pri_1", planCode: "pro", tossProductCode: "", monthlyCredits: 5 })).toEqual({
      paddlePriceId: "pri_1",
      planCode: "pro",
      tossProductCode: null,
      monthlyCredits: 5,
    });
  });

  it("leaves a required text and a non-text field as they are", () => {
    expect(requestFor({ planCode: "", monthlyCredits: 0, paddlePriceId: "  " })).toEqual({ planCode: "", monthlyCredits: 0, paddlePriceId: null });
  });
});
