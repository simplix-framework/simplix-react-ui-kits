import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import en from "./locales/features/en.json";
import ko from "./locales/features/ko.json";

/** The catalogs a screen reads: the kit's words and one entity's names, in the language under test. */
const catalogs = vi.hoisted(() => ({
  locale: "en" as "en" | "ko",
  entity: { en: { _label: "Usage event", _plural: "Usage events" } as Record<string, string>, ko: { _label: "사용 이벤트", _plural: "사용 이벤트" } as Record<string, string> },
}));

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
    expect(wordsIn("ko").emptyTitle).toBe("사용 이벤트 없음");
  });

  it("does not repeat a word the Korean name already starts with", () => {
    const entity = catalogs.entity.ko;
    const saved = { ...entity };
    Object.assign(entity, { _label: "등록 보이스", _plural: "등록 보이스" });
    try {
      expect(wordsIn("ko").emptyTitle).toBe("등록 보이스 없음");
    } finally {
      Object.assign(entity, saved);
    }
  });
});

describe("the verbs that name the entity", () => {
  it("set a title-cased singular name in lower case inside the English sentence", () => {
    const entity = catalogs.entity.en;
    const saved = { ...entity };
    Object.assign(entity, { _label: "Release file", _plural: "Release files" });
    try {
      const words = wordsIn("en");
      expect(words.add).toBe("Add release file");
      expect(words.editTitle).toBe("Edit release file");
      expect(words.deleteTitle).toBe("Delete release file");
      expect(words.label).toBe("Release file");
    } finally {
      Object.assign(entity, saved);
    }
  });

  it("keep an acronym whole", () => {
    const entity = catalogs.entity.en;
    const saved = { ...entity };
    Object.assign(entity, { _label: "AI provider connection", _plural: "AI provider connections" });
    try {
      expect(wordsIn("en").add).toBe("Add AI provider connection");
    } finally {
      Object.assign(entity, saved);
    }
  });
});
