// Hit and miss cases for lib/screen-design.mjs: each check is shown to catch the form it exists
// for and to stay quiet on the form it must leave alone.
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { blocksAreEmpty, descriptionCatalogProblems, entryProblems, manifestProblems, pageDrawsFacet, primaryKeyOf, readRoutePath, withoutComments } from "./screen-design.mjs";

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

describe("a generated page as the customisation file", () => {
  const design = { app: "a", route: "/x", decided: true, persona: "p", question: "q", description: { shown: true, reason: "r", text: "t" }, cards: { shown: false, reason: "r" }, notices: { shown: false, reason: "r" }, list: { presentation: "table", leading: "n", sort: { field: "name" }, filters: [] }, detail: { sections: ["s"] }, blocks: "page.tsx" };
  const run = (text, render, overrides = {}, acknowledged = []) =>
    manifestProblems({ screens: [{ ...design, ...overrides }], acknowledged }, [{ app: "a", route: "/x" }], () => text, {}, () => render);
  // What the kit's crud-page template lays down: the header comment names every facet, the code
  // draws the description and, only where the Meta counts, the figure row.
  const PAGE = "/** Laid down with its description, the figures its Meta counts. */\nexport function P() {\n  return <CrudPage spec={{ title, description }} />;\n}\n";
  const TILED = PAGE.replace("{{ title, description }}", "{{ title, description, tiles: figures.tiles }}");

  it("accepts a page still equal to its render when it draws the description the design asks for", () => {
    assert.deepEqual(run(PAGE, PAGE), []);
  });
  it("refuses a page equal to its render that draws nothing of what the design asks for", () => {
    assert.match(run("export const x = 1;", "export const x = 1;").join(), /draws none of it/);
  });
  it("does not count a header comment that names the facet", () => {
    const bare = "/** description, tiles, notices */\nexport const x = 1;";
    assert.match(run(bare, bare).join(), /asks for description/);
  });
  it("refuses cards the template does not draw, and accepts cards its figure row draws", () => {
    const cards = { cards: { shown: true, reason: "r", items: ["Failed"] } };
    assert.match(run(PAGE, PAGE, cards).join(), /asks for cards/);
    assert.deepEqual(run(TILED, TILED, cards), []);
  });
  it("refuses notices on a page equal to its render, since no template draws them", () => {
    const notices = { notices: { shown: true, reason: "r", items: ["Failed mail"] } };
    assert.match(run(TILED, TILED, notices).join(), /asks for notices/);
  });
  it("counts a page edited past its render as customised", () => {
    assert.deepEqual(run(PAGE + "// own", PAGE, { notices: { shown: true, reason: "r", items: ["n"] } }), []);
  });
  it("still refuses an empty stub under the same design", () => {
    assert.match(run(EMPTY, undefined).join(), /asks for description/);
  });
  it("accepts an acknowledged page that is still the template's own, and refuses the acknowledgement once it is edited", () => {
    const ack = [{ app: "a", route: "/x", reason: "pending" }];
    assert.deepEqual(run(PAGE, PAGE, {}, ack), []);
    assert.match(run(PAGE + "// own", PAGE, {}, ack).join(), /remove the acknowledgement/);
  });
  it("names the way out in the message", () => {
    assert.match(run(EMPTY, undefined).join(), /list the screen under "acknowledged"/);
  });
  it("keeps refusing a routed screen that has no decided entry", () => {
    assert.match(manifestProblems({ screens: [] }, [{ app: "a", route: "/x" }], () => PAGE, {}, () => PAGE).join(), /routed screen with no design entry/);
    assert.match(run(PAGE, PAGE, { decided: false }).join(), /undecided/);
  });
});

describe("pageDrawsFacet and withoutComments", () => {
  it("reads the code and not the comments", () => {
    assert.equal(pageDrawsFacet("// notices\nconst a = 1;", "notices"), false);
    assert.equal(pageDrawsFacet("notices={blocks.notices?.(list)}", "notices"), true);
    assert.equal(withoutComments('const u = "https://x.y"; // tiles'), 'const u = "https://x.y"; ');
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
  it("takes a menu decision with a group and an icon, and refuses half of one", () => {
    assert.deepEqual(entryProblems(entry({ menu: { group: "records", icon: "MailIcon" } })), []);
    assert.match(entryProblems(entry({ menu: { group: "records" } })).join("\n"), /menu has no icon/);
    assert.match(entryProblems(entry({ menu: { icon: "MailIcon" } })).join("\n"), /menu has no group/);
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

describe("the description sentence in the module catalog", () => {
  const catalog = { file: "src/locales/widgets/{locale}.json", key: "screen.{entity}.description", locales: ["en", "ko"] };
  const design = { screens: [entry({ entity: "user-note", blocks: "mods/admin/user/src/pages/user-note/crud-page.tsx" })] };
  const stated = { screen: { userNote: { description: "Notes." } } };
  const catalogs = (map) => (path) => map[path];
  const reading = () => 'const line = t("screen.userNote.description");';

  it("passes where every locale states it", () => {
    const found = descriptionCatalogProblems(design, catalog, catalogs({ "mods/admin/user/src/locales/widgets/en.json": stated, "mods/admin/user/src/locales/widgets/ko.json": stated }), reading);
    assert.deepEqual(found, []);
  });

  it("reports a locale whose catalog lacks the key, and a catalog that does not exist", () => {
    const found = descriptionCatalogProblems(design, catalog, catalogs({ "mods/admin/user/src/locales/widgets/en.json": stated, "mods/admin/user/src/locales/widgets/ko.json": { screen: {} } }), reading);
    assert.equal(found.length, 1);
    assert.match(found[0], /ko\.json has no "screen\.userNote\.description"/);
    assert.equal(descriptionCatalogProblems(design, catalog, catalogs({}), reading).length, 2);
  });

  it("leaves an entry that shows no description alone", () => {
    const quiet = { screens: [entry({ entity: "user-note", blocks: "mods/admin/user/src/pages/user-note/crud-page.tsx", description: { shown: false, reason: "none" } })] };
    assert.deepEqual(descriptionCatalogProblems(quiet, catalog, catalogs({}), reading), []);
  });

  it("leaves a page that states its description another way alone", () => {
    assert.deepEqual(descriptionCatalogProblems(design, catalog, catalogs({}), () => "const line = copy.lede;"), []);
  });
});
