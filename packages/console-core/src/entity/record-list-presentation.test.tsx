import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { UIProvider } from "@simplix-react/ui";
import { afterEach, describe, expect, it } from "vitest";

import { memoryPresentationStorage } from "../page/presentation-memory";
import { writeRememberedView } from "./list-view-memory";
import { derivedViewKey, offersViewSwitch, openingView, RecordList, splitCardColumns, type RecordColumn, type RecordListProps } from "./record-list";

interface Row {
  readonly id: string;
  readonly name: string;
  readonly status: string;
}

const rows: readonly Row[] = [
  { id: "a", name: "Alpha", status: "Open" },
  { id: "b", name: "Beta", status: "Closed" },
];

const columns: readonly RecordColumn<Row>[] = [
  { key: "status", header: "Status", field: "status" },
  { key: "name", header: "Name", field: "name" },
];

function html(props: Partial<RecordListProps<Row>> = {}): string {
  return renderToStaticMarkup(createElement(UIProvider, { children: createElement(RecordList<Row>, { rows, columns, rowId: (row) => row.id, ...props }) }));
}

describe("RecordList presentation", () => {
  it("draws the table by default", () => {
    const out = html();
    expect(out).toContain("<table");
    expect(out).not.toContain('data-testid="list-card-grid"');
  });

  it("draws the cards in the fit grid and no table when presentation is cards", () => {
    const out = html({ presentation: "cards" });
    expect(out).not.toContain("<table");
    expect(out).toContain('data-testid="list-card-grid"');
    expect(out).toContain("Alpha");
    expect(out).toContain("Beta");
  });

  it("titles each card by the first column, or by the column cardTitle names", () => {
    const first = html({ presentation: "cards" });
    expect(first.indexOf("Open")).toBeLessThan(first.indexOf("Alpha"));
    const named = html({ presentation: "cards", cardTitle: "name" });
    expect(named.indexOf("Alpha")).toBeLessThan(named.indexOf("Open"));
  });

  it("refuses a cardTitle that names no column", () => {
    expect(() => html({ presentation: "cards", cardTitle: "missing" })).toThrow(/names no column/);
  });

  it("draws a toggle action with the glyph of each row's state, in the row and on the card", () => {
    // The label read from the row is proved in the framework's own row action test and on
    // `toRowAction` here; this render resolves the framework's built output, which is what draws
    // the glyph function.
    const flipped = [
      { id: "a", name: "Alpha", status: "On" },
      { id: "b", name: "Beta", status: "Off" },
    ];
    const toggle = { type: (row: Row) => (row.status === "On" ? ("disable" as const) : ("enable" as const)), label: (row: Row) => (row.status === "On" ? "Disable" : "Enable"), onClick: () => undefined };
    for (const presentation of ["table", "cards"] as const) {
      const out = html({ rows: flipped, presentation, actions: [toggle] });
      expect(out).toContain("lucide-power-off");
      expect(out.replace("lucide-power-off", "")).toContain("lucide-power");
    }
  });

  it("sets a card's labelled values in one grid whose label column follows the longest label, a wide value across the pair", () => {
    const columnsWithLabels: readonly RecordColumn<Row>[] = [
      { key: "name", header: "Name", field: "name" },
      { key: "budget", header: "Monthly budget", value: () => "$50" },
      { key: "wide", header: "Reason", value: () => "A reason that runs long enough to take the whole card" },
    ];
    const out = html({ presentation: "cards", columns: columnsWithLabels });
    expect(out).toContain("grid-cols-[fit-content(var(--console-card-label-max))_minmax(0,1fr)]");
    // A label is a cell of the grid, not a fixed-measure box beside its value.
    expect(out).not.toMatch(/class="[^"]*\bw-16\b[^"]*"[^>]*>Monthly budget/);
    // The wide value takes the cells of the second pair and its label starts a row.
    expect(out).toMatch(/col-start-1[^>]*>Reason/);
    expect(out).toContain("@sm:col-span-3");
    // A short value stays in its cell.
    expect(out.match(/@sm:col-span-3/g)?.length).toBe(2);
  });

  it("draws a line no card fills on none, one a card fills on every card, and one that asks to be kept on every card", () => {
    const withLines = (cardKeep?: boolean): readonly RecordColumn<Row>[] => [
      { key: "name", header: "Name", field: "name" },
      { key: "empty", header: "Opens at", value: () => null, ...(cardKeep === undefined ? {} : { cardKeep }) },
      { key: "some", header: "Closes at", value: (row) => (row.id === "a" ? "10:00 to 12:00 on weekdays" : null) },
    ];
    const count = (out: string, label: string) => out.split(`>${label}<`).length - 1;
    const plain = html({ presentation: "cards", columns: withLines() });
    expect(count(plain, "Opens at")).toBe(0);
    expect(count(plain, "Closes at")).toBe(2);
    const kept = html({ presentation: "cards", columns: withLines(true) });
    expect(count(kept, "Opens at")).toBe(2);
    expect(count(kept, "Closes at")).toBe(2);
    const optedOut = html({ presentation: "cards", columns: withLines(false) });
    expect(count(optedOut, "Opens at")).toBe(0);
  });

  it("draws a table list exactly as it did before the presentation props existed", () => {
    expect(html({ presentation: "table", viewToggle: false })).toBe(html());
  });
});

/** Runs a render with a browser storage in place, as the reader's browser has. */
function withBrowserStorage<T>(initial: Record<string, string>, render: () => T): T {
  const storage = memoryPresentationStorage(initial);
  Object.assign(globalThis, { window: { localStorage: storage } });
  try {
    return render();
  } finally {
    Reflect.deleteProperty(globalThis, "window");
  }
}

describe("RecordList view switch", () => {
  afterEach(() => Reflect.deleteProperty(globalThis, "window"));

  // The server render never draws the switch itself (it appears after the first effect), so what the
  // list decided is read from the one visible consequence: the saved view replaces the presentation.
  it("opens a cards list in the reader's saved table without viewToggle being passed, so the switch is on", () => {
    const out = withBrowserStorage({ "console.listView.voices": "list" }, () => html({ presentation: "cards", viewKey: "voices" }));
    expect(out).toContain("<table");
    const forcedOn = withBrowserStorage({ "console.listView.voices": "list" }, () => html({ presentation: "cards", viewToggle: false, viewKey: "voices" }));
    expect(forcedOn).toContain("<table");
  });

  it("opens in the reader's saved view over the presentation, where the switch is offered", () => {
    const storage = memoryPresentationStorage();
    writeRememberedView(storage, "voices", "list");
    Object.assign(globalThis, { window: { localStorage: storage } });
    const out = html({ presentation: "cards", viewToggle: true, viewKey: "voices" });
    expect(out).toContain("<table");
    expect(out).not.toContain('data-testid="list-card-grid"');
  });

  it("ignores a saved view where no switch is offered, so the presentation is the one view", () => {
    const out = withBrowserStorage({ "console.listView.voices": "grid" }, () => html({ presentation: "table", viewKey: "voices" }));
    expect(out).toContain("<table");
    expect(out).not.toContain('data-testid="list-card-grid"');
  });

  it("opens a cards list in the table the reader chose, under a key derived from its columns when none is named", () => {
    const key = derivedViewKey(columns);
    const out = withBrowserStorage({ [`console.listView.${key}`]: "list" }, () => html({ presentation: "cards" }));
    expect(out).toContain("<table");
    expect(out).not.toContain('data-testid="list-card-grid"');
  });

  it("does not read another list's saved view for a cards list with no key", () => {
    const out = withBrowserStorage({ [`console.listView.${derivedViewKey([{ key: "other" }])}`]: "list" }, () => html({ presentation: "cards" }));
    expect(out).toContain('data-testid="list-card-grid"');
  });

  it("keeps the presentation when the saved view belongs to another list", () => {
    const out = withBrowserStorage({ "console.listView.other": "list" }, () => html({ presentation: "cards", viewToggle: true, viewKey: "voices" }));
    expect(out).toContain('data-testid="list-card-grid"');
  });
});

describe("offersViewSwitch", () => {
  it("is true for every cards list, whatever viewToggle says", () => {
    expect(offersViewSwitch("cards", false)).toBe(true);
    expect(offersViewSwitch("cards", true)).toBe(true);
  });

  it("follows viewToggle for a table list", () => {
    expect(offersViewSwitch("table", false)).toBe(false);
    expect(offersViewSwitch("table", true)).toBe(true);
  });
});

describe("derivedViewKey", () => {
  it("is the same for the same columns in the same order and differs when a column or the order differs", () => {
    const one = derivedViewKey([{ key: "name" }, { key: "status" }]);
    expect(derivedViewKey([{ key: "name" }, { key: "status" }])).toBe(one);
    expect(derivedViewKey([{ key: "status" }, { key: "name" }])).not.toBe(one);
    expect(derivedViewKey([{ key: "name" }])).not.toBe(one);
    expect(one).toMatch(/^columns-[0-9a-f]{8}$/);
  });
});

describe("openingView", () => {
  it("opens a table list on the table and a cards list on the grid", () => {
    expect(openingView("table", false, undefined)).toBe("list");
    expect(openingView("cards", false, undefined)).toBe("grid");
  });

  it("lets the saved view replace the presentation where the switch is offered", () => {
    expect(openingView("cards", true, "list")).toBe("list");
    expect(openingView("table", true, "grid")).toBe("grid");
  });

  it("keeps the presentation where no switch is offered, whatever is saved", () => {
    expect(openingView("cards", false, "list")).toBe("grid");
    expect(openingView("table", false, "grid")).toBe("list");
  });

  it("falls back to the presentation when nothing is saved", () => {
    expect(openingView("cards", true, undefined)).toBe("grid");
  });
});

describe("splitCardColumns", () => {
  it("takes the first column as the title when none is named", () => {
    const split = splitCardColumns(columns);
    expect(split.title?.key).toBe("status");
    expect(split.lines.map((column) => column.key)).toEqual(["name"]);
  });

  it("takes the named column as the title and keeps the others in order", () => {
    const three = [...columns, { key: "id", header: "Id", field: "id" } as RecordColumn<Row>];
    const split = splitCardColumns(three, "name");
    expect(split.title?.key).toBe("name");
    expect(split.lines.map((column) => column.key)).toEqual(["status", "id"]);
  });

  it("has no title for a list with no columns", () => {
    expect(splitCardColumns([]).title).toBeUndefined();
  });
});
