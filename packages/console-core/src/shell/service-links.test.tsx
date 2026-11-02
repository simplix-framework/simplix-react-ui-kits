import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { TooltipProvider } from "@simplix-react/ui";

import { ConsoleMenuColumn, ConsoleMenuLinkRow, ConsoleMenuRail } from "./menu-tree";
import { ConsoleServiceLinks, configuredServiceLinks, type ConsoleServiceLink, type ConsoleServiceLinksLayout } from "./service-links";

const LINKS: readonly ConsoleServiceLink[] = [
  { key: "portal", label: "Customer portal", href: " https://portal.example.test/ " },
  { key: "unset", label: "Unset service", href: undefined },
  { key: "empty", label: "Empty service", href: "" },
  { key: "blank", label: "Blank service", href: "   " },
  { key: "null", label: "Null service", href: null },
  { key: "mail", label: "Mail catcher", href: "http://localhost:8025/" },
];

function draw(layout: ConsoleServiceLinksLayout, links: readonly ConsoleServiceLink[] = LINKS): string {
  return renderToStaticMarkup(
    createElement(TooltipProvider, null, createElement(ConsoleServiceLinks, { title: "Related services", links, layout })),
  );
}

/** Every anchor's opening tag in the markup. */
function anchors(markup: string): string[] {
  return markup.match(/<a\b[^>]*>/g) ?? [];
}

describe("configuredServiceLinks", () => {
  it("keeps only the services with an address, trimmed, in the order given", () => {
    expect(configuredServiceLinks(LINKS).map((link) => [link.key, link.href])).toEqual([
      ["portal", "https://portal.example.test/"],
      ["mail", "http://localhost:8025/"],
    ]);
  });
});

describe("ConsoleServiceLinks", () => {
  it.each<ConsoleServiceLinksLayout>(["column", "rail", "sheet"])("draws only the configured services in the %s", (layout) => {
    const markup = draw(layout);
    expect(anchors(markup)).toHaveLength(2);
    expect(markup).toContain('href="https://portal.example.test/"');
    expect(markup).toContain('href="http://localhost:8025/"');
    for (const label of ["Unset service", "Empty service", "Blank service", "Null service"]) {
      expect(markup).not.toContain(label);
    }
  });

  it.each<ConsoleServiceLinksLayout>(["column", "rail", "sheet"])("opens every service in a new tab with no opener and no referrer in the %s", (layout) => {
    for (const anchor of anchors(draw(layout))) {
      expect(anchor).toContain('target="_blank"');
      expect(anchor).toContain('rel="noopener noreferrer"');
    }
  });

  it.each<ConsoleServiceLinksLayout>(["column", "rail", "sheet"])("draws nothing in the %s when no service has an address", (layout) => {
    expect(draw(layout, LINKS.filter((link) => !link.href?.trim()))).toBe("");
    expect(draw(layout, [])).toBe("");
  });

  it("names the group as a landmark and over the rows in the column", () => {
    const markup = draw("column");
    expect(markup).toContain('role="navigation" aria-label="Related services"');
    expect(markup).toMatch(/data-part="console-service-links-title"[^>]*>Related services</);
  });

  it("gives each rail mark a tooltip and a name in words, with no native title beside it", () => {
    const markup = draw("rail");
    for (const anchor of anchors(markup)) {
      // Radix marks a tooltip trigger with its state; the content mounts on hover or focus.
      expect(anchor).toContain('data-state="closed"');
      expect(anchor).not.toContain("title=");
    }
    expect(markup).toMatch(/<span class="sr-only">Customer portal [^<]+<\/span>/);
    expect(markup).not.toContain('data-part="console-service-links-title"');
  });

  it("titles the section in the phone sheet", () => {
    const markup = draw("sheet");
    expect(markup).toContain(">Related services<");
    expect(markup).toContain('role="navigation" aria-label="Related services"');
  });
});

describe("ConsoleMenuLinkRow", () => {
  it("marks an external row and opens it in a new tab", () => {
    const markup = renderToStaticMarkup(createElement(ConsoleMenuLinkRow, { label: "Portal", href: "https://portal.example.test/", external: true }));
    expect(markup).toContain('target="_blank"');
    expect(markup).toContain('rel="noopener noreferrer"');
    // The words follow the label after a space, so the link is heard as two phrases, not one word.
    expect(markup).toMatch(/>Portal<\/span>.*<span class="sr-only"> \S/);
  });

  it("leaves a destination of the console in the same tab with no new-tab mark", () => {
    const markup = renderToStaticMarkup(createElement(ConsoleMenuLinkRow, { label: "Users", href: "/users" }));
    expect(markup).not.toContain("target=");
    expect(markup).not.toContain("sr-only");
  });
});

describe("the navigation's foot", () => {
  it("draws the column's foot after its scrolling body", () => {
    const markup = renderToStaticMarkup(
      createElement(ConsoleMenuColumn, { label: "Menu", title: "Operations", foot: createElement("i", { id: "foot" }), children: createElement("b", { id: "row" }) }),
    );
    expect(markup.indexOf('id="row"')).toBeGreaterThan(-1);
    expect(markup.indexOf('id="foot"')).toBeGreaterThan(markup.indexOf('data-part="console-menu-ink"'));
  });

  it("holds the rail's foot at the rail's end, and draws no box without one", () => {
    const withFoot = renderToStaticMarkup(createElement(ConsoleMenuRail, { label: "Rail", foot: createElement("i", { id: "foot" }), children: null }));
    expect(withFoot).toMatch(/data-part="console-menu-rail-foot"[^>]*><i id="foot">/);
    const without = renderToStaticMarkup(createElement(ConsoleMenuRail, { label: "Rail", children: null }));
    expect(without).not.toContain("console-menu-rail-foot");
  });
});
