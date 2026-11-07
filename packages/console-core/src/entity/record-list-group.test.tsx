import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { UIProvider, type UseCrudListResult } from "@simplix-react/ui";
import { describe, expect, it } from "vitest";

import { RecordList, type RecordColumn } from "./record-list";

interface Row {
  readonly id: string;
  readonly name: string;
  readonly category: string | null;
}

const columns: readonly RecordColumn<Row>[] = [{ key: "name", header: "Name", field: "name", minWidth: 160 }];
const noop = () => undefined;

function serverList(data: readonly Row[]): UseCrudListResult<Row> {
  return {
    data: [...data],
    isLoading: false,
    error: null,
    isPaused: false,
    failureCount: 0,
    filters: {
      search: "", setSearch: noop, values: {}, setValue: noop, setValues: noop, setAll: noop, clear: noop, apply: noop,
      isPending: false, isLoading: false, committedValues: {}, commitValue: noop, commitValues: noop,
    },
    sort: { field: null, direction: "asc", setSort: noop, toggleSort: noop },
    pagination: { page: 1, pageSize: 20, total: data.length, totalPages: 1, setPage: noop, setPageSize: noop },
    selection: { selected: new Set(), toggle: noop, toggleAll: noop, clear: noop, isSelected: () => false },
    emptyReason: null,
  } as UseCrudListResult<Row>;
}

const rows: readonly Row[] = [
  { id: "1", name: "Ada", category: "ENGINEERING" },
  { id: "2", name: "Bo", category: "" },
  { id: "3", name: "Cy", category: null },
];

const draw = (groupBy: { ungrouped?: string } = {}) =>
  renderToStaticMarkup(
    createElement(UIProvider, {
      children: createElement(RecordList<Row>, {
        rows,
        list: serverList(rows),
        columns,
        rowId: (row) => row.id,
        groupBy: { field: "category", label: (key: string) => `Category.${key}`, ...groupBy },
      }),
    }),
  );

describe("a list grouped by a field some rows leave empty", () => {
  it("draws the rows with no value under one heading of their own, not under a heading made of an empty key", () => {
    const out = draw();
    expect(out).toContain("Category.ENGINEERING");
    expect(out).not.toMatch(/Category\.(?!ENGINEERING)/);
    expect(out.split("recordList.ungrouped").length - 1).toBe(1);
  });

  it("takes the heading the screen words for them", () => {
    const out = draw({ ungrouped: "No category" });
    expect(out).toContain("No category");
    expect(out).not.toContain("recordList.ungrouped");
  });
});
