import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { WindowScreen } from "./window-screen";

describe("WindowScreen", () => {
  it("draws its page inside a box at least as tall as the window", () => {
    const html = renderToStaticMarkup(createElement(WindowScreen, null, createElement("p", null, "held page")));
    expect(html).toContain("held page");
    expect(html).toContain("min-h-dvh");
  });
});
