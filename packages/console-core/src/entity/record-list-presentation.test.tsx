import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { UIProvider } from "@simplix-react/ui";
import { afterEach, describe, expect, it } from "vitest";

import { memoryPresentationStorage } from "../page/presentation-memory";
import { writeRememberedView } from "./list-view-memory";
import { openingView, RecordList, splitCardColumns, type RecordColumn, type RecordListProps } from "./record-list";

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

  it("offers no switch unless viewToggle is on, for either presentation", () => {
    expect(html({ presentation: "cards" })).not.toContain("aria-pressed");
    expect(html({ presentation: "table" })).not.toContain("aria-pressed");
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
    const out = withBrowserStorage({ "console.listView.voices": "list" }, () => html({ presentation: "cards", viewKey: "voices" }));
    expect(out).toContain('data-testid="list-card-grid"');
  });

  it("keeps the presentation when the saved view belongs to another list", () => {
    const out = withBrowserStorage({ "console.listView.other": "list" }, () => html({ presentation: "cards", viewToggle: true, viewKey: "voices" }));
    expect(out).toContain('data-testid="list-card-grid"');
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
