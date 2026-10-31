/**
 * The colours the menu column and the rail hand to the parts drawn inside them.
 *
 * <p>Both stand on a ground of their own (`--chrome-sidebar`, and `--chrome-sidebar-hover` under
 * the pointer), so a product that sets a ground sets the colours that pair with it beside it:
 * `--chrome-sidebar-foreground` (labels and the heading), `--chrome-sidebar-foreground-muted` (a row
 * that leads nowhere), `--chrome-sidebar-icon` (marks and carets at rest, the muted foreground when
 * unset) and `--chrome-sidebar-hover-foreground` (labels and marks on the hover ground, the foreground
 * when unset). A token the product leaves unset leaves the part on the page's own colour, which is what
 * the default clarity design draws on its near-white ground.
 *
 * <p>The parts read these through variables the column and the rail define rather than through the
 * tokens themselves, because the same rows also stand in the rail's flyout and in the phone's menu
 * sheet. Those are drawn on the page's own grounds, where the variables are unset and the rows read the
 * page's colours; a row reading the tokens directly would draw the column's light-on-dark pair over a
 * white popover.
 */
const MENU_GROUND =
  "[--menu-fg:var(--chrome-sidebar-foreground)] [--menu-fg-muted:var(--chrome-sidebar-foreground-muted)] [--menu-icon:var(--chrome-sidebar-icon,var(--chrome-sidebar-foreground-muted))] [--menu-hover:var(--chrome-sidebar-hover)] [--menu-hover-fg:var(--chrome-sidebar-hover-foreground,var(--chrome-sidebar-foreground))]";

/** Clarity overrides for the console chrome: top bar, area tabs, menu column, status strip, command palette. */
export const shellSlots: Record<string, string> = {
  // Top bar: a white 52px band, the brand, the area tabs on its full height, the reader's tools.
  "console-preview-topbar": "border-[var(--border)] bg-card",
  "console-preview-topbar-row": "min-h-13 gap-5 pl-4 pr-3",
  "console-preview-topbar-lead": "flex-nowrap gap-5 self-stretch py-0 transition-[gap] duration-[var(--dur-base)] ease-[var(--ease)] max-[900px]:gap-3",
  // Below 1180px the brand keeps only its mark; the name narrows and fades out rather than
  // vanishing, and comes back the same way as the window widens.
  "console-preview-brand":
    "gap-2.5 transition-[gap] duration-[var(--dur-base)] ease-[var(--ease)] max-[1180px]:gap-0 [&_svg]:h-6 [&_svg]:w-auto",
  "console-preview-title":
    "max-w-[12em] overflow-clip whitespace-nowrap text-(length:--fs-title-sm) leading-(--lh-title-sm) font-(--fw-heavy) tracking-[-0.02em] transition-[max-width,opacity] duration-[var(--dur-base)] ease-[var(--ease)] max-[1180px]:max-w-0 max-[1180px]:opacity-0",
  "console-area-switch": "self-stretch",
  // Under 900px the tabs tighten so the whole top level still fits one line beside the tools.
  "console-area-tab":
    "px-3 text-(length:--fs-cell) leading-(--lh-cell) font-medium transition-[color,padding,font-size] duration-[var(--dur-base)] ease-[var(--ease)] max-[900px]:px-1.5 max-[900px]:text-(length:--fs-body-sm) leading-(--lh-body-sm) rounded-[var(--radius-control)] focus-visible:outline-none focus-visible:ring-0 focus-visible:shadow-[var(--focus-halo)]",
  "console-area-tab current=true": "text-foreground",
  "console-area-tab current=false": "text-muted-foreground hover:text-foreground",
  "console-area-ink": "mt-px",
  "console-preview-tools": "gap-0.5",
  // The bar's search drawn before anything stands behind it is a picture of the field, not a disabled
  // control, so it keeps its text and icon at full strength (4.5:1 and 3:1 need more than a 60% fade
  // leaves); the other unbuilt controls are disabled buttons and keep the fade.
  "console-preview-unbuilt": "has-[[data-slot=console-bar-search]]:opacity-100",
  "console-bar-search":
    "mr-2 h-8 w-60 max-w-none gap-2 border-[var(--border)] bg-[var(--surface-2)] pl-2.5 pr-1.5 text-(length:--fs-cell) leading-(--lh-cell) text-muted-foreground hover:border-muted-foreground hover:bg-[var(--surface-2)] max-[1441px]:w-50",
  "console-key-cap": "rounded-[var(--radius-xs)] border-[var(--border-strong)] bg-card font-sans",
  "console-key-cap onbar=true": "border-[var(--border)] bg-transparent",
  "console-preview-site":
    "h-7 gap-1.5 border-[var(--border)] bg-[var(--surface-2)] px-2.5 text-(length:--fs-control) leading-(--lh-control) font-medium shadow-none focus-visible:shadow-[var(--focus-halo)] transition-[border-color,gap] duration-[var(--dur-base)] ease-[var(--ease)] hover:border-muted-foreground hover:bg-[var(--surface-2)] max-[900px]:gap-0.5 [&>[data-slot=text]]:transition-[max-width,opacity] [&>[data-slot=text]]:duration-[var(--dur-base)] [&>[data-slot=text]]:ease-[var(--ease)] max-[900px]:[&>[data-slot=text]]:max-w-0! max-[900px]:[&>[data-slot=text]]:opacity-0 [&_[data-slot=button-caret]]:mr-0 [&_[data-slot=button-caret]]:border-0 [&_[data-slot=button-caret]]:pl-0",
  "console-preview-settings":
    "[&_button]:size-8 [&_button]:text-muted-foreground [&_button:hover]:bg-[var(--hover-bg-strong)] [&_button:hover]:text-foreground",
  // The reader's tools are 32px squares and take the shared press (0.98).
  "console-preview-tool":
    "size-8 text-muted-foreground transition-[background-color,color,scale] duration-[var(--dur-fast)] ease-[var(--ease)] hover:bg-[var(--hover-bg-strong)] hover:text-foreground active:scale-[0.98] [&_svg]:duration-[var(--dur-base)] [&_svg]:ease-[var(--ease-spring)]",
  "console-counted-button":
    "size-8 text-muted-foreground transition-[background-color,color,scale] duration-[var(--dur-fast)] ease-[var(--ease)] hover:bg-[var(--hover-bg-strong)] hover:text-foreground active:scale-[0.98]",
  // The count sits on the glyph's top-right corner, leaving the bell readable under it.
  "console-counted-count":
    "right-0.5 top-0.5 duration-[var(--dur-base)] ease-[var(--ease-spring)] h-[15px] min-w-[15px] rounded-full px-1 text-(length:--fs-2xs) font-semibold leading-[15px] shadow-[var(--shadow-cutout)]",
  "console-preview-account":
    "ml-1.5 h-8 gap-2 pl-1 pr-1.5 text-(length:--fs-cell) leading-(--lh-cell) font-(--fw-strong) hover:bg-[var(--hover-bg-strong)] max-[1281px]:[&_[data-part=console-preview-account-name]]:hidden",
  "console-preview-account-caret": "text-muted-foreground opacity-100 max-[900px]:hidden",
  "console-preview-avatar":
    "size-[26px] bg-[var(--avatar-1)] text-(length:--fs-xs) leading-(--lh-xs) font-(--fw-heavy) tracking-[-0.04em] text-[var(--avatar-1-ink)]",

  // Menu column: 240px on its own near-white ground, rows that take a soft ground on hover and
  // the accent soft ground where the reader is, a rail of 38px marks when collapsed.
  "console-menu-column": `w-60 border-[var(--border)] bg-[var(--chrome-sidebar)] ${MENU_GROUND}`,
  "console-menu-rail": `w-15 border-[var(--border)] bg-[var(--chrome-sidebar)] pb-0 pt-2 ${MENU_GROUND}`,
  "console-menu-rail-rule": "my-[1.5px] bg-transparent",
  "console-menu-rail-button":
    "size-[38px] border-0 bg-transparent text-[var(--menu-icon,var(--muted-foreground))] shadow-none hover:bg-[var(--menu-hover,var(--hover-bg-strong))] hover:text-[var(--menu-hover-fg,var(--foreground))] [&_[data-slot=console-menu-glyph]]:text-current [&_[data-slot=console-menu-glyph]]:opacity-100 [&_svg]:size-[18px]",
  "console-menu-rail-button active=true": "bg-[var(--primary-soft)] text-[var(--primary-text)] hover:bg-[var(--primary-soft)] hover:text-[var(--primary-text)]",
  "console-menu-column-head":
    "h-12 border-0 py-0 pl-[18px] pr-2.5 text-[var(--menu-fg,var(--secondary-foreground))] [&>*:first-child]:text-[var(--menu-fg,var(--foreground))] [&>*:first-child]:text-(length:--fs-cell) leading-(--lh-cell) [&>*:first-child]:font-semibold",
  "console-menu-column-body": "gap-0 px-2.5 pb-6 pt-0.5 [&>*]:mt-1.5",
  "console-menu-branch": "gap-[var(--menu-branch-gap)]",
  "console-menu-branch ruled=true": "ml-[var(--menu-branch-indent)] border-[var(--border)] pl-[var(--menu-branch-inset)]",
  "console-menu-row":
    "focus-visible:outline-none focus-visible:ring-0 focus-visible:shadow-[var(--focus-halo)] min-h-8 gap-2.5 rounded-[var(--radius-control)] px-2.5 py-0 text-(length:--fs-cell) leading-(--lh-cell) text-[var(--menu-fg,var(--secondary-foreground))] transition-colors duration-[var(--dur-fast)] ease-[var(--ease)]",
  "console-menu-row kind=branch": "hover:bg-[var(--menu-hover,var(--hover-bg-strong))] hover:text-[var(--menu-hover-fg,var(--secondary-foreground))]",
  "console-menu-row kind=link": "hover:bg-[var(--menu-hover,var(--hover-bg-strong))] hover:text-[var(--menu-hover-fg,var(--secondary-foreground))]",
  "console-menu-row kind=inactive": "text-[var(--menu-fg-muted,var(--muted-foreground))]",
  "console-menu-row strong=true": "font-normal",
  "console-menu-row current=true":
    "bg-[var(--primary-soft)] font-(--fw-strong) text-[var(--primary-text)] hover:bg-[var(--primary-soft)] hover:text-[var(--primary-text)]",
  "console-menu-glyph":
    "text-[var(--menu-icon,var(--muted-foreground))] opacity-100 transition-colors [[data-current=true]>&]:text-[var(--primary-text)] [:hover>&]:text-[var(--menu-hover-fg,var(--secondary-foreground))]",
  // The shared selected indicator: a 2px accent bar at the column's inner edge that slides to the
  // current row.
  "console-menu-ink":
    "start-1 m-0! block w-0.5 rounded-full bg-primary transition-[top,height,opacity] duration-[var(--dur-base)] ease-[var(--ease)]",
  "console-menu-caret": "text-[var(--menu-icon,var(--muted-foreground))] opacity-100 [&_svg]:size-[13px]",

  // Content column: 24px over the header and 32px at the sides on a 1440px measure; under 900px the
  // sides close to 20px. The padding transitions, so the screen settles into a new width rather
  // than snapping.
  "console-content-column":
    "px-8 pt-6 transition-[padding] duration-[var(--dur-slow)] ease-[var(--ease)] max-[900px]:px-5 max-[900px]:pt-5",
  "console-content-column-body": "max-w-[1440px] gap-5",

  // Status strip: white, 11.5px, a live ticker, readings divided by short rules, the clock.
  "console-preview-status": "gap-4 border-[var(--border)] bg-card px-4",
  "console-preview-ticker": "text-(length:--fs-badge) leading-(--lh-badge)",
  "console-preview-ticker live=true": "font-medium text-foreground",
  "console-preview-segment": "text-(length:--fs-badge) leading-(--lh-badge)",
  "console-preview-segment tone=warn": "font-semibold text-[var(--warning-text)]",
  "console-preview-segment-rule": "bg-[var(--border)]",
  "console-preview-clock": "border-[var(--border)] text-(length:--fs-badge) leading-(--lh-badge)",

  // Command palette: a 640px overlay at 12vh, 52px field, grouped results, key hints under it.
  "console-palette": "rounded-[var(--radius-overlay)] border-[var(--border)] bg-popover shadow-[var(--shadow-3)]",
  // Overlays share the overlay radius; focus is the shared halo.
  "console-menu-flyout": "rounded-[var(--radius-overlay)]",
  "console-display-settings-theme": "focus-visible:outline-none focus-visible:ring-0 focus-visible:shadow-[var(--focus-halo)]",
  "console-palette-list": "p-1.5",
  "console-palette-esc": "right-4",
  "console-palette-sub": "text-(length:--fs-badge) leading-(--lh-badge)",
  "console-palette-match": "font-(--fw-heavy) text-[var(--primary-text)]",
  "console-palette-foot": "gap-4 border-[var(--border)] px-3.5 py-2 text-(length:--fs-badge) leading-(--lh-badge)",
  "console-palette-hint": "gap-[5px]",
};
