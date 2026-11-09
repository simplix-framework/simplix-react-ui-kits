# simplix-mockup-kit

Tooling for mockups of simplix-react products, and the component design changes that have not yet landed in the framework.

A mockup draws every screen with one UI kit (a package of screen types built on simplix-react, named in `mockup.config.json` `uiKit`). This kit adds three things:

- **Designs**: changes to framework components and tokens that are proposed but not yet in the framework. When the framework adopts a change, it is deleted from the kit, so the kit's designs shrink toward empty.
- **A Storybook setup for mockup roots**: the framework's providers and a toolbar of global settings (detail presentation, colour theme, mode, locale) that applies to every screen.
- **Checks and scripts**: design validation, version pinning against the framework lockfile, token extraction, captures, and a mockup root generator.

## Contents

| Path | Contents |
| --- | --- |
| `designs/<design>/` | One design: `design.json`, an optional `tokens.css`, and `ds/` with framework files it changes |
| `lib/vite-plugin.mjs` | Renders the framework from a checkout or the installed packages, with a design's overrides and tokens applied |
| `storybook/preset.mjs` | Storybook preset that adds the plugin |
| `storybook/mockup-preview.tsx` | `createMockupPreview()`: providers and the global settings toolbar for a mockup root |
| `storybook/mockup-settings.tsx` | `useMockupSettings()`: the toolbar's settings, read by a screen |
| `.storybook/` | The kit's own Storybook: every framework story rendered with a design |
| `scaffold/` | Files `init-mockup` copies into a new mockup root |
| `checks/` | `check-screens`, `check-designs`, `check-imports`, `check-versions`, `console-menu`, `screen-design`, `run-stages`, `new-override`, `extract-tokens`, `capture`, `init-mockup` |
| `lib/` | Helpers the checks and the plugin share; `console-menu.mjs` holds the console menu readers and checks, proved by `console-menu.test.mjs`; `screen-design.mjs` holds the screen design checks, proved by `screen-design.test.mjs`; `run-stages.mjs` runs a root's check stages, proved by `run-stages.test.mjs` (`pnpm test`) |

## Designs

```
designs/<design>/
├ design.json   name, optional base design and colour preset, and one record per override
├ tokens.css    optional token overrides, written like the framework's theme/base.css (:root and .dark)
└ ds/<path>     a framework file under @simplix-react/ui src, replaced at the same path
```

- `framework` is the implicit root design: the framework as it ships.
- `colorTheme` names a framework preset (`[data-color-theme]`).
- An override replaces the framework file at the same path for every importer. It reaches the original through `@kit-base/<path>`, never through `@simplix-react/*`.
- `new-override` starts an override by copying the framework file and recording its hash and revision in `design.json`.
- `check-designs` reports an override that is identical to the framework file (adopted, delete it) and one whose framework file changed since it was recorded (reconcile it).

## Global settings

| Setting | Values | Applied through |
| --- | --- | --- |
| Detail | `panel` · `drawer` · `page` | `panel` and `drawer` go to `UIProvider` `defaults.detailPresentation`; a screen reads `page` from `useMockupSettings()` |
| Theme | framework `THEMES` | `data-color-theme` on `<html>` |
| Mode | `light` · `dark` | `dark` class on `<html>` |
| Locale | `mockup.config.json` `locales` | the framework i18n adapter |

`capture --globals "detailPresentation:drawer;locale:ko"` captures every story under those settings.

## Screens are drawn with the UI kit

A screen imports its UI kit, React, Storybook types, its fixtures and locales, and `useMockupSettings`; it writes no `className` or `style`. `check-screens` enforces this. Anything else needs a `// ui-kit-exception: <reason>` line directly above it and is counted on every run, because a screen type the kit lacks belongs in the kit.

The UI kit's own providers and page frame go in through `createMockupPreview({ decorators })` in the root's `.storybook/preview.tsx`.

## Console menu

A mockup draws the product's menu beside every back office screen. `console-menu` writes that menu from the product's own menu module, so a menu entry added to the product reaches the mockup without a second edit, and checks that the menu's words agree with the entity each entry opens.

```bash
node kit/checks/console-menu.mjs [--root <mockup root>]           # write the generated menu
node kit/checks/console-menu.mjs [--root <mockup root>] --check   # fail when it is stale or the words disagree
```

The menu constant is read as syntax, never executed. An entry reaches its screen through its route: the route file declares the path and imports the `<Entity>CrudPage`, and the entity names the frame in `screens/` (`templates.story.files` of the scaffold config names a frame that predates its scaffold). An entry with no route falls back to the frame named after its catalogue key, and an entry with no frame is drawn inactive.

`--check` fails when the generated file is stale, when an entry that has a product route has no frame, when an entry or group has no words in a locale, when the catalogue holds menu words no entry uses, and when an entry's words differ from the plural label of its entity in a locale. An entry that differs on purpose is listed under `menu.labelExceptions` with the reason; an exception without a reason, for an entry that opens no entity list, or whose words now agree is reported as well.

The root's `mockup.config.json` holds everything specific to the product, under the key `menu`; a root without the key is left alone. Paths are relative to the root.

| Key | Meaning |
| --- | --- |
| `source` | The module that holds the menu constant |
| `routes` | The directory of the product's route files |
| `scaffoldConfig` | The scaffold config, read for `templates.story.files` |
| `catalog` | The shell catalogue, `locales/<catalog>/<locale>.json`, whose `shell.menu` and `shell.groups` hold the words |
| `storyIdPrefix` | What a frame's story id starts with, before its screen name |
| `output` | The generated file; the preview imports its `MENU` and `ACCOUNT_ENTRY` |
| `labelExceptions` | Entry key to the reason its words differ from its entity's |
| `designApp` | The app, as the design manifest names it, whose screens this menu opens; the menu is checked against their `menu` decisions |
| `menuConstant`, `accountConstant` | The constants' names; default `ADMIN_MENU` and `ACCOUNT_ENTRY` |
| `iconModule`, `iconType` | Where the marks come from and the type of one mark; default `lucide-react` and `LucideIcon` |
| `entityCatalog` | Where an entity's words live under `locales/`, with `{entity}` in camel case; default `entity/{entity}` |

## Mockup root

```bash
mkdir <mockup-root> && cd <mockup-root> && git init
git submodule add https://github.com/simplecore-inc/simplix-mockup-kit.git kit
node kit/checks/init-mockup.mjs --root . --name <name> --ui-kit <ui kit package> [--workspace <pnpm workspace root>]
pnpm install
pnpm storybook
```

`mockup.config.json` names the framework checkout (`framework`), the UI kit (`uiKit`), the design (`design`), extra design directories, the locales and the default detail presentation. With `--workspace`, libraries that workspace's catalog pins become `catalog:` dependencies. With `--framework-version`, the root depends on the published `@simplix-react/*` packages instead of a checkout.

## The kit's Storybook

```bash
SIMPLIX_FRAMEWORK=<simplix-react checkout> KIT_DESIGN=<design> pnpm storybook
```

It renders every framework story with the framework's own preview and the design applied. One Storybook serves one design.

## Running a root's checks together

A root's `pnpm check` is the list of its stages, run by `run-stages` so that one failing stage does not hide the others: a chain of commands joined by `&&` stops at the first failure, and an unfinished file in one cluster then masks every stage behind it. The stages are the key `checkStages` of the root's `mockup.config.json`, `[{ "name", "command" }]`, run in order from the root through a shell. Every stage runs, the run ends with one line per stage and the names of the stages that failed, and the exit code is 1 when any failed (2 when the list is missing or malformed).

```bash
node kit/checks/run-stages.mjs [--root <mockup root>]
```

## Screen design

A screen is designed for its purpose before it is scaffolded. `screen-design` reads a manifest beside the mockup with one entry per routed screen: the persona and the question they bring, whether the screen shows a description, cards and notices (each with its reason; none is a decision too), the list presentation, leading column, default sort and filters, and the detail sections. The board frame is drawn from that entry; a frame generated from the same template as the screen is not a design, so agreement against it proves nothing.

```bash
node kit/checks/screen-design.mjs [--root <mockup root>]
```

One entry per routed screen:

| Field | Holds |
| --- | --- |
| `app`, `route`, `entity` | the app, the route path the screen is routed at, and the entity it lists (kebab case) |
| `blocks` | the file that draws the page's own parts: the generated `crud-page.tsx`, or a `*.blocks.tsx` |
| `decided` | `false` while the design is open; the run fails on it |
| `persona`, `question` | who opens the screen and the one question they bring |
| `description`, `cards`, `notices` | `{ shown, reason }`; `cards` and `notices` carry `items` when shown. A decision of none needs its reason as much as one of shown |
| `list` | `{ presentation: "table" \| "cards" \| "none", viewToggle, toggleReason, cardTitle, leading, columns, sort: { field, direction }, filters, rowActions, headerActions }`; `none` carries a `reason`. `cards` draws every row as a card in a grid; `viewToggle` offers the reader the table and the cards as two views (the presentation is what the list opens in); every `cards` list has `viewToggle: true`, and a `table` list with `viewToggle: true` states why its rows are also read as units in `toggleReason`; `cardTitle` is the key of the column that titles a card, the first column when absent. `reason` (optional) says why the list is shaped so; when it is stated it must not be empty |
| `detail` | `{ header, reason, sections, notices }`; the sections in reading order. `reason` (optional) says why the detail is laid out so. A section is a sentence, or `{ title, fields, reason }` with the title the detail draws for it as data, so a run can set the screen's and the frame's section titles against the entry without a browser (`detailSectionTitles` in `lib/screen-design.mjs` lists them); a stated title is non-empty and unique within the detail |
| `timeRange` | `{ shown, reason, field }` where the list is read by when its rows happened |
| `body` | for a page that is not a list (a dashboard): `{ shown, reason, panels }`, each panel `{ title, shown, reason, source, span, empty }` in reading order, `span` the columns it takes in a span grid (1, 2 or 4; there is no 3). A panel left out is a decision with its reason as much as one drawn; a drawn panel names in `source` the read its figures come from, so a figure with no backend read behind it cannot be decided as drawn, and in `empty` what it says when that read answers with nothing: `{ text, action }` (the sentence and the next step it offers, naming where the step leads) or `{ text, reason }` (why it offers none), or `{ never: true, reason }` for a panel that always has something to draw. A new account sees every panel empty at once, so an undecided empty state is the first screen it is shown. Optional; when stated it is checked |
| `menu` | `{ group, icon }`: the menu group the screen sits in and the icon its entry draws, for a screen the menu opens |
| `search` | `{ shown, reason }`: whether the console search asks this list for records. Optional; a list whose entity offers keyword search and that is not a source of the search states `shown: false` with the reason |

It fails when a routed screen has no entry, an entry is undecided (`"decided": false`), a decision has no reason, a list sorts by its primary key, or a screen's page does not draw what its entry asks for. A page laid down whole from the kit template and not yet edited draws the description (and the figure row where the entity's Meta counts), so a design asking for those passes untouched; notices, and figures the template does not draw, take the screen's own code, and a header comment naming them does not count. A screen not yet customised is listed under `acknowledged` with its reason, and an acknowledgement whose page has since been customised fails as stale.

`console-menu` reads the `menu` decision: every menu entry that opens an entity list has a design entry whose `menu.group` and `menu.icon` equal the group the product's menu puts it in and the icon it draws (`menu.designApp` in the root's config names the app whose design entries the menu belongs to). Scaffolding the screen with `--menu-group <group> --menu-icon <Icon>` places the entry as decided.

The list decision is compared with the files that draw the list. The root's `screenDesign.listFiles` names them as paths relative to the root, with `{entity}` for the entry's entity and `{module}` for the directory above the `src` its `blocks` file sits in (`"{module}/src/widgets/{entity}/list.tsx"`, `"screens/{entity}.stories.tsx"`). The `<RecordList>` element in each must declare the entry's `presentation`, `viewToggle` and `cardTitle` (`presentation="cards"`, `viewToggle`, `cardTitle="name"`; a cards list always declares `viewToggle`, and a table with no switch declares none of them). A file that does not exist, or draws no `RecordList`, is refused for a decision that needs it and left alone for a plain table. Scaffolding with `--list-presentation cards --card-title <column>` lays down the list and the frame as decided, with the switch a cards list always has; `--view-toggle` is for a table list.

A frame's sample rows are part of its design. The frame a story template lays down cannot know sample data, so it fills every text field with its own name and a number (`roleName: "roleName 1"`), which draws a meaningless list. `screen-design` fails when a file named by `listFiles`, or, with `screenDesign.frameDir` (a directory of `*.stories.tsx` files relative to the root), any frame in that directory, holds a declared field (`name: "roleName"`) whose rows are still such a value. A frame in `frameDir` with no routed screen (a holder tab's table) is read as well.

The console search is checked against the same entries. With `screenDesign.search` (`{ app, meta, sources, definitions? }`: the app whose console searches, its SimpliX Meta document, the JSON file `{ sources: [{ entity, route, sort }] }` the app builds its record search from, and optionally the file where the app defines how each source's rows are named, which the failure line then names beside the sources file), every routed list of that app whose entity offers keyword search in Meta (a field of its search DTO marked `keyword`) is a source of the search, or its entry decides `search: { shown: false, reason }`. A source names an entity that takes a keyword (a list that takes none ignores the text and answers every row), sits at its list's route, and sorts by the entity's default sort. A newly scaffolded list therefore fails the check, which the scaffold runs, with the line to add to the sources file, until it is added or left out with a reason.

Everything specific to a product is the root's `mockup.config.json` key `screenDesign`; a root without the key is left alone:

```json
{
  "screenDesign": {
    "manifest": "screen-design.json",
    "routes": [{ "app": "<app>", "dir": "<path to the app's routes>" }],
    "primaryKey": "{entity}Id",
    "listFiles": ["{module}/src/widgets/{entity}/list.tsx", "screens/{entity}.stories.tsx"],
    "frameDir": "screens",
    "search": { "app": "<app>", "meta": "<path to the Meta document>", "sources": "<path to the search sources JSON>", "definitions": "<optional path to the source definitions>" }
  }
}
```
