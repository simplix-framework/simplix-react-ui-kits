# How to Generate Screens

> Generate a product's screens from its kit's templates instead of writing them by hand.

## Before You Begin

- The product names its kit in `simplix.config.ts` (`templates.from`). See [Use a Kit in a Product](/en/guides/use-a-kit-in-a-product.md).
- The entity exists in a domain package.

## Solution

### A list screen with its record

```bash
simplix scaffold project --module projects
```

This writes the list, the form and the detail of `project` into the module's widgets, the page that holds them, its route and its menu entry.

### The decisions of the screen's design

Pass what the design decided, so the generated screen starts from it:

| Option | Decides |
| --- | --- |
| `--list-presentation <table\|cards>` | How the list draws its rows (default `table`) |
| `--view-toggle` | Offer a table list the reader's switch to cards |
| `--card-title <column>` | The column that titles a card (default: the first) |
| `--status-badge <field>` | The field the detail header draws as the record's badge |
| `--text-filter <fields>` | Comma separated text fields that each get a filter |
| `--menu-group <key>` | The menu group the entry joins |
| `--menu-icon <name>` | The icon the menu entry draws |
| `--blocks` | Also lay down `page.blocks.tsx`, the file where the screen departs from its template |

```bash
simplix scaffold task --module tasks --list-presentation cards --card-title title --status-badge completed --blocks
```

### A page of another kind

```bash
simplix add-page <kind> <name> --module <module>
simplix add-page <kind> <name> --app <app>
```

| Kind | Draws |
| --- | --- |
| `record-page` | One record on a page of its own |
| `dashboard-page` | Cards in the dashboard grid |
| `static-page` | Fixed content |
| `error-page` | A not-found or failure page |
| `auth-page` | A sign-in page |
| `app-shell` | The app's window, laid down once |

```bash
simplix add-page dashboard-page home --module overview
simplix add-page app-shell console --app admin --variant top-bar
```

`--variant <name>` draws another shape of the kind, from `<kind>.<variant>.hbs`. `--dry-run` prints every file the page would write and writes nothing.

## Variations

### A site page

An app whose `templates.from` names `site-clarity` generates the site's page kinds and variants: `static-page` with the variants `doc`, `packs`, `checkout`, `checkout-done`, `account` and `account-section`.

```bash
simplix add-page static-page pricing --app portal --variant packs
```

### A shape of your own

Put a template of the same name under the product's `.simplix/templates/` (or `.simplix/templates/<app>/`). The CLI takes it before the kit's. A shape several products need belongs in the kit instead: see [Add a Screen Part](/en/guides/add-a-screen-part.md).

### A board frame beside the screen

When the app's `templates.storiesDir` names a directory, each generated page also writes its Storybook frame there, so a mockup root draws the same screen.

## Related

- [Screen Templates](/en/core-concepts/screen-templates.md)
- [Console Lists](/en/core-concepts/console-lists.md)

---

<p class="page-source"><a href="https://github.com/simplix-framework/simplix-react-ui-kits/blob/main/docs/en/guides/generate-screens.md" target="_blank" rel="noopener noreferrer">View source</a></p>
