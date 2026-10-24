import { defineSlotStyle } from "@simplix-react/ui/design";

/** The column beside a record opened as a page that holds its approval chain, down a rule. */
export const recordPageFlowStyle = defineSlotStyle({
  slot: "console-record-page-flow",
  as: "part",
  base: "sticky top-0 rounded-lg border bg-card p-4",
  variants: {},
  defaultVariants: {},
});
