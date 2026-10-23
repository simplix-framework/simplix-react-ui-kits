# simplix-react-ui-kits

UI kits for simplix-react products. A kit is a design: the page patterns, layouts, notices, shell and screen widgets a product's screens are composed from, built on simplix-react. A product or a mockup picks one kit and draws every screen with it.

## Kits

| Package | Design |
| --- | --- |
| `@simplix-react-ui-kits/console-classic` | Operations console: page pattern (header, tiles, notices, tabs, list and detail), layout, notices, shell, screen widgets |

A kit is named `<area>-<design>`, because one area (a console, a kiosk, a field app) can have several designs.

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
