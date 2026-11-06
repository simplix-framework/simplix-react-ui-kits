import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { UIProvider } from "@simplix-react/ui";
import { describe, expect, it } from "vitest";

import { RecordList, type RecordColumn } from "./record-list";

interface Row {
  readonly id: string;
  readonly name: string;
  readonly channel: string;
  readonly code: string;
}

const rows: readonly Row[] = [{ id: "a", name: "Alpha", channel: "PowerPoint add-in", code: "C-1" }];

const columns: readonly RecordColumn<Row>[] = [
  { key: "name", header: "Name", field: "name", minWidth: 160 },
  { key: "channel", header: "Channel", field: "channel", width: 120, value: (row) => ({ badge: { label: row.channel } }) },
  { key: "code", header: "Code", field: "code", width: 120 },
];

/** The opening tag of the body cell holding `text`. */
function cellTag(out: string, text: string): string {
  const at = out.indexOf(text);
  const open = out.lastIndexOf("<td", at);
  return out.slice(open, out.indexOf(">", open) + 1);
}

describe("RecordList badge columns", () => {
  const out = renderToStaticMarkup(createElement(UIProvider, { children: createElement(RecordList<Row>, { rows, columns, rowId: (row) => row.id }) }));

  it("draws a fixed column of badges whole: no truncation and no zero max-width on its cells", () => {
    const tag = cellTag(out, "PowerPoint add-in");
    expect(tag).not.toMatch(/\btruncate\b/);
    expect(tag).not.toMatch(/max-width:\s*0/);
  });

  it("keeps a fixed text column truncating at its width", () => {
    const tag = cellTag(out, "C-1");
    expect(tag).toMatch(/\btruncate\b/);
    expect(tag).toMatch(/max-width:\s*0/);
  });
});
