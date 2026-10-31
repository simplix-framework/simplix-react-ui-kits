import { describe, expect, it } from "vitest";

import { runExport } from "./export-action";

describe("runExport", () => {
  it("saves the fetched bytes under the name asked at save time", async () => {
    const blob = new Blob(["a,b\n"], { type: "text/csv" });
    const saved: [Blob, string][] = [];
    let named = 0;
    await runExport(
      { fetch: async () => blob, fileName: () => `log-${++named}.csv` },
      (b, name) => saved.push([b, name]),
      () => {
        throw new Error("no failure expected");
      },
    );
    expect(saved).toEqual([[blob, "log-1.csv"]]);
  });

  it("reports a refused fetch and saves nothing", async () => {
    const refusal = new Error("forbidden");
    const saved: string[] = [];
    const failures: unknown[] = [];
    await runExport(
      { fetch: async () => Promise.reject(refusal), fileName: "log.csv" },
      (_b, name) => saved.push(name),
      (caught) => failures.push(caught),
    );
    expect(saved).toEqual([]);
    expect(failures).toEqual([refusal]);
  });
});
