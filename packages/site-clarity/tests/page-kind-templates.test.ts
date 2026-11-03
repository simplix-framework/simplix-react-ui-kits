import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { render, typecheck, virtualRoot } from "./template-typecheck";

/**
 * The site's page kinds: the window every page wears and one page of the site. Each compiles on its
 * own as the generator renders it, and each stays a site shape, drawn with the site parts and none of
 * the console's.
 */

const shellContext = { namespace: "common", nameKebab: "site", NamePascal: "Site", nameCamel: "site" };
const layout = join(virtualRoot, "apps", "app", "src", "app", "layouts", "root-layout.tsx");
const pageFile = join(virtualRoot, "apps", "app", "src", "pages", "pricing", "page.tsx");

describe("the generated site shell", () => {
  const source = render("app-shell.hbs", shellContext);

  it("compiles alone and reads no blocks file", () => {
    expect(source).not.toContain(".blocks");
    expect(typecheck({ [layout]: source }, [layout])).toEqual([]);
  });

  it("draws the bar, the routed page and the footer from the site parts, and nothing of the console", () => {
    expect(source).toContain("<SiteWindow");
    expect(source).toContain("<SiteBar");
    expect(source).toContain("<SiteFooter");
    expect(source).toContain("{parts.wrap(<Outlet />)}");
    expect(source).not.toMatch(/console-(clarity|core)/);
  });

  it("draws the page in the reader's stored scheme choice, with the site's own store and none of the console's", () => {
    expect(source).toContain("useSiteScheme({ apply: true });");
    expect(source).toContain("theme={parts.theme}");
    expect(source).not.toMatch(/DarkModeToggle|useTheme\(|useSystemScheme/);
  });

  it("hands every site part a link that moves the router on a plain press and keeps the real address", () => {
    expect(source).toContain("linkComponent={RouterLink}");
    expect(source).toContain("void router.navigate({ href });");
    expect(source).toContain("href={href}");
  });

  it("compiles once a page that is not open yet, the visitor's actions, an account, a language picker and a theme control are written into its parts", () => {
    const customised = source.replace(
      '    links: [{ key: "home", label: t("shell.home"), href: "/", current: route === "/" }],\n    legal: [],\n',
      '    links: [{ key: "home", label: t("shell.home"), href: "/", current: route === "/" }, { key: "help", label: "Help" }],\n' +
        '    actions: [{ id: "signIn", label: "Sign in", href: "/login", tone: "quiet", narrow: "menu" }, { id: "start", label: "Start free", href: "/signup" }],\n' +
        '    account: { label: "My account", name: "Taylor", href: "/account" },\n' +
        '    legal: [{ key: "terms", label: "Terms of use" }],\n' +
        "    language: null,\n" +
        "    theme: null,\n",
    );
    expect(customised).toContain('{ key: "help", label: "Help" }');
    expect(typecheck({ [layout]: customised }, [layout])).toEqual([]);
  });
});

describe("the generated site page", () => {
  const source = render("static-page.hbs", { namespace: "common", nameKebab: "pricing", NamePascal: "Pricing", nameCamel: "pricing" });

  it("compiles alone", () => {
    expect(typecheck({ [pageFile]: source }, [pageFile])).toEqual([]);
  });

  it("draws the page column and its head from the page's catalog keys, the lede only when the catalog states one", () => {
    expect(source).toContain("export function PricingPage(");
    expect(source).toContain("<SitePage>");
    expect(source).toContain('title={t("pricing.title")}');
    expect(source).toContain('const line = t("pricing.lede");');
    expect(source).toContain('line !== "pricing.lede"');
    expect(source).not.toMatch(/console-(clarity|core)/);
  });
});
