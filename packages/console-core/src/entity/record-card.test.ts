import { describe, expect, it } from "vitest";
import { cardLayout } from "./record-card";

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
});
