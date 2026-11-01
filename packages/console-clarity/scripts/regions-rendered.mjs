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
export function probe(regions) {
  const entries = Object.entries(regions).filter(([, r]) => r.marks.length > 0);
  const matches = (mark, name) => (mark.endsWith("*") ? name.startsWith(mark.slice(0, -1)) : name === mark);
  const regionOf = (el) => {
    for (let n = el; n && n.tagName !== "MAIN"; n = n.parentElement) {
      const names = [n.dataset?.slot, n.dataset?.part, n.tagName.toLowerCase()].filter(Boolean);
      for (const [key, r] of entries) if (r.marks.some((m) => names.some((name) => matches(m, name)))) return [key, n];
    }
    return ["unassigned", null];
  };
  const out = {};
  const perHolder = new Map();
  for (const b of document.querySelectorAll("main button, main a[role=button], main a[href]")) {
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
  signature.rows = document.querySelectorAll("main tbody tr, main [data-slot=console-record-card]").length;
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
  return entries.map((e) => {
    const el = document.querySelector(e.selector);
    if (!el) return { ...e, missing: true };
    const raw = e.attr ? el.getAttribute(e.attr) : getComputedStyle(el).getPropertyValue(e.prop);
    return { ...e, measured: norm(raw), expected: norm(root.getPropertyValue(e.token).trim()) };
  });
}

/** The measured properties that differ from their token, as strings. A missing element is not judged. */
export function compareTokens(measured) {
  return measured.filter((m) => !m.missing && m.measured !== m.expected).map((m) => `${m.selector} ${m.attr ?? m.prop} = ${m.measured}, token ${m.token} = ${m.expected}`);
}

/** The ways a signature breaks the type's contract, as strings; empty when it holds. */
export function compare(signature, type, c = contract) {
  const t = c.types[type];
  if (!t) return [`unknown page type ${type}`];
  const problems = [];
  const { rows = 0, ...regions } = signature;
  for (const need of t.required ?? []) if (rows > 0 && !regions[need]) problems.push(`${need}: required on ${type} and missing over ${rows} rows`);
  for (const [region, { kinds, perCard }] of Object.entries(regions)) {
    const r = c.regions[region];
    if (region === "unassigned") { problems.push(`unassigned: ${kinds.join(",")} drawn outside every region`); continue; }
    if (!t.regions.includes(region)) { problems.push(`${region}: not a region of ${type}`); continue; }
    const extra = kinds.filter((k) => !r.controls.includes(k));
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
  const ok = tokHit.length === 1 && tokMiss.length === 0 && miss.length === 0 && noStrip.length === 1 && empty.length === 0 && hit.length === 4 && compare(good, "system").length === 2;
  console.log(ok ? "regions-rendered selftest: hit 6, miss 0" : `regions-rendered selftest FAILED\nhit: ${hit.join("\n")}\nmiss: ${miss.join("\n")}`);
  process.exit(ok ? 0 : 1);
}
