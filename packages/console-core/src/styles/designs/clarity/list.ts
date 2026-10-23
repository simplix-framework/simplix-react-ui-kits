/** Clarity overrides for record lists, the record panel and bulk actions the kit draws. */
export const listSlots: Record<string, string> = {
    // A list on a page is one card: toolbar, table and pager inside it, no gaps between them.
    "console-record-list nested=false": "shrink-0 overflow-clip rounded-[var(--radius-surface)] border border-[var(--border)] bg-card [&>[data-testid=crud-list]]:gap-0",
    "console-record-list nested=true": "[&>[data-testid=crud-list]]:gap-0",
    // A person as letters on a ground tinted by their hue.
    "console-initials-avatar": "inline-grid size-[26px] rounded-full bg-[oklch(0.93_0.035_var(--avatar-h))] text-[10.5px] font-[650] tracking-[-0.04em] text-[oklch(0.42_0.08_var(--avatar-h))] dark:bg-[oklch(0.34_0.05_var(--avatar-h))] dark:text-[oklch(0.88_0.05_var(--avatar-h))]",
    "console-initials-avatar size=lg": "size-10 text-[13px]",
    // The record's head: its name at 18px in the foreground, what it is underneath.
    "console-record-head": "gap-3 [&_[data-slot=heading]]:text-[18px] [&_[data-slot=heading]]:font-[650] [&_[data-slot=heading]]:tracking-[-0.02em] [&_[data-slot=heading]]:text-foreground",
    "console-record-head-subtitle": "block truncate text-[12.5px] text-muted-foreground",
};
