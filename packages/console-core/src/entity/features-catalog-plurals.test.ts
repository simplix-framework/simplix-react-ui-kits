import { describe, expect, it } from "vitest";

import en from "./locales/features/en.json";
import ja from "./locales/features/ja.json";
import ko from "./locales/features/ko.json";

const catalogs = { en, ko, ja };

/** Every string leaf of a catalog, with its dotted path. */
function leaves(node: unknown, path = ""): [string, string][] {
  if (typeof node === "string") return [[path, node]];
  if (node === null || typeof node !== "object") return [];
  return Object.entries(node).flatMap(([key, value]) => leaves(value, path ? `${path}.${key}` : key));
}

describe("the counts a hint states in the features catalogs", () => {
  it("never write a plural as 'noun(s)': a count is spelled with the catalog's plural keys", () => {
    for (const [language, catalog] of Object.entries(catalogs)) {
      const hits = leaves(catalog).filter(([, text]) => /\w\(s\)/.test(text)).map(([path]) => path);
      expect(hits, language).toEqual([]);
    }
  });

  it("give the English hints of a disabled submit a singular and a plural form", () => {
    for (const key of ["recordForm.fillBeforeSubmit", "stageGate.blockedUnmet", "stageGate.blockedHeld"]) {
      const paths = new Set(leaves(en).map(([path]) => path));
      expect(paths.has(`${key}_one`), key).toBe(true);
      expect(paths.has(`${key}_other`), key).toBe(true);
    }
  });
});
