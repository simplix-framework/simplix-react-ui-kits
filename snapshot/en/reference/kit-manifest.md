# Kit Manifest

What a kit and the mockup package declare in `package.json`.

## The `simplix` keys of a kit

| Key | Declared by | Type | Description |
| --- | --- | --- | --- |
| `id` | A design kit | `string` | The kit's name in the files it generates (`clarity`, `classic`, `site`). A package that declares it is a kit the harness and the mockup root check run on |
| `extends` | A design kit | `string` | The core kit whose segments it re-exports and whose templates it generates from |
| `templates` | A core kit, or a design kit with an override | `string` | The directory of the kit's templates |
| `overrides` | A design kit | `{ [template]: reason }` | The core templates it replaces, each with the reason |
| `fence` | A core kit | `object` | The imports a screen is refused, with the design kit written as `{{@kit.package}}` |
| `stylesheet` | A kit whose stylesheet does not stand alone | `string[]` | The imports a product stylesheet starts with, in order |

## The tokens of a template

| Token | Filled with |
| --- | --- |
| `{{@kit.package}}` | The package name of the kit the product draws with |
| `{{@kit.label}}` | The name without the scope |
| `{{@kit.id}}` | The kit's `simplix.id` |

An unknown `{{@kit.*}}` token is an error.

## Export entries

A segment's entry names its `source`, its `types` and its built `import`:

```json
{
  "./entity": {
    "source": "./src/entity/index.ts",
    "types": "./src/entity/index.ts",
    "import": "./dist/entity/index.js"
  }
}
```

A product that sets the `source` condition reads the kit's sources; another reads `dist`. The build entries of a package are read from these entries, so a segment is declared in one place.

## Entries of `@simplix-react-ui-kits/mockup`

| Entry | Exports |
| --- | --- |
| `/preview` | `createMockupPreview(config)`, `MockupPreviewConfig` |
| `/settings` | `useMockupSettings()`, `MockupSettings`, `DetailPresentation`, `FrameMode` |
| `/preset` | The Storybook addon: `viteFinal` |
| `/vite-plugin` | `simplixMockupKit(options)` |
| `/screen-design` | The readers and checks of a design entry, for a root's own check |

### `createMockupPreview(config)`

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `locales` | `LocaleCode[]` | Yes | The locales the toolbar offers, the first being the default |
| `detailPresentation` | `DetailPresentation` | No | The detail presentation a screen opens with (default `panel`) |
| `languageSelectorPlacement` | `LanguageSelectorPlacement` | No | The product's placement of a field's language selector |
| `frame` | `FrameMode` | No | Whether a screen opens inside the console's window (default `full`) |
| `appTranslations` | `Record<string, unknown>` | No | The mockup's own copy, as `import.meta.glob("../locales/*/*.json", { eager: true })` returns it |
| `decorators` | `Decorator[]` | No | The UI kit's own providers and frame, innermost last |
| `designs` | `readonly Design[]` | No | The designs the toolbar offers (default: the framework's) |
| `colorTheme` | `string` | No | The colour preset a screen opens with (default: the active design's) |

Returns a Storybook `Preview`.

### `useMockupSettings()`

Returns `{ detailPresentation, setDetailPresentation, colorTheme, mode, locale, setLocale, frame }`. Throws outside the mockup preview's decorator.

## `simplix.mockupRoot` of the mockup package

The libraries a generated mockup root installs, by name. `init-mockup` takes each version from the framework checkout's lockfile, or `catalog:` where the product's catalog pins it.

## See Also

- [Kits and Designs](/en/core-concepts/kits-and-designs.md)
- [Screen Templates](/en/core-concepts/screen-templates.md)

---

<p class="page-source"><a href="https://github.com/simplix-framework/simplix-react-ui-kits/blob/main/docs/en/reference/kit-manifest.md" target="_blank" rel="noopener noreferrer">View source</a></p>
