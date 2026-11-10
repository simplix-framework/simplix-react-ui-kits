// The rendered half of regions.json for site pages. `probe` runs inside a painted page (any driver's
// evaluate) and returns its region signature: the regions in drawing order, the controls each holds,
// and the computed look of the frame, of every region and of every named part inside it. `judge`
// holds one signature to a page type's contract; `compare` holds two signatures of the same page
// (a reference and a build) to each other, property by property. A product's runner opens the pages,
// calls `probe` on each and prints the reports; this file names no product and no route.
//   node scripts/site-regions-rendered.mjs --selftest
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(dirname(fileURLToPath(import.meta.url)));
export const contract = JSON.parse(readFileSync(resolve(here, "regions.json"), "utf8"));

/**
 * Runs in the page; self-contained so a driver can serialise it. `input.contract` is regions.json,
 * `input.type` the page type. `input.selectors` reads a page that carries no site marks (a reference
 * drawn by other code): `{ root?, frame?: { window?, main?, column? }, regions?: { <region>: { root?,
 * parts?: { <part>: css } } } }`, each a CSS selector that stands in for the contract's marks.
 */
export function probe(input) {
  const { contract: c, type, selectors = {} } = input;
  // A mark is a slot name, optionally qualified by attributes or a pseudo-class (`site-action:disabled`).
  // A site part drawn over a framework part (a checkbox, a select) keeps the framework's slot and
  // carries the site name as its part mark (`data-part`), so a mark matches either.
  const css = (mark) => {
    const at = mark.search(/[[:]/);
    const slot = at < 0 ? mark : mark.slice(0, at);
    const rest = at < 0 ? "" : mark.slice(at);
    return `[data-slot="${slot}"]${rest}, [data-part="${slot}"]${rest}`;
  };
  const rootSelector = selectors.root ?? c.types[type]?.root ?? "[data-page]";
  const root = document.querySelector(rootSelector);
  if (!root) return { missing: rootSelector };
  const px = (value) => Math.round((parseFloat(value) || 0) * 100) / 100;
  const shadow = (value) => {
    // A layer whose colour is fully transparent draws nothing; Tailwind writes several such layers
    // before the one it means, so they are dropped and an all-transparent shadow reads as none.
    if (!value || value === "none") return "none";
    const layers = value.split(/,(?![^(]*\))/).map((layer) => layer.trim()).filter((layer) => !/rgba\([^)]*,\s*0\)/.test(layer));
    return layers.length ? layers.join(", ") : "none";
  };
  // Layout sizes, not painted ones: a reference drawn inside a scaled frame (a phone mock-up) paints
  // smaller than it lays out, and its computed type is the unscaled value. An SVG element has no
  // offset box, so its painted box is divided by the scale the root is painted at.
  const rootBox = root.getBoundingClientRect();
  const scale = root instanceof HTMLElement && root.offsetWidth > 0 && rootBox.width > 0 ? rootBox.width / root.offsetWidth : 1;
  const size = (el) => {
    if (el instanceof HTMLElement) return { width: el.offsetWidth, height: el.offsetHeight };
    const box = el.getBoundingClientRect();
    return { width: box.width / scale, height: box.height / scale };
  };
  const look = (el) => {
    if (!el) return null;
    const s = getComputedStyle(el);
    const box = size(el);
    const side = (name) => `${s[`border${name}Width`]} ${s[`border${name}Color`]}`;
    return {
      family: s.fontFamily.split(",")[0].trim().replace(/^["']|["']$/g, "").toLowerCase(),
      size: s.fontSize,
      weight: s.fontWeight,
      lineHeight: s.lineHeight,
      letterSpacing: s.letterSpacing,
      color: s.color,
      background: s.backgroundColor,
      borderTop: side("Top"),
      borderRight: side("Right"),
      borderBottom: side("Bottom"),
      borderLeft: side("Left"),
      radius: s.borderRadius,
      shadow: shadow(s.boxShadow),
      padding: s.padding,
      gap: s.display.includes("flex") || s.display.includes("grid") ? s.gap : "normal",
      opacity: s.opacity,
      // A shape inside a drawing (a wave's bar) is painted by its fill; other elements have none.
      ...(typeof SVGGeometryElement !== "undefined" && el instanceof SVGGeometryElement ? { fill: s.fill } : {}),
      maxWidth: s.maxWidth,
      columns: s.display.includes("grid") ? s.gridTemplateColumns.split(" ").filter(Boolean).length : 0,
      height: px(box.height),
      width: px(box.width),
    };
  };
  const frameSel = { window: css(c.frame.window), main: css(c.frame.main), column: css(c.frame.column), ...selectors.frame };
  const pick = (selector) => (root.matches(selector) ? root : root.querySelector(selector));
  const frame = Object.fromEntries(Object.entries(frameSel).map(([key, selector]) => [key, look(pick(selector))]));

  const instancesOf = (key, region) => {
    const given = selectors.regions?.[key]?.root;
    if (given) return [...root.querySelectorAll(given)];
    const marks = [...root.querySelectorAll(region.marks.map(css).join(", "))];
    const lifted = marks.map((el) => (region.within ? (el.closest(css(region.within)) ?? el) : el));
    return [...new Set(lifted)];
  };
  const found = [];
  for (const [key, region] of Object.entries(c.regions)) for (const el of instancesOf(key, region)) found.push({ key, el });
  found.sort((a, b) => (a.el === b.el ? 0 : a.el.compareDocumentPosition(b.el) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1));
  const top = found.filter((one) => !found.some((other) => other !== one && other.el !== one.el && other.el.contains(one.el)));
  const order = [];
  for (const { key } of top) if (order[order.length - 1] !== key) order.push(key);

  const regions = {};
  for (const { key, el } of top) {
    const region = c.regions[key];
    const entry = (regions[key] ??= { count: 0, root: look(el), parts: {}, controls: [], perInstance: 0 });
    entry.count += 1;
    // A part is read from the first instance of the region that draws it, so a part only a later
    // instance has (the note under the second offer row, its disabled action) is still measured.
    for (const [part, mark] of Object.entries(region.parts ?? {})) {
      if (entry.parts[part]) continue;
      const selector = selectors.regions?.[key]?.parts?.[part] ?? css(mark);
      entry.parts[part] = look(el.matches(selector) ? el : el.querySelector(selector));
    }
    const controls = [...el.querySelectorAll("a[href], button")];
    entry.perInstance = Math.max(entry.perInstance, controls.length);
    for (const control of controls) {
      const kind = control.dataset.part ?? control.dataset.slot ?? (control.tagName === "A" ? "link" : "button");
      if (!entry.controls.includes(kind)) entry.controls.push(kind);
    }
  }
  return { rootWidth: px(size(root).width), order, frame, regions };
}

/** The ways a signature breaks its page type's contract, as strings; empty when it holds. */
export function judge(signature, type, c = contract) {
  const t = c.types[type];
  if (!t) return [`unknown page type ${type}`];
  if (t.status !== "ready") return [`${type}: the type is ${t.status} (${t.reason ?? "no reason given"}), so no page is judged against it yet`];
  if (signature.missing) return [`${type}: no element matches its root ${signature.missing}, so nothing was read`];
  const problems = [];
  const outside = signature.order.filter((region) => !t.regions.includes(region));
  for (const region of outside) problems.push(`${region}: not a region of ${type}`);
  const listed = signature.order.filter((region) => t.regions.includes(region));
  const positions = listed.map((region) => t.regions.indexOf(region));
  if (positions.some((at, i) => i > 0 && at <= (positions[i - 1] ?? -1))) problems.push(`order: ${signature.order.join(" > ")} breaks the drawing order ${t.regions.join(" > ")}`);
  for (const need of t.required ?? []) if (!signature.regions[need]) problems.push(`${need}: required on ${type} and not drawn`);
  for (const [key, entry] of Object.entries(signature.regions)) {
    const region = c.regions[key];
    if (!region || !entry) continue;
    const extra = region.controls.includes("*") ? [] : entry.controls.filter((kind) => !region.controls.includes(kind));
    if (extra.length) problems.push(`${key}: ${extra.join(",")} not allowed (allowed: ${region.controls.join(",") || "none"})`);
    if (region.maxControls !== undefined && entry.perInstance > region.maxControls) problems.push(`${key}: ${entry.perInstance} controls in one ${region.part}, at most ${region.maxControls}`);
  }
  return problems;
}

/** Properties compared exactly: colours, type, borders, radii, shadows, spacing. */
const EXACT = ["family", "size", "weight", "lineHeight", "letterSpacing", "color", "background", "borderTop", "borderRight", "borderBottom", "borderLeft", "radius", "shadow", "padding", "gap", "opacity", "fill", "maxWidth", "columns"];
const BORDERS = new Set(["borderTop", "borderRight", "borderBottom", "borderLeft"]);

/**
 * A property's value as compared: a border side no wider than 0px paints nothing, so its colour (which
 * a host's base layer sets on every element while a bare preflight leaves `currentcolor`) is not part
 * of what is drawn and compares as `0px`.
 */
export function comparable(prop, value) {
  return BORDERS.has(prop) && /^0px(\s|$)/.test(String(value)) ? "0px" : String(value);
}
/**
 * The parts whose width the layout decides, as `<region>.<part>` keys: the frame always, and per
 * region the `widths` regions.json lists (`root` names the region's own box). A width the text
 * decides (a label, a link) is left alone.
 */
export function widthParts(c = contract) {
  const parts = new Set(["frame.window", "frame.main", "frame.column"]);
  for (const [key, region] of Object.entries(c.regions)) for (const part of region.widths ?? []) parts.add(`${key}.${part}`);
  return parts;
}

/**
 * The differences between two signatures of the same page, as strings with both values: the region
 * order, a region or part one draws and the other does not, and every property that differs. Colours,
 * type, borders, radii, shadows and spacing must be equal; a height, and a width where the layout and
 * not the text decides it (`widthParts`), may differ by `tolerance` pixels.
 */
export function compare(reference, build, { tolerance = 1, contract: c = contract } = {}) {
  const sized = widthParts(c);
  if (reference.missing || build.missing) return [`nothing to compare: ${reference.missing ? "reference" : "build"} has no root ${reference.missing ?? build.missing}`];
  const problems = [];
  if (reference.order.join(">") !== build.order.join(">")) problems.push(`order: reference ${reference.order.join(" > ")} | build ${build.order.join(" > ")}`);
  const looks = (where, a, b) => {
    if (!a && !b) return;
    if (!a || !b) {
      problems.push(`${where}: drawn only in the ${a ? "reference" : "build"}`);
      return;
    }
    for (const prop of EXACT) if (comparable(prop, a[prop]) !== comparable(prop, b[prop])) problems.push(`${where} ${prop}: reference ${a[prop]} | build ${b[prop]}`);
    if (Math.abs(a.height - b.height) > tolerance) problems.push(`${where} height: reference ${a.height} | build ${b.height}`);
    if (sized.has(where) && Math.abs(a.width - b.width) > tolerance) problems.push(`${where} width: reference ${a.width} | build ${b.width}`);
  };
  for (const key of new Set([...Object.keys(reference.frame), ...Object.keys(build.frame)])) looks(`frame.${key}`, reference.frame[key], build.frame[key]);
  for (const key of new Set([...Object.keys(reference.regions), ...Object.keys(build.regions)])) {
    const a = reference.regions[key];
    const b = build.regions[key];
    if (!a || !b) {
      problems.push(`${key}: drawn only in the ${a ? "reference" : "build"}`);
      continue;
    }
    if (a.count !== b.count) problems.push(`${key} count: reference ${a.count} | build ${b.count}`);
    looks(`${key}.root`, a.root, b.root);
    for (const part of new Set([...Object.keys(a.parts), ...Object.keys(b.parts)])) looks(`${key}.${part}`, a.parts[part], b.parts[part]);
  }
  return problems;
}

/** The differences `compare` found, counted by region (`frame`, `order` and each region key). */
export function byRegion(problems) {
  const counts = {};
  for (const problem of problems) {
    const head = problem.split(/[ .:]/)[0];
    counts[head] = (counts[head] ?? 0) + 1;
  }
  return counts;
}

// Only when run as a script: a runner importing this file may take a --selftest flag of its own.
const isMain = process.argv[1] !== undefined && fileURLToPath(import.meta.url) === resolve(process.argv[1]);
if (isMain && process.argv.includes("--selftest")) {
  const look = (over = {}) => ({ family: "system-ui", size: "13px", weight: "400", lineHeight: "20px", letterSpacing: "normal", color: "rgb(18, 32, 31)", background: "rgba(0, 0, 0, 0)", borderTop: "0px rgb(18, 32, 31)", borderRight: "0px rgb(18, 32, 31)", borderBottom: "0px rgb(18, 32, 31)", borderLeft: "0px rgb(18, 32, 31)", radius: "0px", shadow: "none", padding: "0px", gap: "normal", opacity: "1", maxWidth: "none", columns: 0, height: 20, width: 100, ...over });
  const signature = (over = {}) => ({
    rootWidth: 1425,
    order: ["bar", "pageHead", "plans", "offers", "footer"],
    frame: { window: look({ width: 1425, height: 1253 }), main: look(), column: look({ maxWidth: "1200px", width: 1200, padding: "32px 24px", gap: "20px" }) },
    regions: {
      bar: { count: 1, root: look({ height: 59, padding: "12px 24px" }), parts: { action: look({ height: 34, background: "rgb(11, 122, 115)" }) }, controls: ["site-bar-brand", "site-bar-link", "site-action", "site-bar-more"], perInstance: 7 },
      pageHead: { count: 1, root: look(), parts: { title: look({ size: "26px", letterSpacing: "-0.65px" }) }, controls: [], perInstance: 0 },
      plans: { count: 1, root: look({ columns: 4 }), parts: { card: look({ padding: "16px", radius: "12px", width: 279 }) }, controls: ["site-action"], perInstance: 5 },
      offers: { count: 2, root: look(), parts: { action: look({ height: 28 }) }, controls: ["site-action"], perInstance: 1 },
      footer: { count: 1, root: look({ height: 49 }), parts: {}, controls: ["site-footer-link"], perInstance: 3 },
    },
    ...over,
  });
  const base = signature();
  const says = (found, pattern) => found.some((problem) => pattern.test(problem));
  const same = compare(base, signature());
  const withinTolerance = compare(base, signature({ frame: { ...base.frame, column: { ...base.frame.column, width: 1200.6 } } }));
  const planted = compare(base, signature({
    order: ["bar", "plans", "pageHead", "offers", "footer"],
    frame: { ...base.frame, column: { ...base.frame.column, maxWidth: "1180px" } },
    regions: {
      ...base.regions,
      bar: { ...base.regions.bar, root: { ...base.regions.bar.root, height: 61 } },
      pageHead: { ...base.regions.pageHead, parts: { title: { ...base.regions.pageHead.parts.title, letterSpacing: "-0.52px" } } },
      plans: { ...base.regions.plans, parts: { card: { ...base.regions.plans.parts.card, padding: "12px", width: 290 } } },
      offers: { ...base.regions.offers, count: 1 },
      footer: undefined,
    },
  }));
  const compareOk =
    same.length === 0 && withinTolerance.length === 0 &&
    says(planted, /^order: reference bar > pageHead > plans/) &&
    says(planted, /^frame\.column maxWidth: reference 1200px \| build 1180px/) &&
    says(planted, /^bar\.root height: reference 59 \| build 61/) &&
    says(planted, /^pageHead\.title letterSpacing: reference -0\.65px \| build -0\.52px/) &&
    says(planted, /^plans\.card padding: reference 16px \| build 12px/) &&
    says(planted, /^plans\.card width: reference 279 \| build 290/) &&
    says(planted, /^offers count: reference 2 \| build 1/) &&
    says(planted, /^footer: drawn only in the reference/) &&
    planted.length === 8;
  // A border no wider than 0px paints nothing, so its colour is no difference; a drawn one's colour is.
  const hairline = (top) => signature({ regions: { ...base.regions, pageHead: { ...base.regions.pageHead, root: look({ borderTop: top }) } } });
  const unpainted = compare(base, hairline("0px rgb(220, 228, 227)"));
  const painted = compare(hairline("1px rgb(18, 32, 31)"), hairline("1px rgb(220, 228, 227)"));
  const bordersOk = unpainted.length === 0 && painted.length === 1 && says(painted, /^pageHead\.root borderTop: reference 1px rgb\(18, 32, 31\) \| build 1px rgb\(220, 228, 227\)$/);
  const counted = byRegion(planted);
  const countOk = counted.plans === 2 && counted.footer === 1 && counted.order === 1 && counted.frame === 1;
  const fine = judge(base, "pricing");
  // A type still planned is never judged. The example is whichever type the contract still plans, so
  // the case does not break when a slice makes the one it named ready; with none left it judges a
  // copy of the contract with pricing marked planned.
  const plannedType = Object.keys(contract.types).find((key) => contract.types[key].status === "planned");
  const plannedContract = plannedType ? contract : { ...contract, types: { ...contract.types, pricing: { status: "planned", reason: "selftest" } } };
  const planned = judge(base, plannedType ?? "pricing", plannedContract);
  const broken = judge({
    ...base,
    order: ["bar", "plans", "pageHead", "hero", "offers"],
    regions: {
      ...base.regions,
      footer: undefined,
      hero: { count: 1, root: look(), parts: {}, controls: [], perInstance: 0 },
      offers: { ...base.regions.offers, controls: ["site-action", "site-switch-option"], perInstance: 2 },
    },
  }, "pricing");
  const vacuous = judge({ missing: "[data-page]" }, "pricing");
  // An enabled offer action is a link or a button drawn by the action part: both read as the same
  // control, so `fine` above holds either. A bare anchor the action part did not draw is refused.
  const bareLink = judge({ ...base, regions: { ...base.regions, offers: { ...base.regions.offers, controls: ["link"] } } }, "pricing");
  const judgeOk =
    fine.length === 0 && planned.length === 1 && new RegExp(`^${plannedType ?? "pricing"}: the type is planned`).test(planned[0] ?? "") && vacuous.length === 1 &&
    says(broken, /^hero: not a region of pricing/) && says(broken, /^order: bar > plans > pageHead/) && says(broken, /^footer: required on pricing/) &&
    says(broken, /^offers: site-switch-option not allowed/) && says(broken, /^offers: 2 controls in one OfferRow, at most 1/) && broken.length === 5 &&
    bareLink.length === 1 && says(bareLink, /^offers: link not allowed/);
  const ok = compareOk && countOk && judgeOk && bordersOk;
  console.log(ok ? "site-regions-rendered selftest: 12 compare cases and 9 judge cases hold" : `site-regions-rendered selftest FAILED\nsame: ${same.join(" | ")}\nunpainted border: ${unpainted.join(" | ")}\npainted border: ${painted.join(" | ")}\ntolerance: ${withinTolerance.join(" | ")}\nplanted (${planted.length}): ${planted.join("\n  ")}\ncounted: ${JSON.stringify(counted)}\nfine: ${fine.join(" | ")}\nplanned: ${planned.join(" | ")}\nbroken (${broken.length}): ${broken.join("\n  ")}`);
  process.exit(ok ? 0 : 1);
}
