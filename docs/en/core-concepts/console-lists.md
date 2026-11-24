# Console Lists

How a console list decides what it draws: which columns survive a narrow pane, whether rows are a table or cards, how filters are built and kept in the address, and how row actions are drawn.

## List columns

A list draws as many columns as its pane holds. The generated column set gives its first four columns no width condition and each later column the width of the set up to it, so a narrower pane drops columns from the end of the field order. A column a screen adds of its own after the leading four (a derived marker) takes the same kind of tier from its place in the order (`ladderColumns`, applied by `RecordList`), so it drops with the others instead of joining the always-drawn set and pushing a table design to cards at a tablet width. These columns never drop, because dropping them leaves the screen unreadable or untrue:

- the leading column, which names the row;
- the column the rows are sorted by (the list's current sort, so it is the default sort until the reader picks another), because a list sorted by a column it does not draw cannot be checked against its own order;
- a column the screen keeps (`keep: true` on the contract field or the column), without which another drawn column reads wrong: a consent's withdrawal beside "granted". Everything kept adds to the narrowest table, so a list whose kept set outgrows its narrowest pane falls to cards;
- the row-action column, which belongs to the table and not to the column set.

A kept column leaves the width ladder and every tier before it grows by the width the kept column now always takes (`keepColumnsDrawn` in `console-core/src/entity/column-priority.ts`, applied by `RecordList`), so the remaining columns still drop from the end and the table does not outgrow the pane. The time column of a log-type list is its default sort column, which is how it stays on screen at every width. A screen whose sort field has no column in its field array is sorted by nothing the reader can see; the field array gets the column. A column's width comes from its contract kind (an enum column is 120px whatever its option labels are), so a column whose longest label is wider than that declares its own `width` in the list and in the board frame, or the label is clipped with an ellipsis.

The columns menu offers every declared column. A column the width dropped is listed unchecked, and switching it on draws it whatever the width, so the table scrolls sideways; switching it off hands it back to the width.

`packages/console-core/scripts/list-columns-rendered.mjs` judges a painted list against this: `probe` reads the drawn headers and the sort mark, `probeMenu` reads the open columns menu, and `compare` checks the sort column and the leading column are drawn, the menu offers every column with the drawn ones checked, and the rest drop from the end. A product's runner opens each list at its page widths and passes the column the list is sorted by, since a dropped column carries no mark. It proves itself with `--selftest` (`pnpm test`).

A `text` field whose value opens something takes `linkOf`, a function from the row to an address: the cell, the card and the detail then draw the value as a link to it (a document version that opens the published text of that version), opening a new tab when the address is on another origin, and draw plain text for a row it answers no address for. The address is the screen's decision; the kit only draws it.

A date or a money value in a cell, a card or a figure tile is drawn by the same contract kind, so a cell and the tile above it agree: a `money` field keeps as many decimals as its stored scale holds, and a count of days is worded by `daysAgoText`, which takes the plural form from the reader's language instead of from a catalogue string.

Three contract kinds cover text a screen would otherwise cut by hand. `prose` is text a person wrote: a list cell or card draws its first `proseLength` characters (200 by default) cut on a word with an ellipsis, and a detail draws the whole text across the panel. `language` writes a stored language code as the language's name in the reader's language, and a code that is not a language tag is drawn as it came. A `boolean` with `markWhenTrue` draws a badge named by the field's own label on the rows it is true of and nothing on the others, with no empty cell on the cards that lack it; a detail still draws yes or no.

## List presentation

A list screen is designed as a table or as cards, and `RecordList` draws either from the same column declarations. `presentation` is `"table"` (the default; the table falls to cards below the width its columns need) or `"cards"`, which draws every row as a card at every width. The card is the one the narrow table already falls to: `record-card.ts` places the title column, the badge row, the labelled lines and the row actions beside the title, so no screen declares a second set of columns for it. `cardTitle` names the column (its `key`) that titles the card, the first column when absent; the other columns keep their order. A `cardTitle` naming no column throws.

Cards sit in a fit grid: as many columns as hold a card no narrower than the `--card-min-width` layout token, each column an equal share of the row, so a detail panel opening beside the list reflows the cards and a pane narrower than one card draws one column. A card's labelled lines are one grid in which a label column is as wide as the longest label, up to the `--console-card-label-max` token, and wraps only past it; the values stand in one column down the card. A line is drawn on every card of the page when some card fills it, with a dash where a card's own value is empty, and on none when no card fills it; a column sets `cardKeep: false` to be drawn only on the cards that have a value, or `cardKeep: true` to be drawn on every card whether or not one has a value, so the cards keep one height whatever the data. The table's sortable headers have no counterpart on a card; a cards list is read in the order of its default sort.

One standard holds for every card list. A list drawn as cards (`presentation="cards"`) always offers the switch to the table, so `viewToggle` is true for it whatever a screen passes, and the reader's choice is remembered per list. A table list offers the switch to cards only where its design entry says its rows are also read as units, with the reason in `list.toggleReason`. The `--card-min-width` layout token (`console-card-min`, 20rem) and the list's own width alone decide the number of columns, every card of every card list has the same column width at the same list width, and a screen sets no card width, no maximum width and no column count. Inside a card the label column is one rule too (the longest label up to the `--console-card-label-max` token), the same on every card list. The rendered region probe measures it: `compareCardGrid` in `scripts/regions-rendered.mjs` holds each card to the column width and to the first card's width, the first card to the list's left padding, and neighbours to the grid gap.

`viewToggle` offers the reader the table and the cards as two views, in the filter bar or, on a list with no filters, in the list's own toolbar (`CrudList.ViewToggle`). `presentation` is what the list opens in. The browser remembers the reader's last choice under `console.listView.<viewKey>` and the next visit opens in it; `viewKey` names the list among the product's lists and, when a screen names none, is a hash of the list's column keys. A list without a switch never reads a saved view, so its presentation is its only view. The decision is made in the screen's design entry (`list.presentation`, `list.viewToggle`, `list.cardTitle`), passed to the scaffold as `--list-presentation`, `--card-title` and, for a table list only, `--view-toggle` (a cards list carries the switch and its key without a flag, and the CLI refuses the flag on it), and the mockup kit's `screen-design` check refuses a list file or a board frame whose `<RecordList>` declares anything else.

## List filters

The generator turns the entity's searchable fields into the list's filters (`ContractFilter`): an enum is a `choice`, a boolean a `toggle`, a moment or a day a `dateRange`, a figure a `number` (a `money` field also carries its currency and scale), and a key of another record a `reference` filtered by that record's name. A text field is left to the keyword search, because a free-text box per field is rarely the question. A screen whose question is asked by a text field (per provider, per plan code) names it in its design and scaffolds with `--text-filter <field,field>`; the list then declares `{ kind: "text", field, operators }`, where `operators` are the ones the endpoint accepts on the field, first one the default (`["equals"]` for a field the server matches only whole, which the filter bar then offers without a `contains` the server would answer with an empty page). The flag is recorded in the origin, so a regeneration offers the same filters, and a name that is not a searchable text field of the entity stops the run.

## List filters in the address

A generated list keeps its committed filters in its page's address, so a link can open a list already filtered (a tile reading "4 failed jobs" opens those four), a reload keeps the filters, and Back leaves the screen in one step instead of stepping through every filter the reader tried. On the wire a filter is one bracketed parameter per key, `?filters[status.in]=FAILED`.

How a screen passes the address. `use<Entity>List(params?, address?)` takes the address as `{ value, onChange }`. The generated `crud-page.tsx` builds it from its own props and nothing else:

```tsx
const list = useJobList(blocks.listParams, {
  value: search.filters,
  onChange: (next) => onNavigate({ ...search, filters: next }, { replace: true }),
});
```

`onNavigate` takes the router's navigation options as its second argument (`PageBlocksContext`, the page's props and the route all carry it), and the route passes `replace: options?.replace` to `navigate`, so a filter change replaces the history entry and opening a record still pushes one. A list called with no address keeps its filters to itself. After a delete the page returns to `{ tab: search.tab, filters: search.filters }`, never to a bare address, and every other move between views keeps both.

What the list reads from the address. The list file declares its address once, at its end, over the set of filters it draws a control for (`<Entity>DrawnFilters`, the contract's filters until a screen trims them; the controls and the address are both built from that one constant, so trimming it narrows both), and exports it as `<Entity>ListAddress` (from the widget index too). A list whose page draws a time range names its field (`timeRangeField`), which makes the strip's `<field>.between` and the bar's two bounds keys the address may carry. A tab or any other request the page forces returns the list to its first page (`scopeKey`):

| Member | Use |
| --- | --- |
| `narrow(filters)` | the filters a list will accept: only the keys its controls commit |
| `controls` | the field and kind of each control, so a toggle's `true` and a number's text read back as the value the control commits; hand it to `filtersToRequestParams` |
| `keys` | the filter keys the controls commit |
| `useAddressed(address, forced)` | a hook: the `addressedFilters` option the list's hook gives `useCrudList` |

Narrowing keeps a key only when the list has a control that commits it: a choice and a reference filter carry `<field>.in`, a toggle `<field>.equals`, a text filter the operators it declares (contains and equals when it declares none the bar knows), a number filter equals and its two bounds, a period `greaterThanOrEqualTo` and `lessThanOrEqualTo`. A reference filter the list supplies no facet for draws no control, so its key is dropped (the list names the fields it has facets for when it declares its address). A stale or hand-typed key therefore never reaches a request the server would refuse, and an address left with no declared key opens the list on its defaults. `declareListAddress`, `narrowAddressedFilters` and `filterControlsOf` in `console-core/src/entity/list-address.ts` hold the rule, and the operator lists are the ones the filter bar draws, so the two cannot drift.

A screen that links to a list runs its keys through that same declaration, so a count and the list it opens read one set of filters:

```tsx
const filters = JobListAddress.narrow({ "status.in": ["FAILED"] });
const count = useListCount(useListJobs, filtersToRequestParams(filters, { controls: JobListAddress.controls }));
const href = { to: "/jobs", search: { filters } };
```

A key a screen writes through something other than the filter bar (a pressed tile, a chip row, the time range strip) reaches the address like any other, and the list reads it back for as long as the list that wrote it stays mounted, so it survives the reader's next filter change. A key that arrives from outside (a link, a typed address, a reload) is read through the declaration alone: a link to a field the list has no control for is dropped, and so is a time range over an undeclared stamp after a reload.

Tabs. A tab that pins a field passes its request as the list's `params` (`listParams` in the page's blocks). A filter over a field `params` pins with `equals` is not applied and the bar draws no control for it, because the pinned value wins in every request and the control would change no row. The key stays in the address until the reader's next filter change writes it out, and it applies again on a tab that does not pin the field. The pinned request rides on the list controller (`withForced`), which is how `RecordList` knows which controls to leave out. A tile that means a tab's set links to `?tab=<key>`, never to a filter over the field the tab pins. Moving between tabs keeps the address's filters.

## Row actions

`RecordList` and `RecordTree` draw `actions` as an icon strip in the row and as the same strip on a card; a row the action cannot run on shows it disabled with the reason. The kit names the verbs a framework type has no glyph for (`retry`, `reset`, `test`, `reprocess`, `enable`, `disable`, `suspend`, `reinstate`, `cancel`, `revoke`, `upload`, `grant`, `adjust`, `approve`, `reject`), each with a glyph of its own, so a screen never borrows `duplicate` for a retry.

A verb that flips with the row's state is one action, not two: give `type` and `label` as functions of the row.

```ts
{
  type: (row) => (row.enabled ? "disable" : "enable"),
  label: (row) => (row.enabled ? t("connection.disable") : t("connection.enable")),
  onClick: (row) => setSwitching({ row, turnOn: !row.enabled }),
  disabled: (row) => blocked(row),
}
```

A function `type` returns a kit verb, because a framework type's glyph is the framework's and cannot follow the row. Declaring Enable and Disable as two actions, one always disabled, is the form to leave. A labelled strip (two actions sharing one framework type, which the region contract refuses) sizes its column by the widest label the rows hold.

> **Previous:** [Console Pages](./console-pages.md) · **Next:** [Records and Search](./console-records-and-search.md)
