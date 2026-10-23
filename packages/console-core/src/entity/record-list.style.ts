import { defineSlotStyle } from "@simplix-react/ui/design";

/**
 * Everything a record list draws: its toolbar, its table and its pager. A list standing on a page
 * may be framed as one card; one nested in a record's tab never is.
 */
export const recordListStyle = defineSlotStyle({
  slot: "console-record-list",
  base: "",
  variants: {
    nested: { true: "", false: "" },
  },
  defaultVariants: { nested: false },
});
