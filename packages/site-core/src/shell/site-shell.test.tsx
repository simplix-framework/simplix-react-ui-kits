import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import type { SiteLinkProps } from "../link/site-link";
import { bySlot, tabStops, unmarked } from "../testing/markup";
import { avatarInitial, menuKeyTarget, SiteBar, type SiteBarProps } from "./site-bar";
import { siteBarAccountNameStyle, siteBarMenuStyle, siteBarMoreStyle, siteBarNavStyle, siteBarStyle, siteFooterStyle, siteWindowStyle } from "./site-shell.style";
import { SiteFooter } from "./site-footer";
import { SiteBand, SiteWindow } from "./site-window";

const links: SiteBarProps["links"] = [
  { key: "intro", label: "Product", href: "/" },
  { key: "pricing", label: "Pricing", href: "/pricing", current: true },
  { key: "download", label: "Download", href: "/download" },
  { key: "help", label: "Help", href: "/help" },
];

const bar = (props: Partial<SiteBarProps> = {}) => (
  <SiteBar
    brand={<svg aria-hidden="true" data-slot="brand-mark" />}
    brandHref="/"
    brandLabel="Home"
    links={links}
    navLabel="Site"
    moreLabel="More pages"
    action={{ id: "start", label: "Start free", href: "/signup" }}
    {...props}
  />
);

const footer = (
  <SiteFooter
    owner="© Owner Inc."
    linksLabel="Legal"
    links={[
      { key: "terms", label: "Terms of use", href: "/terms" },
      { key: "privacy", label: "Privacy policy", href: "/privacy", emphasis: true },
      { key: "business", label: "Business information", href: "/business", current: true },
    ]}
    language={<button type="button" data-slot="language-picker">English</button>}
  />
);

describe("SiteWindow", () => {
  it("draws the bar, the page and the footer in order inside the page container", () => {
    const html = renderToStaticMarkup(
      <SiteWindow page="pricing" bar={bar()} footer={footer}>
        <p data-slot="page-body">body</p>
      </SiteWindow>,
    );
    expect(html.startsWith('<div data-slot="site-window"')).toBe(true);
    expect(html).toContain('data-page="pricing"');
    const order = ["site-bar", "site-main", "page-body", "site-footer"].map((slot) => html.indexOf(`data-slot="${slot}"`));
    expect(order.every((at, i) => at > -1 && (i === 0 || at > (order[i - 1] ?? 0)))).toBe(true);
    expect(siteWindowStyle.base).toContain("@container/page");
    expect(unmarked(html)).toEqual([]);
  });

  it("hands its link component to every link inside", () => {
    const Routed = (props: SiteLinkProps) => <a {...props} data-router="yes" />;
    const html = renderToStaticMarkup(
      <SiteWindow page="pricing" bar={bar()} footer={footer} linkComponent={Routed}>
        <span data-slot="page-body" />
      </SiteWindow>,
    );
    const anchors = html.match(/<a /g)?.length ?? 0;
    expect(anchors).toBeGreaterThan(0);
    expect(html.match(/data-router="yes"/g)?.length).toBe(anchors);
  });

  it("marks a dark band so the band's values take over inside it", () => {
    const html = renderToStaticMarkup(
      <SiteBand tone="dark">
        <span data-slot="hero" />
      </SiteBand>,
    );
    expect(html).toContain('data-slot="site-band"');
    expect(html).toContain('data-band="dark"');
  });
});

describe("SiteBar", () => {
  it("draws the brand home, every page with the current one marked, and the visitor's action", () => {
    const html = renderToStaticMarkup(bar());
    const brand = bySlot(html, "site-bar-brand")[0];
    expect(brand?.attributes.href).toBe("/");
    expect(brand?.attributes["aria-label"]).toBe("Home");
    const pageLinks = bySlot(html, "site-bar-link");
    expect(pageLinks.map((link) => link.attributes.href)).toEqual(["/", "/pricing", "/download", "/help"]);
    expect(pageLinks.map((link) => link.attributes["aria-current"] ?? "")).toEqual(["", "page", "", ""]);
    expect(pageLinks.map((link) => link.attributes["data-current"])).toEqual(["false", "true", "false", "false"]);
    const action = bySlot(html, "site-action")[0];
    expect(action?.name).toBe("a");
    expect(action?.attributes["data-tone"]).toBe("primary");
    expect(bySlot(html, "site-bar-account")).toEqual([]);
    expect(unmarked(html)).toEqual([]);
  });

  it("draws the signed-in account with its initial in place of the visitor's action", () => {
    const html = renderToStaticMarkup(bar({ account: { label: "My account", name: "  taylor", href: "/account", current: true } }));
    expect(bySlot(html, "site-action")).toEqual([]);
    const account = bySlot(html, "site-bar-account")[0];
    expect(account?.attributes["aria-current"]).toBe("page");
    expect(html).toContain(">My account</span>");
    expect(html).toMatch(/data-slot="site-avatar"[^>]*>T</);
  });

  it("reaches every page, the brand, the action and the more menu with Tab, in reading order", () => {
    const stops = tabStops(renderToStaticMarkup(bar())).map((tag) => tag.attributes["data-slot"]);
    expect(stops).toEqual(["site-bar-brand", "site-bar-link", "site-bar-link", "site-bar-link", "site-bar-link", "site-action", "site-bar-more"]);
  });

  it("closes the more menu until it is opened, and names what it opens", () => {
    const more = bySlot(renderToStaticMarkup(bar()), "site-bar-more")[0];
    expect(more?.attributes["aria-expanded"]).toBe("false");
    expect(more?.attributes["aria-label"]).toBe("More pages");
    expect(more?.attributes["aria-controls"]).toBeTruthy();
    expect(bySlot(renderToStaticMarkup(bar()), "site-bar-menu")).toEqual([]);
  });

  it("continues a dark band into the bar", () => {
    const dark = bySlot(renderToStaticMarkup(bar({ tone: "dark" })), "site-bar")[0];
    expect(dark?.attributes["data-band"]).toBe("dark");
    expect(dark?.attributes["data-tone"]).toBe("dark");
    const light = bySlot(renderToStaticMarkup(bar()), "site-bar")[0];
    expect(light?.attributes["data-band"]).toBeUndefined();
  });

  it("moves the pages into the more menu below the narrow tier", () => {
    expect(siteBarNavStyle.base).toContain("@max-page-narrow/page:hidden");
    expect(siteBarMoreStyle.base).toMatch(/(^| )hidden( |$)/);
    expect(siteBarMoreStyle.base).toContain("@max-page-narrow/page:inline-flex");
    expect(siteBarMenuStyle.base).toContain("@max-page-narrow/page:flex");
    expect(siteBarAccountNameStyle.base).toContain("@max-page-narrow/page:sr-only");
    expect(siteBarStyle.base).toContain("@max-page-narrow/page:px-4");
    expect(siteFooterStyle.base).toContain("@max-page-narrow/page:px-4");
  });
});

describe("the more menu's keys", () => {
  it("opens on the first or last item from the trigger, walks and wraps, and closes on Escape", () => {
    expect(menuKeyTarget("ArrowDown", -1, 4)).toBe(0);
    expect(menuKeyTarget("ArrowUp", -1, 4)).toBe(3);
    expect(menuKeyTarget("ArrowDown", 3, 4)).toBe(0);
    expect(menuKeyTarget("ArrowUp", 0, 4)).toBe(3);
    expect(menuKeyTarget("Home", 2, 4)).toBe(0);
    expect(menuKeyTarget("End", 0, 4)).toBe(3);
    expect(menuKeyTarget("Escape", 1, 4)).toBe("close");
  });

  it("leaves every other key alone", () => {
    expect(menuKeyTarget("a", 1, 4)).toBeNull();
    expect(menuKeyTarget("Tab", 1, 4)).toBeNull();
    expect(menuKeyTarget("ArrowDown", -1, 0)).toBeNull();
  });
});

describe("avatarInitial", () => {
  it("takes the first grapheme of the trimmed name, upper-cased", () => {
    expect(avatarInitial(" taylor ")).toBe("T");
    expect(avatarInitial("\uAE40\uD558\uB298")).toBe("\uAE40");
    expect(avatarInitial("")).toBe("");
  });
});

describe("SiteFooter", () => {
  it("draws the owner, the legal links with the emphasised and current ones marked, then the language picker", () => {
    const html = renderToStaticMarkup(footer);
    expect(bySlot(html, "site-footer-owner")).toHaveLength(1);
    const legal = bySlot(html, "site-footer-link");
    expect(legal.map((link) => link.attributes["data-emphasis"])).toEqual(["false", "true", "false"]);
    expect(legal.map((link) => link.attributes["aria-current"] ?? "")).toEqual(["", "", "page"]);
    expect(html.indexOf("site-footer-links")).toBeLessThan(html.indexOf("site-footer-language"));
    expect(bySlot(html, "site-footer-links")[0]?.attributes["aria-label"]).toBe("Legal");
  });

  it("draws no language place when the product hands no picker", () => {
    const html = renderToStaticMarkup(<SiteFooter owner="©" links={[]} linksLabel="Legal" />);
    expect(bySlot(html, "site-footer-language")).toEqual([]);
  });
});
