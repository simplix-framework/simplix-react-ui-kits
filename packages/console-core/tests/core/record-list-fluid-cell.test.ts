import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { PACKAGES } from "../installed-framework";

/**
 * A fluid column's cell ellipsizes one line, and the line may be a control (a name that opens a peek).
 * `truncate` clips with `overflow: hidden`, which cuts that control's keyboard focus halo on three
 * sides; `truncate-halo` clips the text at the same edge and leaves the halo the focus gutter.
 */
const read = (path: string) => readFileSync(join(PACKAGES, path), "utf8");

describe("a fluid column's cell", () => {
  it("is ellipsized by the utility that leaves a control's focus halo room", () => {
    const fluid = read("console-core/src/entity/record-list-view.tsx")
      .split("\n")
      .find((line) => line.includes("column.minWidth !== undefined") && line.includes("className="));
    expect(fluid).toBeDefined();
    expect(fluid).toMatch(/className="[^"]*\btruncate-halo\b/);
    expect(fluid).not.toMatch(/className="[^"]*\btruncate\b(?!-)/);
  });

  it("clips at the box with a clip margin of the focus gutter", () => {
    const utility = /@utility truncate-halo \{([^}]*)\}/.exec(read("console-core/src/styles/utilities.css"))?.[1] ?? "";
    expect(utility).toMatch(/overflow:\s*clip;/);
    expect(utility).toMatch(/overflow-clip-margin:\s*var\(--focus-gutter\);/);
    expect(utility).toMatch(/text-overflow:\s*ellipsis;/);
  });
});
