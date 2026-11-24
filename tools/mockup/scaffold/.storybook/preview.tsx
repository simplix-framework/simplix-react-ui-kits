import { createMockupPreview } from "@simplix-react-ui-kits/mockup/preview";
import config from "../mockup.config.json";
import "../src/index.css";

export default createMockupPreview({
  locales: config.locales,
  detailPresentation: config.detailPresentation,
  appTranslations: import.meta.glob("../locales/*/*.json", { eager: true }),
});
