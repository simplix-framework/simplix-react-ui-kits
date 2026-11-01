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

A console page draws its parts in one order: header, figure tiles, notices, time range, tabs, chips, rows. The figures come first and the page notices sit directly under them, so a notice reads as being about the figures above it. A record's notices sit under its head figures the same way. A screen hands its figures to the page as `spec.tiles`: a count per value is `statusTiles(...)`, and a tile with a `filter` narrows the list under it as its chip does. The figure row has one fold, the console's `TilesCollapse`, shared by every page and remembered as the reader's preference. A row draws as many tiles as fit at the `--tile-min-width` layout token in the page column, up to five (six tiles at full width draw five and one; fewer tiles than columns take the row); `spec.tilesColumns` caps it at one to five. `ConsolePage` holds the order, the kit fence refuses a screen importing `SettingsTiles` or the fold, and `audit-rendered.mjs --check noticesFollowTheStatusCards` refuses a painted page whose notice stands above its figures.

## Page region contract

`packages/console-clarity/regions.json` is the authority on what a console page draws where. For each page type (list-detail, dashboard, tabbed, record, system) it names the regions in drawing order, the one part that fills each region, the `page.blocks` slot that feeds it, and the control kinds the region may hold: a row's actions are an icon strip, a list cell holds a value and no control (a reference to another record is a link), a notice card carries at most one action. Every boolean prop of a slot interface is listed there with the reason it changes content rather than look.

`node packages/console-clarity/scripts/check-regions.mjs` refuses a value part that draws a control and an unlisted boolean slot prop (`pnpm lint`). `packages/console-clarity/scripts/regions-rendered.mjs` exports `probe`, run inside a painted page, and `compare`, which judges its signature against the page type; a product's runner opens its screens and prints the report. Both prove themselves with `--selftest` (`pnpm test`). `packages/console-clarity/scripts/tile-columns-rendered.mjs` does the same for the figure tile grid against `tile-columns.json`: `probe` reads every grid as painted, and `compare` and `compareCase` judge it at the page column widths the contract lists.

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
