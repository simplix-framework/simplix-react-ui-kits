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

describe("the generated account page", () => {
  const source = render("static-page.account.hbs", { namespace: "account", nameKebab: "account", NamePascal: "Account", nameCamel: "account" });
  const accountFile = join(virtualRoot, "apps", "app", "src", "pages", "account", "page.tsx");

  it("compiles alone", () => {
    expect(typecheck({ [accountFile]: source }, [accountFile])).toEqual([]);
  });

  it("draws the section list beside the routed section on the page column, the standing state handed through, and nothing of the console", () => {
    expect(source).toContain("export function AccountPage(");
    expect(source).toContain("<SitePage>");
    expect(source).toContain('<AccountLayout nav={<SectionNav label={t("account.title")} items={items} />} standing={standing}>');
    expect(source).toContain("label: t(`account.section.${section.key}`),");
    expect(source).toContain("current: section.href !== undefined && within(route, section.href),");
    expect(source).not.toMatch(/console-(clarity|core)/);
  });

  it("compiles once the sections are written in, one of them not open yet and one that removes something", () => {
    const customised = source.replace(
      '[{ key: "overview", href: "/account/overview" }]',
      '[{ key: "sub", href: "/account/sub" }, { key: "receipts" }, { key: "leave", danger: true }]',
    );
    expect(customised).toContain('{ key: "receipts" }');
    expect(typecheck({ [accountFile]: customised }, [accountFile])).toEqual([]);
  });
});

describe("the generated account section", () => {
  const source = render("static-page.account-section.hbs", { namespace: "account", nameKebab: "account-credits", NamePascal: "AccountCredits", nameCamel: "accountCredits" });
  const sectionFile = join(virtualRoot, "apps", "app", "src", "pages", "account-credits", "page.tsx");

  it("compiles alone", () => {
    expect(typecheck({ [sectionFile]: source }, [sectionFile])).toEqual([]);
  });

  it("draws the section's heading from its catalog key and its parts under it, with no page column of its own", () => {
    expect(source).toContain("export function AccountCreditsPage(");
    expect(source).toContain('<SectionHead>{t("accountCredits.title")}</SectionHead>');
    expect(source).not.toContain("<SitePage");
    expect(source).not.toMatch(/console-(clarity|core)/);
  });
});

describe("the generated checkout page", () => {
  const source = render("static-page.checkout.hbs", { namespace: "common", nameKebab: "checkout", NamePascal: "Checkout", nameCamel: "checkout" });
  const checkoutFile = join(virtualRoot, "apps", "app", "src", "pages", "checkout", "page.tsx");

  it("compiles alone", () => {
    expect(typecheck({ [checkoutFile]: source }, [checkoutFile])).toEqual([]);
  });

  it("draws the steps from the catalog over our side beside the provider's frame, on the steps rhythm, and nothing of the console", () => {
    expect(source).toContain("export function CheckoutPage(");
    expect(source).toContain('<SitePage rhythm="steps">');
    expect(source).toContain('label={t("checkout.stepsLabel")}');
    expect(source).toContain("label: t(`checkout.steps.${key}`)");
    expect(source).toContain("current={STEPS.indexOf(step)}");
    expect(source).toContain("<CheckoutLayout");
    expect(source).toContain("<ProviderFrame label={frame.label} owner={frame.owner}>");
    expect(source).not.toMatch(/console-(clarity|core)/);
  });

  it("refuses a step the purchase does not have", () => {
    const misuse = `${source}\nexport const wrong = <CheckoutPage step="refund" main={null} frame={{ label: "Provider", body: null }} />;\n`;
    expect(typecheck({ [checkoutFile]: misuse }, [checkoutFile]).join("\n")).toMatch(/refund/);
  });
});

describe("the generated page after a purchase", () => {
  const source = render("static-page.checkout-done.hbs", { namespace: "common", nameKebab: "checkout-done", NamePascal: "CheckoutDone", nameCamel: "checkoutDone" });
  const doneFile = join(virtualRoot, "apps", "app", "src", "pages", "checkout-done", "page.tsx");

  it("compiles alone", () => {
    expect(typecheck({ [doneFile]: source }, [doneFile])).toEqual([]);
  });

  it("draws the done panel in the centred column, and nothing of the console", () => {
    expect(source).toContain("export function CheckoutDonePage(");
    expect(source).toContain('<SitePage rhythm="done">');
    expect(source).toContain("<DonePanel mark={mark} title={title} body={body} actions={actions} notice={notice} />");
    expect(source).not.toMatch(/console-(clarity|core)/);
  });

  it("refuses an action that is not a site action", () => {
    const misuse = `${source}\nexport const wrong = <CheckoutDonePage mark={null} title="Done" actions={[{ label: "Back" }]} />;\n`;
    expect(typecheck({ [doneFile]: misuse }, [doneFile]).join("\n")).toMatch(/id/);
  });
});

describe("the generated packs page", () => {
  const source = render("static-page.packs.hbs", { namespace: "common", nameKebab: "packs", NamePascal: "Packs", nameCamel: "packs" });
  const packsFile = join(virtualRoot, "apps", "app", "src", "pages", "packs", "page.tsx");

  it("compiles alone", () => {
    expect(typecheck({ [packsFile]: source }, [packsFile])).toEqual([]);
  });

  it("draws the packs' heading and lede from the page's catalog keys on the page column, and nothing of the console", () => {
    expect(source).toContain("export function PacksPage(");
    expect(source).toContain("<SitePage>");
    expect(source).toContain('<PackSection heading={t("packs.title")} lede={lede} note={note}>');
    expect(source).toContain('line !== "packs.lede"');
    expect(source).not.toMatch(/console-(clarity|core)/);
  });
});
