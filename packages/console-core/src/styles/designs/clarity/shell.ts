/** Clarity overrides for the console chrome: top bar, area tabs, menu column, status strip, command palette. */
export const shellSlots: Record<string, string> = {
    "console-menu-column": "border-[var(--border)] bg-card",
    "console-menu-rail": "border-[var(--border)] bg-card",
    "console-menu-column-head": "border-[var(--border)]",
    "console-menu-row": "text-secondary-foreground",
    "console-menu-row kind=branch": "hover:bg-[var(--hover-bg-strong)] hover:text-foreground",
    "console-menu-row kind=link": "hover:bg-[var(--hover-bg-strong)] hover:text-foreground",
    "console-menu-row current=true": "bg-[var(--primary-soft)] font-medium text-[var(--primary)]",
    "console-area-tab current=true": "border-primary font-semibold",
    "console-preview-topbar": "border-[var(--border)] bg-card",
    "console-page-header": "border-[var(--border)]",
    "console-tile-strip": "border-[var(--border)] hover:bg-[var(--hover-bg)]",
    "console-tile-handle": "border-[var(--border)] hover:bg-[var(--hover-bg)]",
    "console-tile-strip-dot current=true": "bg-primary",
};
