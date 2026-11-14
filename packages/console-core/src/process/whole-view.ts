/**
 * How a procedure is measured where it is drawn whole, in a dialog as large as the window: the
 * least width of a lane and the width of the step titles, both smaller than on a page. The lanes
 * share whatever width the box has; only when the box is narrower than every lane at its least
 * width do the lanes scroll, inside their own box.
 */
export const WHOLE_VIEW_METRICS = { laneMinWidth: 64, titleWidth: 144 } as const;
