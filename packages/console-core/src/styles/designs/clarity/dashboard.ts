/** Clarity overrides for the dashboard screen the kit draws. */
export const dashboardSlots: Record<string, string> = {
  "dashboard-card": "border-[var(--border)]",
  "dashboard-card-title": "text-[13.5px] font-semibold",
  "dashboard-card-meta": "text-[12.5px]",
  "dashboard-columns": "gap-3",
  "schedule-row": "text-[13.5px] hover:bg-[var(--surface-2)] active:bg-[var(--surface-3)]",
  "schedule-time": "font-[550]",
  "schedule-task": "font-[550]",
  "schedule-task past=true": "font-[450]",
  "schedule-zone": "text-[12.5px]",
  "schedule-go": "text-[var(--muted-2)]",
  "task-sub": "text-[12.5px]",
  "task-due": "text-[12.5px]",
  "task-empty": "text-[12.5px]",
  "schedule-now": "text-[var(--destructive-text)]",
};
