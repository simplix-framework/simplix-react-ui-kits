# How to Add a Screen Part

> A product needs a part or a screen type the kit lacks. Add it to the area's core kit, so every design of the area has it.

## Before You Begin

- The workspace set up. See [Work on the Kits](/en/guides/work-on-the-kits.md).
- Search the core kit's `src/` for the shape first. A part that exists is used, never written again.
- Read the region contract of the area (`packages/console-core/regions.json`, `packages/site-core/regions.json`): it says which part fills which region and which controls a region may hold.

## Solution

### 1. Write the part in the core kit

Put the component in the segment it belongs to (`packages/console-core/src/<segment>/`). Build it on simplix-react and the kit's own parts. It carries behaviour and markup, and every element that carries a look is marked with `data-slot`:

```tsx
// packages/console-core/src/entity/project-summary.tsx
export function ProjectSummary({ name, taskCount }: { readonly name: string; readonly taskCount: number }) {
  return (
    <section data-slot="project-summary">
      <h3 data-slot="project-summary-name">{name}</h3>
      <p data-slot="project-summary-count">{taskCount}</p>
    </section>
  );
}
```

A part names no product. A product value (a permission subject, a brand mark, a tone per enum value) arrives as a prop or through a provider.

### 2. Declare the base look

Declare each slot's look in the `.style.ts` file beside the part, then regenerate the core's stylesheet:

```bash
pnpm --filter @simplix-react-ui-kits/console-core design:css
```

### 3. Export it from its segment

Add the export to the segment's index. Every design kit re-exports the segment, so the part reaches every design with no further edit.

### 4. Draw it in each design

Where a design draws the slot differently, add the slot to that design's spec and regenerate its stylesheet:

```bash
pnpm --filter @simplix-react-ui-kits/console-clarity design:css
```

`pnpm lint` fails when a design leaves a core slot undrawn or a generated stylesheet is behind its declarations.

### 5. Verify

```bash
pnpm typecheck
pnpm lint
pnpm test
```

## Variations

### A new segment

Add the export entry to the core kit's `package.json` `exports`, then write the matching entry and re-export file into every design kit:

```bash
node scripts/sync-design-kits.mjs
```

### A whole screen shape

A screen shape also gets its template in the core kit's `templates/`, so a product generates it. Name the kit only through `{{@kit.package}}`, `{{@kit.label}}` and `{{@kit.id}}`. The harness must be able to generate the template: assign its name a command in `testing/template-harness/lib/plan.mjs`, and give a generated page that takes required props its props in `testing/template-harness/mount/page-props.mjs`.

```bash
pnpm test:templates
```

### A part that changes what a region holds

Change `regions.json` and the part together. `check-regions.mjs` refuses a value part that draws a control and a boolean slot prop the contract does not list.

### Code that is not design

Formatting, API helpers, clipboard, storage and generic hooks belong in simplix-react, not in a kit.

## Related

- [Kits and Designs](/en/core-concepts/kits-and-designs.md)
- [Screen Templates](/en/core-concepts/screen-templates.md)
- [Console Pages](/en/core-concepts/console-pages.md)

---

<p class="page-source"><a href="https://github.com/simplix-framework/simplix-react-ui-kits/blob/main/docs/en/guides/add-a-screen-part.md" target="_blank" rel="noopener noreferrer">View source</a></p>
