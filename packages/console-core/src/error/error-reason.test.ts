import { describe, expect, it } from "vitest";

import en from "./locales/features/en.json";
import ja from "./locales/features/ja.json";
import ko from "./locales/features/ko.json";
import { errorReason } from "./error-dialog";

describe("errorReason", () => {
  it("leads with the server's own message, which names the rule that rejected the request", () => {
    expect(errorReason("Not enough credit", "code text", "kind text")).toBe("Not enough credit");
  });

  it("falls to the error code's text, then to a sentence for the kind of failure", () => {
    expect(errorReason("", "code text", "kind text")).toBe("code text");
    expect(errorReason(undefined, "", "kind text")).toBe("kind text");
    expect(errorReason("   ", "  ", "kind text")).toBe("kind text");
  });
});

describe("the sentence for each kind of failure", () => {
  const kinds = ["server", "client", "network", "auth", "validation", "unknown"] as const;

  it.each([
    ["en", en],
    ["ko", ko],
    ["ja", ja],
  ] as const)("is worded in %s for every kind the dialog draws", (_locale, catalog) => {
    for (const kind of kinds) expect(catalog.error.detail[kind].trim()).not.toBe("");
  });
});
