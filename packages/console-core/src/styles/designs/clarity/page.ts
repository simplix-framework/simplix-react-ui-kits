/** Clarity overrides for the page body: header, figure tiles, notice and explanation cards, page tabs. */
export const pageSlots: Record<string, string> = {
  // The page header stands on the canvas with no rule and no shadow under it, 20px above the next
  // row. Classic's `rule-shadow` is a custom utility tailwind-merge does not see as a shadow, so it
  // is outweighed rather than replaced.
  "console-page-header": "mb-1 border-b-0 pb-0 shadow-none!",
  // The facts under the title stand apart, a short rule between two of them.
  "console-page-meta": "mt-1.5 flex flex-wrap items-center",
  "console-page-meta-rule": "mx-2.5 inline-block h-[11px] w-px bg-[var(--border-strong)] align-[-1px] text-[0px]",

  // The fold control: a quiet labelled button at the right above the figures, not a tab hanging
  // off a rule.
  "console-tile-handle placement=rule":
    "end-0 top-3 h-6 w-auto gap-1 rounded-[var(--radius-control)] border-0 bg-transparent px-2 text-[12.5px] text-muted-foreground shadow-none! hover:bg-[var(--hover-bg-strong)] hover:text-foreground",
  "console-tile-handle placement=head":
    "h-6 gap-1 rounded-[var(--radius-control)] px-2 text-[12.5px] text-muted-foreground hover:bg-[var(--hover-bg-strong)] hover:text-foreground",
  "console-tile-handle-label placement=rule": "not-sr-only whitespace-nowrap",
  "console-tile-handle-chevron": "text-current duration-[var(--dur-slow)] ease-[var(--ease)]",
  "console-tile-handle-chevron folded=true": "group-hover:translate-y-0",
  "console-tile-handle-chevron folded=false": "group-hover:translate-y-0",
  // A titled row's head: 20px under the row above, a 15px heading, the control at the right, 10px
  // down to the tiles.
  "console-tile-head": "mt-1 min-h-7 gap-3 transition-[margin] duration-[var(--dur-slow)] ease-[var(--ease)]",
  "console-tile-head folded=false": "mb-2.5",
  "console-tile-title": "text-[15px] font-semibold tracking-[-0.015em]",
  "console-tile-chips": "[scrollbar-width:none]",
  "console-tile-chip":
    "gap-2 border-[var(--border)] px-[11px] text-[12.5px] hover:border-[var(--muted-2)] hover:bg-card",
  // The tint the tile carries is a class the figure is handed at runtime, so it is outweighed.
  "console-tile-chip-figure": "text-[12.5px]",
  "console-tile-chip-figure tone=warning": "text-[var(--warning-text)]!",
  "console-tile-chip-figure tone=danger": "text-[var(--destructive-text)]!",
  // An untitled row under the header: its fold control 12px below the header, the tiles 36px
  // under that, as the proposal's bare section head draws them.
  "console-tile-reach leads=rule": "-mt-5",
  "console-tile-row leads=rule": "pt-12",
  // Folded, the figures become one line in the same row as the control.
  "console-tile-strip-inset": "px-0",
  "console-tile-strip":
    "mt-2 rounded-none border-0 bg-transparent ps-0 pe-32 shadow-none! hover:bg-transparent",
  "console-tile-strip-dot current=true": "bg-primary",

  // A tile the reader is dragging, and the one it would land on.
  "console-tile drop=true": "ring-[3px] ring-[var(--primary-soft)]",
  "console-tile-grip":
    "size-[22px] rounded-[calc(var(--radius-control)-2px)] text-[var(--muted-2)] duration-[var(--dur-fast)] hover:bg-[var(--hover-bg-strong)] hover:text-foreground",
  "console-tile-go":
    "-translate-x-1 transition-[opacity,translate] duration-[var(--dur-base)] ease-[var(--ease)] group-hover:translate-x-0 group-focus-visible:translate-x-0",

  // The bars behind a figure: the past periods in a quiet series colour, the period the figure
  // reads in the ink (or the tile's tone).
  "console-tile-spark-bar mark=plain": "fill-[var(--chart-3)] opacity-55",
  "console-tile-spark-bar mark=last": "fill-foreground opacity-100",
  "console-tile-spark-bar mark=lastToned": "fill-current opacity-100",

  // A tab's count as a pill, taking the accent's soft ground on the chosen tab.
  "console-counted-tab-count":
    "h-[18px] min-w-5 self-auto rounded-full bg-[var(--surface-3)] px-1.5 text-center text-[11px] leading-[18px] font-semibold text-muted-foreground transition-colors duration-[var(--dur-base)] group-data-[state=active]:bg-[var(--primary-soft)] group-data-[state=active]:text-[var(--primary-text)]",

  // A notice card's title in the heavier weight; an explanation card sets its title and the line
  // under it side by side on one row, and its button is a quiet one whose chevron turns as the
  // explanation opens inside the card.
  "console-notice-title": "font-semibold",
  "console-notice-actions": "mt-3 gap-1.5",
  "console-notice-text kind=help": "flex-row flex-wrap items-baseline gap-x-2.5",
  "console-notice-action kind=help":
    "gap-1 border-transparent bg-transparent shadow-none hover:bg-[var(--hover-bg-strong)] hover:text-foreground",
  "console-notice-chevron": "block duration-[var(--dur-slow)] ease-[var(--ease)]",
  "console-notice-body": "duration-[var(--dur-slow)] ease-[var(--ease)]",
};
