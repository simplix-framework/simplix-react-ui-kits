import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { surfaceShortfall } from "../lib/exports.mjs";

const names = { kit: "@x/area-one", core: "@x/area-core" };
const core = new Map([
  ["./entity", ["RecordForm", "RecordList"]],
  ["./shell", ["ConsoleProviders"]],
]);

describe("surfaceShortfall", () => {
  it("holds for a kit that exports the core's names and more", () => {
    const kit = new Map([
      ["./entity", ["RecordForm", "RecordList"]],
      ["./shell", ["ConsoleProviders", "KIT_DESIGNS"]],
    ]);
    assert.deepEqual(surfaceShortfall(kit, core, names), []);
  });

  it("names an entry of the core's the kit does not have", () => {
    assert.deepEqual(surfaceShortfall(new Map([["./entity", ["RecordForm", "RecordList"]]]), core, names), ['exports["./shell"]: @x/area-core has it and @x/area-one does not']);
  });

  it("names what the kit's entry does not export of the core's", () => {
    const kit = new Map([
      ["./entity", ["RecordList"]],
      ["./shell", ["ConsoleProviders"]],
    ]);
    assert.deepEqual(surfaceShortfall(kit, core, names), ['exports["./entity"]: @x/area-one does not export RecordForm of @x/area-core']);
  });
});
