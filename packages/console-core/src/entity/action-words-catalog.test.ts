import { describe, expect, it } from "vitest";

import en from "./locales/features/en.json";
import ja from "./locales/features/ja.json";
import ko from "./locales/features/ko.json";

const catalogs = { en, ko, ja };

describe("the words an action dialog and a record form hold while the server answers", () => {
  it("say, in every language the kit ships, that the server refused a decision, apart from the form's 'save again' sentence", () => {
    for (const [language, catalog] of Object.entries(catalogs)) {
      expect(catalog.actionDialog.refused, language).toBeTruthy();
      expect(catalog.actionDialog.refused, language).not.toBe(catalog.recordForm.refused);
      // The form's sentence tells the reader to change what it names and save again; a decision is not saved.
      expect(catalog.actionDialog.refused.length, language).toBeLessThan(catalog.recordForm.refused.length);
    }
  });

  it("give a form's save button a running word in every language, other than the running word of a decision", () => {
    for (const [language, catalog] of Object.entries(catalogs)) {
      expect(catalog.recordForm.saving, language).toBeTruthy();
      expect(catalog.recordForm.saving, language).not.toBe(catalog.actionDialog.running);
    }
  });

  it("write the Korean words in Hangul and the English words without it", () => {
    expect(ko.actionDialog.refused).toMatch(/[가-힣]/);
    expect(ko.recordForm.saving).toMatch(/[가-힣]/);
    expect(en.actionDialog.refused).not.toMatch(/[가-힣]/);
    expect(en.recordForm.saving).not.toMatch(/[가-힣]/);
  });
});
