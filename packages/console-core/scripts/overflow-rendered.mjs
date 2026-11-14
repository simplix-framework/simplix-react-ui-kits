// The rendered check for a window's width: whether the page scrolls sideways, whether the page says
// what it is, and whether what a thumb touches is a thumb's size.
//
// `probe` runs inside the page (it is passed to `page.evaluate` as source), reads the window at its
// current width, and `compare` judges the reading for the width it was taken at. The runner sets the
// viewport with `Emulation.setDeviceMetricsOverride` between the two.
//
// A window narrower than PHONE_WINDOW (768) draws the phone bar, which carries the page title and
// every control as a 44px target; a wider one draws the page header's heading.

import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

/** The width below which the console draws its phone shell (`PHONE_WINDOW`, max-width 767px). */
export const PHONE_MAX = 767;
/** What a finger covers, in pixels. */
export const TOUCH = 44;

/** Reads the window. Self-contained: it is evaluated in the page. */
export function probe() {
  const doc = document.documentElement;
  const main = document.querySelector("main");
  const bar = document.querySelector('[data-part="console-phone-bar"]');
  const title = (bar?.querySelector("p")?.textContent ?? "").trim();
  const heading = main?.querySelector("h1")?.textContent?.trim() ?? "";
  const visible = (el) => {
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  };
  const small = [];
  if (bar) {
    for (const el of bar.querySelectorAll("button, a[href]")) {
      if (!visible(el)) continue;
      const r = el.getBoundingClientRect();
      if (r.height < 43.5 || (el.tagName === "BUTTON" && r.width < 43.5)) {
        small.push(`${el.getAttribute("aria-label") ?? el.textContent?.trim() ?? el.tagName} ${Math.round(r.width)}x${Math.round(r.height)}`);
      }
    }
  }
  const wide = [];
  for (const el of document.body.querySelectorAll("*")) {
    const r = el.getBoundingClientRect();
    if (r.width > 0 && r.right > innerWidth + 1 && !el.closest('[data-slot="sheet-content"], [role="dialog"]')) {
      wide.push(`${el.tagName.toLowerCase()}${el.getAttribute("data-part") ? `[${el.getAttribute("data-part")}]` : el.getAttribute("data-slot") ? `[${el.getAttribute("data-slot")}]` : ""} right ${Math.round(r.right)}`);
      if (wide.length >= 3) break;
    }
  }
  return {
    innerWidth,
    documentWidth: doc.scrollWidth,
    mainScrollWidth: main?.scrollWidth ?? 0,
    mainClientWidth: main?.clientWidth ?? 0,
    barDrawn: bar !== null,
    barTitle: title,
    heading,
    small,
    wide,
    lang: doc.lang,
  };
}

/** Judges a reading taken at `width`; returns the findings, empty where the width holds. */
export function compare(reading, width) {
  const out = [];
  if (reading.documentWidth > reading.innerWidth) out.push(`the document is ${reading.documentWidth}px wide in a ${reading.innerWidth}px window${reading.wide.length ? ` (${reading.wide.join(", ")})` : ""}`);
  if (reading.mainScrollWidth > reading.mainClientWidth) out.push(`the content column scrolls sideways (${reading.mainScrollWidth}px of ${reading.mainClientWidth}px)`);
  if (width <= PHONE_MAX) {
    if (!reading.barDrawn) out.push("no phone bar is drawn");
    else if (!reading.barTitle) out.push("the phone bar carries no page title");
    for (const control of reading.small) out.push(`a phone bar control is under ${TOUCH}px: ${control}`);
  } else if (!reading.heading) {
    out.push("the page draws no heading");
  }
  return out;
}

// node scripts/overflow-rendered.mjs --selftest   judges readings built by hand: each good one must hold, each bad one must be refused
if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1]) && process.argv.includes("--selftest")) {
  const reading = (over = {}) => ({ innerWidth: 390, documentWidth: 390, mainScrollWidth: 358, mainClientWidth: 358, barDrawn: true, barTitle: "Members", heading: "", small: [], wide: [], lang: "en", ...over });
  const desk = (over = {}) => reading({ innerWidth: 1440, documentWidth: 1440, mainScrollWidth: 1200, mainClientWidth: 1200, barDrawn: false, barTitle: "", heading: "Members", ...over });
  const good = [
    [reading(), 390],
    [reading({ innerWidth: PHONE_MAX, documentWidth: PHONE_MAX }), PHONE_MAX],
    [desk(), 1440],
    [desk({ innerWidth: PHONE_MAX + 1, documentWidth: PHONE_MAX + 1 }), PHONE_MAX + 1],
  ];
  // A hit per way a width can fail; each is the form `compare` must refuse.
  const bad = {
    "a document wider than the window": [reading({ documentWidth: 412, wide: ["div[console-page] right 412"] }), 390],
    "a content column that scrolls sideways": [reading({ mainScrollWidth: 400 }), 390],
    "a phone window with no bar": [reading({ barDrawn: false }), 390],
    "a phone bar with no title": [reading({ barTitle: "" }), 390],
    "a phone bar control under a finger": [reading({ small: ["Menu 36x36"] }), 390],
    "a wide window with no heading": [desk({ heading: "" }), 1440],
    "a wide document at desk width": [desk({ documentWidth: 1500 }), 1440],
  };
  const missed = good.flatMap(([r, width]) => compare(r, width).map((p) => `miss at ${width}: ${p}`));
  const hits = Object.entries(bad).filter(([, [r, width]]) => compare(r, width).length === 0).map(([label]) => `no hit for ${label}`);
  const ok = missed.length === 0 && hits.length === 0;
  console.log(ok ? `overflow-rendered selftest: hit ${Object.keys(bad).length}, miss 0` : `overflow-rendered selftest FAILED\n${[...missed, ...hits].join("\n")}`);
  process.exit(ok ? 0 : 1);
}
