# simplix-react-ui-kits

UI kits for simplix-react products. A kit is a design: the page patterns, layouts, notices, shell and screen widgets a product's screens are composed from, built on simplix-react. A product or a mockup picks one kit and draws every screen with it.

## Kits

| Package | Design |
| --- | --- |
| `@simplix-react-ui-kits/console-core` | The console parts every console design shares: page pattern (header, tiles, notices, tabs, list and detail), layout, notices, shell, screen widgets. Behaviour and markup only; each element carries the `data-slot` a design draws |
| `@simplix-react-ui-kits/console-classic` | Operations console, classic design: `console-core` drawn with the framework's classic look |
| `@simplix-react-ui-kits/console-clarity` | Operations console, clarity design: hairline borders on a near-white canvas, one accent, hierarchy from type weight and spacing |

Every console kit ships every design's stylesheet, so the reader can switch design, colour theme, card fill, row density and dark mode at run time from `DisplaySettings` (`/shell`); the kit only decides which design a console opens in.

A design kit re-exports `console-core` segment by segment and adds its stylesheet and its design defaults, so every console design behaves identically and differs only in how it looks.

A kit is named `<area>-<design>`, because one area (a console, a kiosk, a field app) can have several designs.

## Console page order

A console page draws its parts in one order: header, figure tiles, notices, time range, tabs, chips, rows. The figures come first and the page notices sit directly under them, so a notice reads as being about the figures above it. A record's notices sit under its head figures the same way. A screen hands its figures to the page as `spec.tiles`: a count per value is `statusTiles(...)`, and a tile with a `filter` narrows the list under it as its chip does. A page's default figures (`FigureTilesSpec.status`) take `tones`, a status tone per enum value (`tones: { FAILED: "danger" }`): a tile wears its tone only while its count is above zero, so a set the reader must act on is tinted when it has rows and plain when it has none. The figure row has one fold, the console's `TilesCollapse`, shared by every page and remembered as the reader's preference. A row draws as many tiles as fit at the `--tile-min-width` layout token in the page column, up to five (six tiles at full width draw five and one; fewer tiles than columns take the row); `spec.tilesColumns` caps it at one to five. `ConsolePage` holds the order, the kit fence refuses a screen importing `SettingsTiles` or the fold, and `audit-rendered.mjs --check noticesFollowTheStatusCards` refuses a painted page whose notice stands above its figures.

## Page region contract

`packages/console-clarity/regions.json` is the authority on what a console page draws where. For each page type (list-detail, dashboard, tabbed, record, system) it names the regions in drawing order, the one part that fills each region, the `page.blocks` slot that feeds it, and the control kinds the region may hold: a row's actions are an icon strip, a list cell holds a value and no control (a reference to another record is a link), a notice card carries at most one action. Every boolean prop of a slot interface is listed there with the reason it changes content rather than look.

`node packages/console-clarity/scripts/check-regions.mjs` refuses a value part that draws a control and an unlisted boolean slot prop (`pnpm lint`). `packages/console-clarity/scripts/regions-rendered.mjs` exports `probe`, run inside a painted page, and `compare`, which judges its signature against the page type; a product's runner opens its screens and prints the report. Both prove themselves with `--selftest` (`pnpm test`). `packages/console-clarity/scripts/tile-columns-rendered.mjs` does the same for the figure tile grid against `tile-columns.json`: `probe` reads every grid as painted, and `compare` and `compareCase` judge it at the page column widths the contract lists.

## List columns

A list draws as many columns as its pane holds. The generated column set gives its first four columns no width condition and each later column the width of the set up to it, so a narrower pane drops columns from the end of the field order. Three columns never drop, because dropping them leaves the screen unreadable:

- the leading column, which names the row;
- the column the rows are sorted by (the list's current sort, so it is the default sort until the reader picks another), because a list sorted by a column it does not draw cannot be checked against its own order;
- the row-action column, which belongs to the table and not to the column set.

A kept column leaves the width ladder and every tier before it grows by the width the kept column now always takes (`keepColumnsDrawn` in `console-core/src/entity/column-priority.ts`, applied by `RecordList`), so the remaining columns still drop from the end and the table does not outgrow the pane. The time column of a log-type list is its default sort column, which is how it stays on screen at every width. A screen whose sort field has no column in its field array is sorted by nothing the reader can see; the field array gets the column. A column's width comes from its contract kind (an enum column is 120px whatever its option labels are), so a column whose longest label is wider than that declares its own `width` in the list and in the board frame, or the label is clipped with an ellipsis.

The columns menu offers every declared column. A column the width dropped is listed unchecked, and switching it on draws it whatever the width, so the table scrolls sideways; switching it off hands it back to the width.

`packages/console-clarity/scripts/list-columns-rendered.mjs` judges a painted list against this: `probe` reads the drawn headers and the sort mark, `probeMenu` reads the open columns menu, and `compare` checks the sort column and the leading column are drawn, the menu offers every column with the drawn ones checked, and the rest drop from the end. A product's runner opens each list at its page widths and passes the column the list is sorted by, since a dropped column carries no mark. It proves itself with `--selftest` (`pnpm test`).

A date or a money value in a cell, a card or a figure tile is drawn by the same contract kind, so a cell and the tile above it agree: a `money` field keeps as many decimals as its stored scale holds, and a count of days is worded by `daysAgoText`, which takes the plural form from the reader's language instead of from a catalogue string.

## List presentation

A list screen is designed as a table or as cards, and `RecordList` draws either from the same column declarations. `presentation` is `"table"` (the default; the table falls to cards below the width its columns need) or `"cards"`, which draws every row as a card at every width. The card is the one the narrow table already falls to: `record-card.ts` places the title column, the badge row, the labelled lines and the row actions beside the title, so no screen declares a second set of columns for it. `cardTitle` names the column (its `key`) that titles the card, the first column when absent; the other columns keep their order. A `cardTitle` naming no column throws.

Cards sit in a fit grid: as many columns as hold a card no narrower than the `--card-min-width` layout token, each column an equal share of the row, so a detail panel opening beside the list reflows the cards and a pane narrower than one card draws one column. A card's labelled lines are one grid in which a label column is as wide as the longest label, up to the `--console-card-label-max` token, and wraps only past it; the values stand in one column down the card. A line is drawn on every card of the page when some card fills it, with a dash where a card's own value is empty, and on none when no card fills it; a column sets `cardKeep: false` to be drawn only on the cards that have a value, or `cardKeep: true` to be drawn on every card whether or not one has a value, so the cards keep one height whatever the data. The table's sortable headers have no counterpart on a card; a cards list is read in the order of its default sort.

`viewToggle` offers the reader the table and the cards as two views, in the filter bar or, on a list with no filters, in the list's own toolbar (`CrudList.ViewToggle`). `presentation` is what the list opens in. With a `viewKey` (what names the list among the product's lists) the browser remembers the reader's last choice under `console.listView.<viewKey>` and the next visit opens in it; a list without a switch never reads a saved view, so its presentation is its only view. The decision is made in the screen's design entry (`list.presentation`, `list.viewToggle`, `list.cardTitle`), passed to the scaffold as `--list-presentation`, `--view-toggle` and `--card-title`, and the mockup kit's `screen-design` check refuses a list file or a board frame whose `<RecordList>` declares anything else.

## List filters

The generator turns the entity's searchable fields into the list's filters (`ContractFilter`): an enum is a `choice`, a boolean a `toggle`, a moment or a day a `dateRange`, a figure a `number` (a `money` field also carries its currency and scale), and a key of another record a `reference` filtered by that record's name. A text field is left to the keyword search, because a free-text box per field is rarely the question. A screen whose question is asked by a text field (per provider, per plan code) names it in its design and scaffolds with `--text-filter <field,field>`; the list then declares `{ kind: "text", field, operators }`, where `operators` are the ones the endpoint accepts on the field, first one the default (`["equals"]` for a field the server matches only whole, which the filter bar then offers without a `contains` the server would answer with an empty page). The flag is recorded in the origin, so a regeneration offers the same filters, and a name that is not a searchable text field of the entity stops the run.

## Row actions

`RecordList` and `RecordTree` draw `actions` as an icon strip in the row and as the same strip on a card; a row the action cannot run on shows it disabled with the reason. The kit names the verbs a framework type has no glyph for (`retry`, `reset`, `test`, `reprocess`, `enable`, `disable`, `suspend`, `reinstate`), each with a glyph of its own, so a screen never borrows `duplicate` for a retry.

A verb that flips with the row's state is one action, not two: give `type` and `label` as functions of the row.

```ts
{
  type: (row) => (row.enabled ? "disable" : "enable"),
  label: (row) => (row.enabled ? t("connection.disable") : t("connection.enable")),
  onClick: (row) => setSwitching({ row, turnOn: !row.enabled }),
  disabled: (row) => blocked(row),
}
```

A function `type` returns a kit verb, because a framework type's glyph is the framework's and cannot follow the row. Declaring Enable and Disable as two actions, one always disabled, is the form to leave. A labelled strip (two actions sharing one framework type, which the region contract refuses) sizes its column by the widest label the rows hold.

## Record detail

`RecordDetail` draws its notices above the body, under the head, with or without tabs: a notice explains the fields beneath it, so it is read first. A head figure takes its name from the field it draws: `contract.headFigures(fields, row)` returns `{ key, label, value }` for each contract field, with the label the list's column and the page's tile use, so one value has one name in every language and a screen writes no catalogue key for it. A figure that is not a field of the record (a share over two fields, a meter) is written as a `RecordHeadFigure` with its own label. A section is named for what it adds to the head, not for the field it holds: a section called "Value" holding a field "Value", or "Cost" under a head figure "Cost", draws the same value twice.

## Using a kit in a product

Add this repository as a git submodule and its packages to the product's pnpm workspace:

```bash
git submodule add https://github.com/simplecore-inc/simplix-react-ui-kits.git vendor/ui-kits
```

```yaml
# pnpm-workspace.yaml
packages:
  - vendor/ui-kits/packages/*
```

Then depend on the kit with `"@simplix-react-ui-kits/console-classic": "workspace:*"` and import its entries (`/page`, `/layout`, `/notice`, `/shell`, …).

## Working on the kits

```bash
cp .simplix-react.sample .simplix-react   # point frameworkPath at a simplix-react checkout
pnpm local:link                           # or pnpm install for the published framework
pnpm typecheck && pnpm build
```
