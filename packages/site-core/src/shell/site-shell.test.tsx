import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import type { SiteLinkProps } from "../link/site-link";
import { bySlot, tabStops, unmarked } from "../testing/markup";
import { avatarInitial, barMenuActions, menuKeyTarget, SiteBar, SiteBarMenuItems, type SiteBarProps } from "./site-bar";
import { siteActionStyle } from "../action/site-action.style";
import { siteBarAccountNameStyle, siteBarMenuStyle, siteBarMoreStyle, siteBarNavStyle, siteBarStyle, siteFooterStyle, siteWindowStyle } from "./site-shell.style";
import { SiteFooter } from "./site-footer";
import { pageHeading, SiteBand, SiteWindow } from "./site-window";
import {
  applySiteScheme,
  followSystemScheme,
  parseSiteScheme,
  readSiteScheme,
  SITE_SCHEME_KEY,
  siteSchemeBootstrap,
  writeSiteScheme,
  type SchemeQuery,
  type SchemeStorage,
} from "./site-scheme";

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
    actions={[{ id: "start", label: "Start free", href: "/signup" }]}
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

  it("draws no page landmark and no more menu when the site has no pages and no menu action", () => {
    const html = renderToStaticMarkup(bar({ links: [], actions: [{ id: "start", label: "Start free", href: "/signup" }] }));
    expect(html).not.toContain("<nav");
    expect(bySlot(html, "site-bar-nav")).toEqual([]);
    expect(bySlot(html, "site-bar-more")).toEqual([]);
    expect(bySlot(html, "site-action")).toHaveLength(1);
    expect(unmarked(html)).toEqual([]);
  });

  it("keeps the more menu for a menu action when there are no pages", () => {
    const html = renderToStaticMarkup(bar({ links: [], actions: [{ id: "start", label: "Start free", href: "/signup", narrow: "menu" }] }));
    expect(bySlot(html, "site-bar-nav")).toEqual([]);
    expect(bySlot(html, "site-bar-more")).toHaveLength(1);
  });

  it("draws the visitor's actions in reading order, each in its own tone, the first without one as the primary", () => {
    const html = renderToStaticMarkup(
      bar({
        actions: [
          { id: "signIn", label: "Sign in", href: "/login", tone: "quiet", narrow: "menu" },
          { id: "start", label: "Start free", href: "/signup" },
        ],
      }),
    );
    const actions = bySlot(html, "site-action");
    expect(actions.map((action) => [action.attributes["data-action"], action.attributes["data-tone"], action.attributes.href])).toEqual([
      ["signIn", "quiet", "/login"],
      ["start", "primary", "/signup"],
    ]);
    expect(actions.map((action) => action.attributes["data-narrow"])).toEqual(["hidden", "shown"]);
    expect(siteActionStyle.variants.narrow.hidden).toContain("@max-page-narrow/page:hidden");
    expect(siteActionStyle.variants.narrow.shown).not.toContain("hidden");
    const stops = tabStops(html).map((tag) => tag.attributes["data-action"] ?? tag.attributes["data-slot"]);
    expect(stops.slice(-3)).toEqual(["signIn", "start", "site-bar-more"]);
    expect(unmarked(html)).toEqual([]);
  });

  it("lists the pages and then only the actions that leave the bar in the open more menu", () => {
    const html = renderToStaticMarkup(
      <SiteBarMenuItems
        links={links}
        actions={[
          { id: "signIn", label: "Sign in", href: "/login", narrow: "menu" },
          { id: "notify", label: "Tell me", narrow: "menu" },
        ]}
        onClose={() => {}}
      />,
    );
    const items = bySlot(html, "site-bar-menu-item");
    expect(items.map((item) => [item.name, item.attributes.href ?? "", item.attributes["data-action"] ?? ""])).toEqual([
      ["a", "/", ""],
      ["a", "/pricing", ""],
      ["a", "/download", ""],
      ["a", "/help", ""],
      ["a", "/login", "signIn"],
      ["button", "", "notify"],
    ]);
    expect(html).toContain(">Sign in</a>");
  });

  it("moves only the actions marked for the menu into it, and none once an account is signed in", () => {
    const actions = [
      { id: "signIn", label: "Sign in", href: "/login", narrow: "menu" as const },
      { id: "start", label: "Start free", href: "/signup" },
      { id: "demo", label: "Book a demo", href: "/demo", narrow: "bar" as const },
    ];
    expect(barMenuActions(actions, false).map((action) => action.id)).toEqual(["signIn"]);
    expect(barMenuActions(actions, true)).toEqual([]);
  });

  it("draws no visitor action once an account is signed in", () => {
    const html = renderToStaticMarkup(
      bar({
        actions: [{ id: "signIn", label: "Sign in", href: "/login", tone: "quiet", narrow: "menu" }],
        account: { label: "My account", name: "Taylor", href: "/account" },
      }),
    );
    expect(bySlot(html, "site-action")).toEqual([]);
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

  it("draws a page that is not open yet as plain text in its place, reached by no Tab", () => {
    const pending = links.map((link) => (link.key === "download" || link.key === "help" ? { ...link, href: undefined } : link));
    const html = renderToStaticMarkup(bar({ links: pending }));
    const pageLinks = bySlot(html, "site-bar-link");
    expect(pageLinks.map((link) => link.name)).toEqual(["a", "a", "span", "span"]);
    expect(pageLinks.map((link) => link.attributes["data-pending"])).toEqual(["false", "false", "true", "true"]);
    expect(pageLinks.slice(2).every((link) => link.attributes.href === undefined && link.attributes["aria-current"] === undefined)).toBe(true);
    expect(html).toContain(">Download</span>");
    const stops = tabStops(html).map((tag) => tag.attributes["data-slot"]);
    expect(stops).toEqual(["site-bar-brand", "site-bar-link", "site-bar-link", "site-action", "site-bar-more"]);
    expect(unmarked(html)).toEqual([]);
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

  it("draws a legal page that is not open yet as plain text in its place, reached by no Tab", () => {
    const html = renderToStaticMarkup(
      <SiteFooter
        owner="©"
        linksLabel="Legal"
        links={[
          { key: "terms", label: "Terms of use" },
          { key: "privacy", label: "Privacy policy", emphasis: true },
          { key: "business", label: "Business information", href: "/business" },
        ]}
      />,
    );
    const legal = bySlot(html, "site-footer-link");
    expect(legal.map((link) => [link.name, link.attributes["data-pending"], link.attributes["data-emphasis"]])).toEqual([
      ["span", "true", "false"],
      ["span", "true", "true"],
      ["a", "false", "false"],
    ]);
    expect(tabStops(html).map((tag) => tag.attributes.href)).toEqual(["/business"]);
  });

  it("draws no legal landmark when the site has no legal links", () => {
    const html = renderToStaticMarkup(<SiteFooter owner="©" links={[]} linksLabel="Legal" />);
    expect(html).not.toContain("<nav");
    expect(bySlot(html, "site-footer-links")).toEqual([]);
    expect(bySlot(html, "site-footer-owner")).toHaveLength(1);
  });

  it("draws no language place when the product hands no picker", () => {
    const html = renderToStaticMarkup(<SiteFooter owner="©" links={[]} linksLabel="Legal" />);
    expect(bySlot(html, "site-footer-language")).toEqual([]);
  });

  it("draws the theme control in its own place after the language picker, and no place without one", () => {
    const html = renderToStaticMarkup(
      <SiteFooter owner="©" links={[]} linksLabel="Legal" language={<span data-slot="language-picker" />} theme={<span data-slot="theme-control" />} />,
    );
    const language = html.indexOf('data-slot="site-footer-language"');
    const theme = html.indexOf('data-slot="site-footer-theme"');
    expect(language).toBeGreaterThan(-1);
    expect(theme).toBeGreaterThan(language);
    expect(html.indexOf('data-slot="theme-control"')).toBeGreaterThan(theme);
    expect(bySlot(renderToStaticMarkup(footer), "site-footer-theme")).toEqual([]);
  });
});

describe("followSystemScheme", () => {
  function fakes(matches: boolean) {
    const listeners = new Set<(event: { readonly matches: boolean }) => void>();
    const query: SchemeQuery = {
      matches,
      addEventListener: (_type, listener) => listeners.add(listener),
      removeEventListener: (_type, listener) => listeners.delete(listener),
    };
    const classes = new Set<string>();
    const target = { classList: { toggle: (token: string, force: boolean) => (force ? classes.add(token) : classes.delete(token), force) } };
    return { query, target, classes, listeners, change: (dark: boolean) => listeners.forEach((listener) => listener({ matches: dark })) };
  }

  it("draws the dark scheme exactly while the system asks for it, and follows a later change", () => {
    const dark = fakes(true);
    followSystemScheme(dark.query, dark.target);
    expect(dark.classes.has("dark")).toBe(true);
    dark.change(false);
    expect(dark.classes.has("dark")).toBe(false);
    const light = fakes(false);
    light.classes.add("dark");
    followSystemScheme(light.query, light.target);
    expect(light.classes.has("dark")).toBe(false);
  });

  it("stops following once the returned function runs", () => {
    const scheme = fakes(false);
    const stop = followSystemScheme(scheme.query, scheme.target);
    expect(scheme.listeners.size).toBe(1);
    stop();
    expect(scheme.listeners.size).toBe(0);
    scheme.change(true);
    expect(scheme.classes.has("dark")).toBe(false);
  });
});

describe("the reader's scheme choice", () => {
  function target() {
    const classes = new Set<string>();
    return { classes, classList: { toggle: (token: string, force: boolean) => (force ? classes.add(token) : classes.delete(token), force) } };
  }
  function query(matches: boolean): SchemeQuery & { readonly count: () => number } {
    const listeners = new Set<unknown>();
    return {
      matches,
      addEventListener: (_type, listener) => listeners.add(listener),
      removeEventListener: (_type, listener) => listeners.delete(listener),
      count: () => listeners.size,
    };
  }
  function memory(initial: Record<string, string> = {}): SchemeStorage & { readonly values: Map<string, string> } {
    const values = new Map(Object.entries(initial));
    return {
      values,
      getItem: (key) => values.get(key) ?? null,
      setItem: (key, value) => void values.set(key, value),
      removeItem: (key) => void values.delete(key),
    };
  }

  it("reads only light and dark as a fixed choice; nothing stored, or anything else, is the system's", () => {
    expect([parseSiteScheme("light"), parseSiteScheme("dark"), parseSiteScheme(null), parseSiteScheme("true"), parseSiteScheme("")]).toEqual(["light", "dark", "system", "system", "system"]);
  });

  it("keeps a fixed choice under its own key and the system's as no value at all", () => {
    const storage = memory();
    writeSiteScheme(storage, "dark");
    expect(storage.values.get(SITE_SCHEME_KEY)).toBe("dark");
    expect(readSiteScheme(storage)).toBe("dark");
    writeSiteScheme(storage, "system");
    expect(storage.values.has(SITE_SCHEME_KEY)).toBe(false);
    expect(readSiteScheme(storage)).toBe("system");
    expect(SITE_SCHEME_KEY).not.toMatch(/:$/);
  });

  it("answers the system's when the store refuses to be read or written", () => {
    const refusing: SchemeStorage = {
      getItem: () => {
        throw new Error("blocked");
      },
      setItem: () => {
        throw new Error("blocked");
      },
      removeItem: () => {
        throw new Error("blocked");
      },
    };
    expect(readSiteScheme(refusing)).toBe("system");
    expect(() => writeSiteScheme(refusing, "dark")).not.toThrow();
  });

  it("draws a fixed choice whatever the system says, and follows the system only for the system's", () => {
    const darkSystem = query(true);
    const light = target();
    applySiteScheme("light", darkSystem, light);
    expect(light.classes.has("dark")).toBe(false);
    expect(darkSystem.count()).toBe(0);
    const lightSystem = query(false);
    const dark = target();
    applySiteScheme("dark", lightSystem, dark);
    expect(dark.classes.has("dark")).toBe(true);
    const followed = target();
    const stop = applySiteScheme("system", darkSystem, followed);
    expect(followed.classes.has("dark")).toBe(true);
    expect(darkSystem.count()).toBe(1);
    stop();
    expect(darkSystem.count()).toBe(0);
  });

  it("opens the page before the first paint exactly as the choice draws it, from the same key", () => {
    // The bootstrap is the text a page puts in its head; it runs here against fakes of what it reads.
    const run = (stored: string | null, systemDark: boolean, key?: string) => {
      const html = target();
      const storage = memory(stored === null ? {} : { [key ?? SITE_SCHEME_KEY]: stored });
      new Function("localStorage", "window", "document", siteSchemeBootstrap(key))(storage, { matchMedia: () => ({ matches: systemDark }) }, { documentElement: html });
      return html.classes.has("dark");
    };
    for (const stored of ["light", "dark", null, "stale"]) {
      for (const systemDark of [true, false]) {
        const drawn = target();
        applySiteScheme(parseSiteScheme(stored), query(systemDark), drawn);
        expect(run(stored, systemDark)).toBe(drawn.classes.has("dark"));
      }
    }
    expect(siteSchemeBootstrap()).toContain(JSON.stringify(SITE_SCHEME_KEY));
    expect(run("dark", false, "other.prefs:scheme")).toBe(true);
    const unreadable = target();
    new Function("localStorage", "window", "document", siteSchemeBootstrap())(
      { getItem: () => { throw new Error("blocked"); } },
      { matchMedia: () => ({ matches: true }) },
      { documentElement: unreadable },
    );
    expect(unreadable.classes.has("dark")).toBe(true);
  });
});

describe("pageHeading", () => {
  const root = (h1: string | null) => ({ querySelector: (selector: string) => (selector === "h1" && h1 !== null ? ({ textContent: h1 } as Element) : null) });

  it("reads the page's heading with its spaces folded, for the document's title", () => {
    expect(pageHeading(root("  Terms of\n   use "))).toBe("Terms of use");
  });

  it("answers empty for a page without a heading and for a window not drawn yet", () => {
    expect(pageHeading(root(null))).toBe("");
    expect(pageHeading(null)).toBe("");
  });
});
