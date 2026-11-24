# How to Use a Kit in a Product

> Make a simplix-react product draw every screen with one kit, and keep it from bypassing the kit.

## Before You Begin

- A simplix-react product with `simplix.config.ts`
- A kit installed in one of the three ways in [Installation](/en/getting-started/installation.md)

## Solution

### 1. Name the kit

```ts
// simplix.config.ts
import { defineConfig } from "@simplix-react/cli";

export default defineConfig({
  templates: { from: "@simplix-react-ui-kits/console-clarity" },
});
```

### 2. Import the stylesheet and register your sources

```css
/* apps/<app>/src/index.css */
@import "@simplix-react-ui-kits/console-clarity/styles/app.css";

/* Your own theme values come after the kit's, so they win. */
@import "./styles/theme.css";

@source "../../../modules/*/src/**/*.{ts,tsx}";
```

### 3. Wrap the app in the kit's providers

```tsx
import { ConsoleProviders } from "@simplix-react-ui-kits/console-clarity/shell";

export function App({ children }: { children: React.ReactNode }) {
  return (
    <ConsoleProviders namespace="project-console" i18nAdapter={i18nAdapter} auth={auth} accessPolicy={accessPolicy}>
      {children}
    </ConsoleProviders>
  );
}
```

`namespace` is the name the operator's preferences are stored under. It is required, so two apps never share one key by accident.

### 4. Fence the framework imports

```bash
simplix kit-fence --write     # write the kit's fence into .oxlintrc.json
simplix kit-fence             # fail when the lint configuration and the kit disagree
```

Run the second form in the product's lint, so a kit update that changes the fence is noticed.

### 5. Import parts from the kit's entries

```tsx
import { RecordList } from "@simplix-react-ui-kits/console-clarity/entity";
import { StatusBadge } from "@simplix-react-ui-kits/console-clarity/badge";
```

A console kit's entries: `/api`, `/attachment`, `/badge`, `/clipboard`, `/dashboard`, `/datetime`, `/entity`, `/error`, `/i18n`, `/identity`, `/layout`, `/manual`, `/mock`, `/notice`, `/page`, `/peek`, `/process`, `/screen`, `/shell`.

## Variations

### Several apps, different kits

Name a kit per app. An app without its own entry takes the top-level one:

```ts
export default defineConfig({
  templates: { from: "@simplix-react-ui-kits/console-clarity" },
  apps: {
    portal: { templates: { from: "@simplix-react-ui-kits/site-clarity" } },
  },
});
```

### Change the design

Change the package name in `templates.from`, in the stylesheet import and in the imports of your screens. Both console designs export the same names from the same entries, so nothing else changes.

### Supply a product value

A kit names no product. A value of yours reaches a part through a prop or a provider: the brand through the shell's parts, a status tone through the tone table you hand to `StatusBadge`. A tone table keyed by one of your domain enums belongs in your product, typed with the kit's `StatusVariant`.

## Related

- [Generate Screens](/en/guides/generate-screens.md)
- [Kits and Designs](/en/core-concepts/kits-and-designs.md)

---

<p class="page-source"><a href="https://github.com/simplix-framework/simplix-react-ui-kits/blob/main/docs/en/guides/use-a-kit-in-a-product.md" target="_blank" rel="noopener noreferrer">View source</a></p>
