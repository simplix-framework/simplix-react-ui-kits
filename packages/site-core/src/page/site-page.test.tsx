import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { bySlot, silentRefusals, tabStops, unmarked } from "../testing/markup";
import { SiteTextAction } from "./site-bits";
import { SiteBreadcrumb, SitePage, SitePageHead, SiteSection } from "./site-page";
import { sitePageStyle } from "./site-page.style";

describe("SitePage", () => {
  it("holds the page's regions in one column no wider than the wide tier, with less side room below the narrow tier", () => {
    const html = renderToStaticMarkup(
      <SitePage>
        <SitePageHead title="Pick a plan" lede="Free voices have no limit." />
      </SitePage>,
    );
    expect(html.startsWith('<div data-slot="site-page"')).toBe(true);
    expect(sitePageStyle.base).toContain("max-w-(--site-page-wide)");
    expect(sitePageStyle.base).toContain("@max-page-narrow/page:px-4");
    expect(sitePageStyle.variants.rhythm.page).toContain("@max-page-narrow/page:py-5");
    expect(unmarked(html)).toEqual([]);
  });
});

describe("SitePageHead", () => {
  it("draws the eyebrow, the one h1 and the lede in that order", () => {
    const html = renderToStaticMarkup(<SitePageHead eyebrow="Billing" title="Pick a plan" lede="Free voices have no limit." />);
    expect(html.match(/<h1/g)).toHaveLength(1);
    const at = ["site-page-eyebrow", "site-page-title", "site-page-lede"].map((slot) => html.indexOf(slot));
    expect(at[0]).toBeLessThan(at[1] ?? 0);
    expect(at[1]).toBeLessThan(at[2] ?? 0);
  });

  it("draws no eyebrow and no lede when none is handed", () => {
    const html = renderToStaticMarkup(<SitePageHead title="Pick a plan" />);
    expect(bySlot(html, "site-page-eyebrow")).toEqual([]);
    expect(bySlot(html, "site-page-lede")).toEqual([]);
  });
});

describe("SiteSection", () => {
  it("is named by its h2 and draws its heading at the size asked", () => {
    const html = renderToStaticMarkup(
      <SiteSection heading="Questions" size="lg" lede="Asked before paying.">
        <p data-slot="body">body</p>
      </SiteSection>,
    );
    const section = bySlot(html, "site-section")[0];
    const heading = bySlot(html, "site-section-heading")[0];
    expect(section?.attributes["aria-labelledby"]).toBe(heading?.attributes.id);
    expect(heading?.name).toBe("h2");
    expect(heading?.attributes["data-size"]).toBe("lg");
    expect(bySlot(renderToStaticMarkup(<SiteSection heading="Q">x</SiteSection>), "site-section-heading")[0]?.attributes["data-size"]).toBe("md");
  });
});

describe("SiteBreadcrumb", () => {
  const steps = [
    { key: "home", label: "Home", href: "/" },
    { key: "legal", label: "Legal", href: "/legal" },
    { key: "terms", label: "Terms of use", href: "/terms" },
  ];

  it("links every step but the last, which is the current page", () => {
    const html = renderToStaticMarkup(<SiteBreadcrumb steps={steps} label="You are here" />);
    expect(bySlot(html, "site-breadcrumb-link").map((link) => link.attributes.href)).toEqual(["/", "/legal"]);
    const items = bySlot(html, "site-breadcrumb-item");
    expect(items.map((item) => item.attributes["aria-current"] ?? "")).toEqual(["", "", "page"]);
    expect(items.map((item) => item.attributes["data-current"])).toEqual(["false", "false", "true"]);
    expect(bySlot(html, "site-breadcrumb-separator")).toHaveLength(2);
    expect(bySlot(html, "site-breadcrumb")[0]?.attributes["aria-label"]).toBe("You are here");
    expect(tabStops(html)).toHaveLength(2);
    expect(unmarked(html)).toEqual([]);
  });

  it("draws one step as the current page with no separator", () => {
    const html = renderToStaticMarkup(<SiteBreadcrumb steps={[{ key: "home", label: "Home", href: "/" }]} label="Trail" />);
    expect(bySlot(html, "site-breadcrumb-link")).toEqual([]);
    expect(bySlot(html, "site-breadcrumb-separator")).toEqual([]);
  });
});

describe("SiteTextAction", () => {
  it("draws a link with an address and, disabled, a button described by its reason for a screen reader", () => {
    expect(bySlot(renderToStaticMarkup(<SiteTextAction href="/a">Resend</SiteTextAction>), "site-text-action")[0]?.name).toBe("a");
    const html = renderToStaticMarkup(
      <SiteTextAction href="/a" disabled reason="Wait a minute before sending again">
        Resend
      </SiteTextAction>,
    );
    const action = bySlot(html, "site-text-action")[0];
    expect(action?.name).toBe("button");
    expect(action?.attributes["aria-describedby"]).toBe(bySlot(html, "site-action-reason")[0]?.attributes.id);
    expect(tabStops(html)).toEqual([]);
    expect(unmarked(html)).toEqual([]);
    // @ts-expect-error a disabled text action carries the reason it cannot run
    expect(<SiteTextAction disabled>Resend</SiteTextAction>).toBeDefined();
  });

  it("is described by the line it names instead of its hidden reason", () => {
    const html = renderToStaticMarkup(
      <SiteTextAction disabled reason="Wait a minute" describedBy="why">
        Resend
      </SiteTextAction>,
    );
    expect(bySlot(html, "site-action-reason")).toEqual([]);
    expect(bySlot(html, "site-text-action")[0]?.attributes["aria-describedby"]).toBe("why");
    expect(silentRefusals(html)).toEqual([]);
  });
});
