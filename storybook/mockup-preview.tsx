// Storybook preview for a mockup root: the framework's providers, the active kit design, and a
// toolbar of global settings (detail presentation, colour theme, mode, locale) that applies to
// every screen at once.
import type { Decorator, Preview } from "@storybook/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, type ReactNode } from "react";
import { MemoryRouter } from "react-router-dom";
import { THEMES } from "@simplix-react/headless";
import { createI18nConfig, type LocaleCode } from "@simplix-react/i18n";
import { I18nProvider } from "@simplix-react/i18n/react";
import { UIProvider } from "@simplix-react/ui";
import design from "virtual:kit-design";
import { type DetailPresentation, type MockupSettings, MockupSettingsContext } from "./mockup-settings";

export interface MockupPreviewConfig {
  /** Locales the toolbar offers, the first being the default. */
  locales: LocaleCode[];
  /** The detail presentation a screen opens with. */
  detailPresentation?: DetailPresentation;
  /** Translations of the mockup's own copy, as `import.meta.glob("./locales/*\/*.json", { eager: true })` returns them. */
  appTranslations?: Record<string, unknown>;
  /**
   * The UI kit's own providers and frame, innermost last: what a screen of that kit needs around it
   * (the product values the kit reads, the page frame the shell would draw).
   */
  decorators?: Decorator[];
}

const DETAIL_ITEMS: { value: DetailPresentation; title: string }[] = [
  { value: "panel", title: "Detail: side panel" },
  { value: "drawer", title: "Detail: right drawer" },
  { value: "page", title: "Detail: page" },
];

export function createMockupPreview(config: MockupPreviewConfig): Preview {
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
    const settings: MockupSettings = {
      detailPresentation: context.globals.detailPresentation,
      colorTheme: context.globals.colorTheme,
      mode: context.globals.mode === "dark" ? "dark" : "light",
      locale: context.globals.locale,
    };
    // The theme goes on <html>, as a product's theme hook puts it: a drawer, dialog or popover
    // portals to <body>, outside any wrapper, and must still take the theme and the mode.
    const html = document.documentElement;
    html.dataset.kitDesign = design.name;
    if (settings.colorTheme === "default") delete html.dataset.colorTheme;
    else html.dataset.colorTheme = settings.colorTheme;
    html.classList.toggle("dark", settings.mode === "dark");
    // A page-presented detail is a screen's own layout; the framework default stays a panel.
    const frameworkPresentation = settings.detailPresentation === "drawer" ? "drawer" : "panel";
    return (
      <MockupSettingsContext.Provider value={settings}>
        <I18nProvider adapter={adapter}>
          <LocaleSync locale={settings.locale}>
            <QueryClientProvider client={queryClient}>
              <MemoryRouter>
                <UIProvider defaults={{ detailPresentation: frameworkPresentation }}>
                  <div className="bg-background text-foreground" style={{ minHeight: "100vh" }}>
                    <Story />
                  </div>
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
    globalTypes: {
      detailPresentation: {
        description: "Where a list screen opens a record",
        toolbar: { title: "Detail", icon: "sidebaralt", items: DETAIL_ITEMS, dynamicTitle: true },
      },
      colorTheme: {
        description: "Colour theme",
        toolbar: { title: "Theme", icon: "paintbrush", items: THEMES.map((t) => ({ value: t.value, title: t.label })), dynamicTitle: true },
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
      locale: {
        description: "Locale",
        toolbar: { title: "Locale", icon: "globe", items: config.locales.map((code) => ({ value: code, title: code.toUpperCase() })), dynamicTitle: true },
      },
    },
    initialGlobals: {
      detailPresentation: config.detailPresentation ?? "panel",
      colorTheme: design.colorTheme,
      mode: "light",
      locale: config.locales[0],
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
