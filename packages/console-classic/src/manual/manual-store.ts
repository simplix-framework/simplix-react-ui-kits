import { create } from "zustand";

/** Whether the manual is open beside the work, held where both the control and the panel see it. */
interface ManualState {
  open: boolean;
  toggle: () => void;
  close: () => void;
}

/**
 * The help panel's open state.
 *
 * <p>Held in a store rather than in the layout because the two halves sit far apart in the tree:
 * the control is in the navigation column's footer and the panel is beside the routed content.
 * Threading a boolean between them would put the state in whatever component happens to contain
 * both, which is the whole console shell.
 *
 * <p>Not remembered between visits, deliberately. A width somebody dragged is a preference they
 * set once; an open panel is an answer they were reading, and reopening it on the next visit
 * would narrow every screen for a question already answered.
 */
export const useManualStore = create<ManualState>((set) => ({
  open: false,
  toggle: () => set((s) => ({ open: !s.open })),
  close: () => set({ open: false }),
}));
