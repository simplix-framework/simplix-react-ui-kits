import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

// The page's modules read the browser's storage when they load; the server render has none.
const memory = new Map<string, string>();
Object.assign(globalThis, {
  localStorage: { getItem: (k: string) => memory.get(k) ?? null, setItem: (k: string, v: string) => memory.set(k, v), removeItem: (k: string) => memory.delete(k) },
});
const { ConsolePage } = await import("./console-page");

const body = createElement("div", { "data-testid": "body" }, "fields");

function render(spec: Record<string, unknown>): string {
  return renderToStaticMarkup(createElement(ConsolePage, { spec: { title: "Release storage", body, ...spec } as never, search: {}, onNavigate: () => {} }));
}

describe("the body of a page with no tabs", () => {
  it("is a named region on a settings page, named by the page title", () => {
    const html = render({ layout: "flow" });
    expect(html).toContain('<section aria-label="Release storage" data-page-body="true">');
    expect(html.indexOf("data-page-body")).toBeLessThan(html.indexOf('data-testid="body"'));
  });

  it("takes the body's own heading as its name when the page has one", () => {
    expect(render({ layout: "flow", bodyTitle: "Bucket" })).toContain('aria-label="Bucket"');
  });

  it("leaves a page that is not a settings page as it was, with no extra region", () => {
    expect(render({})).not.toContain("data-page-body");
  });

  it("leaves a page with tabs to its tab panels", () => {
    const html = render({ layout: "flow", tabs: [{ key: "a", label: "A", body }, { key: "b", label: "B", body }] });
    expect(html).not.toContain("data-page-body");
  });
});
