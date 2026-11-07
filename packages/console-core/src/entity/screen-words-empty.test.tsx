import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import en from "./locales/features/en.json";
import ko from "./locales/features/ko.json";

/** The catalogs a screen reads: the kit's words and one entity's names, in the language under test. */
const catalogs = vi.hoisted(() => ({ locale: "en" as "en" | "ko", entity: { en: { _label: "Usage event", _plural: "Usage events" }, ko: { _label: "사용 이벤트", _plural: "사용 이벤트" } } }));

vi.mock("@simplix-react/i18n/react", () => ({
  useTranslation: (namespace: string) => ({
    t: (key: string, values: Record<string, string> = {}) => {
      const words = namespace.startsWith("entity/") ? catalogs.entity[catalogs.locale] : catalogs.locale === "en" ? en : ko;
      const template = key.split(".").reduce<unknown>((at, part) => (at as Record<string, unknown> | undefined)?.[part], words);
      return typeof template === "string" ? template.replace(/\{\{(\w+)\}\}/g, (_, name: string) => values[name] ?? "") : key;
    },
  }),
}));

const { useScreenWords } = await import("./screen-words");

function wordsIn(locale: "en" | "ko") {
  catalogs.locale = locale;
  let seen: ReturnType<typeof useScreenWords> | undefined;
  function Probe() {
    seen = useScreenWords("usageEvent");
    return null;
  }
  renderToStaticMarkup(createElement(Probe));
  if (!seen) throw new Error("the probe did not render");
  return seen;
}

describe("the empty list's title", () => {
  it("sets the entity's plural in lower case inside the English sentence", () => {
    const words = wordsIn("en");
    expect(words.emptyTitle).toBe("No usage events yet");
    expect(words.emptyTitleRecorded).toBe("No usage events yet");
    // The page title keeps the name as its label states it.
    expect(words.plural).toBe("Usage events");
  });

  it("sets the Korean name as it is", () => {
    expect(wordsIn("ko").emptyTitle).toBe("등록된 사용 이벤트 없음");
  });
});
