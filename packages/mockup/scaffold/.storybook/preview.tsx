import { createMockupPreview } from "../kit/storybook/mockup-preview";
import config from "../mockup.config.json";
import "../src/index.css";

export default createMockupPreview({
  locales: config.locales,
  detailPresentation: config.detailPresentation,
  appTranslations: import.meta.glob("../locales/*/*.json", { eager: true }),
});
