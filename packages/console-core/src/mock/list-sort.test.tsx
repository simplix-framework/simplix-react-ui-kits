import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { useMockList } from "./list";

const rows = [
  { id: "1", at: "2026-10-01" },
  { id: "3", at: "2026-10-03" },
  { id: "2", at: "2026-10-02" },
];

/** Renders the hook once and reports what the first render held. */
function firstRender(options?: Parameters<typeof useMockList<(typeof rows)[number]>>[2]) {
  let seen: { sort: unknown; ids: string[] } | undefined;
  function Probe() {
    const list = useMockList(rows, 20, options);
    seen = { sort: list.sort, ids: list.data.map((row) => row.id) };
    return null;
  }
  renderToStaticMarkup(<Probe />);
  return seen as { sort: { field: string | null; direction: string }; ids: string[] };
}

describe("useMockList defaultSort", () => {
  it("opens sorted, with the sort state reporting the default", () => {
    const first = firstRender({ defaultSort: { field: "at", direction: "desc" } });
    expect(first.ids).toEqual(["3", "2", "1"]);
    expect(first.sort).toMatchObject({ field: "at", direction: "desc" });
  });
  it("keeps the given order and reports no sort without the option", () => {
    const first = firstRender();
    expect(first.ids).toEqual(["1", "3", "2"]);
    expect(first.sort).toMatchObject({ field: null });
  });
});
