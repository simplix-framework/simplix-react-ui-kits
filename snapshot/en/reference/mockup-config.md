# `mockup.config.json`

The configuration of one mockup root. Every path is relative to the root. Everything specific to a product is here, never in the mockup package.

## Root keys

| Key | Type | Required | Description |
| --- | --- | --- | --- |
| `uiKit` | `string` | Yes | The UI kit package every screen is drawn with |
| `framework` | `string` | No | A simplix-react checkout to render. Absent, the installed `@simplix-react/*` packages are rendered |
| `design` | `string` | No | The design the root draws with (default `framework`, the framework as it ships) |
| `designDirs` | `string[]` | No | The directories that hold the root's designs (default none) |
| `locales` | `string[]` | Yes | The locales the toolbar offers, the first being the default |
| `detailPresentation` | `"panel" \| "drawer" \| "dialog" \| "page"` | No | Where a list screen opens a record by default (default `panel`) |
| `languageSelectorPlacement` | `string` | No | Where a multilingual field carries its language selector |
| `screenImports` | `string[]` | No | Import specifiers a screen may use beside the UI kit, as written in the screen |
| `buttonKeys` | `string[]` | No | Further keys whose value `check-screens` judges as a button |
| `checkStages` | `{ name, command }[]` | No | The stages `run-stages` runs |
| `digest` | `object` | No | What `story-digest` records beside text and buttons |
| `menu` | `object` | No | What `console-menu` reads |
| `screenDesign` | `object` | No | What `screen-design` reads |

`locales`, `detailPresentation` and `languageSelectorPlacement` are passed to `createMockupPreview()` by the root's `.storybook/preview.tsx`.

## `digest`

| Key | Type | Description |
| --- | --- | --- |
| `marks` | `{ [name]: { selector, attribute? } }` | An attribute of the first matching element, or whether the element is there |
| `moving` | `string[]` | Regular expressions of text that changes by itself |

## `menu`

| Key | Default | Description |
| --- | --- | --- |
| `source` | | The module that holds the menu constant |
| `routes` | | The directory of the product's route files |
| `scaffoldConfig` | | The scaffold config, read for `templates.story.files` |
| `catalog` | | The shell catalogue, `locales/<catalog>/<locale>.json` |
| `storyIdPrefix` | | What a frame's story id starts with |
| `output` | | The file to write |
| `designApp` | | The app whose design entries the menu belongs to |
| `labelExceptions` | `{}` | Entry key to the reason its words differ from its entity's |
| `menuConstant` | `ADMIN_MENU` | The menu constant's name |
| `accountConstant` | `ACCOUNT_ENTRY` | The account entry constant's name |
| `iconModule` | `lucide-react` | Where the marks are imported from |
| `iconType` | `LucideIcon` | The type of one mark |
| `entityCatalog` | `entity/{entity}` | Where an entity's words live under `locales/` |

## `screenDesign`

| Key | Default | Description |
| --- | --- | --- |
| `manifest` | | The design manifest, `{ screens, acknowledged }` |
| `routes` | | `[{ app, dir }]`: each app's directory of route files |
| `primaryKey` | `{entity}Id` | How an entity's primary key is named |
| `listFiles` | | The files that draw a screen's list, with `{entity}` and `{module}` |
| `search` | | `{ app, meta, sources }`: the console search of one app |
| `descriptionCatalog` | | `{ file, key, locales }`: where a screen's description sentence lives |

The fields of one design entry are listed in the [mockup package README](/en/tools/mockup/README.md).

## A design's `design.json`

| Key | Type | Description |
| --- | --- | --- |
| `name` | `string` | The design's name, equal to its directory. `framework` is reserved |
| `description` | `string` | Free text |
| `base` | `string` | The design this one builds on (default `framework`) |
| `colorTheme` | `string` | A framework colour preset, or the design's own name when its `tokens.css` is the theme |
| `overrides` | `{ [path]: { frameworkSha256, frameworkRevision } }` | One record per file under `ds/` |

## Example

```json
{
  "framework": "../../simplix-react",
  "uiKit": "@simplix-react-ui-kits/console-clarity",
  "screenImports": ["../details"],
  "design": "project",
  "designDirs": ["designs"],
  "locales": ["en", "ko"],
  "detailPresentation": "drawer",
  "checkStages": [
    { "name": "check-screens", "command": "simplix-mockup check-screens" },
    { "name": "typecheck", "command": "tsc --noEmit -p tsconfig.json" }
  ]
}
```

## See Also

- [`simplix-mockup` Commands](/en/reference/simplix-mockup-commands.md)

---

<p class="page-source"><a href="https://github.com/simplix-framework/simplix-react-ui-kits/blob/main/docs/en/reference/mockup-config.md" target="_blank" rel="noopener noreferrer">View source</a></p>
