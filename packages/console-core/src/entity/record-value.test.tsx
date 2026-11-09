import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { isOtherOrigin, RecordValueView } from "./record-value";

describe("a RecordValue marked as code", () => {
  it("draws its text in the monospaced face, inside a code element", () => {
    const html = renderToStaticMarkup(createElement(RecordValueView, { value: { text: "baseline.jobPositions", code: true } }));
    expect(html).toMatch(/<code[^>]*>baseline\.jobPositions<\/code>/);
  });

  it("leaves plain text as plain text", () => {
    const html = renderToStaticMarkup(createElement(RecordValueView, { value: { text: "Head office" } }));
    expect(html).not.toContain("<code");
    expect(html).toMatch(/<span class="[^"]*">Head office<\/span>/);
  });
});

describe("a RecordValue's text in a cell that keeps one line", () => {
  // The text is a flex item, so the cell's own `text-overflow` never reaches it: without a clip and
  // an ellipsis of its own a long address is cut mid-word with no mark.
  const fits = (html: string, text: string) => new RegExp(`class="[^"]*\\bmin-w-0\\b[^"]*\\boverflow-clip\\b[^"]*\\btext-ellipsis\\b[^"]*"[^>]*>${text}<`).test(html);

  it("takes the width its row leaves it and ends in an ellipsis", () => {
    expect(fits(renderToStaticMarkup(createElement(RecordValueView, { value: { text: "alex.kim@example.com" } })), "alex.kim@example.com")).toBe(true);
    expect(fits(renderToStaticMarkup(createElement(RecordValueView, { value: { text: "baseline.key", code: true } })), "baseline.key")).toBe(true);
    expect(fits(renderToStaticMarkup(createElement(RecordValueView, { value: { text: "Alex", sub: "Head of finance" } })), "Head of finance")).toBe(true);
  });

  it("leaves a plain string, which the cell around it already ellipsizes, as it is", () => {
    expect(renderToStaticMarkup(createElement(RecordValueView, { value: "alex.kim@example.com" }))).toBe("alex.kim@example.com");
  });
});

describe("a RecordValue drawn as a link", () => {
  it("draws its name in the link button, which takes the primary text shade itself", () => {
    const html = renderToStaticMarkup(createElement(RecordValueView, { value: { link: "Credits E2E", onClick: () => {} } }));
    expect(html).toMatch(/data-variant="link"[^>]*>Credits E2E<\/button>/);
  });

  it("leaves a link with nowhere to go as plain text", () => {
    const html = renderToStaticMarkup(createElement(RecordValueView, { value: { link: "Credits E2E" } }));
    expect(html).not.toContain("<button");
  });

  it("opens an address on another origin in a new tab and one on its own in place", () => {
    const away = renderToStaticMarkup(createElement(RecordValueView, { value: { link: "1.2", href: "https://portal.example/terms?version=1.2" } }));
    expect(away).toMatch(/<a[^>]*href="https:\/\/portal\.example\/terms\?version=1\.2"[^>]*target="_blank"[^>]*rel="noreferrer"[^>]*>1\.2<\/a>/);
    const here = renderToStaticMarkup(createElement(RecordValueView, { value: { link: "1.2", href: "/terms?version=1.2" } }));
    expect(here).not.toContain("target=");
  });
});

describe("a RecordValue link marked as code", () => {
  it("draws the name of a link in the monospaced face inside the link", () => {
    const html = renderToStaticMarkup(createElement(RecordValueView, { value: { link: "txn_01hx", code: true, href: "/payment-events/9" } }));
    expect(html).toMatch(/<a href="\/payment-events\/9"[^>]*><code[^>]*>txn_01hx<\/code><\/a>/);
  });

  it("draws a pressable name that is no address in the monospaced face too", () => {
    const html = renderToStaticMarkup(createElement(RecordValueView, { value: { link: "txn_01hx", code: true, onClick: () => {} } }));
    expect(html).toMatch(/data-variant="link"[^>]*><code[^>]*>txn_01hx<\/code><\/button>/);
  });

  it("draws a link with nowhere to go as code text, and keeps the face beside a badge or a second line", () => {
    expect(renderToStaticMarkup(createElement(RecordValueView, { value: { link: "txn_01hx", code: true } }))).toMatch(/<code[^>]*>txn_01hx<\/code>/);
    const lined = renderToStaticMarkup(createElement(RecordValueView, { value: { link: "txn_01hx", code: true, href: "/x", sub: "Paddle" } }));
    expect(lined).toMatch(/<code[^>]*>txn_01hx<\/code>/);
    expect(lined).toContain("Paddle");
  });

  it("leaves a link without the mark as the plain name", () => {
    const html = renderToStaticMarkup(createElement(RecordValueView, { value: { link: "Credits E2E", href: "/x" } }));
    expect(html).not.toContain("<code");
  });
});

describe("isOtherOrigin", () => {
  it("reads an absolute address on another origin as elsewhere, and a relative or same-origin one as here", () => {
    expect(isOtherOrigin("https://portal.example/terms", "https://console.example")).toBe(true);
    expect(isOtherOrigin("https://console.example/users", "https://console.example")).toBe(false);
    expect(isOtherOrigin("/terms?version=1.2", "https://console.example")).toBe(false);
    expect(isOtherOrigin("https://", "https://console.example")).toBe(false);
  });
});

describe("a RecordValue marked as a block", () => {
  it("keeps the line breaks of a several-line machine value", () => {
    const html = renderToStaticMarkup(createElement(RecordValueView, { value: { text: '{\n  "a": 1\n}', code: true, block: true } }));
    expect(html).toContain("whitespace-pre-wrap");
    expect(html).toContain('{\n  &quot;a&quot;: 1\n}');
  });

  it("fills the width of the row it stands in rather than stopping at its longest line", () => {
    const html = renderToStaticMarkup(createElement(RecordValueView, { value: { text: "{}", code: true, block: true } }));
    expect(html).toMatch(/class="[^"]*\bw-full\b/);
  });
});
