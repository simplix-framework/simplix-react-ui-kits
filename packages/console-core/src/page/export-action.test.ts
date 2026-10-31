import { describe, expect, it } from "vitest";

import { runExport, type ExportFileFormat } from "./export-action";

describe("runExport", () => {
  it("fetches the chosen format and saves it under the name asked at save time with its extension", async () => {
    const blob = new Blob(["a,b\n"], { type: "text/csv" });
    const saved: [Blob, string][] = [];
    const asked: ExportFileFormat[] = [];
    let named = 0;
    const props = {
      fetch: async (format: ExportFileFormat) => {
        asked.push(format);
        return blob;
      },
      fileName: () => `log-${++named}`,
    };
    const unexpected = () => {
      throw new Error("no failure expected");
    };
    await runExport(props, "csv", (b, name) => saved.push([b, name]), unexpected);
    await runExport(props, "xlsx", (b, name) => saved.push([b, name]), unexpected);
    expect(asked).toEqual(["csv", "xlsx"]);
    expect(saved).toEqual([
      [blob, "log-1.csv"],
      [blob, "log-2.xlsx"],
    ]);
  });

  it("reports a refused fetch and saves nothing", async () => {
    const refusal = new Error("forbidden");
    const saved: string[] = [];
    const failures: unknown[] = [];
    await runExport(
      { fetch: async () => Promise.reject(refusal), fileName: "log" },
      "xlsx",
      (_b, name) => saved.push(name),
      (caught) => failures.push(caught),
    );
    expect(saved).toEqual([]);
    expect(failures).toEqual([refusal]);
  });
});
