import { defineSlotStyle } from "@simplix-react/ui/design";

/**
 * Everything a record list draws: its toolbar, its table and its pager. A list standing on a page
 * is one card holding all three with no gaps between them; one nested in a record's tab takes the
 * frame of the form its tab chose.
 */
export const recordListStyle = defineSlotStyle({
  slot: "console-record-list",
  base: "",
  variants: {
    nested: { true: "", false: "shrink-0 overflow-clip rounded-lg border bg-card [&>[data-testid=crud-list]]:gap-0" },
  },
  defaultVariants: { nested: false },
});
