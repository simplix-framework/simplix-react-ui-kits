import { createContext, useContext } from "react";
import { CLASSIC_DESIGN, type Design } from "@simplix-react/ui/design";

/** The design the console kit in use draws in when the reader has chosen none. */
export const ConsoleDesignContext = createContext<Design>(CLASSIC_DESIGN);

/** The designs the reader may pick from, the kit's own first; a kit passes them to `ConsoleProviders`. */
export const ConsoleDesignsContext = createContext<readonly Design[]>([CLASSIC_DESIGN]);

/** The kit's own design, for the display settings to offer as the default. */
export function useConsoleDesign(): Design {
  return useContext(ConsoleDesignContext);
}

/** The designs the display settings offer. */
export function useConsoleDesigns(): readonly Design[] {
  return useContext(ConsoleDesignsContext);
}
