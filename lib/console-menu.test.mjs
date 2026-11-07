// Hit and miss cases for scripts/console-menu-lib.mjs: each reader and check is shown to catch the
// form it exists for and to stay quiet on the form it must leave alone.
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  menuDecisionProblems,
  readClaimedFrames,
  readMenu,
  readRelativeImports,
  readStringTables,
  readPageRoutes,
  readRoutes,
  renderMenu,
  resolveMenu,
  wordProblems,
} from "./console-menu.mjs";

const MENU_SOURCE = `
  const GATE = { action: "list" };
  export const ADMIN_MENU: readonly Group[] = [
    { key: "overview", icon: HomeIcon, entries: [{ key: "dashboard", icon: HomeIcon }] },
    { key: "people", icon: UsersIcon, entries: [
      { key: "users", href: "/users", icon: UsersIcon, phoneTab: true, gate: GATE },
      { key: "plans", icon: TagIcon },
    ] },
  ];
  export const ACCOUNT_ENTRY: Entry = { key: "me", href: "/me", icon: CircleIcon };
`;

const frameText = (id) => `export default {\n  id: "${id}",\n};`;
const FRAMES = new Map([
  ["user-account.stories.tsx", frameText("backoffice-user-account")],
  ["jobs.stories.tsx", frameText("backoffice-jobs")],
  ["dashboard.stories.tsx", frameText("backoffice-dashboard")],
  ["odd.stories.tsx", frameText("other-odd")],
]);

const ROUTES = readRoutes([
  'import { UserAccountCrudPage } from "@x/pages";\nexport const Route = createFileRoute("/users")({});',
  'import { MyProfilePage } from "@x/pages";\nexport const Route = createFileRoute("/me")({});',
  'import { BackgroundJobCrudPage } from "@x/pages";\nexport const Route = createFileRoute(\n  "/jobs",\n)({});',
]);
const CLAIMED = readClaimedFrames(
  'export default { templates: { story: { files: { "background-job": "jobs.stories.tsx" } } } };',
  "simplix.config.ts",
);
const INPUTS = {
  routes: ROUTES,
  claimed: CLAIMED,
  frame: (file) => FRAMES.get(file),
  prefix: "backoffice-",
};

const menu = readMenu(MENU_SOURCE, "menu.ts");
const resolved = resolveMenu(menu, INPUTS);

describe("reading the app's menu", () => {
  it("reads every group, entry and href, and the account entry", () => {
    assert.equal(menu.groups.length, 2);
    assert.equal(menu.groups[1].entries[0].href, "/users");
    assert.equal(menu.groups[1].entries[1].href, undefined);
    assert.deepEqual(menu.account, { key: "me", icon: "CircleIcon" });
  });

  it("refuses a key that is not a string literal", () => {
    assert.throws(
      () => readMenu(MENU_SOURCE.replace('key: "users"', "key: someKey"), "menu.ts"),
      /`key` must be a string literal/,
    );
  });

  it("refuses a spread property it cannot read", () => {
    assert.throws(
      () => readMenu(MENU_SOURCE.replace("phoneTab: true,", "...EXTRA,"), "menu.ts"),
      /only plain/,
    );
  });

  it("reads an href written as an imported table's key", () => {
    const source = MENU_SOURCE.replace('href: "/users"', "href: ROUTES.users");
    const tables = readStringTables(
      'export const ROUTES = { users: "/users", roles: "/roles" } as const;',
      "routes.ts",
    );
    const read = readMenu(source, "menu.ts", undefined, tables);
    assert.equal(read.groups[1].entries[0].href, "/users");
  });

  it("refuses an href that reads a key no imported table holds", () => {
    const source = MENU_SOURCE.replace('href: "/users"', "href: ROUTES.missing");
    const tables = readStringTables('export const ROUTES = { users: "/users" };', "routes.ts");
    assert.throws(() => readMenu(source, "menu.ts", undefined, tables), /no imported constant table/);
  });

  it("leaves out an exported table holding anything but strings", () => {
    const tables = readStringTables(
      'export const MIXED = { a: "/a", b: 2 }; const LOCAL = { c: "/c" }; export const OK = { d: "/d" };',
      "routes.ts",
    );
    assert.deepEqual([...tables.keys()], ["OK"]);
  });

  it("lists the names a module imports by relative path, not packages or types", () => {
    const imports = readRelativeImports(
      'import { A, B as C } from "./a"; import { D } from "pkg"; import type { E } from "./e"; import { type F, G } from "../g";',
      "menu.ts",
    );
    assert.deepEqual(imports, [
      { from: "./a", names: [{ local: "A", exported: "A" }, { local: "C", exported: "B" }] },
      { from: "../g", names: [{ local: "G", exported: "G" }] },
    ]);
  });

  it("refuses a file with no menu constant", () => {
    assert.throws(() => readMenu("export const OTHER = [];", "menu.ts"), /no `const ADMIN_MENU`/);
  });
});

describe("reading routes and claimed frames", () => {
  it("names the entity of a route's CrudPage", () => {
    assert.equal(ROUTES.get("/users"), "user-account");
  });

  it("names no entity for a route whose page is not a CrudPage", () => {
    assert.equal(ROUTES.has("/me"), false);
  });

  it("reads a path the formatter split over lines", () => {
    assert.equal(ROUTES.get("/jobs"), "background-job");
  });

  it("reads the frame a scaffold config claims for an entity", () => {
    assert.equal(CLAIMED["background-job"], "jobs.stories.tsx");
  });

  it("reads no claim from a config that makes none", () => {
    assert.deepEqual(readClaimedFrames("export default {};", "simplix.config.ts"), {});
  });
});

describe("giving each entry its board screen", () => {
  const byKey = Object.fromEntries(
    resolved.groups.flatMap((g) => g.entries).map((e) => [e.key, e]),
  );

  it("reaches the frame of an entry's route entity", () => {
    assert.equal(byKey.users.screen, "user-account");
    assert.equal(byKey.users.entity, "user-account");
  });

  it("reaches the frame named after the key of an entry with no route", () => {
    assert.equal(byKey.dashboard.screen, "dashboard");
    assert.equal(byKey.dashboard.entity, undefined);
  });

  it("reaches the frame add-page laid down for the page a route draws, before the frame named after the key", () => {
    const pages = readPageRoutes(['import { HomePage } from "../pages/home/page";\nexport const Route = createFileRoute("/")({});']);
    assert.equal(pages.get("/"), "home");
    const homeMenu = { ...menu, groups: [{ key: "g", icon: "I", entries: [{ key: "dashboard", icon: "I", href: "/" }] }] };
    const frames = new Map([...FRAMES, ["admin-home.stories.tsx", frameText("backoffice-home")]]);
    const withPage = resolveMenu(homeMenu, { ...INPUTS, frame: (file) => frames.get(file), pages, app: "admin" });
    assert.equal(withPage.groups[0].entries[0].screen, "home");
    // Without the page's frame, the frame named after the key stands.
    assert.equal(resolveMenu(homeMenu, { ...INPUTS, pages, app: "admin" }).groups[0].entries[0].screen, "dashboard");
    // A list route is not a page route.
    assert.equal(readPageRoutes(['import { JobsCrudPage } from "@x/pages";\nexport const Route = createFileRoute("/jobs")({});']).size, 0);
  });

  it("draws an entry with no route and no frame inactive without reporting it", () => {
    assert.equal(byKey.plans.screen, undefined);
    assert.deepEqual(resolved.unframed, []);
  });

  it("prefers a claimed frame to the entity's own name", () => {
    const claimedMenu = {
      ...menu,
      groups: [{ key: "g", icon: "I", entries: [{ key: "jobs", icon: "I", href: "/jobs" }] }],
    };
    assert.equal(resolveMenu(claimedMenu, INPUTS).groups[0].entries[0].screen, "jobs");
  });

  it("reports an entry that has an app route and no frame", () => {
    const missing = resolveMenu(menu, {
      ...INPUTS,
      frame: (file) => (file === "user-account.stories.tsx" ? undefined : FRAMES.get(file)),
    });
    assert.deepEqual(missing.unframed, ["users"]);
  });

  it("skips a fixture row's own id field to read the frame's story id", () => {
    const rows = `const rows = [\n  {\n    id: "row-1",\n  },\n];\n${frameText("backoffice-user-account")}`;
    const framed = resolveMenu(menu, { ...INPUTS, frame: () => rows });
    assert.equal(framed.groups[1].entries[0].screen, "user-account");
  });

  it("does not take a frame outside the board's id prefix for a screen", () => {
    const odd = resolveMenu(menu, { ...INPUTS, frame: () => frameText("other-odd") });
    assert.equal(odd.groups[1].entries[0].screen, undefined);
  });
});

describe("rendering the board menu", () => {
  const source = renderMenu(resolved);

  it("renders the same text for the same menu", () => {
    assert.equal(source, renderMenu(resolveMenu(menu, INPUTS)));
  });

  it("renders a built entry with its screen and an unbuilt one without", () => {
    assert.ok(source.includes('{ key: "users", icon: UsersIcon, screen: "user-account" },'));
    assert.ok(source.includes('{ key: "plans", icon: TagIcon },'));
  });

  it("keeps a lone short entry on the line of its group", () => {
    assert.ok(
      source.includes('entries: [{ key: "dashboard", icon: HomeIcon, screen: "dashboard" }],'),
    );
  });

  it("imports every icon once, sorted", () => {
    assert.ok(/^ {2}CircleIcon,$/m.test(source));
    assert.ok(source.indexOf("CircleIcon,") < source.indexOf("HomeIcon,"));
    assert.equal(source.match(/^ {2}HomeIcon,$/gm)?.length, 1);
  });

  it("ends with one newline", () => {
    assert.ok(source.endsWith("as const;\n"));
  });

  it("imports the icons from the module the settings name", () => {
    const custom = renderMenu(resolved, { iconModule: "@x/icons", iconType: "IconType" });
    assert.ok(custom.includes('import type { IconType } from "@x/icons";'));
    assert.ok(custom.includes('} from "@x/icons";'));
    assert.ok(custom.includes("readonly icon: IconType;"));
    assert.ok(!custom.includes("lucide-react"));
  });

  it("imports the icons from lucide-react when the settings name no module", () => {
    assert.ok(source.includes('import type { LucideIcon } from "lucide-react";'));
  });
});

describe("comparing the menu's words with the entity's", () => {
  const catalogue = {
    en: {
      menu: { dashboard: "Dashboard", users: "Users", plans: "Plans", me: "Me" },
      groups: { overview: "Overview", people: "People" },
    },
    xx: {
      menu: { dashboard: "[xx] Dashboard", users: "[xx] Users", plans: "[xx] Plans", me: "[xx] Me" },
      groups: { overview: "[xx] Overview", people: "[xx] People" },
    },
  };
  const plurals = {
    en: { "user-account": "User accounts" },
    xx: { "user-account": "[xx] User accounts" },
  };
  const agreeing = { en: { "user-account": "Users" }, xx: { "user-account": "[xx] Users" } };
  const run = ({ words, plural, exceptions = {}, locales = ["en", "xx"] } = {}) =>
    wordProblems(resolved, {
      locales,
      words: words ?? ((locale) => catalogue[locale]),
      plural: plural ?? ((entity, locale) => plurals[locale][entity]),
      exceptions,
    });
  const withMenu = (change) => (locale) => ({
    ...catalogue[locale],
    menu: change(catalogue[locale].menu),
  });
  const excepted = { users: "A phone tab label is kept short." };

  it("reports words that differ from the entity's, in each locale", () => {
    const problems = run();
    assert.equal(problems.length, 2);
    assert.ok(problems.every((p) => /entry "users" says/.test(p)));
  });

  it("stays quiet on words equal to the entity's", () => {
    assert.deepEqual(run({ plural: (entity, locale) => agreeing[locale][entity] }), []);
  });

  it("stays quiet on a listed exception that states its reason", () => {
    assert.deepEqual(run({ exceptions: excepted }), []);
  });

  it("reports an exception that states no reason", () => {
    assert.ok(run({ exceptions: { users: "  " } }).some((p) => /states no reason/.test(p)));
  });

  it("reports an exception for an entry that opens no entity list", () => {
    const problems = run({ exceptions: { ...excepted, plans: "r" } });
    assert.ok(problems.some((p) => /"plans" names no entry that opens an entity list/.test(p)));
  });

  it("reports an exception that names no entry", () => {
    const problems = run({ exceptions: { ...excepted, nothere: "r" } });
    assert.ok(problems.some((p) => /"nothere" names no entry/.test(p)));
  });

  it("reports an exception whose words now agree as stale", () => {
    const problems = run({
      plural: (entity, locale) => agreeing[locale][entity],
      exceptions: excepted,
    });
    assert.equal(problems.length, 1);
    assert.match(problems[0], /is stale/);
  });

  it("reports an entry with no words", () => {
    const problems = run({
      words: withMenu((menuWords) => ({ ...menuWords, dashboard: undefined })),
      exceptions: excepted,
    });
    assert.ok(problems.some((p) => /entry "dashboard" has no words/.test(p)));
  });

  it("reports menu words that no entry uses", () => {
    const problems = run({
      words: withMenu((menuWords) => ({ ...menuWords, ghost: "Ghost" })),
      exceptions: excepted,
    });
    assert.ok(problems.some((p) => /"ghost" belong to no entry/.test(p)));
  });

  it("reports a group with no words", () => {
    const problems = run({
      words: (locale) => ({ ...catalogue[locale], groups: { overview: "Overview" } }),
      exceptions: excepted,
    });
    assert.ok(problems.some((p) => /group "people" has no words/.test(p)));
  });

  it("reports an entity with no plural label", () => {
    const problems = run({ plural: () => undefined, locales: ["en"] });
    assert.ok(problems.some((p) => /has no plural label/.test(p)));
  });
});

describe("the menu placement as a design decision", () => {
  const design = (menuDecision) => [
    { app: "admin", route: "/users", menu: menuDecision },
    { app: "portal", route: "/users", menu: { group: "elsewhere", icon: "Nothing" } },
  ];
  it("passes when the design names the group and the icon the menu draws", () => {
    assert.deepEqual(menuDecisionProblems(resolved, design({ group: "people", icon: "UsersIcon" }), { app: "admin" }), []);
  });
  it("refuses a design naming another group", () => {
    const problems = menuDecisionProblems(resolved, design({ group: "overview", icon: "UsersIcon" }), { app: "admin" });
    assert.match(problems.join(), /menu group "overview" but the menu puts it in "people"/);
  });
  it("refuses a design naming another icon", () => {
    const problems = menuDecisionProblems(resolved, design({ group: "people", icon: "TagIcon" }), { app: "admin" });
    assert.match(problems.join(), /icon TagIcon but the menu draws UsersIcon/);
  });
  it("refuses an entry that opens a list and has no menu decision", () => {
    assert.match(menuDecisionProblems(resolved, [{ app: "admin", route: "/users" }], { app: "admin" }).join(), /no menu decision/);
  });
  it("leaves alone an entry that opens no entity list, and a design of another app", () => {
    assert.deepEqual(menuDecisionProblems(resolved, [{ app: "portal", route: "/users" }], { app: "admin" }), []);
    assert.deepEqual(menuDecisionProblems(resolved, [], { app: "admin" }), []);
  });
});
