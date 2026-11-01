import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

// The page's modules read the browser's storage when they load; the server render has none.
const memory = new Map<string, string>();
Object.assign(globalThis, {
  localStorage: { getItem: (k: string) => memory.get(k) ?? null, setItem: (k: string, v: string) => memory.set(k, v), removeItem: (k: string) => memory.delete(k) },
});
const { ConsolePage } = await import("./console-page");

describe("the console page's order", () => {
  it("draws the figure tiles first and the notices directly under them", () => {
    const html = renderToStaticMarkup(
      createElement(ConsolePage, {
        spec: {
          title: "Jobs",
          tiles: [{ key: "failed", label: "Failed", value: 2, counted: true, filter: { field: "status", value: "FAILED" } }],
          notice: { key: "failed", kind: "danger", title: "2 jobs failed" },
          body: createElement("div", { "data-testid": "body" }, "rows"),
        },
        search: {},
        onNavigate: () => {},
      }),
    );
    const cards = html.indexOf(">Failed<");
    const notice = html.indexOf("2 jobs failed");
    const body = html.indexOf('data-testid="body"');
    expect(cards).toBeGreaterThan(-1);
    expect(cards).toBeLessThan(notice);
    expect(notice).toBeLessThan(body);
  });
});
