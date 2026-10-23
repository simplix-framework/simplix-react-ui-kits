/** Clarity overrides for the console chrome: top bar, area tabs, menu column, status strip, command palette. */
export const shellSlots: Record<string, string> = {
  // Top bar: a white 52px band, the brand, the area tabs on its full height, the reader's tools.
  "console-preview-topbar": "border-[var(--border)] bg-card",
  "console-preview-topbar-row": "min-h-[52px] gap-5 pl-4 pr-3",
  "console-preview-topbar-lead": "gap-5 self-stretch py-0",
  "console-preview-brand": "gap-2.5 [&_svg]:size-6",
  "console-preview-title": "text-[15px] font-[650] tracking-[-0.02em]",
  "console-area-switch": "self-stretch",
  "console-area-tab":
    "px-3 text-[13.5px] font-medium transition-colors duration-[var(--dur-base)] ease-[var(--ease)]",
  "console-area-tab current=true": "text-foreground",
  "console-area-tab current=false": "text-muted-foreground hover:text-foreground",
  "console-area-ink": "mt-px",
  "console-preview-tools": "gap-0.5",
  "console-bar-search":
    "mr-2 h-8 w-[240px] max-w-none gap-2 border-[var(--border)] bg-[var(--surface-2)] pl-2.5 pr-1.5 text-[13.5px] text-muted-foreground hover:border-muted-foreground hover:bg-[var(--surface-2)] max-[1441px]:w-[200px]",
  "console-key-cap": "rounded-[calc(var(--radius-control)-3px)] border-[var(--border-strong)] bg-card font-sans",
  "console-key-cap onBar=true": "border-[var(--border)] bg-transparent",
  "console-preview-site":
    "h-7 gap-1.5 border-[var(--border)] bg-[var(--surface-2)] px-2.5 text-[12.5px] font-medium shadow-none hover:border-muted-foreground hover:bg-[var(--surface-2)] [&_[data-slot=button-caret]]:mr-0 [&_[data-slot=button-caret]]:border-0 [&_[data-slot=button-caret]]:pl-0",
  "console-preview-settings":
    "[&_button]:size-8 [&_button]:text-muted-foreground [&_button:hover]:bg-[var(--hover-bg-strong)] [&_button:hover]:text-foreground",
  "console-preview-tool": "text-muted-foreground hover:bg-[var(--hover-bg-strong)] hover:text-foreground",
  "console-counted-button": "text-muted-foreground hover:bg-[var(--hover-bg-strong)] hover:text-foreground",
  "console-counted-count":
    "right-[3px] top-1 h-[15px] min-w-[15px] rounded-full px-1 text-[10px] font-semibold leading-[15px] ring-2 ring-card",
  "console-preview-account":
    "ml-1.5 h-8 gap-2 pl-1 pr-1.5 text-[13.5px] font-[550] hover:bg-[var(--hover-bg-strong)] max-[1281px]:[&_[data-part=console-preview-account-name]]:hidden",
  "console-preview-account-caret": "text-muted-foreground opacity-100",
  "console-preview-avatar":
    "size-[26px] bg-[oklch(0.93_0.035_213)] text-[10.5px] font-[650] tracking-[-0.04em] text-[oklch(0.42_0.08_213)] dark:bg-[oklch(0.34_0.05_213)] dark:text-[oklch(0.88_0.05_213)]",

  // Menu column: 240px on its own near-white ground, rows that take a soft ground on hover and
  // the accent soft ground where the reader is, a rail of 38px marks when collapsed.
  "console-menu-column": "w-60 border-[var(--border)] bg-[var(--chrome-sidebar)]",
  "console-menu-rail": "w-[60px] border-[var(--border)] bg-[var(--chrome-sidebar)] pb-0 pt-2",
  "console-menu-rail-rule": "my-[1.5px] bg-transparent",
  "console-menu-rail-button":
    "size-[38px] border-0 bg-transparent text-muted-foreground shadow-none hover:bg-[var(--chrome-sidebar-hover)] hover:text-foreground [&_[data-slot=console-menu-glyph]]:text-current [&_[data-slot=console-menu-glyph]]:opacity-100 [&_svg]:size-[18px]",
  "console-menu-rail-button active=true": "bg-[var(--primary-soft)] text-[var(--primary-text)] hover:bg-[var(--primary-soft)]",
  "console-menu-column-head":
    "h-12 border-0 py-0 pl-[18px] pr-2.5 text-secondary-foreground [&>*:first-child]:text-[13.5px] [&>*:first-child]:font-semibold",
  "console-menu-column-body": "gap-0 px-2.5 pb-6 pt-0.5 [&>*]:mt-1.5",
  "console-menu-branch": "gap-px",
  "console-menu-branch ruled=true": "ml-[17px] border-[var(--border)] pl-[9px]",
  "console-menu-row":
    "min-h-8 gap-2.5 rounded-[var(--radius-control)] px-2.5 py-0 text-[13.5px] text-secondary-foreground transition-colors duration-[var(--dur-fast)] ease-[var(--ease)]",
  "console-menu-row kind=branch": "hover:bg-[var(--chrome-sidebar-hover)] hover:text-secondary-foreground",
  "console-menu-row kind=link": "hover:bg-[var(--chrome-sidebar-hover)] hover:text-secondary-foreground",
  "console-menu-row kind=inactive": "text-muted-foreground",
  "console-menu-row strong=true": "font-normal",
  "console-menu-row current=true":
    "bg-[var(--primary-soft)] font-[550] text-[var(--primary-text)] hover:bg-[var(--primary-soft)] hover:text-[var(--primary-text)]",
  "console-menu-glyph":
    "text-muted-foreground opacity-100 transition-colors [[data-current=true]>&]:text-[var(--primary-text)] [:hover>&]:text-secondary-foreground",
  "console-menu-caret": "text-muted-foreground opacity-100 [&_svg]:size-[13px]",

  // Status strip: white, 11.5px, a live ticker, readings divided by short rules, the clock.
  "console-preview-status": "gap-4 border-[var(--border)] bg-card px-4",
  "console-preview-ticker": "text-[11.5px]",
  "console-preview-ticker live=true": "font-medium text-foreground",
  "console-preview-segment": "text-[11.5px]",
  "console-preview-segment tone=warn": "font-semibold text-[var(--warning-text)]",
  "console-preview-segment-rule": "bg-[var(--border)]",
  "console-preview-clock": "border-[var(--border)] text-[11.5px]",

  // Command palette: a 640px overlay at 12vh, 52px field, grouped results, key hints under it.
  "console-palette": "rounded-[calc(var(--radius-control)+4px)] border-[var(--border)] bg-popover shadow-[var(--shadow-3)]",
  "console-palette-list": "p-1.5",
  "console-palette-esc": "right-4",
  "console-palette-sub": "text-[11.5px]",
  "console-palette-match": "font-[650] text-[var(--primary-text)]",
  "console-palette-foot": "gap-4 border-[var(--border)] px-3.5 py-2 text-[11.5px]",
  "console-palette-hint": "gap-[5px]",
};
