# Contributing to simplix-react-ui-kits

The rules that bind every change are in [AGENTS.md](AGENTS.md). This page is the practical side: how to set up, what to run, and where a change goes.

## Development Setup

### Prerequisites

- Node.js 20 or later
- pnpm 10
- A simplix-react checkout beside this repository (`../simplix-react`)
- A local Chrome or Chromium, for the rendered checks

### Getting Started

```bash
git clone https://github.com/simplix-framework/simplix-react-ui-kits.git
cd simplix-react-ui-kits
pnpm install
pnpm local:status
```

### Development Workflow

```bash
pnpm typecheck    # type checking
pnpm lint         # imports, cycles, design kits against core kits, versions, each package's lint
pnpm test         # package tests, template harness, parity, a mockup root per kit
```

[Work on the Kits](docs/en/guides/work-on-the-kits.md) describes each command and what to regenerate after a change.

## Repository Structure

```text
packages/     the kits: <area>-core and <area>-<design>
tools/        installable packages that are not kits (mockup)
testing/      the workspace's own checks, never published
scripts/      sync-design-kits.mjs, sync-version.mjs
docs/         en/ and ko/, the same documents in both; figures/ and assets/diagrams/
```

## Making Changes

| The change | Goes into |
| --- | --- |
| A part, a screen type, a template | The area's core kit. See [Add a Screen Part](docs/en/guides/add-a-screen-part.md) |
| A look | A design kit's spec, then its generated stylesheet |
| Code that is not design | simplix-react, not a kit |
| A value of one product | That product, never a kit or the mockup package |
| A mockup command or the preview | `tools/mockup` |

A generated file is regenerated, never edited: a stylesheet by `pnpm design:css`, a design kit's export entries by `node scripts/sync-design-kits.mjs`, a package version by `node scripts/sync-version.mjs`, a figure by its module under `docs/figures/`.

## Documentation

- The documents live in `docs/en` and `docs/ko`, at the same paths. Change both in the same change.
- Each document is one Diataxis type: a tutorial, a guide, a reference or an explanation.
- A figure is drawn by a module under `docs/figures/` with the svg-diagrams document-figure library, once per language. Edit the module, build, and run the library's `verify.py`; never edit the SVG.
- `README.md` and `docs/en` are written in English, `docs/ko` in Korean.

## Commit Messages

Conventional commits in English: `type(scope): description`.

## Versioning

Every package is released together under the root version. Add what your change ships to the `Unreleased` section of [CHANGELOG.md](CHANGELOG.md). See [Release](docs/en/guides/release.md).
