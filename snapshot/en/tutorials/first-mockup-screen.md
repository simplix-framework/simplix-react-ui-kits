# Build a Mockup Root with One Screen

> After completing this tutorial, you will have a Storybook that draws one screen with the `console-clarity` kit, passes the mockup checks, and redraws the screen when you change a toolbar setting.

## Prerequisites

- Node.js 20 or later and pnpm 10
- A checkout of `simplix-react` and a checkout of `simplix-react-ui-kits` in one directory, each installed with `pnpm install`

```text
workspace/
├ simplix-react/
└ simplix-react-ui-kits/
```

## Step 1: Generate the root

From `workspace/`:

```bash
node simplix-react-ui-kits/tools/mockup/bin/simplix-mockup.mjs init-mockup \
  --root project-mockup --name project-mockup \
  --ui-kit @simplix-react-ui-kits/console-clarity \
  --framework simplix-react \
  --ui-kit-version link:../simplix-react-ui-kits/packages/console-clarity \
  --mockup-version link:../simplix-react-ui-kits/tools/mockup
```

Expected output:

```text
mockup root .../project-mockup: created 8 (.storybook/main.ts, .storybook/preview.tsx, .gitignore, mockup.config.json, tokens/tokens.css, tsconfig.json, src/index.css, package.json)
```

## Step 2: Install

```bash
cd project-mockup
pnpm install
```

`node_modules/.bin/simplix-mockup` now exists.

## Step 3: Draw a screen

Create `screens/projects.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react";
import { StatusBadge } from "@simplix-react-ui-kits/console-clarity/badge";
import { useMockupSettings } from "@simplix-react-ui-kits/mockup/settings";

function Projects() {
  const { locale, mode } = useMockupSettings();
  return <StatusBadge enumName="ProjectStatus" value={`${locale}-${mode}`} variantMap={{ "ko-light": "success", "en-dark": "warning" }} />;
}

const meta: Meta<typeof Projects> = { title: "Projects/Status", component: Projects };
export default meta;
export const Default: StoryObj<typeof Projects> = {};
```

## Step 4: Check the root

```bash
pnpm check
```

Expected output, one line per check:

```text
screens: 1 files with @simplix-react-ui-kits/console-clarity, 0 violations, 0 declared exceptions
designs: 0, 0 component overrides, 0 problems
imports: 0 design files scanned, 0 framework imports
versions: ... 0 problems
```

## Step 5: Start Storybook

```bash
pnpm storybook
```

Open `http://localhost:6006` and choose **Projects / Status**. The badge reads `ko-light`.

## Step 6: Change a setting

In the toolbar, set **Locale** to `EN` and **Mode** to `Dark`. The badge reads `en-dark` and the page turns dark: the screen read the toolbar's settings through `useMockupSettings()`.

## Step 7: See a check fail (optional)

Add a class to the screen:

```tsx
return <div className="p-4"><StatusBadge enumName="ProjectStatus" value="ko-light" variantMap={{ "ko-light": "success" }} /></div>;
```

Run `pnpm check`. `check-screens` reports one violation: a screen does not lay itself out. Remove the wrapper and the check passes again.

## Summary

You generated a mockup root, drew a screen with a UI kit, passed the checks, and saw the screen follow the toolbar.

- More options of the generator and the other commands: [Create a Mockup Root](/en/guides/create-a-mockup-root.md)
- Why a screen may not lay itself out: [Mockup Roots](/en/core-concepts/mockup-roots.md)
- Every command: [`simplix-mockup` Commands](/en/reference/simplix-mockup-commands.md)

---

<p class="page-source"><a href="https://github.com/simplix-framework/simplix-react-ui-kits/blob/main/docs/en/tutorials/first-mockup-screen.md" target="_blank" rel="noopener noreferrer">Edit on GitHub</a></p>
