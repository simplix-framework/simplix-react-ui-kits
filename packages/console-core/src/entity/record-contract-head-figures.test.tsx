import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { UIProvider } from "@simplix-react/ui";
import { describe, expect, it } from "vitest";

import { useRecordContract, type ContractField } from "./record-contract";

const fields: ContractField[] = [
  { name: "costMicros", kind: "number" },
  { name: "creditsCharged", kind: "credits" },
];
const row = { costMicros: 1200, creditsCharged: 80 };

/** Renders the contract's head figures and the same field's label and value read one by one, as JSON. */
function Probe() {
  const contract = useRecordContract("usage-daily-aggregate");
  const figures = contract.headFigures(fields, row);
  const separately = fields.map((field) => ({ key: field.name, label: contract.fieldLabel(field.name), value: contract.value(field, row) }));
  return createElement("pre", null, JSON.stringify({ figures, separately }));
}

function read(): { figures: unknown[]; separately: unknown[] } {
  const html = renderToStaticMarkup(createElement(UIProvider, { children: createElement(Probe) }));
  const json = /<pre>([\s\S]*)<\/pre>/.exec(html)?.[1] ?? "{}";
  return JSON.parse(json.replace(/&quot;/g, '"').replace(/&amp;/g, "&"));
}

describe("a record's head figures", () => {
  it("take the field's name and its value as the list's column and the page's tile do", () => {
    const { figures, separately } = read();
    expect(figures).toEqual(separately);
    expect(figures).toHaveLength(2);
    expect(figures.map((figure) => (figure as { key: string }).key)).toEqual(["costMicros", "creditsCharged"]);
  });

  it("draw a credits field by its own kind and not as a bare number", () => {
    const { figures } = read();
    const credits = JSON.stringify((figures[1] as { value: unknown }).value);
    expect(credits).not.toBe("80");
    expect(credits).toContain("credits");
  });
});

describe("a text field that names where it opens", () => {
  const linked: ContractField[] = [{ name: "documentVersion", kind: "text", linkOf: (one) => (one.consentType === "TERMS_OF_USE" ? `https://portal.example/terms?version=${String(one.documentVersion)}` : undefined) }];

  function LinkProbe({ consentType }: { readonly consentType: string }) {
    const contract = useRecordContract("consent-record");
    return createElement("pre", null, JSON.stringify(contract.value(linked[0] as ContractField, { documentVersion: "1.2", consentType })));
  }
  const readLink = (consentType: string) => {
    const html = renderToStaticMarkup(createElement(UIProvider, { children: createElement(LinkProbe, { consentType }) }));
    return JSON.parse((/<pre>([\s\S]*)<\/pre>/.exec(html)?.[1] ?? "null").replace(/&quot;/g, '"').replace(/&amp;/g, "&"));
  };

  it("draws the value as a link to the address the row answers", () => {
    expect(readLink("TERMS_OF_USE")).toEqual({ link: "1.2", href: "https://portal.example/terms?version=1.2" });
  });

  it("draws plain text for a row it answers no address for", () => {
    expect(readLink("MARKETING")).toBe("1.2");
  });
});
