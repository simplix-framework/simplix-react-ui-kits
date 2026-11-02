import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { ConsoleMenuLinkRow } from "./menu-tree";

const row = (current?: boolean) => renderToStaticMarkup(createElement(ConsoleMenuLinkRow, { icon: null, label: "Dashboard", href: "/", current }));

describe("ConsoleMenuLinkRow", () => {
  it("tells a screen reader the row it stands on, as the ground tells the eye", () => {
    expect(row(true)).toContain('aria-current="page"');
  });
  it("marks no other row", () => {
    expect(row(false)).not.toContain("aria-current");
    expect(row()).not.toContain("aria-current");
  });
});
