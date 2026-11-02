import { describe, expect, it } from "vitest";

import en from "./locales/features/en.json";
import ja from "./locales/features/ja.json";
import ko from "./locales/features/ko.json";

/**
 * A credits value is worded through `recordValue.credits` with the number as `count` and the grouped
 * figure as `value`; i18next picks the key by `Intl.PluralRules` of the reader's language. These read
 * the catalogs the way it does, so a language missing a form its rules ask for, or a form that writes
 * the raw count, fails here rather than as 「1 credits」 on a screen.
 */
const CATALOGS = { en, ko, ja } as const;

function word(locale: keyof typeof CATALOGS, n: number): string {
  const forms = CATALOGS[locale].recordValue as Record<string, string>;
  const form = forms[`credits_${new Intl.PluralRules(locale).select(n)}`];
  if (form === undefined) throw new Error(`${locale} has no credits form for ${n}`);
  return form.replace("{{value}}", new Intl.NumberFormat(locale).format(n));
}

describe("the credits value's words", () => {
  it("say one credit in the singular and the rest in the plural, with the figure grouped", () => {
    expect(word("en", 1)).toBe("1 credit");
    expect(word("en", -1)).toBe("-1 credit");
    expect(word("en", 2)).toBe("2 credits");
    expect(word("en", 1240)).toBe("1,240 credits");
    expect(word("ko", 1240)).toBe("1,240크레딧");
    expect(word("ja", 1)).toBe("1クレジット");
  });

  it("write the grouped figure and never the raw count, and keep no form without a plural suffix", () => {
    for (const [locale, catalog] of Object.entries(CATALOGS)) {
      const forms = Object.entries(catalog.recordValue as Record<string, string>).filter(([key]) => key.startsWith("credits"));
      expect(forms.length, locale).toBeGreaterThan(0);
      for (const [key, form] of forms) {
        expect(key, locale).toMatch(/^credits_(zero|one|two|few|many|other)$/);
        expect(form, `${locale} ${key}`).toContain("{{value}}");
        expect(form, `${locale} ${key}`).not.toContain("{{count}}");
      }
    }
  });
});
