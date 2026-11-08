import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { UIProvider, type UseCrudListResult } from "@simplix-react/ui";
import { describe, expect, it } from "vitest";

import { RecordList, type RecordColumn, type RecordListProps } from "./record-list";

// A list says what an empty result means in the page's own words: `empty` for a list with nothing in it
// yet, `filteredEmpty` for lit chips or filters that matched nothing. Without `filteredEmpty` the
// framework's card stays for the second.

interface Row {
  readonly id: string;
  readonly name: string;
}

const columns: readonly RecordColumn<Row>[] = [{ key: "name", header: "Name", field: "name", minWidth: 160 }];
const noop = () => undefined;

function listWith(emptyReason: "no-data" | "no-filter"): UseCrudListResult<Row> {
  return {
    data: [],
    isLoading: false,
    error: null,
    isPaused: false,
    failureCount: 0,
    filters: {
      search: "", setSearch: noop, values: {}, setValue: noop, setValues: noop, setAll: noop, clear: noop, apply: noop,
      isPending: false, isLoading: false, committedValues: {}, commitValue: noop, commitValues: noop,
    },
    sort: { field: null, direction: "asc", setSort: noop, toggleSort: noop },
    pagination: { page: 1, pageSize: 20, total: 0, totalPages: 1, setPage: noop, setPageSize: noop },
    selection: { selected: new Set(), toggle: noop, toggleAll: noop, clear: noop, isSelected: () => false },
    emptyReason,
  } as UseCrudListResult<Row>;
}

const nothingYet = { title: "No accounts yet", description: "Invite the first one" };
const nothingMatches = { title: "No account matches the chips", description: "Clear a chip to see more" };

function draw(reason: "no-data" | "no-filter", extra: Partial<RecordListProps<Row>> = {}): string {
  const list = listWith(reason);
  return renderToStaticMarkup(
    createElement(UIProvider, { children: createElement(RecordList<Row>, { rows: list.data, list, columns, rowId: (row) => row.id, empty: nothingYet, ...extra }) }),
  );
}

describe("a RecordList that is empty", () => {
  it("says the page's no-data words for a list with nothing in it, and not its filtered words", () => {
    const out = draw("no-data", { filteredEmpty: nothingMatches });
    expect(out).toContain("No accounts yet");
    expect(out).not.toContain("No account matches the chips");
  });

  it("says the page's filtered words for lit chips that match nothing, in place of the framework card and the no-data words", () => {
    const out = draw("no-filter", { filteredEmpty: nothingMatches });
    expect(out).toContain("No account matches the chips");
    expect(out).toContain("Clear a chip to see more");
    expect(out).not.toContain("list.noFilterTitle");
    expect(out).not.toContain("No accounts yet");
  });

  it("keeps the framework card for filters that match nothing where the page words none", () => {
    const out = draw("no-filter");
    expect(out).toContain("list.noFilterTitle");
    expect(out).not.toContain("No accounts yet");
  });
});
