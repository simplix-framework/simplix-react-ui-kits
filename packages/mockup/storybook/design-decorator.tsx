// Marks the page with the active kit design so its scoped tokens apply, and starts Storybook on
// the design's colour preset.
import type { Decorator } from "@storybook/react";
import design from "virtual:kit-design";

export const kitDesign = design;

export const withKitDesign: Decorator = (Story) => {
  document.documentElement.dataset.kitDesign = design.name;
  return <Story />;
};
