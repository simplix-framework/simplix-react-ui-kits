import { describe, expect, it } from "vitest";

import { SITE_FIELD_NARROW } from "./form.style";

// Vite's module glob, which vitest resolves at build time; the package has no Vite client types.
declare global {
  interface ImportMeta {
    glob<T>(patterns: string | readonly string[], options: { readonly eager: true; readonly import?: string; readonly query?: string }): Record<string, T>;
  }
}

/** Every slot style of the kit, by its exported name. */
const STYLES: Readonly<Record<string, { readonly base?: string }>> = Object.assign(
  {},
  ...Object.values(import.meta.glob<Record<string, { readonly base?: string }>>("../**/*.style.ts", { eager: true })),
);

/** The kit's component sources as text, by path, tests left out. */
const SOURCES: Readonly<Record<string, string>> = import.meta.glob<string>(["../**/*.tsx", "!../**/*.test.tsx"], { eager: true, query: "?raw", import: "default" });

/** Types of `<input>` a reader does not type text into. */
const NOT_TEXT = /type="(checkbox|radio|file|hidden|range|color)"/;

/** Each `<input>` or `<textarea>` element the kit draws, with the slot style it spreads. */
function typedElements(): { readonly where: string; readonly style: string | undefined }[] {
  return Object.entries(SOURCES).flatMap(([file, text]) =>
    [...text.matchAll(/<(input|textarea)\b([\s\S]*?)\/>/g)]
      .filter((match) => !NOT_TEXT.test(match[2] ?? ""))
      .map((match) => ({ where: `${file.replace("../", "")}:${text.slice(0, match.index).split("\n").length}`, style: /slotAttributes\((\w+)/.exec(match[2] ?? "")?.[1] })),
  );
}

describe("text a reader types", () => {
  it("is read at the product's input size at phone width in every element the kit draws for it", () => {
    const elements = typedElements();
    expect(elements.length).toBeGreaterThan(0);
    for (const element of elements) {
      expect(element.style, `${element.where} spreads no slot style`).toBeDefined();
      const base = STYLES[element.style ?? ""]?.base ?? "";
      // A phone browser zooms into a field read below its input size on focus.
      expect(base, `${element.where} (${element.style ?? ""})`).toContain(SITE_FIELD_NARROW);
    }
  });

  it("finds a typed element that lacks the size, and leaves a checkbox alone", () => {
    const missing = "<input {...slotAttributes(siteSearchInputStyle, {})} />";
    const checkbox = '<input type="checkbox" {...slotAttributes(siteCheckboxStyle, {})} />';
    const read = (text: string) => [...text.matchAll(/<(input|textarea)\b([\s\S]*?)\/>/g)].filter((match) => !NOT_TEXT.test(match[2] ?? "")).map((match) => /slotAttributes\((\w+)/.exec(match[2] ?? "")?.[1]);
    expect(read(missing)).toEqual(["siteSearchInputStyle"]);
    expect(read(checkbox)).toEqual([]);
  });
});
