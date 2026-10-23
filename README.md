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
| `checks/` | `check-screens`, `check-designs`, `check-imports`, `check-versions`, `new-override`, `extract-tokens`, `capture`, `init-mockup` |

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
