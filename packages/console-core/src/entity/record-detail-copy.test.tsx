import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { UIProvider } from "@simplix-react/ui";
import { describe, expect, it, vi } from "vitest";

import type { RecordDetailProps } from "./record-detail";
import { copyTextOf } from "./record-value";

// The detail's import graph reads the browser's storage when it loads, and this suite renders on the server.
vi.hoisted(() => {
  const items = new Map<string, string>();
  Object.assign(globalThis, {
    localStorage: { getItem: (key: string) => items.get(key) ?? null, setItem: (key: string, value: string) => void items.set(key, value), removeItem: (key: string) => void items.delete(key) },
  });
});
const { RecordDetail } = await import("./record-detail");

/** What a copy control is drawn as: a button inside a copyable row. */
const COPY_CONTROLS = /<button[^>]*clipboard\.copy(?:Action|Named)/g;

function html(fields: NonNullable<RecordDetailProps["sections"]>[number]["fields"]): string {
  const sections: RecordDetailProps["sections"] = [{ key: "main", title: "Main", fields }];
  return renderToStaticMarkup(createElement(UIProvider, { children: createElement(RecordDetail, { title: "Record", sections }) }));
}

describe("copyTextOf", () => {
  it("reads the text a value carries", () => {
    expect(copyTextOf("abc")).toBe("abc");
    expect(copyTextOf(42)).toBe("42");
    expect(copyTextOf({ text: "key", code: true })).toBe("key");
    expect(copyTextOf({ excerpt: "error: boom" })).toBe("error: boom");
  });

  it("has no text for a value that is read rather than carried, or for nothing", () => {
    expect(copyTextOf(null)).toBeUndefined();
    expect(copyTextOf("")).toBeUndefined();
    expect(copyTextOf({ badge: { label: "On" } })).toBeUndefined();
    expect(copyTextOf({ figure: "1.5 MB" })).toBeUndefined();
  });
});

describe("a detail field that asks for a copy control", () => {
  it("draws one for a string", () => {
    expect(html([{ label: "Key", value: "plain-key", copy: true }]).match(COPY_CONTROLS)).toHaveLength(1);
  });

  it("draws one for a value the contract draws as an object, and still draws the object", () => {
    const out = html([{ label: "Message", value: { text: "stack line one\nstack line two", code: true, block: true }, copy: true, wide: true }]);
    expect(out.match(COPY_CONTROLS)).toHaveLength(1);
    expect(out).toContain("stack line one");
  });

  it("draws none for a field that does not ask, or one with no text to carry", () => {
    expect(html([{ label: "Key", value: { text: "plain-key", code: true } }]).match(COPY_CONTROLS)).toBeNull();
    expect(html([{ label: "State", value: { badge: { label: "On" } }, copy: true }]).match(COPY_CONTROLS)).toBeNull();
  });
});
