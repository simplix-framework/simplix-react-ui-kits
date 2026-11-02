import { describe, expect, it, vi } from "vitest";

// The theme store reads the browser's storage while the module loads, which a test running in node
// does not have; an empty one gives it the defaults.
vi.hoisted(() => {
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: { getItem: () => null, setItem: () => undefined, removeItem: () => undefined },
  });
});

import { phoneRowHasContent } from "../shell/page-header";
import { recordPageTitle } from "./crud-page";

describe("recordPageTitle", () => {
  it("keeps the list's title for the phone's bar while a record is the page", () => {
    expect(recordPageTitle(true, "My credits")).toBe("My credits");
  });

  it("publishes none wider, where the record's own identifier is the heading", () => {
    expect(recordPageTitle(false, "My credits")).toBe("");
  });
});

describe("phoneRowHasContent", () => {
  it("draws the row for a way back, for verbs and for a card that can be brought back", () => {
    expect(phoneRowHasContent({ back: "back", actions: null, noticeCount: 0 })).toBe(true);
    expect(phoneRowHasContent({ back: null, actions: "verbs", noticeCount: 0 })).toBe(true);
    expect(phoneRowHasContent({ back: null, actions: null, noticeCount: 2 })).toBe(true);
  });

  it("draws none for a record shown as the page, which would only push the record down", () => {
    expect(phoneRowHasContent({ back: undefined, actions: undefined, noticeCount: 0 })).toBe(false);
  });
});
