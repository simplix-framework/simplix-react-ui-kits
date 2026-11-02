import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { memoryPresentationStorage } from "../page/presentation-memory";
import { LIST_VIEW_STORAGE_PREFIX, readRememberedView, useRememberedView, writeRememberedView, type RememberedView } from "./list-view-memory";

describe("the remembered view of a list", () => {
  it("reads back what was written, per list", () => {
    const storage = memoryPresentationStorage();
    expect(readRememberedView(storage, "voices")).toBeUndefined();
    expect(writeRememberedView(storage, "voices", "grid")).toBe(true);
    expect(readRememberedView(storage, "voices")).toBe("grid");
    expect(readRememberedView(storage, "plans")).toBeUndefined();
    expect(storage.getItem(`${LIST_VIEW_STORAGE_PREFIX}voices`)).toBe("grid");
  });

  it("ignores a saved value that is not a view", () => {
    expect(readRememberedView(memoryPresentationStorage({ [`${LIST_VIEW_STORAGE_PREFIX}voices`]: "table" }), "voices")).toBeUndefined();
  });

  it("answers nothing, and writes nothing, where no storage can be reached", () => {
    expect(readRememberedView(undefined, "voices")).toBeUndefined();
    expect(writeRememberedView(undefined, "voices", "list")).toBe(false);
  });

  it("survives a storage that refuses", () => {
    const refusing = {
      getItem: () => {
        throw new DOMException("blocked", "SecurityError");
      },
      setItem: () => {
        throw new DOMException("blocked", "QuotaExceededError");
      },
      removeItem: () => undefined,
    };
    expect(readRememberedView(refusing, "voices")).toBeUndefined();
    expect(writeRememberedView(refusing, "voices", "list")).toBe(false);
  });
});

/** Renders the hook once and returns what it handed the list. */
function viewUnder(viewKey: string | undefined, storage: ReturnType<typeof memoryPresentationStorage>): RememberedView {
  let seen: RememberedView | undefined;
  function Probe() {
    seen = useRememberedView(viewKey, storage);
    return null;
  }
  renderToStaticMarkup(createElement(Probe));
  if (!seen) throw new Error("the probe did not render");
  return seen;
}

describe("useRememberedView", () => {
  it("hands back the saved view on the first render", () => {
    const storage = memoryPresentationStorage();
    writeRememberedView(storage, "voices", "grid");
    expect(viewUnder("voices", storage).saved).toBe("grid");
  });

  it("saves the reader's choice under the list's key", () => {
    const storage = memoryPresentationStorage();
    viewUnder("voices", storage).remember("list");
    expect(readRememberedView(storage, "voices")).toBe("list");
  });

  it("remembers nothing for a list with no key", () => {
    const storage = memoryPresentationStorage();
    const view = viewUnder(undefined, storage);
    view.remember("grid");
    expect(view.saved).toBeUndefined();
    expect(storage.getItem(`${LIST_VIEW_STORAGE_PREFIX}undefined`)).toBeNull();
  });
});
