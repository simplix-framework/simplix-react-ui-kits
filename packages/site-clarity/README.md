# @simplix-react-ui-kits/site-clarity

The web site kit in the clarity design: the site parts of `@simplix-react-ui-kits/site-core` drawn with hairline borders, one accent and hierarchy from type. It re-exports site-core segment by segment (`/account`, `/action`, `/auth`, `/checkout`, `/form`, `/help`, `/install`, `/legal`, `/link`, `/marketing`, `/page`, `/pricing`, `/shell`) and adds the stylesheet, the variables it reads, the page region contract and the rendered checks.

## Using it in an app

```css
/* the app's stylesheet */
@import "tailwindcss";
@import "@simplix-react/ui/theme.css";
@import "@simplix-react-ui-kits/site-clarity/styles/app.css";
@import "./site-theme.css"; /* the product's values for the variables below */
```

The parts carry no classes of their own: every element is marked with `data-slot`, and `styles/designs/clarity.css` draws each slot with Tailwind utilities that read the site variables. The window (`SiteWindow`) is the `page` container, so the parts reflow on the page tiers (`page-narrow` 620px, `page-medium` 900px, `page-wide` 1200px, declared in `styles/site-tokens.css` as `--container-page-*`) by the window's width, not the viewport's.

```tsx
import { SiteWindow, SiteBar, SiteFooter } from "@simplix-react-ui-kits/site-clarity/shell";
import { SitePage, SitePageHead } from "@simplix-react-ui-kits/site-clarity/page";

<SiteWindow
  page="pricing"
  linkComponent={RouterLink}
  title={(heading) => t("shell.documentTitle", { page: heading })}
  bar={<SiteBar … />}
  footer={<SiteFooter … />}
>
  <SitePage>
    <SitePageHead title={t("pricing.title")} lede={t("pricing.lede")} />
    …
  </SitePage>
</SiteWindow>;
```

Every label is a prop: the kit ships no strings, and the product passes its own catalogue's text in each language. `title` writes the document title from the text of the page's heading after every drawing, so a tab, a bookmark and the history name the page; left out, the document keeps the title its HTML gives.

## Variables

`styles/site-tokens.css` defines every variable the stylesheet reads, with a default that falls back to the framework theme token named in it. A product writes its own values for the same names after the kit's stylesheet; a value it leaves unset keeps the default. `tests/stylesheet.test.ts` fails when the stylesheet reads a variable this list does not define or document.

| Variable | What it draws | Default |
| --- | --- | --- |
| `--site-canvas` | the page's ground | `var(--background)` |
| `--site-surface` | bar, footer, cards and the chosen switch option | `var(--card)` |
| `--site-surface-sunken` | switch track, hovered quiet controls | `var(--muted)` |
| `--site-surface-raised` | a dialog and an open select's list | `var(--site-surface)` |
| `--site-line` | every hairline: bar, footer, cards, table rules | `var(--border)` |
| `--site-control-line` | the border of every control the kit draws: fields, selects, checkboxes, switches, code cells | `var(--input)` |
| `--site-ink` | body text and headings | `var(--foreground)` |
| `--site-ink-muted` | ledes, notes, captions, table values | `var(--muted-foreground)` |
| `--site-ink-disabled` | a disabled action's label | `var(--muted-foreground)` |
| `--site-ink-faint` | the dashed outline of a draft field still to fill | `var(--border)` |
| `--site-control-disabled` | a disabled action's ground | `var(--muted)` |
| `--site-accent` | the one accent: primary action, highlighted offer, checks | `var(--primary)` |
| `--site-on-accent` | text on the accent | `var(--primary-foreground)` |
| `--site-accent-strong` | primary action under the pointer, a checked control's border and fill under the pointer | `var(--primary)` |
| `--site-accent-text` | accent text: a quiet action, an avatar initial, a link or mark drawn in the accent | `var(--site-accent-strong)` |
| `--site-accent-soft` | avatar ground, quiet action under the pointer | `var(--accent)` |
| `--site-voice` | the voice colour: a hero's accent line, the play toggle, a playing sample | `var(--site-accent)` |
| `--site-on-voice` | text and glyphs on the voice colour | `var(--site-on-accent)` |
| `--site-voice-strong` | the play toggle under the pointer | `var(--site-accent-strong)` |
| `--site-voice-soft` | a playing sample's ground, the word being read | `var(--site-accent-soft)` |
| `--site-voice-text` | the word being read | `var(--site-accent-strong)` |
| `--site-wave-rest` | a wave's bars not yet played | `var(--border)` |
| `--site-good` | a finding that passed, its chip and verdict | `var(--success-text)` |
| `--site-good-soft` | a good chip's ground | `var(--success)` at 14% |
| `--site-warn` | a chip that asks for care | `var(--warning-text)` |
| `--site-warn-soft` | its ground | `var(--warning-text)` at 14% |
| `--site-bad` | a finding that blocks, its chip and verdict | `var(--destructive-text)` |
| `--site-bad-soft` | a bad chip's ground | `var(--destructive)` at 14% |
| `--site-font-sans` | the text family | `var(--font-sans)` |
| `--site-font-display` | the display family: page titles, prices, display headings | `var(--font-sans)` |
| `--site-font-mono` | the mono family: a hero eyebrow, step numbers | `var(--font-mono)` |
| `--site-fs-base` | the window's text size | `13px` |
| `--site-lh-base` | the window's line height | `19.5px` |
| `--site-fw-base` | the window's weight | `400` |
| `--site-fs-body` | a page lede | `14px` |
| `--site-lh-body` | a page lede's line height | `22px` |
| `--site-fs-body-pane` | bar links, actions, pitches, questions | `13px` |
| `--site-lh-body-pane` | their line height | `20px` |
| `--site-fs-caption` | notes, features, footer, small actions, switch options | `12px` |
| `--site-lh-caption` | their line height | `16px` |
| `--site-fw-caption` | their weight | `500` |
| `--site-fs-label` | the highlight badge, an eyebrow | `11px` |
| `--site-lh-label` | their line height | `14px` |
| `--site-tracking-label` | their letter spacing | `0.02em` |
| `--site-fs-heading` | a heading inside a page part | `16px` |
| `--site-lh-heading` | its line height | `24px` |
| `--site-lh-reading` | the line height of a sentence read along | `26px` |
| `--site-fs-notes` | a text of several lines (`SiteTextarea`) | `13.5px` |
| `--site-lh-notes` | its line height | `24px` |
| `--site-fs-input` | a text field (`SiteInput`, `SiteTextarea`) at the narrow page tier, so a phone browser does not zoom into it | `16px` |
| `--site-lh-input` | its line height at the narrow tier | `24px` |
| `--site-fs-digits` | a code cell's digit (`CodeField`) | `20px` |
| `--site-lh-digits` | its line height | `24px` |
| `--site-fw-digits` | its weight | `600` |
| `--site-fs-subheading` | offer names, section headings | `14px` |
| `--site-lh-subheading` | their line height | `20px` |
| `--site-fs-headline` | a display section heading (`SiteSection size="lg"`) | `23px` |
| `--site-lh-headline` | its line height | `26px` |
| `--site-fs-stat` | a price | `24px` |
| `--site-lh-stat` | its line height | `28px` |
| `--site-fw-stat` | its weight | `750` |
| `--site-fs-title` | the page title | `26px` |
| `--site-lh-title` | its line height | `32px` |
| `--site-fw-title` | its weight, and a display heading's | `700` |
| `--site-fs-display` | a hero title on a narrow page | `34px` |
| `--site-lh-display` | its line height | `40px` |
| `--site-fs-display-xl` | a hero title | `44px` |
| `--site-lh-display-xl` | its line height | `48px` |
| `--site-fw-display` | a hero title's weight | `750` |
| `--site-fw-strong` | the current link, actions, names, the chosen option | `600` |
| `--site-fw-bold` | a receipt's title and a payment method's name and mark | `700` |
| `--site-tracking-display` | letter spacing of the display family | `-0.025em` |
| `--site-tracking-stat` | letter spacing of a stat figure drawn without the display spacing (the refund calculator amount) | `-0.02em` |
| `--site-tracking-wide` | letter spacing of a mono eyebrow | `0.025em` |
| `--site-tracking-code` | letter spacing of a code to type | `0.1em` |
| `--site-page-wide` | the page column's widest measure | `var(--container-page-wide)` |
| `--site-control` | an action's height | `34px` |
| `--site-control-sm` | a small action's and a switch option's height | `28px` |
| `--site-control-lg` | a hero action's height | `42px` |
| `--site-code-cell` | a code cell's width, which shrinks evenly in a narrow column | `48px` |
| `--site-radius-xs` | footer and breadcrumb link focus corners | `4px` |
| `--site-radius-sm` | switch options, menu items | `6px` |
| `--site-radius-md` | actions, bar links, the switch track, the more menu | `8px` |
| `--site-radius-lg` | a hero action | `10px` |
| `--site-radius-xl` | cards, offer rows, the price table | `12px` |
| `--site-radius-2xl` | a raised player card | `16px` |
| `--site-radius-full` | the highlight badge, the avatar | `9999px` |
| `--site-recede` | the opacity of a bar link that is not the current page | `0.7` |
| `--site-faint` | a feature an offer leaves out, a disabled switch option | `0.4` |
| `--site-dim` | a control that cannot be used now (the comparison while the previous version shows) | `0.45` |
| `--site-fade` | a choice that cannot be taken now (the current plan in a plan change) | `0.5` |
| `--site-duration-fast` | hover and press transitions | `120ms` |
| `--site-duration-base` | a switch thumb's travel | `220ms` |
| `--site-ease` | their easing | `cubic-bezier(0.2, 0.8, 0.2, 1)` |
| `--site-focus-ring` | the keyboard focus ring | a 2px surface gap, then a 2px accent ring |
| `--site-focus-ring-inset` | the focus ring inside a part that clips its edge (a row of a ruled list) | a 2px accent ring inside |
| `--site-shadow-float` | the more menu | `0 10px 30px` at 22% |
| `--site-shadow-accent` | the highlighted offer | `0 2px 8px` of the accent at 28% |
| `--site-shadow-window` | a raised player card | `0 14px 40px` at 32% and a 1px line |
| `--site-slider-size` | the line a slider takes presses on, as tall as the thumb's reach | `20px` |
| `--site-slider-track-size` | a slider track's thickness | `4px` |
| `--site-slider-thumb-size` | a slider thumb's diameter | `16px` |
| `--site-slider-thumb-ring` | the width of the thumb's ring | `2px` |
| `--site-slider-press` | the scale of a thumb while it is pressed or dragged | `1.12` |
| `--site-slider-track` | a slider track's ground | `var(--site-surface-sunken)` |
| `--site-slider-track-line` | the hairline inside the track's edge | `var(--site-line)` |
| `--site-slider-fill` | the track up to the value | `var(--site-accent)` |
| `--site-slider-thumb` | the thumb's ground | `var(--site-surface)` |
| `--site-slider-thumb-line` | the thumb's ring | `var(--site-accent)` |
| `--site-slider-thumb-hover` | the thumb's ground under the pointer | `var(--site-accent-soft)` |
| `--site-dark-canvas` | a dark band's ground (`data-band="dark"`) | `var(--sidebar)` |
| `--site-dark-surface` | a dark band's cards and chosen options | `var(--sidebar)` |
| `--site-dark-surface-sunken` | a dark band's sunken ground | `var(--sidebar-accent)` |
| `--site-dark-line` | a dark band's hairline | `transparent` |
| `--site-dark-ink` | a dark band's text | `var(--sidebar-foreground)` |
| `--site-dark-ink-muted` | a dark band's muted text | `var(--sidebar-foreground)` |
| `--site-dark-accent` | a dark band's accent | `var(--sidebar-primary)` |
| `--site-dark-on-accent` | text on a dark band's accent | `var(--sidebar-primary-foreground)` |
| `--site-dark-accent-strong` | a dark band's strong accent | `var(--sidebar-primary)` |
| `--site-dark-accent-text` | a dark band's accent text | `var(--site-dark-accent-strong)` |
| `--site-dark-accent-soft` | a dark band's soft accent | `var(--sidebar-accent)` |
| `--site-dark-voice-soft` | a dark band's voice ground | `var(--site-dark-accent-soft)` |
| `--site-dark-voice-text` | a dark band's word being read | `var(--site-dark-accent-strong)` |
| `--site-dark-wave-rest` | a dark band's wave rest colour | `var(--site-dark-line)` |
| `--site-dark-shadow-window` | a dark band's raised card | `0 16px 44px` at 50% and a 1px accent line |
| `--site-dark-bar-ink` | the bar's text over a dark band, which may differ from the band's own | `var(--site-dark-ink)` |
| `--site-dark-surface-raised` | a dark ground's dialogs and open lists | `var(--site-dark-surface)` |
| `--site-dark-control-line` | a dark ground's control borders | `var(--site-control-line)` |
| `--site-dark-control-disabled` | a dark ground's disabled action ground | `var(--site-control-disabled)` |
| `--site-dark-ink-disabled` | a dark ground's disabled action label | `var(--site-ink-disabled)` |
| `--site-dark-good` | a dark ground's good colour | `var(--site-good)` |
| `--site-dark-good-soft` | its soft ground | `var(--site-good-soft)` |
| `--site-dark-warn` | a dark ground's warn colour | `var(--site-warn)` |
| `--site-dark-warn-soft` | its soft ground | `var(--site-warn-soft)` |
| `--site-dark-bad` | a dark ground's bad colour | `var(--site-bad)` |
| `--site-dark-bad-soft` | its soft ground | `var(--site-bad-soft)` |
| `--site-dark-shadow-float` | a dark ground's raised card and menu | `var(--site-shadow-float)` |

Inside an element marked `data-band="dark"` (`SiteBand`, `HeroBand` with `tone="dark"`, `SiteBar` with `tone="dark"`, and `AuthPage` with `scheme="dark"`), the ground, surface, ink, line, accent, voice, wave, raised-card, control, disabled, state-tone, float and slider colour variables take the `--site-dark-*` values, so the same rules draw on the dark ground. The bar over a dark band draws its text in `--site-dark-bar-ink`.

## Page region contract

`regions.json` names, per site page type, the regions in drawing order, the part that fills each and the prop that feeds it (`slot`), the `data-slot` marks that place an element in it, the named parts inside it a rendered check measures, and the controls it may hold. A type is `ready` when the kit draws every region it lists; the others are `planned` with the reason.

| Type | Status | Regions |
| --- | --- | --- |
| `pricing` | ready | bar, pageHead, switches, plans, offers, priceTable, questions, footer |
| `marketing` | ready | bar, hero, compare, steps, footer |
| `install` | ready | bar, pageHead, notice, check, downloads, installSteps, video, troubleshooting, symptoms, caption, footer |
| `help` | ready | bar, search, categories, articles, contact, footer |
| `article` | ready | bar, breadcrumb, docHead, contents, doc, footer |
| `legal` | ready | bar, breadcrumb, docHead, contents, doc, footer |
| `account` | ready | bar, sectionNav, accountSection, footer |
| `checkout` | ready | bar, stepper, checkout, done, footer |
| `auth` | ready | authCard |
| `packs` | ready | bar, packs, footer |

`tests/slot-styles.test.ts` refuses a slot style whose base, or one of whose variant values, sets one property twice (two border colours, two directions): the stylesheet's order, not the class order, would decide which one draws, so an override goes in a variant.

`node scripts/check-site-regions.mjs` holds the contract to the slots site-core declares (`pnpm lint`, `design:check`), and `--selftest` proves it on a broken contract. A part that names an enabled action is `site-action:not(:disabled)`, never `:enabled`: the action is a link or a button, `:enabled` matches only a form control, and only a button is disabled; the check refuses the `:enabled` form.

## Rendered checks

`scripts/site-regions-rendered.mjs` exports `probe`, `judge`, `compare` and `byRegion`:

```js
import { contract, probe, judge, compare, byRegion } from "@simplix-react-ui-kits/site-clarity/scripts/site-regions-rendered.mjs";

const signature = await page.evaluate(probe, { contract, type: "pricing" });
judge(signature, "pricing"); // [] when the regions are in the contract's order and hold only their controls
const reference = await other.evaluate(probe, { contract, type: "pricing", selectors }); // a page without site marks
compare(reference, signature); // ["plans.card padding: reference 16px | build 12px", ...]
```

`probe` reads, inside the page root, the regions in drawing order, the controls each holds and, for the frame, every region and every named part, the computed first font family, size, weight, line height, letter spacing, colour, background, borders, radius, shadow, padding, gap, opacity, an SVG shape's fill, maximum width, grid columns, and the layout height and width (offset sizes, so a reference painted inside a scaled frame reads at its layout size; an SVG element's painted box is divided by the scale the root is painted at). A mark names a slot or a part: a site part drawn over a framework part (a checkbox, a select) keeps the framework's `data-slot` and carries the site name as `data-part`, and a control is listed by its part mark first. `selectors` stands CSS selectors in for the marks when the reference page carries none. `compare` requires colours, type, borders, radii, shadows, fills and spacing to be equal and a height, and a width the layout decides (`widthParts`: the frame and each region's `widths` in regions.json), to agree within 1px.

`scripts/site-demo.mjs` renders the kit's verification pages: each `tests/fixtures/<name>-page.tsx` is a page composed from the parts (pricing, marketing, ...), rendered on the server and drawn with the stylesheet compiled the way an app's Tailwind compiles it, with the product values of `tests/fixtures/theme.css`. The fixtures carry the reference's words in English and Korean (`props.locale`). The account, checkout, sign-in and packs fixtures draw blocks read off the rendered reference per story and language (`account-copy.json`, `checkout-copy.json`, `auth-copy.json`, `packs-copy.json`: the reference product's own words, product names and Hangul included, kept because where a line wraps is measured); `tests/` is outside the package's `files`, so none of it ships, and `src` names no product.

```bash
node scripts/site-demo.mjs --out page.html --fixture marketing --props '{"locale":"ko"}'   # write a page
node scripts/site-demo.mjs --probe --fixture pricing --width 1440                       # open it in ego-browser, print the regions and the verdict
node scripts/site-demo.mjs --measure    # hold every page the measure files record to its recorded look
node scripts/site-demo.mjs --selftest   # the same, plus each page with a planted card radius that must be found on the carded regions that draw a card on that page
```

The measure files record the reference design's signature per page: `measure.json` (pricing at 1440, 1024 and 800 wide, a phone, signed in, and the bar over a dark band) and `measure/<type>.json` for the other page types (each at 1440, 1024, 800 and a phone, in English and Korean, and in the states the parts draw). An entry names its page type, its fixture when the type's name is not it, its props, the viewport and the page-root width; `--measure` renders the fixture with those props at that width, with the reference window's height as the root's least height (a reference shorter than its frame fills the frame; a taller build still grows, and the column's own height is compared), and prints every difference.

`scripts/record-measure.mjs` reads a measure file's pages from their reference stories again. Each entry's story is opened on the reference Storybook at the entry's viewport in the light scheme and read through the product's stand-ins for the parts its reference draws without a site mark (`--selectors`: a module and an export, an object or a function of the entry; the product's parity runner reads the same stories through the same module, so a recording and a parity reading agree). The fixture is then drawn at the reading's page-root width in the same browser. Every difference from the recorded signature and from the fixture is printed; `--record` writes the reading of each page whose reference drew and whose fixture equals it, so `--measure` holds what it records. `--expect <regex>` refuses a page with a difference from the record the pattern does not name. The browser is a headless Chromium (an agent-browser session, or the endpoint `--cdp` names), which draws classic scrollbars: a story that scrolls inside its frame lays its root out narrower by the scrollbar, as the recorded pages were read, where a headed browser following a system set to overlay scrollbars reads those roots wider.

```bash
node scripts/record-measure.mjs --file measure/account.json --origin http://localhost:6006 --selectors <stand-ins>.mjs#<export>                       # print what moved
node scripts/record-measure.mjs --file measure/account.json --origin http://localhost:6006 --selectors <stand-ins>.mjs#<export> --only <name> --record  # write it
```
