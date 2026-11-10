import { createElement } from "react";
import { CLARITY_DESIGN, CLASSIC_DESIGN, type Design } from "@simplix-react/ui/design";
import {
  ConsoleProviders as CoreConsoleProviders,
  type ConsoleProvidersProps,
} from "@simplix-react-ui-kits/console-core/shell";

export * from "@simplix-react-ui-kits/console-core/shell";

/**
 * The clarity design with this kit's clarity stylesheet beside the framework's, so a console in
 * clarity draws the kit's parts in it too. Both load only when clarity is chosen.
 */
const CONSOLE_CLARITY_DESIGN: Design = {
  ...CLARITY_DESIGN,
  load: async () => {
    const [framework, kit] = await Promise.all([
      CLARITY_DESIGN.load?.() ?? Promise.resolve([] as readonly string[]),
      import("../styles/designs/clarity-stylesheet").then((m) => m.default),
    ]);
    return [...framework, kit];
  },
};

/**
 * The designs this kit offers, its own first, so a mockup's toolbar and a display setting open in
 * the design the kit's screens are drawn in.
 */
export const KIT_DESIGNS: readonly Design[] = [CONSOLE_CLARITY_DESIGN, CLASSIC_DESIGN];

/** The console provider stack, drawing in the clarity design unless the reader picks another. */
export function ConsoleProviders(props: ConsoleProvidersProps) {
  return createElement(CoreConsoleProviders, { design: CONSOLE_CLARITY_DESIGN, designs: KIT_DESIGNS, ...props });
}
