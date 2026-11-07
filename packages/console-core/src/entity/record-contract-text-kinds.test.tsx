import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { UIProvider } from "@simplix-react/ui";
import { describe, expect, it } from "vitest";

import { languageName, PROSE_CHARS, proseExcerpt, useRecordContract, type ContractField } from "./record-contract";

describe("proseExcerpt", () => {
  it("returns a short text whole, with its line breaks folded into spaces", () => {
    expect(proseExcerpt("Called back.\n\nRefund sent.")).toBe("Called back. Refund sent.");
  });

  it("cuts a long text on a word and adds an ellipsis", () => {
    expect(proseExcerpt("alpha beta gamma delta epsilon zeta eta theta iota kappa", 30)).toBe("alpha beta gamma delta…");
  });

  it("keeps the first characters of a text that is one long word", () => {
    expect(proseExcerpt("x".repeat(400), 50)).toBe(`${"x".repeat(50)}…`);
  });

  it("leaves a text of exactly the limit alone", () => {
    const text = "a".repeat(PROSE_CHARS);
    expect(proseExcerpt(text)).toBe(text);
  });
});

describe("languageName", () => {
  it("names a language code in the reader's language", () => {
    expect(languageName("ko", "en")).toBe("Korean");
    expect(languageName("en", "ko")).toBe("영어");
  });

  it("names a regional code and reads an underscore as a hyphen", () => {
    expect(languageName("pt-BR", "en")).toBe("Brazilian Portuguese");
    expect(languageName("pt_BR", "en")).toBe("Brazilian Portuguese");
  });

  it("draws a code that is not a language tag as it came, without throwing", () => {
    expect(languageName("not a code", "en")).toBe("not a code");
    expect(languageName("zz", "en")).toBe("zz");
  });
});

const note = "alpha beta gamma delta epsilon zeta eta theta iota kappa\nlambda mu";
const fields: ContractField[] = [
  { name: "content", kind: "prose", proseLength: 30 },
  { name: "pinned", kind: "boolean", markWhenTrue: true },
  { name: "locale", kind: "language" },
];

/** What the contract draws for each field of a row, in a list and in a detail, as JSON. */
function Probe(props: { row: Record<string, unknown> }) {
  const contract = useRecordContract("user-note");
  const list = fields.map((field) => contract.value(field, props.row));
  const detail = fields.map((field) => contract.detailField(field, props.row));
  const columns = contract.columns(fields).map((column) => ({ key: column.key, cardKeep: (column as { cardKeep?: boolean }).cardKeep, wrap: (column as { wrap?: boolean }).wrap }));
  return createElement("pre", null, JSON.stringify({ list, detail, columns }));
}

function read(row: Record<string, unknown>) {
  const html = renderToStaticMarkup(createElement(UIProvider, { children: createElement(Probe, { row }) }));
  const json = /<pre>([\s\S]*)<\/pre>/.exec(html)?.[1] ?? "{}";
  return JSON.parse(json.replace(/&quot;/g, '"').replace(/&amp;/g, "&").replace(/&#x27;/g, "'")) as {
    list: unknown[];
    detail: { value: unknown; wide: boolean }[];
    columns: { key: string; cardKeep?: boolean; wrap?: boolean }[];
  };
}

describe("the prose kind", () => {
  it("draws the start of the text in a list and the whole text in a detail, across the panel", () => {
    const { list, detail } = read({ content: note, pinned: false, locale: "ko" });
    expect(list[0]).toBe("alpha beta gamma delta…");
    expect(detail[0]?.value).toBe(note);
    expect(detail[0]?.wide).toBe(true);
  });

  it("wraps in its column", () => {
    expect(read({}).columns[0]?.wrap).toBe(true);
  });
});

describe("a boolean that marks only when true", () => {
  it("draws a badge named by the field when true and nothing when false", () => {
    const yes = read({ pinned: true }).list[1] as { badge: { label: string } };
    expect(yes.badge.label).not.toMatch(/^(Yes|No)$/);
    expect(read({ pinned: false }).list[1]).toBeNull();
  });

  it("draws a yes or no in a detail, where an absent mark would read as unknown", () => {
    const detail = read({ pinned: false }).detail[1] as { value: { badge: { label: string; tone: string } } };
    expect(detail.value).not.toBeNull();
    expect(detail.value.badge.tone).toBe("neutral");
  });

  it("leaves the cards that lack the mark without an empty cell", () => {
    expect(read({}).columns[1]?.cardKeep).toBe(false);
    expect(read({}).columns[0]?.cardKeep).toBeUndefined();
  });
});

describe("the language kind", () => {
  it("draws the language's name where the row holds its code", () => {
    expect(read({ locale: "ko" }).list[2]).toBe("Korean");
  });
});

describe("the excerpt kind", () => {
  const trace = "java.lang.IllegalStateException: refused\n\tat com.example.Service.run(Service.java:42)";
  const excerptFields: ContractField[] = [{ name: "stackTrace", kind: "excerpt" }];

  function ExcerptProbe(props: { row: Record<string, unknown> }) {
    const contract = useRecordContract("error-record");
    return createElement("pre", null, JSON.stringify({ list: excerptFields.map((field) => contract.value(field, props.row)), detail: excerptFields.map((field) => contract.detailField(field, props.row)) }));
  }

  function readExcerpt(row: Record<string, unknown>) {
    const html = renderToStaticMarkup(createElement(UIProvider, { children: createElement(ExcerptProbe, { row }) }));
    const json = /<pre>([\s\S]*)<\/pre>/.exec(html)?.[1] ?? "{}";
    return JSON.parse(json.replace(/&quot;/g, '"').replace(/&amp;/g, "&").replace(/&#x27;/g, "'")) as { list: unknown[]; detail: { value: unknown; wide: boolean; copy: boolean }[] };
  }

  it("keeps an excerpt in a list and draws the whole message as a copyable code block in a detail", () => {
    const { list, detail } = readExcerpt({ stackTrace: trace });
    expect(list[0]).toEqual({ excerpt: trace });
    expect(detail[0]).toMatchObject({ value: { text: trace, code: true, block: true }, wide: true, copy: true });
  });

  it("draws nothing to copy where the message is absent", () => {
    const { detail } = readExcerpt({ stackTrace: null });
    expect(detail[0]).toMatchObject({ value: null, wide: true, copy: false });
  });
});
