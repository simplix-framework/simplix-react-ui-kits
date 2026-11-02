import { defineSlotStyle } from "@simplix-react/ui/design";

/**
 * The services beside the console, gathered at the foot of the navigation. In the column they stand
 * on a band of their own under a rule, inset as the destinations above are so the rows line up and a
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

/** The name over the services in the column, inset to the rows' own inset so it lines up with them. */
export const serviceLinksTitleStyle = defineSlotStyle({
  slot: "console-service-links-title",
  as: "part",
  base: "px-2.5",
  variants: {},
  defaultVariants: {},
});
