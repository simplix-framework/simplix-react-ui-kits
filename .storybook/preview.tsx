// The framework's own preview (providers, colour preset, mode and locale toolbars), with the
// active kit design marked on the page, its colour preset as the starting theme, and the
// framework's installation-wide detail presentation as a toolbar setting.
import type { Decorator, Preview } from "@storybook/react";
import frameworkPreview from "@kit-framework/apps/storybook/.storybook/preview";
import { UIProvider } from "@simplix-react/ui";
import { kitDesign, withKitDesign } from "../storybook/design-decorator";

const withDetailPresentation: Decorator = (Story, context) => (
  <UIProvider defaults={{ detailPresentation: context.globals.detailPresentation === "drawer" ? "drawer" : "panel" }}>
    <Story />
  </UIProvider>
);

const preview: Preview = {
  ...frameworkPreview,
  globalTypes: {
    ...frameworkPreview.globalTypes,
    detailPresentation: {
      description: "Where a list screen opens a record (UIProvider defaults)",
      toolbar: {
        title: "Detail",
        icon: "sidebaralt",
        items: [
          { value: "panel", title: "Detail: side panel" },
          { value: "drawer", title: "Detail: right drawer" },
        ],
        dynamicTitle: true,
      },
    },
  },
  decorators: [withDetailPresentation, ...[frameworkPreview.decorators ?? []].flat(), withKitDesign],
  initialGlobals: { ...frameworkPreview.initialGlobals, colorTheme: kitDesign.colorTheme, detailPresentation: "panel" },
};

export default preview;
