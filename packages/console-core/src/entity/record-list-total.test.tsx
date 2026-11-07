import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { UIProvider, type UseCrudListResult } from "@simplix-react/ui";
import { describe, expect, it } from "vitest";

import { RecordList, type RecordColumn, type RecordFilter } from "./record-list";

interface Row {
  readonly id: string;
  readonly name: string;
}

const columns: readonly RecordColumn<Row>[] = [{ key: "name", header: "Name", field: "name", minWidth: 160 }];
const noop = () => undefined;

/** A server list whose read has not answered (`loading`), failed (`failed`) or answered empty. */
function serverList(state: "loading" | "failed" | "empty"): UseCrudListResult<Row> {
  return {
    data: [],
    isLoading: state === "loading",
    error: state === "failed" ? new Error("HTTP 500") : null,
    isPaused: false,
    failureCount: state === "failed" ? 2 : 0,
    filters: {
      search: "", setSearch: noop, values: {}, setValue: noop, setValues: noop, setAll: noop, clear: noop, apply: noop,
      isPending: false, isLoading: state === "loading", committedValues: {}, commitValue: noop, commitValues: noop,
    },
    sort: { field: null, direction: "asc", setSort: noop, toggleSort: noop },
    pagination: { page: 1, pageSize: 20, total: 0, totalPages: 1, setPage: noop, setPageSize: noop },
    selection: { selected: new Set(), toggle: noop, toggleAll: noop, clear: noop, isSelected: () => false },
    emptyReason: state === "failed" ? "error" : state === "empty" ? "no-data" : null,
  } as UseCrudListResult<Row>;
}

const draw = (list: UseCrudListResult<Row>, filters: readonly RecordFilter<Row>[] = []) =>
  renderToStaticMarkup(createElement(UIProvider, { children: createElement(RecordList<Row>, { rows: list.data, list, columns, rowId: (row) => row.id, filters }) }));

const filtered: readonly RecordFilter<Row>[] = [{ kind: "text", field: "name", label: "Name" }];

describe("RecordList total while its read has not answered", () => {
  for (const state of ["loading", "failed"] as const) {
    for (const [shape, filters] of [["with no filters", []], ["with filters", filtered]] as const) {
      it(`draws the total and the pager as unknown while the read is ${state}, ${shape}`, () => {
        const out = draw(serverList(state), filters);
        expect(out).toContain("list.totalCountUnknown");
        expect(out).not.toContain("list.totalCount<");
        expect(out).not.toContain("0-0 / 0");
        expect(out).toContain("list.rangeUnknown");
      });
    }
  }

  it("states a total of zero once the read has answered empty", () => {
    const out = draw(serverList("empty"));
    expect(out).not.toContain("list.totalCountUnknown");
    expect(out).toContain("0-0 / 0");
  });
});
