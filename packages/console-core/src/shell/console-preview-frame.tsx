import { useState, type ReactNode } from "react";
import { PageHeaderProvider, ToastContainer, usePageHeaderState } from "@simplix-react/ui";

import { TilesCollapseProvider } from "../layout/tiles-collapse";
import { LocalNoticeDismissalsProvider } from "../notice/local-dismissals";
import { NoticeRegistryProvider } from "../notice/notice-registry";
import { PeekHost } from "../peek/peek-host";
import { ConsoleContentColumn } from "./content-column";
import { ConsoleContextProvider, type ConsoleContextValue } from "./console-context";
import { ConsolePreviewWindowChrome, ConsolePreviewPhoneMenu, type ConsolePreviewChrome } from "./preview-chrome";
import { ConsolePhoneShell, useConsoleOnAPhone } from "./phone-shell";
import { ConsoleTopBarWindow } from "./top-bar-window";

/** Props for {@link ConsolePreviewFrame}. */
export interface ConsolePreviewFrameProps {
  /** Who is signed in and which workplace the page reads against, as the product's provider fills it. */
  readonly console: ConsoleContextValue;
  /** The name the tile row's open or folded preference is kept under. */
  readonly namespace: string;
  /**
   * The console's window around the page: the area bar, the menu column and the status strip.
   * Absent, the page is drawn alone, bounded to the viewport.
   */
  readonly chrome?: ConsolePreviewChrome;
  /**
   * The band of a window with no menu column, drawn over the page instead of {@link chrome}: the
   * shell of an app the console's people do not work in.
   */
  readonly topBar?: ReactNode;
  readonly children: ReactNode;
}

/**
 * The content column of a console with what a page needs above it: the console's identity, the
 * peek host, the page header and the notice registry.
 *
 * <p>For drawing a page outside a running console (a mockup, a story): a page renders here exactly
 * as it does inside the shell's content column, with the values a product's own providers would
 * supply handed in as props. Notices the reader puts away are kept for as long as the page is
 * open and come back from the header's list; the tile row folds and opens as it does in an app.
 */
export function ConsolePreviewFrame({ console, namespace, chrome, topBar, children }: ConsolePreviewFrameProps) {
  // A phone window draws the console's phone shell, as an app's shell does, so a page previewed at
  // a phone's width is measured inside the same shell (its 44px touch targets, its bars) as the app.
  const onAPhone = useConsoleOnAPhone();
  return (
    <ConsoleContextProvider value={console}>
      <PeekHost>
        <PageHeaderProvider>
          <LocalNoticeDismissalsProvider>
            <TilesCollapseProvider namespace={namespace}>
              <NoticeRegistryProvider>
                {/* Bounded to the viewport as the shell bounds its column, so a list scrolls inside and
                    a panel's footer stays on screen. */}
                {chrome && onAPhone ? (
                  <PreviewPhoneShell chrome={chrome}>{children}</PreviewPhoneShell>
                ) : chrome ? (
                  <ConsolePreviewWindowChrome chrome={chrome}>
                    <ConsoleContentColumn>{children}</ConsoleContentColumn>
                  </ConsolePreviewWindowChrome>
                ) : topBar ? (
                  <ConsoleTopBarWindow topBar={topBar}>{children}</ConsoleTopBarWindow>
                ) : (
                  <div className="flex h-dvh min-h-0 flex-col">
                    <ConsoleContentColumn>{children}</ConsoleContentColumn>
                  </div>
                )}
                {/* Where a finished action says so, as the console's providers mount it. */}
                <ToastContainer />
              </NoticeRegistryProvider>
            </TilesCollapseProvider>
          </LocalNoticeDismissalsProvider>
        </PageHeaderProvider>
      </PeekHost>
    </ConsoleContextProvider>
  );
}

/**
 * The phone shell around a previewed page: the page header's title in the top bar and the menu
 * entry along the bottom. The menu uses the same destinations and navigation port as the desktop.
 */
function PreviewPhoneShell({ chrome, children }: { readonly chrome: ConsolePreviewChrome; readonly children: ReactNode }) {
  const { title } = usePageHeaderState();
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <ConsolePhoneShell brand={chrome.mark} title={title ?? chrome.title} tabs={[{ key: "menu", label: chrome.labels.menu, icon: "menu", onPress: () => setMenuOpen(true) }]} activeTab="">
      <ConsoleContentColumn>{children}</ConsoleContentColumn>
      <ConsolePreviewPhoneMenu chrome={chrome} open={menuOpen} onOpenChange={setMenuOpen} />
    </ConsolePhoneShell>
  );
}
