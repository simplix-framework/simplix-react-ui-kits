import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { UIProvider } from "@simplix-react/ui";
import { describe, expect, it } from "vitest";

import { HelpTable } from "./help-table";

describe("HelpTable", () => {
  it("draws a heading per column and a row per entry, each cell from its catalog key, with the caption under it", () => {
    const html = renderToStaticMarkup(
      createElement(UIProvider, {
        children: createElement(HelpTable, {
          namespace: "help-test",
          columns: [{ title: "lifecycle.columnStatus", width: 112 }, { title: "lifecycle.columnMeaning" }],
          rows: [
            { key: "active", cells: ["status.active", "lifecycle.activeMeaning"] },
            { key: "dormant", cells: ["status.dormant", "lifecycle.dormantMeaning"] },
          ],
          caption: "lifecycle.caption",
        }),
      }),
    );
    expect((html.match(/<tr/g) ?? []).length).toBe(3);
    for (const key of ["lifecycle.columnStatus", "lifecycle.columnMeaning", "status.dormant", "lifecycle.activeMeaning", "lifecycle.caption"]) expect(html).toContain(key);
  });
});
