import { ConsoleProductProvider, type ConsoleProduct } from "../identity/console-product";
import type { ReactNode } from "react";
import { I18nProvider } from "@simplix-react/i18n/react";
import { AuthProvider } from "@simplix-react/auth/react";
import { AccessProvider } from "@simplix-react/access/react";
import { ToastContainer, TooltipProvider, UIProvider } from "@simplix-react/ui";
import { CLASSIC_DESIGN, DESIGNS, type Design } from "@simplix-react/ui/design";
import { QueryClientProvider } from "@tanstack/react-query";
import type { QueryClient } from "@tanstack/react-query";

import { ErrorDialog } from "../error";
import { TilesCollapseProvider } from "../layout/tiles-collapse";
import { ConsoleDesignContext } from "./console-design";
import { useAppliedFill, useDisplayPreferences } from "./display-preferences";
import { useTheme } from "./use-theme";

/** Props for {@link ConsoleProviders}. */
export interface ConsoleProvidersProps {
  /**
   * The app's own name, under which its operator preferences are stored.
   *
   * <p>Required rather than defaulted: a default would be one key three apps quietly shared, which
   * is exactly what the navigation column's preference did before each app was made to say its own
   * name. A missing one is a compile error here and a silent agreement there.
   */
  readonly namespace: string;
  /** The app's locale adapter. */
  readonly i18nAdapter: Parameters<typeof I18nProvider>[0]["adapter"];
  /** The app's auth stack. */
  readonly auth: Parameters<typeof AuthProvider>[0]["auth"];
  /** What this app's operator may see, read from the server. */
  readonly accessPolicy: Parameters<typeof AccessProvider>[0]["policy"];
  /** The client the console's two caches were built into. */
  readonly queryClient: QueryClient;
  /** The product's values the kit parts read: permission subjects and the sign-in mark. */
  readonly product: ConsoleProduct;
  /**
   * The design this console draws in until the reader picks another in the display settings.
   * A design kit passes its own; the classic design when absent.
   */
  readonly design?: Design;
  /** Whatever the app mounts inside its own providers — a router, a shell. */
  readonly children: ReactNode;
}

/** Writes the card fill the reader's theme and choices name onto the document element. */
function AppliedFill() {
  const { colorTheme } = useTheme();
  useAppliedFill(colorTheme);
  return null;
}

/**
 * The provider stack every app in this installation mounts, in the order it has to be mounted in.
 *
 * <p>Locale outside auth outside access outside the query client: a screen renders against an
 * identity, an identity is read in a language, and every read is cached per client. Written per
 * app the order was written three times, and an order that is wrong in one of them shows up as a
 * screen that renders before its grants arrive — an affordance flashing into view and then
 * disappearing, with the reader's press already spent on it.
 *
 * <p><b>`UIProvider` takes no `actionVariant` here on purpose</b>: the scaffold's shape is this
 * product's shape (frontend invariant #67). An override was once set on the evidence that fifteen
 * of sixteen literals in the tree said `ghost` — but those sixteen were hand-typed onto screens
 * that never went through the generator, so counting them measured the drift rather than the
 * standard. A list whose columns genuinely cannot spare the width still says `actionVariant` for
 * itself.
 */
export function ConsoleProviders({
  namespace,
  i18nAdapter,
  auth,
  accessPolicy,
  queryClient,
  product,
  design = CLASSIC_DESIGN,
  children,
}: ConsoleProvidersProps) {
  const { prefs } = useDisplayPreferences();
  const chosen = DESIGNS.find((d) => d.id === prefs.design) ?? design;
  const defaults = prefs.density ? { density: prefs.density } : undefined;
  return (
    <I18nProvider adapter={i18nAdapter}>
      <AuthProvider auth={auth}>
        <AccessProvider policy={accessPolicy} auth={auth}>
          <QueryClientProvider client={queryClient}>
            <TooltipProvider>
              <UIProvider design={chosen} defaults={defaults}>
                <AppliedFill />
                {/* Inside the UI provider and above the router: the figure row's fold is one
                    choice the operator makes once and every route reads, so it cannot live in a
                    layout a navigation remounts. */}
                <TilesCollapseProvider namespace={namespace}>
                  <ConsoleProductProvider subjects={product.subjects} brand={product.brand}>
                    <ConsoleDesignContext.Provider value={design}>{children}</ConsoleDesignContext.Provider>
                  </ConsoleProductProvider>
                </TilesCollapseProvider>
                <ErrorDialog />
                <ToastContainer />
              </UIProvider>
            </TooltipProvider>
          </QueryClientProvider>
        </AccessProvider>
      </AuthProvider>
    </I18nProvider>
  );
}
