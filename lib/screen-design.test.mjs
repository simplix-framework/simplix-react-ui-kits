// Hit and miss cases for lib/screen-design.mjs: each check is shown to catch the form it exists
// for and to stay quiet on the form it must leave alone.
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { blocksAreEmpty, declaredListView, detailSectionTitles, descriptionCatalogProblems, entitySearchOffers, entryProblems, searchProblems, listViewProblems, manifestProblems, placeholderFields, placeholderFrameProblems, placeholderRowProblems, recordListAttributes, pageDrawsFacet, primaryKeyOf, readRoutePath, withoutComments } from "./screen-design.mjs";

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
  it("counts the figures a companion blocks file states, and still refuses when it states none", () => {
    const cards = { cards: { shown: true, reason: "r", items: ["Failed"] } };
    const withCompanion = (companion) => manifestProblems({ screens: [{ ...design, ...cards }], acknowledged: [] }, [{ app: "a", route: "/x" }], () => PAGE, { companion: () => companion }, () => PAGE);
    assert.deepEqual(withCompanion("export const spec = { tiles: [] };"), []);
    assert.match(withCompanion("export const spec = {};").join(), /asks for cards/);
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
  it("takes table, cards and none, and refuses any other presentation", () => {
    for (const presentation of ["table", "cards"]) {
      const list = { presentation, ...(presentation === "cards" ? { viewToggle: true } : {}), leading: "Name", sort: { field: "name", direction: "asc" }, filters: [] };
      assert.deepEqual(entryProblems(entry({ list })), []);
    }
    const grid = { presentation: "grid", leading: "Name", sort: { field: "name", direction: "asc" }, filters: [] };
    assert.match(entryProblems(entry({ list: grid })).join("\n"), /presentation "grid" is not one of table, cards, none/);
  });
  it("takes a view switch and a card title on a list, and refuses them malformed or on a screen with no list", () => {
    const base = { presentation: "cards", leading: "Name", sort: { field: "name", direction: "asc" }, filters: [] };
    assert.deepEqual(entryProblems(entry({ list: { ...base, viewToggle: true, cardTitle: "name" } })), []);
    assert.match(entryProblems(entry({ list: { ...base, viewToggle: "yes" } })).join("\n"), /viewToggle is not true or false/);
    assert.match(entryProblems(entry({ list: { ...base, cardTitle: "" } })).join("\n"), /cardTitle is not the key of a column/);
    const none = { presentation: "none", reason: "A dashboard", viewToggle: true };
    assert.match(entryProblems(entry({ list: none })).join("\n"), /list none has no viewToggle/);
  });
  it("refuses a cards list without the switch, and takes it with", () => {
    const cards = { presentation: "cards", leading: "Name", sort: { field: "name", direction: "asc" }, filters: [] };
    assert.match(entryProblems(entry({ list: cards })).join("\n"), /a cards list offers the switch to the table/);
    assert.match(entryProblems(entry({ list: { ...cards, viewToggle: false } })).join("\n"), /a cards list offers the switch to the table/);
    assert.deepEqual(entryProblems(entry({ list: { ...cards, viewToggle: true } })), []);
  });
  it("takes the switch on a table list only with a toggleReason", () => {
    const table = { presentation: "table", leading: "Name", sort: { field: "name", direction: "asc" }, filters: [] };
    assert.deepEqual(entryProblems(entry({ list: table })), []);
    assert.match(entryProblems(entry({ list: { ...table, viewToggle: true } })).join("\n"), /table list that offers the switch to cards has no toggleReason/);
    assert.match(entryProblems(entry({ list: { ...table, viewToggle: true, toggleReason: " " } })).join("\n"), /toggleReason/);
    assert.deepEqual(entryProblems(entry({ list: { ...table, viewToggle: true, toggleReason: "Voices are also read as units" } })), []);
  });
  it("refuses a toggleReason on a list that offers no switch to cards", () => {
    const table = { presentation: "table", leading: "Name", sort: { field: "name", direction: "asc" }, filters: [], toggleReason: "Why" };
    assert.match(entryProblems(entry({ list: table })).join("\n"), /toggleReason belongs to a table list that offers the switch/);
    const cards = { presentation: "cards", viewToggle: true, leading: "Name", sort: { field: "name", direction: "asc" }, filters: [], toggleReason: "Why" };
    assert.match(entryProblems(entry({ list: cards })).join("\n"), /toggleReason belongs to a table list/);
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

describe("the RecordList element of a list file", () => {
  const LIST = `export function OrderList({ list }: Props) {
  return (
    <RecordList<OrderRow>
      list={list}
      rowId={(row) => String(row.orderId)}
      columns={generated}
      presentation="cards"
      viewToggle
      cardTitle={"name"}
      {...rest}
    />
  );
}`;
  it("reads the attributes by name, through an arrow function and a generic argument", () => {
    const attributes = recordListAttributes(LIST);
    assert.equal(attributes.presentation, "cards");
    assert.equal(attributes.viewToggle, "true");
    assert.equal(attributes.cardTitle, '"name"');
    assert.equal(attributes.columns, "generated");
  });
  it("reads a table list with no presentation as a table without a switch", () => {
    const plain = "return <RecordList list={list} rowId={(row) => row.id} columns={c} />;";
    assert.deepEqual(declaredListView(recordListAttributes(plain)), { presentation: "table", viewToggle: false, cardTitle: undefined });
  });
  it("reads viewToggle={false} as off, and names nothing from a comment", () => {
    const off = "// <RecordList presentation=\"cards\" />\nreturn <RecordList viewToggle={false} />;";
    assert.deepEqual(declaredListView(recordListAttributes(off)), { presentation: "table", viewToggle: false, cardTitle: undefined });
  });
  it("finds no element in a file that draws none", () => {
    assert.equal(recordListAttributes("export const x = 1;"), undefined);
  });
});

describe("the list decision against the files that draw the list", () => {
  const patterns = ["{module}/src/widgets/{entity}/list.tsx", "screens/{entity}.stories.tsx"];
  const at = { widget: "mods/admin/user/src/widgets/order-line/list.tsx", frame: "screens/order-line.stories.tsx" };
  const design = (list) => ({ screens: [entry({ blocks: "mods/admin/user/src/pages/order-line/crud-page.tsx", list: { leading: "Name", sort: { field: "name" }, filters: [], ...list } })] });
  const cards = '<RecordList presentation="cards" columns={c} />';
  const table = "<RecordList columns={c} />";
  const read = (map) => (path) => map[path];

  it("passes a cards decision that both files declare, and a table decision that both leave at the default", () => {
    assert.deepEqual(listViewProblems(design({ presentation: "cards" }), patterns, read({ [at.widget]: cards, [at.frame]: cards })), []);
    assert.deepEqual(listViewProblems(design({ presentation: "table" }), patterns, read({ [at.widget]: table, [at.frame]: table })), []);
  });
  it("refuses a cards decision a file still draws as a table, and the reverse", () => {
    const found = listViewProblems(design({ presentation: "cards" }), patterns, read({ [at.widget]: table, [at.frame]: cards }));
    assert.equal(found.length, 1);
    assert.match(found[0], new RegExp(`decides cards and ${at.widget.replaceAll("/", "\\/")} declares a table`));
    const reverse = listViewProblems(design({ presentation: "table" }), patterns, read({ [at.widget]: cards, [at.frame]: table }));
    assert.match(reverse.join("\n"), /decides a table and .*list\.tsx declares cards/);
  });
  it("compares the view switch and the card title too", () => {
    const toggled = design({ presentation: "cards", viewToggle: true, cardTitle: "name" });
    const full = '<RecordList presentation="cards" viewToggle cardTitle="name" />';
    assert.deepEqual(listViewProblems(toggled, patterns, read({ [at.widget]: full, [at.frame]: full })), []);
    assert.match(listViewProblems(toggled, patterns, read({ [at.widget]: cards, [at.frame]: full })).join("\n"), /with a view switch, titled by name/);
    const wrongTitle = '<RecordList presentation="cards" viewToggle cardTitle="status" />';
    assert.equal(listViewProblems(toggled, patterns, read({ [at.widget]: wrongTitle, [at.frame]: full })).length, 1);
  });
  it("refuses a decision that needs a file the screen does not have, and leaves a plain table alone", () => {
    assert.match(listViewProblems(design({ presentation: "cards" }), patterns, read({ [at.frame]: cards })).join("\n"), /list\.tsx does not exist/);
    assert.match(listViewProblems(design({ presentation: "cards" }), patterns, read({ [at.widget]: "export const x = 1;", [at.frame]: cards })).join("\n"), /draws no RecordList/);
    assert.deepEqual(listViewProblems(design({ presentation: "table" }), patterns, read({})), []);
  });
  it("leaves a screen with no list alone", () => {
    assert.deepEqual(listViewProblems(design({ presentation: "none", reason: "A dashboard" }), patterns, read({})), []);
  });
});

describe("the optional reasons and section titles of an entry", () => {
  it("leaves an entry that states none alone", () => {
    assert.deepEqual(entryProblems(entry()), []);
  });

  it("reads a list reason and a detail reason when they are stated, and refuses an empty one", () => {
    assert.deepEqual(entryProblems(entry({ list: { ...entry().list, reason: "A catalogue read by name" }, detail: { sections: ["Order"], reason: "A key and its value" } })), []);
    assert.match(entryProblems(entry({ list: { ...entry().list, reason: " " } })).join(), /list reason is empty/);
    assert.match(entryProblems(entry({ detail: { sections: ["Order"], reason: "" } })).join(), /detail reason is empty/);
  });

  it("does not ask a list with no presentation twice for its reason", () => {
    const none = entryProblems(entry({ list: { presentation: "none", reason: "" } }));
    assert.equal(none.filter((problem) => /reason/.test(problem)).length, 1);
  });

  it("accepts a section declared as prose or as { title, fields }", () => {
    assert.deepEqual(entryProblems(entry({ detail: { sections: ["Order (the lines)", { title: "In effect", fields: ["Value", "Default"], reason: "What is configured first" }] } })), []);
  });

  it("refuses a titled section with no title, an empty one, a repeated one or malformed fields", () => {
    const problems = (sections) => entryProblems(entry({ detail: { sections } })).join("; ");
    assert.match(problems([{ fields: ["A"] }]), /section 1 has no title/);
    assert.match(problems([{ title: "  " }]), /section 1 has no title/);
    assert.match(problems([{ title: "Cost" }, { title: "Cost" }]), /section 2 repeats the title "Cost"/);
    assert.match(problems([{ title: "Cost", fields: "Value" }]), /fields are not a list of labels/);
    assert.match(problems([{ title: "Cost", fields: ["Value", ""] }]), /fields are not a list of labels/);
    assert.match(problems([{ title: "Cost", reason: "" }]), /section 1 reason is empty/);
    assert.match(problems([42]), /neither a sentence nor/);
  });

  it("leaves an entry with no body decision alone, and takes a complete one", () => {
    const body = {
      shown: true,
      reason: "How the service is doing",
      panels: [
        { title: "Usage", shown: true, reason: "Calls per day", source: "UsageDailyAggregate search", empty: { text: "No calls yet", reason: "Calls are made in the app" } },
        { title: "Plan", shown: true, reason: "The plan in force", source: "Subscription standing", empty: { never: true, reason: "The free plan is a plan" } },
        { title: "Credits", shown: true, reason: "The balance", source: "Credits summary", empty: { text: "No credits yet", action: "Buy credits, opening the checkout" } },
        { title: "Revenue", shown: false, reason: "No backend read yet" },
      ],
    };
    assert.deepEqual(entryProblems(entry({ body })), []);
    assert.deepEqual(entryProblems(entry({ body: { shown: false, reason: "A list page" } })), []);
  });

  it("refuses a body or a panel without its decision, its reason, its title or a shown panel's source", () => {
    const problems = (body) => entryProblems(entry({ body })).join("; ");
    const usage = { title: "Usage", shown: true, reason: "Calls per day", source: "Aggregates", empty: { text: "No calls", reason: "Made in the app" } };
    assert.match(problems({ reason: "x" }), /body is not decided/);
    assert.match(problems({ shown: true, reason: " ", panels: [usage] }), /body shown has no reason/);
    assert.match(problems({ shown: true, reason: "x" }), /body shown with no panels/);
    assert.match(problems({ shown: true, reason: "x", panels: "Usage" }), /body panels are not a list/);
    assert.match(problems({ shown: true, reason: "x", panels: [{ ...usage, shown: false }] }), /body shown with no panel shown/);
    assert.match(problems({ shown: true, reason: "x", panels: [{ ...usage, title: "" }] }), /panel 1 has no title/);
    assert.match(problems({ shown: true, reason: "x", panels: [usage, usage] }), /panel 2 repeats the title "Usage"/);
    assert.match(problems({ shown: true, reason: "x", panels: [{ ...usage, shown: "yes" }] }), /panel 1 is not decided/);
    assert.match(problems({ shown: true, reason: "x", panels: [usage, { title: "Revenue", shown: false }] }), /panel 2 has no reason/);
    assert.match(problems({ shown: true, reason: "x", panels: [{ ...usage, source: "" }] }), /panel 1 is shown with no source/);
    assert.match(problems({ shown: true, reason: "x", panels: [usage, 7] }), /panel 2 is not \{ title, shown, reason \}/);
    assert.match(problems({ shown: true, reason: "x", panels: [{ ...usage, span: 3 }] }), /panel 1 has span 3, not 1, 2 or 4/);
    assert.deepEqual(entryProblems(entry({ body: { shown: true, reason: "x", panels: [{ ...usage, span: 2 }] } })), []);
  });

  it("refuses a drawn panel whose empty state is undecided, and takes each decided form", () => {
    const problems = (empty) => entryProblems(entry({ body: { shown: true, reason: "x", panels: [{ title: "Usage", shown: true, reason: "x", source: "x", empty }] } })).join("; ");
    assert.match(problems(undefined), /panel 1 is shown with no empty state/);
    assert.match(problems("No calls"), /panel 1 empty is not \{ text, action \}/);
    assert.match(problems({ text: " ", reason: "x" }), /panel 1 empty has no text/);
    assert.match(problems({ text: "No calls" }), /panel 1 empty offers no action and gives no reason/);
    assert.match(problems({ text: "No calls", action: "" }), /panel 1 empty action is empty/);
    assert.match(problems({ never: true }), /panel 1 empty never has no reason/);
    assert.equal(problems({ text: "No calls", action: "Open the app page" }), "");
    assert.equal(problems({ text: "No calls", reason: "Calls are made in the app" }), "");
    assert.equal(problems({ never: true, reason: "Always has a plan" }), "");
    // A panel left out says nothing, so it decides no empty state.
    assert.deepEqual(entryProblems(entry({ body: { shown: true, reason: "x", panels: [{ title: "Usage", shown: true, reason: "x", source: "x", empty: { never: true, reason: "x" } }, { title: "Revenue", shown: false, reason: "x" }] } })), []);
  });

  it("lists the titles an entry states in reading order, and none for prose", () => {
    assert.deepEqual(detailSectionTitles(entry({ detail: { sections: ["Order", { title: "In effect" }, { title: "Per call" }] } })), ["In effect", "Per call"]);
    assert.deepEqual(detailSectionTitles(entry()), []);
    assert.deepEqual(detailSectionTitles({}), []);
  });
});

describe("placeholderFields", () => {
  const declared = 'const FIELDS = [{ name: "roleName", kind: "text" }, { name: "description", kind: "longText" }];\n';

  it("finds a declared field whose sample rows hold its own name and a number", () => {
    const text = `${declared}const ROWS = [{ roleName: "roleName 1", description: "description 1" }, { roleName: "roleName 2", description: "Can read" }];`;
    assert.deepEqual(placeholderFields(text), [{ field: "roleName", cells: 2 }, { field: "description", cells: 1 }]);
  });

  it("leaves hand-drawn rows alone", () => {
    const text = `${declared}const ROWS = [{ roleName: "Support agent", description: "Reads accounts and notes" }];`;
    assert.deepEqual(placeholderFields(text), []);
  });

  it("leaves a value that merely ends in a number, or a field the file does not declare", () => {
    const text = `${declared}const ROWS = [{ roleName: "Tier 1", phase: "phase 1", description: "roleName 1 is the placeholder" }];`;
    assert.deepEqual(placeholderFields(text), []);
  });

  it("does not read a placeholder written in a comment", () => {
    assert.deepEqual(placeholderFields(`${declared}// roleName: "roleName 1"\nconst ROWS = [];`), []);
  });
});

describe("placeholderRowProblems", () => {
  const manifest = { screens: [entry()] };
  const patterns = ["screens/{entity}.stories.tsx"];
  const frame = 'const F = [{ name: "orderNo", kind: "text" }];\nconst ROWS = [{ orderNo: "orderNo 1" }];';

  it("names the screen, the frame and the fields whose rows are placeholders", () => {
    const problems = placeholderRowProblems(manifest, patterns, () => frame);
    assert.equal(problems.length, 1);
    assert.match(problems[0], /admin \/orders: screens\/order-line\.stories\.tsx still draws the generated placeholder rows for orderNo/);
  });

  it("is quiet for a frame with real rows, a missing file and a screen with no list", () => {
    assert.deepEqual(placeholderRowProblems(manifest, patterns, () => 'const F = [{ name: "orderNo" }];\nconst ROWS = [{ orderNo: "A-1001" }];'), []);
    assert.deepEqual(placeholderRowProblems(manifest, patterns, () => undefined), []);
    assert.deepEqual(placeholderRowProblems({ screens: [entry({ list: { presentation: "none", reason: "No list" } })] }, patterns, () => frame), []);
  });
});

describe("placeholderFrameProblems", () => {
  it("reads every frame it is given, whether or not a screen's entry names it", () => {
    const text = (path) => (path === "screens/a.stories.tsx" ? 'const F = [{ name: "x" }]; const R = [{ x: "x 1" }];' : "const R = [];");
    const problems = placeholderFrameProblems(["screens/a.stories.tsx", "screens/b.stories.tsx", "screens/gone.stories.tsx"], (path) => (path.includes("gone") ? undefined : text(path)));
    assert.equal(problems.length, 1);
    assert.match(problems[0], /^screens\/a\.stories\.tsx still draws/);
  });
});

describe("entitySearchOffers", () => {
  const meta = {
    entities: { OrderLine: { defaultSort: { field: "placedAt", direction: "desc" } }, Note: {} },
    operations: {
      a: { entity: "OrderLine", request: { searchDto: "OrderLineSearchDTO" } },
      b: { entity: "Note", request: { searchDto: "NoteSearchDTO" } },
    },
    types: {
      OrderLineSearchDTO: { fields: [{ name: "code", searchable: { keyword: true } }, { name: "placedAt", searchable: {} }] },
      NoteSearchDTO: { fields: [{ name: "content", searchable: { operators: ["CONTAINS"] } }] },
    },
  };
  it("reads the keyword fields and the default sort of each entity, by its kebab name", () => {
    const offers = entitySearchOffers(meta);
    assert.deepEqual(offers.get("order-line"), { keyword: ["code"], sort: { field: "placedAt", direction: "desc" } });
  });
  it("reads no keyword for an entity whose search DTO marks none", () => {
    assert.deepEqual(entitySearchOffers(meta).get("note").keyword, []);
  });
});

describe("searchProblems", () => {
  const offers = new Map([
    ["order-line", { keyword: ["code"], sort: { field: "placedAt", direction: "desc" } }],
    ["note", { keyword: [], sort: { field: "createdAt", direction: "desc" } }],
  ]);
  const at = { app: "admin", sourcesPath: "search-sources.json" };
  const source = { entity: "order-line", route: "/orders", sort: { field: "placedAt", direction: "desc" } };
  const manifest = (screens) => ({ screens });
  it("refuses a list whose entity offers keyword search and that is neither a source nor left out with a reason", () => {
    const problems = searchProblems(manifest([entry()]), offers, [], at);
    assert.equal(problems.length, 1);
    assert.match(problems[0], /offers keyword search \(code\).*add \{ "entity": "order-line", "route": "\/orders"/);
  });
  it("is quiet for a list that is a source, and for a list left out with a reason", () => {
    assert.deepEqual(searchProblems(manifest([entry()]), offers, [source], at), []);
    assert.deepEqual(searchProblems(manifest([entry({ search: { shown: false, reason: "Rows are days" } })]), offers, [], at), []);
  });
  it("is quiet for a list whose entity takes no keyword, and for another app's list", () => {
    assert.deepEqual(searchProblems(manifest([entry({ entity: "note", route: "/notes" })]), offers, [], at), []);
    assert.deepEqual(searchProblems(manifest([entry({ app: "portal" })]), offers, [], at), []);
  });
  it("refuses a source over an entity that takes no keyword, which would answer every row", () => {
    const problems = searchProblems(manifest([entry({ entity: "note", route: "/notes" })]), offers, [{ entity: "note", route: "/notes", sort: { field: "createdAt", direction: "desc" } }], at);
    assert.equal(problems.length, 1);
    assert.match(problems[0], /offers no keyword search/);
  });
  it("refuses a source at another route than its list, sorted otherwise than Meta, or listed twice", () => {
    const problems = searchProblems(manifest([entry()]), offers, [{ ...source, route: "/order-lines", sort: { field: "code", direction: "asc" } }, source], at);
    assert.ok(problems.some((problem) => /twice/.test(problem)));
    const moved = searchProblems(manifest([entry()]), offers, [{ ...source, route: "/order-lines", sort: { field: "code", direction: "asc" } }], at);
    assert.ok(moved.some((problem) => /sits at \/order-lines/.test(problem)));
    assert.ok(moved.some((problem) => /Meta's default sort is placedAt desc/.test(problem)));
  });
  it("refuses a list left out of the search while a source still names it", () => {
    const problems = searchProblems(manifest([entry({ search: { shown: false, reason: "Rows are days" } })]), offers, [source], at);
    assert.match(problems[0], /leaves the list out/);
  });
});

describe("entryProblems: the search decision", () => {
  it("refuses a search decision without shown or without a reason", () => {
    assert.ok(entryProblems(entry({ search: { reason: "x" } })).some((problem) => /search is not decided/.test(problem)));
    assert.ok(entryProblems(entry({ search: { shown: false } })).some((problem) => /search none has no reason/.test(problem)));
  });
  it("is quiet for an entry with no search decision or a decided one", () => {
    assert.ok(!entryProblems(entry()).some((problem) => /search/.test(problem)));
    assert.ok(!entryProblems(entry({ search: { shown: false, reason: "Rows are days" } })).some((problem) => /search/.test(problem)));
  });
});
