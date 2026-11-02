/** Clarity overrides for the dashboard screen the kit draws. */
export const dashboardSlots: Record<string, string> = {
  "dashboard-card": "border-[var(--border)]",
  "dashboard-card-title": "text-(length:--fs-cell) leading-(--lh-cell) font-semibold",
  "dashboard-card-meta": "text-(length:--fs-control) leading-(--lh-control)",
  "dashboard-columns": "gap-3",
  "dashboard-grid": "gap-3",
  "schedule-row": "text-(length:--fs-cell) leading-(--lh-cell) hover:bg-[var(--surface-2)] active:bg-[var(--surface-3)]",
  "schedule-time": "font-(--fw-strong)",
  "schedule-task": "font-(--fw-strong)",
  "schedule-task past=true": "font-(--fw-book)",
  "schedule-zone": "text-(length:--fs-control) leading-(--lh-control)",
  "schedule-go": "text-[var(--muted-2)]",
  "task-sub": "text-(length:--fs-control) leading-(--lh-control)",
  "task-due": "text-(length:--fs-control) leading-(--lh-control)",
  "task-empty": "text-(length:--fs-control) leading-(--lh-control)",
  "schedule-now": "text-[var(--destructive-text)]",
  // The link to the list a card or a figure reads: an action, so it is drawn on the quiet filled
  // ground the tile fold uses, never as bare text.
  "figure-action":
    "rounded-[var(--radius-control)] bg-[var(--surface-2)] hover:bg-[color-mix(in_oklch,var(--surface-2),var(--foreground)_7%)] text-muted-foreground hover:text-foreground",
};
