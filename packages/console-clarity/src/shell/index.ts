import { createElement } from "react";
import type { Design } from "@simplix-react/ui/design";
import {
  CONSOLE_CLARITY_DESIGN,
  CONSOLE_DESIGNS,
  ConsoleProviders as CoreConsoleProviders,
  type ConsoleProvidersProps,
} from "@simplix-react-ui-kits/console-core/shell";

export * from "@simplix-react-ui-kits/console-core/shell";

/** The console provider stack, drawing in the clarity design unless the reader picks another. */
export function ConsoleProviders(props: ConsoleProvidersProps) {
  return createElement(CoreConsoleProviders, { design: CONSOLE_CLARITY_DESIGN, ...props });
}

/**
 * The designs this kit offers, its own first, so a mockup's toolbar and a display setting open in
 * the design the kit's screens are drawn in.
 */
export const KIT_DESIGNS: readonly Design[] = [
  CONSOLE_CLARITY_DESIGN,
  ...CONSOLE_DESIGNS.filter((d) => d.id !== CONSOLE_CLARITY_DESIGN.id),
];
