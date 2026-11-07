import { describe, expect, it } from "vitest";

import { inSentence } from "./screen-words";

describe("inSentence", () => {
  it("lowers a title-cased first word, as the name reads mid-sentence", () => {
    expect(inSentence("Usage events")).toBe("usage events");
    expect(inSentence("Jobs")).toBe("jobs");
    expect(inSentence("Free cloud budgets")).toBe("free cloud budgets");
  });

  it("keeps an acronym or a name whose second letter is not lower case", () => {
    expect(inSentence("AI provider connections")).toBe("AI provider connections");
    expect(inSentence("URLs")).toBe("URLs");
    expect(inSentence("iOS builds")).toBe("iOS builds");
  });

  it("returns a name in a script without letter case as it is", () => {
    expect(inSentence("사용 이벤트")).toBe("사용 이벤트");
    expect(inSentence("ジョブ")).toBe("ジョブ");
    expect(inSentence("")).toBe("");
  });
});
