import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { bySlot, unmarked } from "../testing/markup";
import { SiteSlider, SLIDER_PAGE_STEPS, sliderKeyTarget, sliderShare, sliderSnap, sliderValueAt, type SiteSliderProps, type SiteSliderRange } from "./slider";

/** Checks a props object against the slider's type. */
const form = (props: SiteSliderProps) => props;

const months: SiteSliderRange = { min: 1, max: 12, step: 1, pageStep: SLIDER_PAGE_STEPS };
const half: SiteSliderRange = { min: 0, max: 1, step: 0.1, pageStep: 0.5 };

describe("sliderSnap", () => {
  it("holds a value inside the range", () => {
    expect(sliderSnap(0, months)).toBe(1);
    expect(sliderSnap(40, months)).toBe(12);
    expect(sliderSnap(Number.NaN, months)).toBe(1);
  });

  it("moves a value to the nearest whole step from min, without floating point residue", () => {
    expect(sliderSnap(3.4, months)).toBe(3);
    expect(sliderSnap(3.6, months)).toBe(4);
    expect(sliderSnap(0.30000000000000004, half)).toBe(0.3);
    expect(sliderSnap(0.26, half)).toBe(0.3);
    expect(sliderSnap(4, { min: 1, max: 10, step: 2 })).toBe(5);
  });

  it("leaves max reachable when the step does not divide the range", () => {
    expect(sliderSnap(10, { min: 1, max: 10, step: 2 })).toBe(10);
    expect(sliderSnap(9.9, { min: 1, max: 10, step: 2 })).toBe(9);
  });

  it("answers min for an empty range", () => {
    expect(sliderSnap(5, { min: 3, max: 3, step: 1 })).toBe(3);
    expect(sliderShare(5, 3, 3)).toBe(0);
  });
});

describe("sliderKeyTarget", () => {
  it("moves by a step on the arrows, right and up raising the value", () => {
    expect(sliderKeyTarget("ArrowRight", 3, months)).toBe(4);
    expect(sliderKeyTarget("ArrowUp", 3, months)).toBe(4);
    expect(sliderKeyTarget("ArrowLeft", 3, months)).toBe(2);
    expect(sliderKeyTarget("ArrowDown", 3, months)).toBe(2);
  });

  it("moves by a page on Page Up and Page Down, held at the ends", () => {
    expect(sliderKeyTarget("PageUp", 1, months)).toBe(11);
    expect(sliderKeyTarget("PageUp", 3, months)).toBe(12);
    expect(sliderKeyTarget("PageDown", 12, months)).toBe(2);
    expect(sliderKeyTarget("PageDown", 4, months)).toBe(1);
  });

  it("jumps to the ends on Home and End", () => {
    expect(sliderKeyTarget("Home", 7, months)).toBe(1);
    expect(sliderKeyTarget("End", 7, months)).toBe(12);
  });

  it("answers null for a key it does not take and for a move that would not move", () => {
    expect(sliderKeyTarget("Enter", 3, months)).toBeNull();
    expect(sliderKeyTarget("a", 3, months)).toBeNull();
    expect(sliderKeyTarget("ArrowRight", 12, months)).toBeNull();
    expect(sliderKeyTarget("ArrowLeft", 1, months)).toBeNull();
    expect(sliderKeyTarget("Home", 1, months)).toBeNull();
    expect(sliderKeyTarget("End", 12, months)).toBeNull();
  });

  it("steps a fractional range by its step", () => {
    expect(sliderKeyTarget("ArrowRight", 0.2, half)).toBe(0.3);
    expect(sliderKeyTarget("PageUp", 0.7, half)).toBe(1);
  });
});

describe("sliderValueAt", () => {
  it("answers the snapped value under the pointer across the track", () => {
    expect(sliderValueAt(100, 100, 220, months)).toBe(1);
    expect(sliderValueAt(320, 100, 220, months)).toBe(12);
    expect(sliderValueAt(100 + 220 * (2 / 11), 100, 220, months)).toBe(3);
    expect(sliderValueAt(100 + 220 * (2.4 / 11), 100, 220, months)).toBe(3);
    expect(sliderValueAt(100 + 220 * (2.6 / 11), 100, 220, months)).toBe(4);
  });

  it("holds a pointer outside the track at the ends", () => {
    expect(sliderValueAt(20, 100, 220, months)).toBe(1);
    expect(sliderValueAt(900, 100, 220, months)).toBe(12);
    expect(sliderValueAt(150, 100, 0, months)).toBe(1);
  });
});

describe("SiteSlider", () => {
  it("is an ARIA slider on the thumb, named, valued and read as words", () => {
    const html = renderToStaticMarkup(<SiteSlider label="Months used" valueText={(n) => `${String(n)} months`} min={1} max={12} value={3} />);
    const thumb = bySlot(html, "site-slider-thumb")[0];
    expect(thumb?.attributes.role).toBe("slider");
    expect(thumb?.attributes.tabindex).toBe("0");
    expect(thumb?.attributes["aria-label"]).toBe("Months used");
    expect(thumb?.attributes["aria-valuemin"]).toBe("1");
    expect(thumb?.attributes["aria-valuemax"]).toBe("12");
    expect(thumb?.attributes["aria-valuenow"]).toBe("3");
    expect(thumb?.attributes["aria-valuetext"]).toBe("3 months");
    expect(thumb?.attributes["aria-orientation"]).toBe("horizontal");
    expect(bySlot(html, "site-slider")[0]?.attributes.role).toBe("group");
    expect(unmarked(html)).toEqual([]);
  });

  it("draws the fill up to the value and the thumb on it", () => {
    const html = renderToStaticMarkup(<SiteSlider label="Months used" min={1} max={12} value={3} />);
    const at = `${String((2 / 11) * 100)}%`;
    expect(bySlot(html, "site-slider-fill")[0]?.attributes.style).toBe(`width:${at}`);
    expect(bySlot(html, "site-slider-thumb")[0]?.attributes.style).toBe(`left:${at}`);
  });

  it("is labelled by a visible label when given its id instead of words", () => {
    const html = renderToStaticMarkup(<SiteSlider labelledBy="used" min={1} max={12} value={3} />);
    const thumb = bySlot(html, "site-slider-thumb")[0];
    expect(thumb?.attributes["aria-labelledby"]).toBe("used");
    expect(thumb?.attributes["aria-label"]).toBeUndefined();
  });

  it("holds its own value from defaultValue, snapped, when no value is given", () => {
    const own = bySlot(renderToStaticMarkup(<SiteSlider label="Speed" min={0} max={1} step={0.1} defaultValue={0.26} />), "site-slider-thumb")[0];
    expect(own?.attributes["aria-valuenow"]).toBe("0.3");
    const atMin = bySlot(renderToStaticMarkup(<SiteSlider label="Speed" min={2} max={5} />), "site-slider-thumb")[0];
    expect(atMin?.attributes["aria-valuenow"]).toBe("2");
  });

  it("draws a held value outside the range at the end it passed", () => {
    const thumb = bySlot(renderToStaticMarkup(<SiteSlider label="Months used" min={1} max={12} value={30} />), "site-slider-thumb")[0];
    expect(thumb?.attributes["aria-valuenow"]).toBe("12");
  });

  it("leaves the tab order and says so when disabled", () => {
    const html = renderToStaticMarkup(<SiteSlider label="Months used" min={1} max={12} value={3} disabled />);
    const thumb = bySlot(html, "site-slider-thumb")[0];
    expect(thumb?.attributes.tabindex).toBe("-1");
    expect(thumb?.attributes["aria-disabled"]).toBe("true");
    expect(bySlot(html, "site-slider")[0]?.attributes["data-disabled"]).toBe("true");
    const enabled = bySlot(renderToStaticMarkup(<SiteSlider label="Months used" min={1} max={12} value={3} />), "site-slider-thumb")[0];
    expect(enabled?.attributes["aria-disabled"]).toBeUndefined();
  });

  it("refuses a slider with neither a label nor a labelling id, and one with both", () => {
    // @ts-expect-error a slider needs an accessible name
    expect(form({ min: 1, max: 12 })).toBeDefined();
    // @ts-expect-error a slider is named one way
    expect(form({ label: "A", labelledBy: "b", min: 1, max: 12 })).toBeDefined();
  });
});
