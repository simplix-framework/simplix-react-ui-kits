// The rendered check for content a box cuts: a badge, a chip, a control or a value drawn wider than
// the box that clips it, in a table cell, a card or a panel.
//
//   node scripts/clip-rendered.mjs --selftest
//
// `probe` runs inside the page (pass its source to `page.evaluate`) and returns the geometry of every
// element that reaches past the box of the nearest ancestor clipping it sideways, and of every badge
// whose own label is wider than the badge. `compare` judges that reading and returns the findings.
//
// What is allowed: plain text cut by an ellipsis (a name, a file name, a long value; the cell says
// there is more), and content past the edge of a container that scrolls sideways, which the reader
// reaches by scrolling. What is never allowed: a badge or a chip cut by any box or by its own label's
// width, a control or an icon cut, and text cut with no ellipsis. A container that scrolls a table
// sideways must also be reachable from the keyboard (a focusable region with a name), since a
// pointer-less reader has no other way to bring the cut columns into view.

/** What counts as a badge or a chip: drawn whole or not at all. */
export const BADGE_SELECTOR = '[data-slot="status-badge"], [data-slot="badge"], [data-slot="chip"], [data-slot$="-badge"], [data-slot$="-chip"]';

/**
 * Reads the page. Self-contained: it is evaluated in the page.
 *
 * @param {string} [root] a selector of the region to read; the whole document when absent
 * @returns {{ cut: object[], scrollers: object[] }}
 */
export function probe(root, badgeSelector) {
  const BADGE = badgeSelector ?? '[data-slot="status-badge"], [data-slot="badge"], [data-slot="chip"], [data-slot$="-badge"], [data-slot$="-chip"]';
  const scope = (root && document.querySelector(root)) || document.body;
  const ATOMIC = new Set(["BUTTON", "A", "INPUT", "SELECT", "TEXTAREA", "IMG", "svg", "SVG", "VIDEO", "CANVAS"]);
  const name = (el) => {
    const slot = el.getAttribute?.("data-slot") ?? el.getAttribute?.("data-part");
    const text = (el.textContent ?? "").replace(/\s+/g, " ").trim().slice(0, 40);
    return `${el.tagName.toLowerCase()}${slot ? `[${slot}]` : ""}${text ? ` "${text}"` : ""}`;
  };
  const shown = (el) => {
    const r = el.getBoundingClientRect();
    if (r.width <= 0 || r.height <= 0) return false;
    const s = getComputedStyle(el);
    return s.visibility !== "hidden" && s.display !== "none";
  };
  const inner = (el) => {
    const r = el.getBoundingClientRect();
    const left = r.left + el.clientLeft;
    return [left, left + el.clientWidth];
  };
  const scrollsX = (el, s) => (s.overflowX === "auto" || s.overflowX === "scroll") && el.scrollWidth > el.clientWidth + 1;
  const ellipsizes = (s) => s.textOverflow === "ellipsis" && s.overflowX !== "visible" && s.whiteSpace.includes("nowrap");
  const kindOf = (el) => {
    if (el.matches(BADGE)) return "badge";
    if (ATOMIC.has(el.tagName) || el.getAttribute("role") === "button" || el.getAttribute("role") === "link") return "control";
    return el.children.length === 0 ? "text" : "box";
  };
  const cut = [];
  const seen = new Set();
  for (const el of scope.querySelectorAll("*")) {
    if (!(el instanceof Element) || !shown(el)) continue;
    const kind = kindOf(el);
    // A box with element children is judged through its children; its own text nodes count as text.
    if (kind === "box" && ![...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())) continue;
    const box = el.getBoundingClientRect();
    let clip = null;
    let ellipsis = null;
    for (let a = el.parentElement; a && a !== document.documentElement; a = a.parentElement) {
      const s = getComputedStyle(a);
      if (!ellipsis && ellipsizes(s)) ellipsis = inner(a);
      if (s.overflowX === "visible") continue;
      const [left, right] = inner(a);
      if (box.right <= right + 1 && box.left >= left - 1) continue;
      clip = { by: name(a), box: [Math.round(left), Math.round(right)], scrolls: scrollsX(a, s) };
      break;
    }
    const own = getComputedStyle(el);
    if (ellipsizes(own)) ellipsis = inner(el);
    const labelOverflows = kind === "badge" && el.scrollWidth > el.clientWidth + 1;
    if (!clip && !labelOverflows) continue;
    // A badge's own label is reported once, not again for each of its text children.
    if (el.closest(BADGE) && el.closest(BADGE) !== el && seen.has(el.closest(BADGE))) continue;
    seen.add(el);
    cut.push({
      element: name(el),
      kind,
      box: [Math.round(box.left), Math.round(box.right)],
      clip,
      ellipsis: ellipsis ? [Math.round(ellipsis[0]), Math.round(ellipsis[1])] : null,
      labelOverflows,
      inBadge: kind !== "badge" && el.closest(BADGE) !== null,
    });
  }
  const scrollers = [];
  for (const el of scope.querySelectorAll("*")) {
    if (!shown(el) || !el.querySelector("table")) continue;
    const s = getComputedStyle(el);
    if (!scrollsX(el, s)) continue;
    scrollers.push({
      element: name(el),
      focusable: el.tabIndex >= 0,
      named: Boolean(el.getAttribute("aria-label") || el.getAttribute("aria-labelledby")),
      region: el.getAttribute("role") === "region",
    });
  }
  return { cut, scrollers };
}

/**
 * Judges a reading of {@link probe}; returns one line per finding, empty where nothing is cut.
 *
 * @param {{ cut: object[], scrollers: object[] }} reading
 * @returns {string[]}
 */
export function compare(reading) {
  const findings = [];
  for (const item of reading.cut ?? []) {
    if (item.kind === "badge" || item.inBadge) {
      if (item.labelOverflows) findings.push(`${item.element}: the badge's label is wider than the badge`);
      else if (item.clip && !item.clip.scrolls) findings.push(`${item.element}: the badge is cut by ${item.clip.by} (${item.box[0]}..${item.box[1]} past ${item.clip.box[0]}..${item.clip.box[1]})`);
      continue;
    }
    if (!item.clip || item.clip.scrolls) continue;
    if (item.kind === "control") {
      findings.push(`${item.element}: the control is cut by ${item.clip.by}`);
      continue;
    }
    // Text cut at an ellipsis that stands inside the clipping box says there is more: allowed.
    const marked = item.ellipsis && item.ellipsis[1] <= item.clip.box[1] + 1 && item.ellipsis[0] >= item.clip.box[0] - 1;
    if (!marked) findings.push(`${item.element}: the text is cut by ${item.clip.by} with no ellipsis`);
  }
  for (const scroller of reading.scrollers ?? []) {
    if (!scroller.focusable || !scroller.named) findings.push(`${scroller.element}: the table scrolls sideways but the region is ${scroller.focusable ? "unnamed" : "not focusable"}`);
  }
  return findings;
}

if (process.argv.includes("--selftest")) {
  const clip = (scrolls = false) => ({ by: "td[table-cell]", box: [100, 220], scrolls });
  const item = (over) => ({ element: "span", kind: "text", box: [104, 260], clip: clip(), ellipsis: null, labelOverflows: false, inBadge: false, ...over });
  const good = {
    "text cut at an ellipsis inside the cell": { cut: [item({ ellipsis: [104, 216] })], scrollers: [] },
    "a badge past a container that scrolls": { cut: [item({ kind: "badge", clip: clip(true) })], scrollers: [{ element: "div[table-container]", focusable: true, named: true, region: true }] },
    "text past a container that scrolls": { cut: [item({ clip: clip(true) })], scrollers: [] },
    "nothing cut": { cut: [], scrollers: [] },
  };
  const bad = {
    "a badge cut by its cell": { cut: [item({ kind: "badge" })], scrollers: [] },
    "the text inside a badge cut by its cell": { cut: [item({ inBadge: true, ellipsis: [104, 216] })], scrollers: [] },
    "a badge's label wider than the badge": { cut: [item({ kind: "badge", clip: null, labelOverflows: true })], scrollers: [] },
    "a control cut by its cell": { cut: [item({ kind: "control" })], scrollers: [] },
    "text cut with no ellipsis": { cut: [item({})], scrollers: [] },
    "text cut at an ellipsis that is itself past the clip": { cut: [item({ ellipsis: [104, 260] })], scrollers: [] },
    "a sideways scroller the keyboard cannot reach": { cut: [], scrollers: [{ element: "div[table-container]", focusable: false, named: false, region: false }] },
    "a focusable sideways scroller with no name": { cut: [], scrollers: [{ element: "div[table-container]", focusable: true, named: false, region: true }] },
  };
  let failed = 0;
  for (const [label, reading] of Object.entries(good)) {
    const found = compare(reading);
    if (found.length > 0) {
      failed += 1;
      console.error(`miss case flagged: ${label}: ${found.join("; ")}`);
    }
  }
  for (const [label, reading] of Object.entries(bad)) {
    if (compare(reading).length === 0) {
      failed += 1;
      console.error(`hit case passed: ${label}`);
    }
  }
  if (failed > 0) process.exit(1);
  console.log(`clip-rendered selftest: ${Object.keys(good).length} miss and ${Object.keys(bad).length} hit cases hold`);
}
