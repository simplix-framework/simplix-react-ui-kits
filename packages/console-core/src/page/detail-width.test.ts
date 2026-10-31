import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import { detailWidthFor, detailWidthLimits, detailWidthPx, useDetailWidthLimits, type DetailWidthLimits } from "./detail-width";

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

/** A document whose root carries the given custom properties, as a theme's stylesheet puts them there. */
function themeNaming(variables: Readonly<Record<string, string>>): void {
  vi.stubGlobal("document", { documentElement: {} });
  vi.stubGlobal("getComputedStyle", () => ({ getPropertyValue: (name: string) => variables[name] ?? "" }));
}

const theme = {
  "--detail-panel-width": "600px",
  "--detail-panel-min-width": "420px",
  "--detail-panel-max-width": "960px",
  "--detail-drawer-width": "720px",
  "--detail-drawer-min-width": "480px",
  "--detail-drawer-max-width": "1080px",
  "--detail-dialog-width": "960px",
  "--detail-dialog-min-width": "640px",
  "--detail-dialog-max-width": "1280px",
};

describe("detailWidthLimits", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("reads each presentation's width, minimum and maximum from its own variables", () => {
    themeNaming(theme);
    expect(detailWidthLimits("panel")).toEqual({ width: 600, min: 420, max: 960 });
    expect(detailWidthLimits("drawer")).toEqual({ width: 720, min: 480, max: 1080 });
    expect(detailWidthLimits("dialog")).toEqual({ width: 960, min: 640, max: 1280 });
  });

  it("leaves a page without limits, since it is the width of the window", () => {
    themeNaming(theme);
    expect(detailWidthLimits("page")).toEqual({});
  });

  it("names nothing for a bound the theme leaves out, and for a value that is not a width", () => {
    themeNaming({ "--detail-panel-width": "600px", "--detail-panel-min-width": "auto", "--detail-panel-max-width": "0px" });
    expect(detailWidthLimits("panel")).toEqual({ width: 600, min: undefined, max: undefined });
    expect(detailWidthLimits("drawer")).toEqual({ width: undefined, min: undefined, max: undefined });
  });

  it("names nothing where there is no document to read", () => {
    vi.stubGlobal("document", undefined);
    expect(detailWidthLimits("panel")).toEqual({});
  });

  it("is read by a page when it first draws, so the record opens at the theme's width", () => {
    themeNaming(theme);
    let seen: DetailWidthLimits | undefined;
    function Probe({ presentation }: { presentation: string }) {
      seen = useDetailWidthLimits(presentation);
      return null;
    }
    renderToStaticMarkup(createElement(Probe, { presentation: "drawer" }));
    expect(seen).toEqual({ width: 720, min: 480, max: 1080 });
  });
});

describe("detailWidthPx", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("opens each presentation at its own width, whatever the record's tabs", () => {
    themeNaming(theme);
    for (const width of ["regular", "wide"] as const) {
      expect(detailWidthPx("panel", width)).toBe(600);
      expect(detailWidthPx("drawer", width)).toBe(720);
      expect(detailWidthPx("dialog", width)).toBe(960);
      expect(detailWidthPx("page", width)).toBeUndefined();
    }
  });

  it("leaves the framework's width where the theme names none", () => {
    themeNaming({});
    expect(detailWidthPx("panel", "regular")).toBeUndefined();
  });
});
