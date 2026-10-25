import { describe, expect, it } from "vitest";

import {
  DETAIL_PRESENTATION_STORAGE_KEY,
  forgetRememberedPresentation,
  memoryPresentationStorage,
  readRememberedPresentation,
  writeRememberedPresentation,
  type PresentationStorage,
} from "./presentation-memory";

/** A storage that refuses every access, as a private window or blocked site data does. */
const refusing: PresentationStorage = {
  getItem: () => {
    throw new DOMException("blocked", "SecurityError");
  },
  setItem: () => {
    throw new DOMException("full", "QuotaExceededError");
  },
  removeItem: () => {
    throw new DOMException("blocked", "SecurityError");
  },
};

describe("presentation memory", () => {
  it("reads back what it wrote, and nothing after forgetting it", () => {
    const storage = memoryPresentationStorage();
    expect(readRememberedPresentation(storage)).toBeUndefined();
    expect(writeRememberedPresentation(storage, "drawer")).toBe(true);
    expect(readRememberedPresentation(storage)).toBe("drawer");
    expect(forgetRememberedPresentation(storage)).toBe(true);
    expect(readRememberedPresentation(storage)).toBeUndefined();
  });

  it("ignores a saved value that is not a presentation", () => {
    const storage = memoryPresentationStorage({ [DETAIL_PRESENTATION_STORAGE_KEY]: "sideways" });
    expect(readRememberedPresentation(storage)).toBeUndefined();
  });

  it("keeps each key apart", () => {
    const storage = memoryPresentationStorage({ a: "page" });
    expect(readRememberedPresentation(storage, "a")).toBe("page");
    expect(readRememberedPresentation(storage, "b")).toBeUndefined();
  });

  it("falls back to nothing saved when storage refuses access", () => {
    expect(readRememberedPresentation(refusing)).toBeUndefined();
    expect(writeRememberedPresentation(refusing, "dialog")).toBe(false);
    expect(forgetRememberedPresentation(refusing)).toBe(false);
    expect(readRememberedPresentation(undefined)).toBeUndefined();
  });
});
