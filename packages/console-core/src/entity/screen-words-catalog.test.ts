import { describe, expect, it } from "vitest";

import en from "./locales/features/en.json";
import ja from "./locales/features/ja.json";
import ko from "./locales/features/ko.json";

describe("the words every generated detail reads", () => {
  it("name the changes tab and the timeline in every language the kit ships", () => {
    for (const catalog of [en, ko, ja]) {
      expect(catalog.screen.changes).toBeTruthy();
      expect(catalog.screen.timeline).toBeTruthy();
    }
  });
});
