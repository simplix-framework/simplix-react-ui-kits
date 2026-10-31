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
  it("leaves every presentation at the theme's one detail width, whatever the record's tabs", () => {
    for (const presentation of ["panel", "drawer", "dialog", "page"]) {
      expect(detailWidthPx(presentation, "regular"), presentation).toBeUndefined();
      expect(detailWidthPx(presentation, "wide"), presentation).toBeUndefined();
    }
  });
});
