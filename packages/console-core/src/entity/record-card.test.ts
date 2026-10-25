import { describe, expect, it } from "vitest";
import { cardLayout, keptColumns, packedLines, wideColumns } from "./record-card";

describe("cardLayout", () => {
  const columns = [
    { key: "contract", header: "계약", value: { link: "협력업체 A" } },
    { key: "decision", header: "허가 대상", value: { badge: { label: "허가 대상", tone: "danger" as const } } },
    { key: "types", header: "허가 유형", value: { badges: [{ label: "화기" }, { label: "고소" }] } },
    { key: "status", header: "상태", value: { badge: { label: "작성 중" } } },
    { key: "date", header: "작업일", value: "2026-10-26" },
    { key: "shift", header: "교대조", value: "주간조" },
  ];

  it("gathers badge values into one unlabelled row in column order", () => {
    expect(cardLayout(columns).badges.map((b) => b.key)).toEqual(["decision", "types", "status"]);
  });
  it("keeps the label of every other value for the grid", () => {
    expect(cardLayout(columns).lines.map((l) => l.header)).toEqual(["계약", "작업일", "교대조"]);
  });
  it("leaves out empty values, so a card is as tall as what the row has", () => {
    const layout = cardLayout([{ key: "a", header: "A", value: null }, { key: "b", header: "B", value: "" }, { key: "c", header: "C", value: "x" }]);
    expect(layout.lines.map((l) => l.key)).toEqual(["c"]);
  });
  it("draws text with a badge beside it as a labelled value, and honours a column's own place", () => {
    const layout = cardLayout([
      { key: "t", header: "T", value: { text: "x", badge: { label: "y" } } },
      { key: "s", header: "S", value: "z", place: "badges" as const },
      { key: "h", header: "H", value: "w", place: "hidden" as const },
    ]);
    expect(layout.lines.map((l) => l.key)).toEqual(["t"]);
    expect(layout.badges.map((b) => b.key)).toEqual(["s"]);
  });

  it("gives a long value the card's full width and a short one a grid cell", () => {
    const lines = cardLayout(columns).lines;
    expect(lines.find((l) => l.key === "date")?.wide).toBe(false);
    expect(cardLayout([{ key: "c", header: "계약", value: { link: "가상 협력업체 A · 보일러 정비 용역" } }]).lines[0].wide).toBe(true);
  });

  it("keeps a column wide on every card once any row runs long, so a label holds one cell down the list", () => {
    const rows = [{ course: "가상 관리감독자 직무교육", date: "2026-11-03" }, { course: "작업 전 수시 위험성평가 교육", date: "2026-10-27" }];
    const wide = wideColumns(["course", "date"] as const, rows, (key, row) => row[key]);
    expect([...wide]).toEqual(["course"]);
    const first = cardLayout([{ key: "course", header: "과정", value: rows[0]!.course, wide: wide.has("course") }]);
    expect(first.lines[0]?.wide).toBe(true);
  });
});

describe("packedLines", () => {
  const value = (key: string, row: Record<string, string>) => row[key] ?? null;
  it("packs a list whose labelled values are all short", () => {
    expect(packedLines(["v", "d"], [{ v: "4", d: "2026-10-14" }, { v: "3", d: "2026-09-01" }], value)).toBe(true);
  });
  it("keeps the grid once any row's value runs long, or there are many values", () => {
    expect(packedLines(["v", "d"], [{ v: "4", d: "2026-10-14" }, { v: "가상 협력업체 B 정비부문", d: "x" }], value)).toBe(false);
    expect(packedLines(["a", "b", "c", "d"], [{ a: "1", b: "2", c: "3", d: "4" }], value)).toBe(false);
    expect(packedLines([], [{}], value)).toBe(false);
  });
});

describe("keptColumns", () => {
  it("keeps a labelled column's cell on a card whose own value is empty, so labels stay put", () => {
    const rows = [{ a: "1", b: "x" }, { a: "2", b: null }];
    const value = (key: string, row: Record<string, string | null>) => row[key] ?? null;
    const kept = keptColumns(["a", "b"], rows, value);
    expect([...kept]).toEqual(["a", "b"]);
    const layout = cardLayout([{ key: "a", header: "A", value: "2" }, { key: "b", header: "B", value: null, keep: kept.has("b") }]);
    expect(layout.lines.map((l) => l.key)).toEqual(["a", "b"]);
  });
});
