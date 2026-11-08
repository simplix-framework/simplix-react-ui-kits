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

  it("draws the framework's failures once over every ground (a refusal page, the sign-in ground, the window), in catalog words, and its toasts inside the window", () => {
    expect(source).toContain("<SiteErrors copy={copy} />");
    expect((source.match(/<ShellErrors \/>/g) ?? []).length).toBe(3);
    expect(source).toContain("<SiteToasts />");
    for (const key of ["errors.titles.server", "errors.unavailable", "errors.fallback", "errors.close", "errors.closeAll"]) expect(source).toContain(`t("${key}"`);
  });

  it("draws the page an app names for a refused self read in place of the whole site, from the framework's one refusal store", () => {
    expect(source).toContain('import { useSelfAccessRefusal } from "@simplix-react-ext/simplix-boot-access";');
    expect(source).toContain("refusalPageFor(parts.refusalPages, useSelfAccessRefusal())");
    expect(source).toContain("readonly refusalPages?: SiteRefusalPages;");
  });

  it("hands every site part a link that moves the router on a plain press and keeps the real address", () => {
    expect(source).toContain("linkComponent={RouterLink}");
    expect(source).toContain("void router.navigate({ href });");
    // Another origin's address, a download and a new window are the browser's (routesInPage).
    expect(source).toContain("if (!routesInPage(event, href, anchor)) return;");
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
    // A lede the catalog holds empty reads as no words through tOr, never compared with its own key.
    expect(source).toContain('const lede = tOr("pricing.lede", "") || undefined;');
    expect(source).not.toContain('!== "pricing.lede"');
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
    // The account page has no title above its section, so the section's heading is the page's h1.
    expect(source).toContain('<SectionHead level={1}>{t("accountCredits.title")}</SectionHead>');
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
    // The steps are the visible heading, so the page's h1 for the tab names the step it is on.
    expect(source).toContain("heading={t(`checkout.steps.${step}`)}");
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
    // The packs are a page of their own, so their heading is the page's h1.
    expect(source).toContain('<PackSection level={1} heading={t("packs.title")} lede={lede} status={status} note={note}>');
    // What the page says about itself is the section's status region above the cards, not a child among them.
    expect(source).toContain("readonly status?: ReactNode;");
    expect(source).toContain("({ children, status, note }: PacksPageProps = {})");
    expect(source).toContain('const lede = tOr("packs.lede", "") || undefined;');
    expect(source).not.toMatch(/console-(clarity|core)/);
  });
});

describe("the generated document page", () => {
  const source = render("static-page.doc.hbs", { namespace: "legal", nameKebab: "terms", NamePascal: "Terms", nameCamel: "terms" });
  const docFile = join(virtualRoot, "apps", "app", "src", "pages", "terms", "page.tsx");

  it("compiles alone", () => {
    expect(typecheck({ [docFile]: source }, [docFile])).toEqual([]);
  });

  it("lays the document on the kit's document layout with the kit's jump, its words from the page's catalog, and nothing of the console", () => {
    expect(source).toContain("export function TermsPage(");
    expect(source).toContain("<DocLayout");
    expect(source).toContain("const { current, jump } = useDocJump();");
    expect(source).toContain('tocTitle={t("terms.toc")}');
    expect(source).toContain('const lede = tOr("terms.lede", "");');
    // The layout draws its own jump select from the contents; the page hands none.
    expect(source).not.toContain("jump={");
    expect(source).not.toMatch(/console-(clarity|core)/);
  });
});

describe("the generated site failure page", () => {
  const source = render("error-page.hbs", { namespace: "common", nameKebab: "not-found", NamePascal: "NotFound", nameCamel: "notFound" });
  const failureFile = join(virtualRoot, "apps", "app", "src", "pages", "not-found", "page.tsx");

  it("compiles alone", () => {
    expect(typecheck({ [failureFile]: source }, [failureFile])).toEqual([]);
  });

  it("draws the centred column with the failure part from the page's catalog keys, a way back to the start first, and nothing of the console", () => {
    expect(source).toContain('<SitePage rhythm="done">');
    expect(source).toContain('title={t("notFound.title")}');
    expect(source).toContain('body={t("notFound.body")}');
    expect(source).toContain('{ id: "home", label: t("notFound.home"), href: "/", tone: "primary" }');
    expect(source).not.toMatch(/console-(clarity|core)/);
  });

  it("refuses a page that draws the failure without its mark", () => {
    const unmarked = source.replace("mark={mark} ", "");
    expect(typecheck({ [failureFile]: unmarked }, [failureFile]).join("\n")).toContain("TS2741");
  });
});

describe("the generated site sign-in step", () => {
  const source = render("auth-page.hbs", { namespace: "common", nameKebab: "sign-in", NamePascal: "SignIn", nameCamel: "signIn" });
  const authFile = join(virtualRoot, "apps", "app", "src", "pages", "sign-in", "page.tsx");

  it("compiles alone", () => {
    expect(typecheck({ [authFile]: source }, [authFile])).toEqual([]);
  });

  it("draws the step on the sign-in ground and its card, named by the step, from the page's catalog keys, and nothing of the console", () => {
    expect(source).toContain('<AuthPage step="sign-in">');
    expect(source).toContain('<AuthCard title={t("signIn.title")} mark={mark}>');
    expect(source).toContain('{t("signIn.lede")}');
    expect(source).not.toMatch(/console-(clarity|core)/);
  });

  it("refuses a step drawn outside the sign-in ground's card", () => {
    const loose = source.replace('<AuthCard title={t("signIn.title")} mark={mark}>', "<AuthCard>");
    expect(typecheck({ [authFile]: loose }, [authFile]).join("\n")).toContain("TS2741");
  });
});
