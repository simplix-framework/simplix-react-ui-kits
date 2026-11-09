import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { ConsolePhoneBar } from "./phone-shell";

const bar = (props: { title?: string; brand?: string }) => renderToStaticMarkup(createElement(ConsolePhoneBar, props));

// The page header draws no title on a phone, so the bar carries the screen's name; a bar that drew it
// as plain text left a routed page with no level-one heading at a phone's width.
describe("the phone bar", () => {
  it("draws the page title as the screen's one level-one heading, with or without a brand", () => {
    expect(bar({ title: "Revenue and cost", brand: "Mark" }).match(/<h1[^>]*>Revenue and cost<\/h1>/g)).toHaveLength(1);
    expect(bar({ title: "Revenue and cost" }).match(/<h1[^>]*>Revenue and cost<\/h1>/g)).toHaveLength(1);
  });

  it("draws no heading when the screen has no title", () => {
    expect(bar({ brand: "Mark" })).not.toContain("<h1");
  });
});
