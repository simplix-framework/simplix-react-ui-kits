import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { ConsoleMenuInactiveRow, ConsoleMenuLinkRow } from "./menu-tree";

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

describe("ConsoleMenuInactiveRow", () => {
  const inactive = (props: Record<string, unknown> = {}) => renderToStaticMarkup(createElement(ConsoleMenuInactiveRow, { icon: null, label: "Reports", "aria-description": "Not built yet", ...props }));

  it("is a tab stop that says it is disabled, so the reason is reachable without a pointer", () => {
    const out = inactive();
    expect(out).toContain('tabindex="0"');
    expect(out).toContain('aria-disabled="true"');
    expect(out).toContain('aria-description="Not built yet"');
  });

  it("lets the caller take the tab stop away", () => {
    expect(inactive({ tabIndex: -1 })).toContain('tabindex="-1"');
  });
});
