import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { useNoticeDismissals, type NoticeDismissals } from "./dismissal-source";
import { LocalNoticeDismissalsProvider } from "./local-dismissals";

function memoryStore() {
  const data = new Map<string, string>();
  return {
    data,
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => void data.set(key, value),
    removeItem: (key: string) => void data.delete(key),
  };
}

/** Renders the provider once, as a fresh mount, and hands back what its children read. */
function mount(props: { readonly storageKey?: string | null; readonly storage?: ReturnType<typeof memoryStore> }): NoticeDismissals {
  let seen: NoticeDismissals | undefined;
  function Reader() {
    seen = useNoticeDismissals();
    return null;
  }
  renderToStaticMarkup(createElement(LocalNoticeDismissalsProvider, { ...props, children: createElement(Reader) }));
  if (!seen) throw new Error("the provider rendered no child");
  return seen;
}

describe("LocalNoticeDismissalsProvider", () => {
  it("keeps a dismissal under its storage key, so a later mount still has it put away", () => {
    const storage = memoryStore();
    mount({ storageKey: "app.prefs:notices:u1", storage }).hide("billing.failed");
    expect(JSON.parse(storage.data.get("app.prefs:notices:u1") ?? "[]")).toEqual(["billing.failed"]);
    const later = mount({ storageKey: "app.prefs:notices:u1", storage });
    expect(later.ready).toBe(true);
    expect(later.isHidden("billing.failed")).toBe(true);
    expect(mount({ storageKey: "app.prefs:notices:u2", storage }).isHidden("billing.failed")).toBe(false);
  });

  it("is not ready and puts nothing away while the key is not known yet", () => {
    const storage = memoryStore();
    storage.setItem("app.prefs:notices:u1", JSON.stringify(["a"]));
    const waiting = mount({ storageKey: null, storage });
    expect(waiting.ready).toBe(false);
    expect(waiting.hiddenKeys).toEqual([]);
    waiting.hide("b");
    expect(storage.data.size).toBe(1);
  });

  it("reads a value it did not write as nothing put away", () => {
    const storage = memoryStore();
    storage.setItem("k", "not json");
    expect(mount({ storageKey: "k", storage }).hiddenKeys).toEqual([]);
  });

  it("keeps the set for the page only without a key", () => {
    const store = memoryStore();
    mount({ storage: store }).hide("x");
    expect(store.data.size).toBe(0);
    expect(mount({}).isHidden("x")).toBe(false);
  });
});
