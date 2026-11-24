# How to Work on the Kits

> Set the workspace up against a simplix-react checkout and run the checks a change has to pass.

## Before You Begin

- Node.js 20 or later and pnpm 10
- A simplix-react checkout beside this repository (`../simplix-react`). The kits' templates are read by the framework's CLI, so the checkout, CLI included, is what the kits build and test against.
- A local Chrome or Chromium for the rendered checks

## Solution

### 1. Install

```bash
cp .simplix-react.sample .simplix-react   # optional: name another framework path
pnpm install
pnpm local:status                         # prints the resolved link profile and framework path
```

The link profile is `auto`: the `@simplix-react/*` packages are linked to the checkout when it exists, and come from the registry otherwise.

### 2. Run the checks

```bash
pnpm typecheck
pnpm lint
pnpm test
```

| Command | Runs |
| --- | --- |
| `pnpm typecheck` | The type check of every package |
| `pnpm lint` | Undeclared imports, import cycles, the em dash check, design kits against their core kits, the version of every package, then each package's own lint (its design check included) |
| `pnpm test` | The design kit sync self-test, every package's tests (each kit generates and mounts its templates), the parity of the kits of each area, then a generated mockup root per kit |

### 3. Regenerate what you changed

| You changed | Run |
| --- | --- |
| A `.style.ts` or a design spec | `pnpm design:css` in the package that holds the stylesheet |
| A core kit's `exports` | `node scripts/sync-design-kits.mjs` |
| The root version | `node scripts/sync-version.mjs` |

## Variations

### One kit's templates only

```bash
pnpm --filter @simplix-react-ui-kits/console-classic test:templates
```

### One kit's mockup root only

```bash
node testing/mockup-root/run.mjs console-clarity
```

### Against the published framework

```bash
pnpm local:unlink     # SIMPLIX_PROFILE=registry
pnpm local:link       # SIMPLIX_PROFILE=local, back to the checkout
```

### Beside another person or agent in the same checkout

Commit by naming your own paths, read the diff before staging, and leave changes that are not yours where they are.

## Related

- [Workspace Scripts](../reference/workspace-scripts.md)
- [Add a Screen Part](./add-a-screen-part.md)
- [CONTRIBUTING](../../../CONTRIBUTING.md)
