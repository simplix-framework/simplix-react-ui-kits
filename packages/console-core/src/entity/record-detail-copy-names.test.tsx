import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { UIProvider } from "@simplix-react/ui";
import { describe, expect, it, vi } from "vitest";

import { copyControlName } from "../clipboard/copyable-detail-field";
import clipboardEn from "../clipboard/locales/features/en.json";
import clipboardJa from "../clipboard/locales/features/ja.json";
import clipboardKo from "../clipboard/locales/features/ko.json";
import type { RecordDetailProps } from "./record-detail";

// The detail's import graph reads the browser's storage when it loads, and this suite renders on the server.
vi.hoisted(() => {
  const items = new Map<string, string>();
  Object.assign(globalThis, {
    localStorage: { getItem: (key: string) => items.get(key) ?? null, setItem: (key: string, value: string) => void items.set(key, value), removeItem: (key: string) => void items.delete(key) },
  });
});

// A translator that writes the key and what it was given, so a name that carries the field shows it.
vi.mock("@simplix-react/i18n/react", async (original) => {
  const real = await original<typeof import("@simplix-react/i18n/react")>();
  return { ...real, useTranslation: () => ({ t: (key: string, vars?: Record<string, unknown>) => (vars?.label ? `${key}[${String(vars.label)}]` : key), exists: () => false, i18n: undefined }) };
});
const { RecordDetail } = await import("./record-detail");

/** The accessible names of the copy controls a record draws, in order. */
function copyNames(fields: NonNullable<RecordDetailProps["sections"]>[number]["fields"]): string[] {
  const sections: RecordDetailProps["sections"] = [{ key: "main", title: "Main", fields }];
  const out = renderToStaticMarkup(createElement(UIProvider, { children: createElement(RecordDetail, { title: "Record", sections }) }));
  return [...out.matchAll(/<button[^>]*aria-label="(clipboard\.copy[^"]*)"/g)].map((m) => m[1] ?? "");
}

describe("the copy controls of one record", () => {
  it("are named by the field each copies, so a reader of the controls can tell them apart", () => {
    const names = copyNames([
      { label: "Provider message", value: "quota exceeded", copy: true },
      { label: "Error code", value: "E42", copy: true },
    ]);
    expect(names).toEqual(["clipboard.copyNamed[Provider message]", "clipboard.copyNamed[Error code]"]);
    expect(new Set(names).size).toBe(2);
  });
});

describe("copyControlName", () => {
  const generic = "Copy to clipboard";
  const named = (label: string) => `Copy ${label}`;

  it("names the control by a text label, trimmed", () => {
    expect(copyControlName("Provider message", generic, named)).toBe("Copy Provider message");
    expect(copyControlName("  Error code ", generic, named)).toBe("Copy Error code");
  });

  it("falls back to the generic action for a label that is not text or is empty", () => {
    expect(copyControlName(undefined, generic, named)).toBe(generic);
    expect(copyControlName("  ", generic, named)).toBe(generic);
    expect(copyControlName({ node: true }, generic, named)).toBe(generic);
  });
});

describe("the copy words of the clipboard catalogs", () => {
  it("name the field in every language the kit ships", () => {
    for (const catalog of [clipboardEn, clipboardKo, clipboardJa]) {
      expect(catalog.clipboard.copyNamed).toContain("{{label}}");
      expect(catalog.clipboard.copyNamed).not.toBe(catalog.clipboard.copyAction);
    }
  });
});
