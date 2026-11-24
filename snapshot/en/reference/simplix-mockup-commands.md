# `simplix-mockup` Commands

`simplix-mockup <command> [arguments]` runs one command of `@simplix-react-ui-kits/mockup` from a mockup root. A command with no name, or an unknown one, prints the list and exits with 2.

Unless a table says otherwise, a command reads the mockup root it runs in. A value comes from a flag, then the environment, then the root's `mockup.config.json`.

| Value | Flag | Environment | `mockup.config.json` |
| --- | --- | --- | --- |
| Framework checkout | `--framework` | `SIMPLIX_FRAMEWORK` | `framework` |
| Design directories | `--design-dirs a:b` | `KIT_DESIGN_DIRS` | `designDirs` |
| Active design | | `KIT_DESIGN` | `design` |

## `init-mockup`

Creates a mockup root. Existing files are never overwritten.

| Argument | Required | Description |
| --- | --- | --- |
| `--root <dir>` | Yes | The directory to create the root in |
| `--name <package name>` | Yes | The `name` of the root's `package.json` |
| `--ui-kit <package>` | Yes | The UI kit every screen is drawn with |
| `--framework <checkout>` | No | The checkout whose lockfile pins the libraries and which the root renders |
| `--workspace <dir>` | No | A pnpm workspace root; every library its catalog pins becomes `catalog:` |
| `--framework-version <x.y.z>` | No | Depend on the published `@simplix-react/*` packages instead of a checkout |
| `--ui-kit-version <spec>` | No | How the root depends on the UI kit (default `workspace:*`) |
| `--mockup-version <spec>` | No | How the root depends on the mockup package (default `workspace:*`) |
| `--stylesheet <specifier>` | No | An import of the root's stylesheet, once per import and in order (default: the kit's `simplix.stylesheet`, else `<ui kit>/styles/app.css`) |

## `check-screens`

Fails when a screen under `screens/` imports anything but the UI kit, React, `@storybook/*`, its `fixtures/` and `locales/`, the mockup settings entry and the `screenImports` the root names; when it writes `className` or `style`; or when a button it declares has neither an `onClick`/`onAction`/`href` nor a `disabled` reason. A `// ui-kit-exception: <reason>` line directly above a line exempts it and is counted.

| Argument | Required | Description |
| --- | --- | --- |
| `--root <dir>` | No | The mockup root (default: the working directory) |

Exit code 2 when the root has no `mockup.config.json` or names no `uiKit`.

## `check-designs`

Validates every design of the root against the framework.

| Fails when | |
| --- | --- |
| An override has no framework file at its path, or is not recorded in `design.json` | |
| An override is identical to the framework file | The change was adopted: delete it |
| The framework file changed since the override was recorded | Reconcile, then record again |
| A `colorTheme` is neither a framework preset nor the design itself with a `tokens.css` | |
| A base chain is cyclic or names an unknown design, or `tokens.css` has blocks other than `:root`, `.dark`, `:root[data-design]` and `:root[data-design].dark` | |

| Argument | Required | Description |
| --- | --- | --- |
| `--design-dirs a:b` | No | Colon separated design directories |
| `--framework <checkout>` | No | The framework checkout |

## `check-imports`

Fails when a file of a design imports `@simplix-react/*`. An override reaches the file it replaces through `@kit-base/<path>`.

| Argument | Required | Description |
| --- | --- | --- |
| `--design-dirs a:b` | No | Colon separated design directories |

## `check-versions`

Fails when the root's `package.json` pins a library to a version the framework checkout's lockfile does not resolve, pins one inexactly, or lacks a library the framework's UI packages need. A `catalog:`, `workspace:` or `link:` dependency is not compared.

| Argument | Required | Description |
| --- | --- | --- |
| `--root <dir>` | No | The mockup root (default: the working directory) |
| `--framework <checkout>` | No | The framework checkout |

Exit code 2 when no framework checkout is found.

## `new-override`

Copies a framework file into a design and records its hash and revision in `design.json`.

| Argument | Required | Description |
| --- | --- | --- |
| `--design <name>` | Yes | The design that holds the override |
| `--file <path>` | Yes | The path under `@simplix-react/ui` `src`, for example `base/controls/button.tsx` |
| `--designs <dir>` | No | The design directory (default: the root's first `designDirs` entry) |
| `--framework <checkout>` | No | The framework checkout |
| `--base <design>` | No | The base of a new design |
| `--color-theme <preset>` | No | The colour preset of a new design |

## `extract-tokens`

Extracts a product's design tokens from its app stylesheet into `<out>/tokens.css`, `tokens.json` and `source.lock.json`.

| Argument | Required | Description |
| --- | --- | --- |
| `--entry <stylesheet>` | Yes | The product's app stylesheet |
| `--out <dir>` | Yes | The directory to write into |
| `--alias <specifier>=<dir>` | No | Where an import specifier is found; repeatable |
| `--stop-at <regex>` | No | Imports recorded and not inlined (default: the framework theme entry) |
| `--slot-pattern <regex>` | No | Selectors whose rules are copied as well |

## `capture`

Writes one PNG per story and mode of a running Storybook, and `report.json`.

| Argument | Required | Description |
| --- | --- | --- |
| `--url <storybook url>` | Yes | The running Storybook |
| `--out <dir>` | Yes | The directory to write into |
| `--modes <list>` | No | Comma separated modes (default `light,dark`) |
| `--filter <regex>` | No | Only the stories whose id matches |
| `--globals <text>` | No | Toolbar settings, for example `detailPresentation:drawer;locale:ko` |
| `--concurrency <n>` | No | Pages open at once (default 4) |
| `--width <px>`, `--height <px>` | No | The viewport (default 1280 by 800) |
| `--timeout <ms>` | No | Per story (default 20000) |

## `story-digest`

Records, for every story under `screens/`, the visible text, every button with whether it can be pressed, and the marks the root names; or compares two recordings.

| Argument | Required | Description |
| --- | --- | --- |
| `--url <storybook url>` | Yes, to record | The running Storybook |
| `--out <file.json>` | Yes, to record | The recording |
| `--filter <regex>` | No | Only the stories whose id matches |
| `--root <dir>` | No | The mockup root, read for `digest` |
| `--channel <name>` | No | An installed browser (`chrome`, `msedge`) instead of the bundled one |
| `--width <px>`, `--height <px>` | No | The viewport (default 1440 by 900) |
| `--diff <before.json> <after.json>` | Yes, to compare | Lists each story that differs; exit code 1 when any does |

## `run-stages`

Runs the root's `checkStages` in order, every one whatever the stages before it did, with the root's `node_modules/.bin` on the path.

| Argument | Required | Description |
| --- | --- | --- |
| `--root <dir>` | No | The mockup root (default: the working directory) |

Exit code 1 when any stage failed, 2 when the list is missing or malformed.

## `console-menu`

Writes the mockup's console menu from the product's own menu module, read as syntax and never executed. A root without the `menu` key is left alone.

| Argument | Required | Description |
| --- | --- | --- |
| `--root <dir>` | No | The mockup root (default: the working directory) |
| `--check` | No | Write nothing; fail when the generated file is stale, an entry with a product route has no frame, an entry or group has no words in a locale, the catalogue holds menu words no entry uses, or an entry's words differ from its entity's plural label without a listed exception |

## `screen-design`

Checks that every routed screen of the product has a decided design entry. A root without the `screenDesign` key is left alone.

| Argument | Required | Description |
| --- | --- | --- |
| `--root <dir>` | No | The mockup root (default: the working directory) |

Fails when a routed screen has no entry, an entry is undecided, a decision has no reason, a list sorts by its primary key, or a screen's page does not draw what its entry asks for.

## See Also

- [`mockup.config.json`](/en/reference/mockup-config.md)
- [Create a Mockup Root](/en/guides/create-a-mockup-root.md)

---

<p class="page-source"><a href="https://github.com/simplix-framework/simplix-react-ui-kits/blob/main/docs/en/reference/simplix-mockup-commands.md" target="_blank" rel="noopener noreferrer">Edit on GitHub</a></p>
