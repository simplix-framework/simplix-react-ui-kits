/** Clarity overrides for the dashboard screen the kit draws. */
export const dashboardSlots: Record<string, string> = {
  "dashboard-card": "border-[var(--border)]",
  "dashboard-card-title": "text-[13.5px] font-semibold",
  "dashboard-card-meta": "text-[12.5px]",
  "dashboard-columns": "gap-3",
  "schedule-row": "text-[13.5px] hover:bg-[var(--surface-2)]",
  "schedule-time": "font-[550]",
  "schedule-task": "font-[550]",
  "schedule-task past=true": "font-[450]",
  "schedule-zone": "text-[12.5px]",
  "schedule-go": "text-[var(--muted-2)]",
  "schedule-now": "text-[var(--destructive-text)]",
};
