// Hit and miss cases for lib/screen-design.mjs: each check is shown to catch the form it exists
// for and to stay quiet on the form it must leave alone.
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { blocksAreEmpty, entryProblems, manifestProblems, primaryKeyOf, readRoutePath } from "./screen-design.mjs";

const EMPTY = "export function usePageBlocks(): PageBlocks {\n  return {};\n}\n";
const CUSTOMISED = "export function usePageBlocks(): PageBlocks {\n  return { spec: { description: t(\"d\") } };\n}\n";

const entry = (overrides = {}) => ({
  app: "admin",
  route: "/orders",
  entity: "order-line",
  blocks: "orders.blocks.tsx",
  decided: true,
  persona: "Operator",
  question: "Which orders are late?",
  description: { shown: true, reason: "Rare task", text: "Orders." },
  cards: { shown: false, reason: "No state" },
  notices: { shown: false, reason: "No state" },
  list: { presentation: "table", leading: "Placed at", sort: { field: "placedAt", direction: "desc" }, filters: [] },
  detail: { sections: ["Order"] },
  ...overrides,
});
const ROUTED = [{ app: "admin", route: "/orders" }];
const files = (map) => (path) => map[path];

describe("readRoutePath", () => {
  it("reads the path, across a line break", () => {
    assert.equal(readRoutePath('createFileRoute(\n  "/jobs"\n)({})'), "/jobs");
    assert.equal(readRoutePath('export const Route = createFileRoute("/login_/complete")({});'), "/login_/complete");
  });
  it("leaves a file with no route alone", () => {
    assert.equal(readRoutePath("export const Route = createRootRoute({});"), undefined);
  });
});

describe("blocksAreEmpty", () => {
  it("catches a stub returning an empty object", () => assert.equal(blocksAreEmpty(EMPTY), true));
  it("stays quiet on a blocks file that states something", () => assert.equal(blocksAreEmpty(CUSTOMISED), false));
  it("stays quiet when one of two returns states something", () => {
    assert.equal(blocksAreEmpty("if (x) return {};\nreturn { dialogs };"), false);
  });
});

describe("primaryKeyOf", () => {
  it("camel-cases the entity into the pattern", () => assert.equal(primaryKeyOf("order-line", "{entity}Id"), "orderLineId"));
});

describe("entryProblems", () => {
  it("passes a complete entry", () => assert.deepEqual(entryProblems(entry()), []));
  it("refuses an undecided entry", () => {
    assert.match(entryProblems({ app: "admin", route: "/orders", decided: false })[0], /undecided/);
  });
  it("refuses a none decision with no reason", () => {
    assert.match(entryProblems(entry({ cards: { shown: false } })).join("\n"), /cards none has no reason/);
  });
  it("refuses a shown decision with no reason", () => {
    assert.match(entryProblems(entry({ description: { shown: true, reason: " " } })).join("\n"), /description shown has no reason/);
  });
  it("refuses a facet that is not decided", () => {
    assert.match(entryProblems(entry({ notices: undefined })).join("\n"), /notices is not decided/);
  });
  it("refuses a list sorted by the primary key", () => {
    const list = { presentation: "table", leading: "Id", sort: { field: "orderLineId", direction: "desc" }, filters: [] };
    assert.match(entryProblems(entry({ list })).join("\n"), /primary key orderLineId/);
  });
  it("follows a configured primary key pattern", () => {
    const list = { presentation: "table", leading: "Id", sort: { field: "order_line_pk", direction: "desc" }, filters: [] };
    assert.deepEqual(entryProblems(entry({ list })), []);
  });
  it("accepts a screen with no list when the reason is given, and refuses it without", () => {
    assert.deepEqual(entryProblems(entry({ list: { presentation: "none", reason: "A dashboard" } })), []);
    assert.match(entryProblems(entry({ list: { presentation: "none" } })).join("\n"), /list none has no reason/);
  });
});

describe("manifestProblems", () => {
  it("passes a designed, customised screen", () => {
    assert.deepEqual(manifestProblems({ screens: [entry()] }, ROUTED, files({ "orders.blocks.tsx": CUSTOMISED })), []);
  });
  it("refuses a routed screen with no entry, and an entry with no route", () => {
    const problems = manifestProblems({ screens: [entry({ route: "/old" })] }, ROUTED, files({ "orders.blocks.tsx": CUSTOMISED })).join("\n");
    assert.match(problems, /admin \/orders: routed screen with no design entry/);
    assert.match(problems, /admin \/old: design entry for no routed screen/);
  });
  it("refuses empty blocks under an entry asking for a description", () => {
    assert.match(manifestProblems({ screens: [entry()] }, ROUTED, files({ "orders.blocks.tsx": EMPTY })).join("\n"), /asks for description/);
  });
  it("leaves empty blocks alone when the entry asks for nothing", () => {
    const quiet = entry({ description: { shown: false, reason: "A log" } });
    assert.deepEqual(manifestProblems({ screens: [quiet] }, ROUTED, files({ "orders.blocks.tsx": EMPTY })), []);
  });
  it("accepts an acknowledged screen whose blocks are still empty", () => {
    const manifest = { screens: [entry()], acknowledged: [{ app: "admin", route: "/orders", reason: "pending customisation" }] };
    assert.deepEqual(manifestProblems(manifest, ROUTED, files({ "orders.blocks.tsx": EMPTY })), []);
  });
  it("refuses a stale acknowledgement once the blocks are customised", () => {
    const manifest = { screens: [entry()], acknowledged: [{ app: "admin", route: "/orders", reason: "pending customisation" }] };
    assert.match(manifestProblems(manifest, ROUTED, files({ "orders.blocks.tsx": CUSTOMISED })).join("\n"), /remove the acknowledgement/);
  });
  it("refuses an acknowledgement without a reason", () => {
    const manifest = { screens: [entry()], acknowledged: [{ app: "admin", route: "/orders" }] };
    assert.match(manifestProblems(manifest, ROUTED, files({ "orders.blocks.tsx": EMPTY })).join("\n"), /acknowledged without a reason/);
  });
  it("refuses a blocks path that does not exist", () => {
    assert.match(manifestProblems({ screens: [entry()] }, ROUTED, files({})).join("\n"), /does not exist/);
  });
});
