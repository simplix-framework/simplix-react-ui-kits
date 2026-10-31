import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { RecordValueView } from "./record-value";

describe("a RecordValue marked as code", () => {
  it("draws its text in the monospaced face, inside a code element", () => {
    const html = renderToStaticMarkup(createElement(RecordValueView, { value: { text: "baseline.jobPositions", code: true } }));
    expect(html).toMatch(/<code[^>]*>baseline\.jobPositions<\/code>/);
  });

  it("leaves plain text as plain text", () => {
    const html = renderToStaticMarkup(createElement(RecordValueView, { value: { text: "Head office" } }));
    expect(html).not.toContain("<code");
    expect(html).toContain("<span>Head office</span>");
  });
});
