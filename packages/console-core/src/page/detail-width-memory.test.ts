import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import {
  DETAIL_WIDTH_STORAGE_KEY,
  forgetRememberedWidths,
  persistWidths,
  readRememberedWidths,
  useDetailWidthMemory,
  withWidth,
  withoutWidth,
  writeRememberedWidths,
  type DetailWidthSetting,
} from "./detail-width-memory";
import { memoryPresentationStorage, type PresentationStorage } from "./presentation-memory";

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

describe("remembered detail widths", () => {
  it("reads back what it wrote, and nothing after forgetting it", () => {
    const storage = memoryPresentationStorage();
    expect(readRememberedWidths(storage)).toEqual({});
    expect(writeRememberedWidths(storage, { panel: 640, dialog: 1000 })).toBe(true);
    expect(readRememberedWidths(storage)).toEqual({ panel: 640, dialog: 1000 });
    expect(forgetRememberedWidths(storage)).toBe(true);
    expect(readRememberedWidths(storage)).toEqual({});
  });

  it("keeps only a positive finite number for a resizable presentation", () => {
    const storage = memoryPresentationStorage({
      [DETAIL_WIDTH_STORAGE_KEY]: JSON.stringify({ panel: 640, drawer: "720", dialog: -1, page: 900, other: 5 }),
    });
    expect(readRememberedWidths(storage)).toEqual({ panel: 640 });
  });

  it("ignores a value that is not an object, and text that is not JSON", () => {
    for (const saved of ["12", "null", "[1,2]", "not json", ""]) {
      expect(readRememberedWidths(memoryPresentationStorage({ [DETAIL_WIDTH_STORAGE_KEY]: saved }))).toEqual({});
    }
  });

  it("works under a key of the product's choosing", () => {
    const storage = memoryPresentationStorage();
    writeRememberedWidths(storage, { drawer: 800 }, "shop.widths");
    expect(readRememberedWidths(storage)).toEqual({});
    expect(readRememberedWidths(storage, "shop.widths")).toEqual({ drawer: 800 });
  });

  it("reports a storage that refuses, and reads nothing from it", () => {
    expect(readRememberedWidths(refusing)).toEqual({});
    expect(writeRememberedWidths(refusing, { panel: 600 })).toBe(false);
    expect(forgetRememberedWidths(refusing)).toBe(false);
    expect(writeRememberedWidths(undefined, { panel: 600 })).toBe(false);
  });
});

describe("changing the widths", () => {
  it("sets one presentation and leaves the others", () => {
    expect(withWidth({ panel: 600 }, "drawer", 800)).toEqual({ panel: 600, drawer: 800 });
    expect(withWidth({ panel: 600 }, "panel", 700)).toEqual({ panel: 700 });
  });

  it("hands back the same object for a width it already holds", () => {
    const widths = { panel: 600 };
    expect(withWidth(widths, "panel", 600)).toBe(widths);
  });

  it("drops one presentation and leaves the others", () => {
    expect(withoutWidth({ panel: 600, drawer: 800 }, "panel")).toEqual({ drawer: 800 });
    expect(withoutWidth({}, "dialog")).toEqual({});
  });
});

describe("persistWidths", () => {
  it("saves the widths while the browser remembers", () => {
    const storage = memoryPresentationStorage();
    persistWidths(storage, true, { panel: 640 });
    expect(readRememberedWidths(storage)).toEqual({ panel: 640 });
  });

  it("removes them when the reader stops asking the browser to remember", () => {
    const storage = memoryPresentationStorage();
    persistWidths(storage, true, { panel: 640 });
    persistWidths(storage, false, { panel: 640 });
    expect(storage.getItem(DETAIL_WIDTH_STORAGE_KEY)).toBeNull();
  });

  it("removes them when every presentation is back at its default", () => {
    const storage = memoryPresentationStorage();
    persistWidths(storage, true, { panel: 640 });
    persistWidths(storage, true, {});
    expect(storage.getItem(DETAIL_WIDTH_STORAGE_KEY)).toBeNull();
  });

  it("saves nothing while the browser does not remember", () => {
    const storage = memoryPresentationStorage();
    persistWidths(storage, false, { panel: 640 });
    expect(storage.getItem(DETAIL_WIDTH_STORAGE_KEY)).toBeNull();
  });
});

describe("useDetailWidthMemory", () => {
  /** Renders the hook once and returns what it handed the page. */
  function settingWith(remember: boolean, storage: PresentationStorage): DetailWidthSetting {
    let seen: DetailWidthSetting | undefined;
    function Probe() {
      seen = useDetailWidthMemory({ remember, storage });
      return null;
    }
    renderToStaticMarkup(createElement(Probe));
    if (!seen) throw new Error("the probe did not render");
    return seen;
  }

  it("starts from the saved widths when the browser remembers", () => {
    const storage = memoryPresentationStorage();
    writeRememberedWidths(storage, { panel: 640, drawer: 800 });
    expect(settingWith(true, storage).widths).toEqual({ panel: 640, drawer: 800 });
  });

  it("starts from nothing when the browser does not remember, whatever is saved", () => {
    const storage = memoryPresentationStorage();
    writeRememberedWidths(storage, { panel: 640 });
    expect(settingWith(false, storage).widths).toEqual({});
  });
});
