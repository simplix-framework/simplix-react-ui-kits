import { defineSlotStyle } from "@simplix-react/ui/design";

/**
 * The services beside the console, gathered at the foot of the navigation. In the column they stand
 * on a band of their own under a rule, inset as the destinations above are so the row lines up and a
 * focus halo stays inside the slot that clips the column. On the rail the short rule the rail draws
 * under its lead mark divides them from the clusters, and the band adds nothing.
 */
export const serviceLinksStyle = defineSlotStyle({
  slot: "console-service-links",
  as: "part",
  base: "",
  variants: {
    layout: {
      column: "border-t px-2.5 pb-3 pt-2",
      rail: "",
      sheet: "",
    },
  },
  defaultVariants: { layout: "column" },
});
