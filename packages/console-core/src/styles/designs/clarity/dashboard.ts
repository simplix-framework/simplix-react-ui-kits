/** Clarity overrides for the dashboard screen the kit draws. */
export const dashboardSlots: Record<string, string> = {
  "dashboard-card": "border-[var(--border)]",
  "dashboard-card-title": "text-(length:--fs-cell) leading-(--lh-cell) font-semibold",
  "dashboard-card-meta": "text-(length:--fs-control) leading-(--lh-control)",
  "dashboard-columns": "gap-3",
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
};
