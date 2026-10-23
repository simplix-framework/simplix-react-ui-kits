import { createContext, useContext } from "react";
import { CLARITY_DESIGN, CLASSIC_DESIGN, type Design } from "@simplix-react/ui/design";

/**
 * The clarity design with the console kit's own clarity stylesheet beside the framework's, so a
 * console in clarity draws the kit's parts in it too. Both load only when clarity is chosen.
 */
export const CONSOLE_CLARITY_DESIGN: Design = {
  ...CLARITY_DESIGN,
  load: async () => {
    const [framework, kit] = await Promise.all([
      CLARITY_DESIGN.load?.() ?? Promise.resolve([] as readonly string[]),
      import("../styles/designs/clarity-stylesheet").then((m) => m.default),
    ]);
    return [...framework, kit];
  },
};

/** Every design a console can be drawn in, for the display settings and a mockup's toolbar. */
export const CONSOLE_DESIGNS: readonly Design[] = [CLASSIC_DESIGN, CONSOLE_CLARITY_DESIGN];

/** The design the console kit in use draws in when the reader has chosen none. */
export const ConsoleDesignContext = createContext<Design>(CLASSIC_DESIGN);

/** The kit's own design, for the display settings to offer as the default. */
export function useConsoleDesign(): Design {
  return useContext(ConsoleDesignContext);
}
