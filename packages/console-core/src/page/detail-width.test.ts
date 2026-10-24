import { describe, expect, it } from "vitest";
import { detailWidthFor, detailWidthPx } from "./detail-width";

describe("detailWidthFor", () => {
  it("keeps a record with a few tabs at the regular width", () => {
    expect(detailWidthFor(["개요", "이력", "권한"])).toBe("regular");
  });
  it("widens a record whose tab strip would not fit", () => {
    expect(detailWidthFor(["개요", "허가 대상 판정", "작업허가", "인원 편성", "위험성평가", "TBM", "중장비 작업계획", "보호구 지급", "이력"])).toBe("wide");
  });
  it("counts Latin letters narrower than Hangul", () => {
    expect(detailWidthFor(Array.from({ length: 8 }, () => "TBM"))).toBe("regular");
  });
});

describe("detailWidthPx", () => {
  it("opens a drawer at one width whatever its tabs", () => {
    expect(detailWidthPx("drawer", "regular")).toBe(880);
    expect(detailWidthPx("drawer", "wide")).toBe(880);
  });
  it("leaves a regular panel and dialog at the framework width and widens a wide one", () => {
    expect(detailWidthPx("panel", "regular")).toBeUndefined();
    expect(detailWidthPx("dialog", "wide")).toBe(880);
  });
});
