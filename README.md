# simplix-mockup-kit

The shared, product-independent part of a simplix-react mockup environment. A mockup root adds it as a git submodule pinned to a tag; the `simplix-mockup` skill (`simplix-mockup-skill`) describes how to use it.

## Contents

| Path | Contents |
| --- | --- |
| `scaffold/` | Files copied into a new mockup root: `package.json`, Vite and Tailwind v4 config, a `mockup.config.ts` sample |
| `checks/` | Machine checks: token extraction, token check, captures, pixel diff |
| `ds/base/` | Mock counterparts of the framework's controls, inputs, display, feedback, overlay and navigation components |
| `ds/crud/` | Mock counterparts of `CrudList.*` · `CrudDetail.*` · `ListDetail` · `FilterBar` · `PageHeader` · `PanelHeader` · `EditorFooter` · `SectionShell` |
| `gallery/` | Token pages and every kit component in every state |
| `reference-harness/` | Renders the real framework components for pixel diffs |
| `FRAMEWORK_VERSION` | The simplix-react version the kit reproduces |

Product-specific layers stay in the mockup root: `tokens/`, `ds/console/`, `ds/custom/`, `templates/`, `screens/`, `fixtures/`.

## Versions

Tags follow `v<simplix-react version>.<n>`, for example `v1.4.0.2` is the third kit release reproducing simplix-react 1.4.0. A mockup root pins one tag and records it in its `mockup.config.ts`.

## Usage

```bash
git submodule add https://github.com/simplecore-inc/simplix-mockup-kit.git kit
git -C kit checkout <tag>
```
