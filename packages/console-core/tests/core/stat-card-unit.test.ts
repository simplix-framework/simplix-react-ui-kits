import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { installedFramework } from "../installed-framework";

// A tile figure may break anywhere, so its unit ("credits", or the Korean word) must be one piece. The
// framework's stat card draws the unit in its own slot and keeps it whole in both designs; the kit adds
// nothing of its own, so this holds the framework's two designs to it.

const designs = join(installedFramework(), "src/theme/designs");

/** The declarations of the stat card unit's rule in one design stylesheet. */
function unitRule(design: string): string {
  const css = readFileSync(join(designs, `${design}.css`), "utf8");
  return /\[data-slot="stat-card-unit"\]\[data-slot\]\[data-s-stat-card-unit\]\s*\{([^}]*)\}/.exec(css)?.[1] ?? "";
}

describe("the unit of a tile figure", () => {
  it.each(["classic", "clarity"])("stays in one piece in the framework's %s design", (design) => {
    expect(unitRule(design)).toMatch(/whitespace-nowrap/);
  });

});
