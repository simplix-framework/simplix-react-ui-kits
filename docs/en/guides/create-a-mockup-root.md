# How to Create a Mockup Root

> Give a product a Storybook of its screens, drawn with the product's UI kit and checked by machine.

## Before You Begin

- A simplix-react checkout on the machine. A mockup root renders the framework's sources and pins its libraries from the checkout's lockfile.
- A checkout of this repository, or the published `@simplix-react-ui-kits/mockup`.

## Solution

### 1. Generate the root

From a checkout of this repository beside the product:

```bash
node ../simplix-react-ui-kits/tools/mockup/bin/simplix-mockup.mjs init-mockup \
  --root mockup --name @project/mockup \
  --ui-kit @simplix-react-ui-kits/console-clarity \
  --framework ../simplix-react \
  --ui-kit-version link:../../simplix-react-ui-kits/packages/console-clarity \
  --mockup-version link:../../simplix-react-ui-kits/tools/mockup
```

A `link:` path is relative to the root. The generator writes `package.json`, `mockup.config.json`, `tsconfig.json`, `.storybook/`, `src/index.css`, `tokens/tokens.css` and the `fixtures/`, `screens/` and `locales/` directories. It never overwrites a file that exists.

### 2. Install and start

```bash
cd mockup
pnpm install
pnpm storybook
```

### 3. Draw a screen

```tsx
// screens/projects.stories.tsx
import type { Meta, StoryObj } from "@storybook/react";
import { StatusBadge } from "@simplix-react-ui-kits/console-clarity/badge";
import { useMockupSettings } from "@simplix-react-ui-kits/mockup/settings";

function Projects() {
  const { locale } = useMockupSettings();
  return <StatusBadge enumName="ProjectStatus" value="active" variantMap={{ active: "success", archived: "secondary" }} />;
}

const meta: Meta<typeof Projects> = { title: "Projects/List", component: Projects };
export default meta;
export const Default: StoryObj<typeof Projects> = {};
```

A screen imports only its UI kit, React, Storybook types, its fixtures and locales, and the settings hook, and writes no `className` or `style`.

### 4. Check the root

```bash
pnpm check
```

The generated `check` runs `check-screens`, the type check, `check-designs`, `check-imports` and `check-versions`.

## Variations

### Inside the product's pnpm workspace

Pass `--workspace <workspace root>`. Every library that workspace's catalog pins becomes a `catalog:` dependency, so the root renders exactly what the product's apps render. Leave out `--ui-kit-version` and `--mockup-version`: the default is `workspace:*`.

### On the published framework

Pass `--framework-version <x.y.z>`. The root depends on the published `@simplix-react/*` packages instead of rendering a checkout.

### Stages that all run

A chain of commands joined by `&&` stops at the first failure and hides the stages behind it. Declare the stages in `mockup.config.json` and run them with `run-stages`, which runs every stage and reports every failure together:

```json
{
  "checkStages": [
    { "name": "check-screens", "command": "simplix-mockup check-screens" },
    { "name": "typecheck", "command": "tsc --noEmit -p tsconfig.json" },
    { "name": "check-versions", "command": "simplix-mockup check-versions" }
  ]
}
```

```json
{ "scripts": { "check": "simplix-mockup run-stages" } }
```

### The product's own tokens

```bash
simplix-mockup extract-tokens --entry ../apps/admin/src/index.css --out tokens
```

This writes `tokens/tokens.css`, `tokens.json` and `source.lock.json` from the product's stylesheet. Never edit a token by hand.

### Captures for hand-off

```bash
simplix-mockup capture --url http://localhost:6006 --out captures --globals "detailPresentation:drawer;locale:ko"
```

### Proving a change left the screens as they were

```bash
simplix-mockup story-digest --url http://localhost:6006 --out before.json
# make the change
simplix-mockup story-digest --url http://localhost:6006 --out after.json
simplix-mockup story-digest --diff before.json after.json
```

## Related

- [Build a Mockup Root with One Screen](../tutorials/first-mockup-screen.md)
- [`simplix-mockup` Commands](../reference/simplix-mockup-commands.md)
- [`mockup.config.json`](../reference/mockup-config.md)
- [Mockup Roots](../core-concepts/mockup-roots.md)
