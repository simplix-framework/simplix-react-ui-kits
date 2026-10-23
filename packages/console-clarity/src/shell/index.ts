import { createElement } from "react";
import {
  CONSOLE_CLARITY_DESIGN,
  ConsoleProviders as CoreConsoleProviders,
  type ConsoleProvidersProps,
} from "@simplix-react-ui-kits/console-core/shell";

export * from "@simplix-react-ui-kits/console-core/shell";

/** The console provider stack, drawing in the clarity design unless the reader picks another. */
export function ConsoleProviders(props: ConsoleProvidersProps) {
  return createElement(CoreConsoleProviders, { design: CONSOLE_CLARITY_DESIGN, ...props });
}
