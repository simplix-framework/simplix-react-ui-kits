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

A console page draws its parts in one order: header, figure tiles, status cards, notices, time range, tabs, chips, rows. The status cards come first and the page notices sit directly under them, so a notice reads as being about the figures above it. A record's notices sit under its head figures the same way. The card strip folds from its own control into one line of each card's label and figure, and the fold is remembered per page in the browser. `ConsolePage` holds the order, and `audit-rendered.mjs --check noticesFollowTheStatusCards` refuses a painted page whose notice stands above its cards.

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
