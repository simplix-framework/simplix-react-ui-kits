# Workspace Scripts

## Root

| Script | Runs |
| --- | --- |
| `pnpm build` | The build of every package |
| `pnpm typecheck` | The type check of every package |
| `pnpm lint` | `simplix-declared-imports`, `simplix cycles`, `simplix-em-dash`, `sync-design-kits --check`, `sync-version --check`, then every package's `lint` |
| `pnpm test` | `sync-design-kits --test`, every package's `test`, the template parity of each area, then a mockup root per kit |
| `pnpm test:templates` | The template harness on every kit, then the parity |
| `pnpm test:mockup` | A generated mockup root per kit: install, check, Storybook build |
| `pnpm sync-version` | Writes the root version into every package |
| `pnpm release` | Refuses a `-SNAPSHOT` version; otherwise syncs, builds and publishes. Releases run through the `Release` workflow |
| `pnpm cycles` | Import cycles and package dependency cycles |
| `pnpm check:imports` | Bare imports a package does not declare |
| `pnpm local:link` | Installs with the framework linked to the checkout |
| `pnpm local:unlink` | Installs with the published framework |
| `pnpm local:status` | Prints the resolved link profile and framework path |

## `scripts/`

| Script | Arguments | Does |
| --- | --- | --- |
| `sync-design-kits.mjs` | | Writes each design kit's missing export entries and re-export files |
| | `--check` | Fails where a design kit and its core kit disagree |
| | `--test` | Proves the check on its own hit and miss cases |
| `sync-version.mjs` | | Writes the root version into every package |
| | `--check` | Fails when a package is out of sync |
| | `--set <version>` | Sets the root version, writes it everywhere, and moves `CHANGELOG.md` with it |
| `build-docs.mjs` | | Assembles the documentation site under `build-docs/`, and fails on a link that leads nowhere or a page a sidebar does not list |
| `preview-docs.mjs` | `[--port <port>] [--release <version>...]` | Serves the site as GitHub Pages does, with a folder for each version |
| `prepare-docs.mjs` | `<previous> <built> <output> <version>` | Merges a new build into the published site. The `Deploy Documentation` workflow runs it |

## A kit package

| Script | In | Runs |
| --- | --- | --- |
| `build` | Every package | `tsup`, with entries read from `exports` |
| `typecheck` | Every package | `tsc --noEmit` |
| `lint` | Every package | `oxlint` and the package's own checks, its `design:check` included |
| `test` | Every package | Its unit tests; a kit also generates and mounts its templates |
| `design:css` | A package that holds a stylesheet | Regenerates the stylesheet from its declarations |
| `design:check` | A package that holds a stylesheet | Fails when the stylesheet is behind its declarations |
| `test:kit` | A design kit | The core kit's suite, run on this kit (`KIT_DIR=.`) |
| `test:templates` | A design kit | The template harness on this kit |

## `testing/`

| Path | Does |
| --- | --- |
| `template-harness/harness.mjs <kit dir>` | Generates a project from every template of one kit, then checks the fence, the types and the mounts |
| `template-harness/parity.mjs` | Compares the generated projects of two kits of one area |
| `template-harness/run-all.mjs [--parity-only]` | Every kit at once, then the parity |
| `mockup-root/run.mjs [<kit>...]` | A mockup root per kit: generate, install, check, build Storybook |

## See Also

- [Work on the Kits](/en/guides/work-on-the-kits.md)
- [Release](/en/guides/release.md)

---

<p class="page-source"><a href="https://github.com/simplix-framework/simplix-react-ui-kits/blob/main/docs/en/reference/workspace-scripts.md" target="_blank" rel="noopener noreferrer">View source</a></p>
