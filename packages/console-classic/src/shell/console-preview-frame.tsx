import type { ReactNode } from "react";
import { PageHeaderProvider } from "@simplix-react/ui";

import { TilesCollapseProvider } from "../layout/tiles-collapse";
import { LocalNoticeDismissalsProvider } from "../notice/local-dismissals";
import { NoticeRegistryProvider } from "../notice/notice-registry";
import { PeekHost } from "../peek/peek-host";
import { ConsoleContentColumn } from "./content-column";
import { ConsoleContextProvider, type ConsoleContextValue } from "./console-context";
import { ConsolePreviewWindowChrome, type ConsolePreviewChrome } from "./preview-chrome";

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
export function ConsolePreviewFrame({ console, namespace, chrome, children }: ConsolePreviewFrameProps) {
  return (
    <ConsoleContextProvider value={console}>
      <PeekHost>
        <PageHeaderProvider>
          <LocalNoticeDismissalsProvider>
            <TilesCollapseProvider namespace={namespace}>
              <NoticeRegistryProvider>
                {/* Bounded to the viewport as the shell bounds its column, so a list scrolls inside and
                    a panel's footer stays on screen. */}
                {chrome ? (
                  <ConsolePreviewWindowChrome chrome={chrome}>
                    <ConsoleContentColumn>{children}</ConsoleContentColumn>
                  </ConsolePreviewWindowChrome>
                ) : (
                  <div className="flex h-dvh min-h-0 flex-col">
                    <ConsoleContentColumn>{children}</ConsoleContentColumn>
                  </div>
                )}
              </NoticeRegistryProvider>
            </TilesCollapseProvider>
          </LocalNoticeDismissalsProvider>
        </PageHeaderProvider>
      </PeekHost>
    </ConsoleContextProvider>
  );
}
