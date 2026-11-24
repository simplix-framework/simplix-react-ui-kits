# Contributing to simplix-react-ui-kits

The rules that bind every change are in [AGENTS.md](https://github.com/simplix-framework/simplix-react-ui-kits/blob/main/AGENTS.md). This page is the practical side: how to set up, what to run, and where a change goes.

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

[Work on the Kits](/ko/guides/work-on-the-kits.md) describes each command and what to regenerate after a change.

## Repository Structure

```text
packages/     the kits: <area>-core and <area>-<design>
tools/        installable packages that are not kits (mockup)
testing/      the workspace's own checks, never published
scripts/      sync-design-kits.mjs, sync-version.mjs, and the documentation site (build-docs, preview-docs, prepare-docs)
docs/         en/ and ko/, the same documents in both; figures/ and assets/diagrams/
```

## Making Changes

| The change | Goes into |
| --- | --- |
| A part, a screen type, a template | The area's core kit. See [Add a Screen Part](/ko/guides/add-a-screen-part.md) |
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

### Documentation site

The documents are published as a Docsify site on GitHub Pages, with one folder for each version.

- `docs/site.json` names the site and lists the documents outside `docs/` that become pages. `docs/index.html`, `docs/_coverpage.md` and `docs/_navbar.md` are the frame of the site.
- `docs/en/_sidebar.md` and `docs/ko/_sidebar.md` are the sidebars. Add a new page to both, at the same position.
- A link stays relative, as GitHub reads it. The build rewrites each link to the place its target takes in the site, and fails on a link that leads nowhere.

```bash
node scripts/build-docs.mjs                     # assemble the site under build-docs/
node scripts/preview-docs.mjs --release 0.0.9   # serve it as GitHub Pages does, with a second version to switch to
node --test scripts/tests/docs-site.test.mjs    # the checks of the site tooling
```

The `Deploy Documentation` workflow publishes the site to the `gh-pages` branch. A documentation change on `main` refreshes the `snapshot` folder, and a manual run with a released version such as `0.1.0` builds the tag `v0.1.0` into a folder of that name. The root of the site opens the highest released version, or the snapshot when there is none.

## Commit Messages

Conventional commits in English: `type(scope): description`.

## Versioning

Every package is released together under the root version. Add what your change ships to the `Unreleased` section of [CHANGELOG.md](https://github.com/simplix-framework/simplix-react-ui-kits/blob/main/CHANGELOG.md). See [Release](/ko/guides/release.md).

---

<p class="page-source"><a href="https://github.com/simplix-framework/simplix-react-ui-kits/blob/main/CONTRIBUTING.md" target="_blank" rel="noopener noreferrer">GitHub에서 편집</a></p>
