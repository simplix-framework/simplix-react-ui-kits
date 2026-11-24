// The active design is a module the mockup plugin writes; a root that reads this file as the
// package's types needs its declaration with it.
// oxlint-disable-next-line typescript/triple-slash-reference
/// <reference path="./kit-env.d.ts" />
// Storybook preview for a mockup root: the framework's providers, the active kit design, and a
// toolbar of global settings (detail presentation, design, colour theme, card fill, density, mode,
// frame, locale) that applies to every screen at once.
import type { Decorator, Preview } from "@storybook/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, type ReactNode } from "react";
import { MemoryRouter } from "react-router-dom";
import { useGlobals } from "storybook/preview-api";
import { THEMES } from "@simplix-react/headless";
import { createI18nConfig, type LocaleCode } from "@simplix-react/i18n";
import { I18nProvider } from "@simplix-react/i18n/react";
import { TooltipProvider, UIProvider, type LanguageSelectorPlacement } from "@simplix-react/ui";
import { DESIGNS as FRAMEWORK_DESIGNS, type Design } from "@simplix-react/ui/design";
import design from "virtual:kit-design";
import { type DetailPresentation, type FrameMode, type MockupSettings, MockupSettingsContext } from "./settings";

export interface MockupPreviewConfig {
  /** Locales the toolbar offers, the first being the default. */
  locales: LocaleCode[];
  /** The detail presentation a screen opens with. */
  detailPresentation?: DetailPresentation;
  /**
   * Where a multilingual field carries its language selector, as the product's `UIProvider`
   * defaults set it; the framework's own default when absent.
   */
  languageSelectorPlacement?: LanguageSelectorPlacement;
  /** Whether a screen opens inside the console's window or alone; `full` when absent. */
  frame?: FrameMode;
  /** Translations of the mockup's own copy, as `import.meta.glob("./locales/*\/*.json", { eager: true })` returns them. */
  appTranslations?: Record<string, unknown>;
  /**
   * The UI kit's own providers and frame, innermost last: what a screen of that kit needs around it
   * (the product values the kit reads, the page frame the shell would draw).
   */
  decorators?: Decorator[];
  /**
   * The designs the toolbar offers, the first being the default. A UI kit that adds its own
   * design stylesheets passes its list; the framework's designs otherwise.
   */
  designs?: readonly Design[];
  /** The colour preset a screen opens with; the active kit design's own when absent. */
  colorTheme?: string;
}

const DETAIL_ITEMS: { value: DetailPresentation; title: string }[] = [
  { value: "panel", title: "Detail: side panel" },
  { value: "drawer", title: "Detail: right drawer" },
  { value: "dialog", title: "Detail: dialog" },
  { value: "page", title: "Detail: page" },
];

export function createMockupPreview(config: MockupPreviewConfig): Preview {
  const DESIGNS = config.designs ?? FRAMEWORK_DESIGNS;
  if (config.locales.length === 0) throw new Error("mockup preview needs at least one locale");
  const { adapter, i18nReady } = createI18nConfig({
    defaultLocale: config.locales[0],
    supportedLocales: config.locales,
    ...(config.appTranslations ? { appTranslations: config.appTranslations as never } : {}),
  });
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false, staleTime: Infinity } } });

  function LocaleSync({ locale, children }: { locale: string; children: ReactNode }) {
    useEffect(() => {
      if (adapter.locale !== locale) adapter.setLocale(locale);
    }, [locale]);
    return <>{children}</>;
  }

  const withMockupSettings: Decorator = (Story, context) => {
    // The toolbar's global is the one owner of the setting; a screen's switch writes the same global.
    const [, updateGlobals] = useGlobals();
    const settings: MockupSettings = {
      detailPresentation: context.globals.detailPresentation,
      setDetailPresentation: (value) => updateGlobals({ detailPresentation: value }),
      colorTheme: context.globals.colorTheme,
      mode: context.globals.mode === "dark" ? "dark" : "light",
      locale: context.globals.locale,
      setLocale: (locale) => updateGlobals({ locale }),
      frame: context.globals.frame === "content" ? "content" : "full",
    };
    // The theme goes on <html>, as a product's theme hook puts it: a drawer, dialog or popover
    // portals to <body>, outside any wrapper, and must still take the theme and the mode.
    const html = document.documentElement;
    html.dataset.kitDesign = design.name;
    if (settings.colorTheme === "default") delete html.dataset.colorTheme;
    else html.dataset.colorTheme = settings.colorTheme;
    html.classList.toggle("dark", settings.mode === "dark");
    // The card fill the toolbar names, else the one the colour theme names; plain is no attribute.
    const fill = context.globals.fill === "theme"
      ? (THEMES.find((t) => t.value === settings.colorTheme)?.fill ?? "plain")
      : context.globals.fill;
    if (!fill || fill === "plain") delete html.dataset.fill;
    else html.dataset.fill = fill;
    const uiDesign = DESIGNS.find((d) => d.id === context.globals.uiDesign) ?? DESIGNS[0];
    const density = context.globals.density === "theme" ? undefined : context.globals.density;
    // A page-presented detail is a screen's own layout; the framework default stays a panel.
    const frameworkPresentation = settings.detailPresentation === "page" ? "panel" : settings.detailPresentation;
    return (
      <MockupSettingsContext.Provider value={settings}>
        <I18nProvider adapter={adapter}>
          <LocaleSync locale={settings.locale}>
            <QueryClientProvider client={queryClient}>
              <MemoryRouter>
                <UIProvider
                  design={uiDesign}
                  defaults={{
                    detailPresentation: frameworkPresentation,
                    ...(density ? { density } : {}),
                    ...(config.languageSelectorPlacement ? { languageSelectorPlacement: config.languageSelectorPlacement } : {}),
                  }}
                >
                  {/* The providers a console screen sits in (ConsoleProviders), so a tooltip a screen draws has one. */}
                  <TooltipProvider>
                    <div className="bg-background text-foreground" style={{ minHeight: "100vh" }}>
                      <Story />
                    </div>
                  </TooltipProvider>
                </UIProvider>
              </MemoryRouter>
            </QueryClientProvider>
          </LocaleSync>
        </I18nProvider>
      </MockupSettingsContext.Provider>
    );
  };

  return {
    parameters: { layout: "fullscreen" },
    // Settings that name long values draw as icons only (the value shows in the menu and the
    // tooltip), so the toolbar stays one row beside the addons; mode and locale keep short labels.
    globalTypes: {
      detailPresentation: {
        description: "Where a list screen opens a record",
        toolbar: { icon: "sidebaralt", items: DETAIL_ITEMS, dynamicTitle: false },
      },
      uiDesign: {
        description: "Design: how every slot is drawn",
        toolbar: { icon: "component", items: DESIGNS.map((d) => ({ value: d.id, title: `Design: ${d.id}` })), dynamicTitle: false },
      },
      fill: {
        description: "Card fill",
        toolbar: {
          icon: "contrast",
          items: ["theme", "plain", "outline", "raised", "tint", "lead"].map((f) => ({ value: f, title: f === "theme" ? "Fill: theme's own" : `Fill: ${f}` })),
          dynamicTitle: false,
        },
      },
      density: {
        description: "Row density",
        toolbar: {
          icon: "listunordered",
          items: ["theme", "compact", "default", "comfortable"].map((d) => ({ value: d, title: d === "theme" ? "Density: design's own" : `Density: ${d}` })),
          dynamicTitle: false,
        },
      },
      colorTheme: {
        description: "Colour theme",
        toolbar: { icon: "paintbrush", items: THEMES.map((t) => ({ value: t.value, title: t.label })), dynamicTitle: false },
      },
      mode: {
        description: "Light / dark",
        toolbar: {
          title: "Mode",
          icon: "mirror",
          items: [
            { value: "light", title: "Light", icon: "sun" },
            { value: "dark", title: "Dark", icon: "moon" },
          ],
          dynamicTitle: true,
        },
      },
      frame: {
        description: "The console's window around the screen, or the screen alone",
        toolbar: {
          icon: "browser",
          items: [
            { value: "full", title: "Frame: full window" },
            { value: "content", title: "Frame: screen only" },
          ],
          dynamicTitle: false,
        },
      },
      locale: {
        description: "Locale",
        toolbar: { title: "Locale", icon: "globe", items: config.locales.map((code) => ({ value: code, title: code.toUpperCase() })), dynamicTitle: true },
      },
    },
    initialGlobals: {
      detailPresentation: config.detailPresentation ?? "panel",
      colorTheme: config.colorTheme ?? design.colorTheme,
      uiDesign: DESIGNS[0].id,
      fill: "theme",
      density: "theme",
      mode: "light",
      locale: config.locales[0],
      frame: config.frame ?? "full",
    },
    // Storybook applies a story's decorators innermost-first, so the kit's frame sits inside the
    // settings, providers and theme this preview sets up.
    decorators: [...(config.decorators ?? []), withMockupSettings],
    loaders: [
      async () => {
        await i18nReady;
        return {};
      },
    ],
  };
}
