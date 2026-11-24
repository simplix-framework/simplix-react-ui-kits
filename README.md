# simplix-react-ui-kits

UI kits for simplix-react products: the screen parts, the screen templates and the mockup tooling a product draws every screen with.

## What is simplix-react-ui-kits?

A UI kit is a design built on [simplix-react](https://github.com/simplix-framework/simplix-react): the page patterns, layouts, notices, shell and screen widgets a product's screens are composed from. A product picks one kit and draws every screen with it, so a screen composes kit parts and never places framework components itself.

The repository is for teams that build operations consoles and customer-facing sites on simplix-react. It gives them one place where a screen type is defined, one set of templates the `simplix` CLI generates screens from, and one mockup setup that draws the same screens in Storybook before the product is built.

## Key Features

- **One area, several designs**: a core kit holds an area's behaviour and markup, and each design kit redraws the same parts, so every design of an area has the same screens.
- **Screens from templates**: `simplix scaffold` and `simplix add-page` generate a product's screens from the kit's templates, and a template names the kit only through `{{@kit.package}}`.
- **Parity checked by machine**: a harness generates a project from every template for every kit, compiles it, mounts it, and compares the kits of one area file by file.
- **Mockups drawn with the product's kit**: `@simplix-react-ui-kits/mockup` runs a mockup root's Storybook and refuses a screen that is not drawn with the kit.
- **One version**: every package is released together under the repository's version.

## Packages

| Package | Kind | Description |
| --- | --- | --- |
| `@simplix-react-ui-kits/console-core` | core kit | The parts every console design shares: page pattern, layout, notices, shell, screen widgets, and the console screen templates |
| `@simplix-react-ui-kits/console-classic` | design kit | Operations console in the framework's classic look |
| `@simplix-react-ui-kits/console-clarity` | design kit | Operations console with hairline borders, one accent, and hierarchy from type weight and spacing |
| `@simplix-react-ui-kits/site-core` | core kit | The parts every web site design shares: the site shell, the page column, head and section, the pricing parts, and the site templates |
| `@simplix-react-ui-kits/site-clarity` | design kit | Web site in the clarity look, reading the `--site-*` variables a product sets |
| `@simplix-react-ui-kits/mockup` | tool | The Storybook preview and preset of a mockup root, the `simplix-mockup` commands, and the generator of a new root |

`packages/` holds the kits and `tools/` holds the installable packages that are not kits.

## Quick Start

Add a console kit to a simplix-react product and generate a screen for the `project` entity:

```bash
pnpm add @simplix-react-ui-kits/console-clarity
```

```css
/* apps/<app>/src/index.css */
@import "@simplix-react-ui-kits/console-clarity/styles/app.css";
```

```ts
// simplix.config.ts
import { defineConfig } from "@simplix-react/cli";

export default defineConfig({
  templates: { from: "@simplix-react-ui-kits/console-clarity" },
});
```

```bash
simplix kit-fence --write                      # refuse the framework imports the kit fences
simplix scaffold project --module projects     # list, form, detail, page, route and menu entry
```

[Quick Start](docs/en/getting-started/quick-start.md) walks through each step and its result.

## Documentation

| Section | Read it to |
| --- | --- |
| [Getting Started](docs/en/getting-started/README.md) | Learn what a kit is, install one, and generate a first screen |
| [Core Concepts](docs/en/core-concepts/README.md) | Understand kits and designs, screen templates, mockup roots, and how a console page and list are drawn |
| [Guides](docs/en/guides/README.md) | Use a kit in a product, generate screens, create a mockup root, change a kit, release |
| [Tutorials](docs/en/tutorials/README.md) | Build a mockup root with one screen, step by step |
| [Reference](docs/en/reference/README.md) | Look up the `simplix-mockup` commands, `mockup.config.json`, the kit manifest keys and the workspace scripts |

The documentation is written in English ([docs/en](docs/en/README.md)) and in Korean ([docs/ko](docs/ko/README.md)), with the same documents in both.

Package documents: [site-clarity](packages/site-clarity/README.md), [site-core](packages/site-core/README.md), [mockup](tools/mockup/README.md).

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

No license file is published in this repository yet.
