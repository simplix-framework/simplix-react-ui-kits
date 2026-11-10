/**
 * Clarity overrides for the kit's screen widgets: the radius and the ground they drew before
 * they were slots, which the clarity class replacements would otherwise redraw.
 */
export const screenSlots: Record<string, string> = {
  "console-attachment-drop": "rounded-md bg-muted/40",
  "console-approval-step": "rounded-md",
  "work-calendar-day-head": "rounded-md",
  "work-calendar-empty": "rounded-md bg-muted/50",
  "work-calendar-legend-bar": "rounded-sm",
  "work-calendar-legend-swatch": "rounded-sm",
};
