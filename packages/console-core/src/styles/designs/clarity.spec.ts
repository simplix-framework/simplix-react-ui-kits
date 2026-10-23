import { CLARITY_REPLACE, type DesignSpec } from "@simplix-react/ui/design";

import { dashboardSlots } from "./clarity/dashboard";
import { listSlots } from "./clarity/list";
import { pageSlots } from "./clarity/page";
import { shellSlots } from "./clarity/shell";

/**
 * The console kit's slots in the clarity design: the framework's clarity replacements, and the
 * kit's own chrome redrawn in that look (a white menu column whose current row takes the accent
 * soft ground, an area tab marked by an accent rule, quiet tile folds).
 */
const spec: DesignSpec = {
  id: "clarity",
  replace: CLARITY_REPLACE,
  slots: { ...shellSlots, ...pageSlots, ...listSlots, ...dashboardSlots },
};

export default spec;
