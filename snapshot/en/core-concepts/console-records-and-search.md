# Console Records and Search

How a record's detail names and orders what it draws, and how the one console search finds a record or a screen.

## Record detail

`RecordDetail` draws its notices above the body, under the head, with or without tabs: a notice explains the fields beneath it, so it is read first. A head figure takes its name from the field it draws: `contract.headFigures(fields, row)` returns `{ key, label, value }` for each contract field, with the label the list's column and the page's tile use, so one value has one name in every language and a screen writes no catalogue key for it. A figure that is not a field of the record (a share over two fields, a meter) is written as a `RecordHeadFigure` with its own label. A section is named for what it adds to the head, not for the field it holds: a section called "Value" holding a field "Value", or "Cost" under a head figure "Cost", draws the same value twice.

## Console search

The console has one search, a shell part rather than a routed screen. The top bar's search field, the phone bar's search glyph (`ConsolePhoneSearchButton` in `ConsolePhoneShell`'s `actions`) and ⌘K or Ctrl+K open one palette, `ConsoleCommandPalette`, wired by `useConsoleSearch` (`/shell`); the `app-shell` template mounts it once per window.

- **Who and what for**: an operator who knows a name, a code or a screen and wants that record or screen without walking the menu.
- **Reading order while typing**: the destinations the account may open (the menu after its gates, matched on the entry and its group, Hangul initials included), then one group per record source that matched, then the actions. Before anything is typed: the reader's recents (the last eight records and screens opened, per account in the browser), then the destinations and the actions.
- **A record group** is a list the account may open (`FederatedSearchSource`): its name, its mark, at most five rows (a title in the interface language, never an id, and a second line of one to three values), and a last row opening the list searched for the same text (`<route>?q=<text>`; `CrudPage` types `q` into the list's search box). A group still asking says so in its own line; a failed group says so in its own line while the others stand; a text no source holds names the text.
- **Asking**: two or more characters, 250 ms after the last key, every allowed source at once. A newer text cancels the older requests through their signal, and an older answer that arrives anyway is dropped. A rejected request, an envelope that is not a success, and a body that is not a list of rows are the source failing. A text of Hangul initials only matches commands locally and asks no source.
- **The header row** is the search glyph, the field and the Esc keycap, padded as the panel is and closed by one bottom rule. The field draws no border and no focus ring: it holds the keys while the palette stands open, and the panel and the caret say where focus is. The result rows show the keyboard's place with the selected row's fill.
- **Keys**: arrows move, Enter opens, ⌘ or Ctrl with Enter opens a record or a screen in a new tab, Esc closes and focus returns to the control that opened the palette; the field is a combobox over a listbox, and Tab stays in the dialog.
- **Where each part lives**: `createFederatedSearch` and `useFederatedSearch` (`/shell`) know no entity; a product declares its sources, one per list, from its generated search calls, and the shell's `search` parts hand them, the recents key and the product's actions to `useConsoleSearch`.

> **Previous:** [Console Lists](/en/core-concepts/console-lists.md) · **Next:** [Screen Templates](/en/core-concepts/screen-templates.md)

---

<p class="page-source"><a href="https://github.com/simplix-framework/simplix-react-ui-kits/blob/main/docs/en/core-concepts/console-records-and-search.md" target="_blank" rel="noopener noreferrer">Edit on GitHub</a></p>
