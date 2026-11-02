// The rendered half of regions.json. `probe` runs inside a page (any driver's evaluate) and returns
// the page's region signature: per region, the control kinds drawn in it. `compare` judges that
// signature against a page type's contract. A product's runner signs in, opens each screen, calls
// both and prints the report; this file names no product and no route.
//   node scripts/regions-rendered.mjs --selftest
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(dirname(fileURLToPath(import.meta.url)));
export const contract = JSON.parse(readFileSync(resolve(here, "regions.json"), "utf8"));

/**
 * Runs in the page. `regions` is contract.regions; returns { region: { kinds: string[], perCard: number } }.
 * Self-contained so a driver can serialise it.
 */
export function probe(regions, root = "main") {
  const entries = Object.entries(regions).filter(([, r]) => r.marks.length > 0);
  const matches = (mark, name) => (mark.endsWith("*") ? name.startsWith(mark.slice(0, -1)) : name === mark);
  const regionOf = (el) => {
    for (let n = el; n && !n.matches?.(root); n = n.parentElement) {
      const names = [n.dataset?.slot, n.dataset?.part, n.tagName.toLowerCase()].filter(Boolean);
      for (const [key, r] of entries) if (r.marks.some((m) => names.some((name) => matches(m, name)))) return [key, n];
    }
    return ["unassigned", null];
  };
  const out = {};
  const perHolder = new Map();
  const scope = document.querySelector(root);
  if (!scope) return { missing: root };
  for (const b of scope.querySelectorAll("button, a[role=button], a[href]")) {
    const [region, holder] = regionOf(b);
    const label = (b.textContent || "").trim() !== "";
    const isLink = b.dataset.variant === "link" || (b.tagName === "A" && b.getAttribute("role") !== "button");
    let kind = isLink ? "link" : b.dataset.slot || "button";
    if (region === "rowActions") kind = `button:${label ? "label" : "icon"}`;
    (out[region] ??= { kinds: new Set(), perCard: 0 }).kinds.add(kind);
    // A part's own icon-only control (a notice's dismiss) is not an action the screen added.
    if (holder && label) {
      const n = (perHolder.get(holder) ?? 0) + 1;
      perHolder.set(holder, n);
      out[region].perCard = Math.max(out[region].perCard, n);
    }
  }
  const signature = Object.fromEntries(Object.entries(out).map(([k, v]) => [k, { kinds: [...v.kinds].sort(), perCard: v.perCard }]));
  // Rows drawn, so a required region is judged only where there are rows to carry it.
  signature.rows = scope.querySelectorAll("tbody tr, [data-slot=crud-card]").length;
  // The cards of the grid view are separate boxes: a border on every side and a radius. The stacked
  // fallback inside a list frame is ruled rows and is not judged here.
  signature.unboxedCards = [...scope.querySelectorAll("[data-slot=crud-list-view][data-grid=true] [data-slot=crud-card]")].filter((card) => {
    const s = getComputedStyle(card);
    const sides = [s.borderTopWidth, s.borderRightWidth, s.borderBottomWidth, s.borderLeftWidth];
    return sides.some((w) => !(parseFloat(w) > 0)) || !(parseFloat(s.borderTopLeftRadius) > 0);
  }).length;
  return signature;
}

/**
 * Runs in the page. For each entry of a part's partTokens, the measured value and the token's
 * value, both resolved through one canvas so hex, rgb and colour functions compare as one form.
 */
export function probeTokens(entries) {
  const ctx = document.createElement("canvas").getContext("2d");
  const norm = (c) => { ctx.fillStyle = "#010203"; ctx.fillStyle = c; return ctx.fillStyle; };
  const root = getComputedStyle(document.documentElement);
  const channels = (c) => { const h = norm(c).slice(1); return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)); };
  const hex = (rgb) => `#${rgb.map((c) => Math.round(c).toString(16).padStart(2, "0")).join("")}`;
  return entries.map((e) => {
    if (e.ramp) {
      // The theme ramp, built the way the framework builds it, and every fill drawn checked against it.
      const [from, to] = e.ramp.map((token) => channels(root.getPropertyValue(token).trim()));
      const ramp = Array.from({ length: e.steps }, (_, step) => hex(from.map((c, i) => c + (to[i] - c) * (step / (e.steps - 1)))));
      const fills = [...new Set([...document.querySelectorAll(e.selector)].map((el) => norm(el.getAttribute(e.attr))))];
      if (fills.length === 0) return { ...e, missing: true };
      return { ...e, measured: fills.join(","), expected: ramp.join(","), outside: fills.filter((f) => !ramp.includes(f)) };
    }
    const el = document.querySelector(e.selector);
    if (!el) return { ...e, missing: true };
    const raw = e.attr ? el.getAttribute(e.attr) : getComputedStyle(el).getPropertyValue(e.prop);
    return { ...e, measured: norm(raw), expected: norm(root.getPropertyValue(e.token).trim()) };
  });
}

/** The measured properties that differ from their token, as strings. A missing element is not judged. */
export function compareTokens(measured) {
  return measured
    .filter((m) => !m.missing && (m.ramp ? m.outside.length > 0 : m.measured !== m.expected))
    .map((m) => (m.ramp ? `${m.selector} ${m.attr} draws ${m.outside.join(",")} outside the ramp ${m.ramp.join(" to ")} (${m.expected})` : `${m.selector} ${m.attr ?? m.prop} = ${m.measured}, token ${m.token} = ${m.expected}`));
}

/** The ways a signature breaks the type's contract, as strings; empty when it holds. */
export function compare(signature, type, c = contract) {
  const t = c.types[type];
  if (!t) return [`unknown page type ${type}`];
  const problems = [];
  if (signature.missing) return [`${type}: no element matches its root ${signature.missing}, so nothing was read`];
  const { rows = 0, unboxedCards = 0, ...regions } = signature;
  if (unboxedCards > 0) problems.push(`cards: ${unboxedCards} card${unboxedCards === 1 ? "" : "s"} of the grid view drawn with no border on every side or no radius, so the cards read as loose text`);
  for (const need of t.required ?? []) if (rows > 0 && !regions[need]) problems.push(`${need}: required on ${type} and missing over ${rows} rows`);
  for (const [region, { kinds, perCard }] of Object.entries(regions)) {
    const r = c.regions[region];
    if (region === "unassigned") { problems.push(`unassigned: ${kinds.join(",")} drawn outside every region`); continue; }
    if (!t.regions.includes(region)) { problems.push(`${region}: not a region of ${type}`); continue; }
    const extra = r.controls.includes("*") ? [] : kinds.filter((k) => !r.controls.includes(k));
    if (extra.length) problems.push(`${region}: ${extra.join(",")} not allowed (allowed: ${r.controls.join(",") || "none"})`);
    if (r.maxControls !== undefined && perCard > r.maxControls) problems.push(`${region}: ${perCard} controls in one ${r.part}, at most ${r.maxControls}`);
  }
  return problems;
}

if (process.argv.includes("--selftest")) {
  const good = { header: { kinds: ["button"], perCard: 1 }, rowActions: { kinds: ["button:icon"], perCard: 2 }, cell: { kinds: ["link"], perCard: 1 }, notices: { kinds: ["button"], perCard: 1 } };
  const bad = { rowActions: { kinds: ["button:label"], perCard: 2 }, cell: { kinds: ["button"], perCard: 2 }, unassigned: { kinds: ["button"], perCard: 0 }, notices: { kinds: ["button"], perCard: 2 } };
  const miss = compare({ ...good, rows: 3 }, "list-detail");
  const noStrip = compare({ header: good.header, rows: 3 }, "list-detail");
  const empty = compare({ header: good.header, rows: 0 }, "list-detail");
  const hit = compare(bad, "list-detail");
  const tokHit = compareTokens([{ selector: "rect", attr: "stroke", token: "--background", measured: "#000000", expected: "#f4f7f7" }]);
  const tokMiss = compareTokens([{ selector: "rect", attr: "stroke", token: "--background", measured: "#f4f7f7", expected: "#f4f7f7" }, { selector: "x", missing: true }]);
  const vacuous = compare({ missing: "main" }, "list-detail");
  const rampHit = compareTokens([{ selector: "rect", attr: "fill", ramp: ["--muted", "--primary"], measured: "#f1f5f9", expected: "#eef2f2,#0f766e", outside: ["#f1f5f9"] }]);
  const rampMiss = compareTokens([{ selector: "rect", attr: "fill", ramp: ["--muted", "--primary"], measured: "#eef2f2", expected: "#eef2f2,#0f766e", outside: [] }]);
  // A figure that counts the rows of another screen opens it: a link is a control of the figures region, a bare button is not.
  const linkTile = compare({ figures: { kinds: ["console-tile-chip", "link"], perCard: 0 }, rows: 0 }, "dashboard");
  const buttonTile = compare({ figures: { kinds: ["button"], perCard: 0 }, rows: 0 }, "dashboard");
  // A list drawn as cards has no head and no cells, and its rows are the cards: the action strip is still required over them,
  // and the list/grid switch is a control of the toolbar.
  const cards = { toolbar: { kinds: ["crud-filter-bar-view-button"], perCard: 0 }, rowActions: { kinds: ["button:icon"], perCard: 0 }, cell: { kinds: ["link"], perCard: 1 } };
  const cardList = compare({ ...cards, rows: 4 }, "list-detail");
  const cardsNoStrip = compare({ toolbar: cards.toolbar, cell: cards.cell, rows: 4 }, "list-detail");
  const switchInCell = compare({ ...cards, cell: { kinds: ["link", "crud-filter-bar-view-button"], perCard: 1 }, rows: 4 }, "list-detail");
  // A card of the grid view with no box fails; boxed cards and a list with no grid hold.
  const unboxed = compare({ ...cards, rows: 4, unboxedCards: 2 }, "list-detail");
  const boxed = compare({ ...cards, rows: 4, unboxedCards: 0 }, "list-detail");
  const ok = unboxed.length === 1 && boxed.length === 0 && cardList.length === 0 && cardsNoStrip.length === 1 && switchInCell.length === 1 && linkTile.length === 0 && buttonTile.length === 1 && rampHit.length === 1 && rampMiss.length === 0 && vacuous.length === 1 && tokHit.length === 1 && tokMiss.length === 0 && miss.length === 0 && noStrip.length === 1 && empty.length === 0 && hit.length === 4 && compare(good, "system").length === 4;
  console.log(ok ? "regions-rendered selftest: hit 13, miss 0" : `regions-rendered selftest FAILED\nhit: ${hit.join("\n")}\nmiss: ${miss.join("\n")}`);
  process.exit(ok ? 0 : 1);
}
