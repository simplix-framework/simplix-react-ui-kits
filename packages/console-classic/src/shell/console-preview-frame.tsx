import type { ReactNode } from "react";
import { PageHeaderProvider } from "@simplix-react/ui";

import { NoticeRegistryProvider } from "../notice/notice-registry";
import { PeekHost } from "../peek/peek-host";
import { ConsoleContentColumn } from "./content-column";
import { ConsoleContextProvider, type ConsoleContextValue } from "./console-context";

/** Props for {@link ConsolePreviewFrame}. */
export interface ConsolePreviewFrameProps {
  /** Who is signed in and which workplace the page reads against, as the product's provider fills it. */
  readonly console: ConsoleContextValue;
  readonly children: ReactNode;
}

/**
 * The content column of a console with what a page needs above it: the console's identity, the
 * peek host, the page header and the notice registry.
 *
 * <p>For drawing a page outside a running console (a mockup, a story): a page renders here exactly
 * as it does inside the shell's content column, with the values a product's own providers would
 * supply handed in as props.
 */
export function ConsolePreviewFrame({ console, children }: ConsolePreviewFrameProps) {
  return (
    <ConsoleContextProvider value={console}>
      <PeekHost>
        <PageHeaderProvider>
          <NoticeRegistryProvider>
            <ConsoleContentColumn>{children}</ConsoleContentColumn>
          </NoticeRegistryProvider>
        </PageHeaderProvider>
      </PeekHost>
    </ConsoleContextProvider>
  );
}
