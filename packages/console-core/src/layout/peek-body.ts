import { createContext } from "react";

/**
 * Whether the content is drawn inside a peek dialog's padded body. A part that wants the dialog's
 * own edge (a column running to the dialog's right edge, from header to footer) reads this to cancel
 * the body's padding on the sides it should reach through; outside a peek it is false and nothing
 * is cancelled.
 */
export const PeekBodyContext = createContext(false);
