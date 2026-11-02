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
  // The card grid as laid out: the list's own width, the gap, the card minimum the layout token decides the
  // columns by, the tracks drawn and where each card stands, so `compare` can hold every card list to one width rule.
  const grid = scope.querySelector("[data-slot=crud-list-view][data-grid=true] [data-testid=list-card-grid]");
  if (grid) {
    const px = (value) => parseFloat(value) || 0;
    const style = getComputedStyle(grid);
    const box = grid.getBoundingClientRect();
    const inset = px(style.borderLeftWidth) + px(style.paddingLeft);
    const minimum = document.createElement("div");
    minimum.style.cssText = "position:absolute;visibility:hidden;height:0;width:var(--card-min-width, 20rem)";
    grid.appendChild(minimum);
    const cardMin = minimum.getBoundingClientRect().width;
    minimum.remove();
    const round = (value) => Math.round(value * 100) / 100;
    signature.cardGrid = {
      listWidth: round(box.width - inset - px(style.paddingRight) - px(style.borderRightWidth)),
      gap: px(style.columnGap),
      rowGap: px(style.rowGap),
      cardMin: round(cardMin),
      tracks: style.gridTemplateColumns.split(" ").filter(Boolean).length,
      cards: [...grid.querySelectorAll(":scope > [data-slot=crud-card]")].map((card) => {
        const r = card.getBoundingClientRect();
        return { x: round(r.left - box.left - inset), y: round(r.top - box.top), w: round(r.width), h: round(r.height) };
      }),
    };
  }
  // The dashboard grid as laid out: its width, its column gap and count, and each card's span and box, so
  // `compareDashboardGrid` can hold every row full and every card to the width its span names.
  const dash = scope.querySelector("[data-slot=dashboard-grid]");
  if (dash) {
    const px = (value) => parseFloat(value) || 0;
    const style = getComputedStyle(dash);
    const box = dash.getBoundingClientRect();
    const round = (value) => Math.round(value * 100) / 100;
    signature.dashboardGrid = {
      width: round(box.width - px(style.paddingLeft) - px(style.paddingRight)),
      gap: px(style.columnGap),
      columns: Number(dash.dataset.columns) || style.gridTemplateColumns.split(" ").filter(Boolean).length,
      cards: [...dash.querySelectorAll(":scope > [data-span]")].map((card) => {
        const r = card.getBoundingClientRect();
        return { span: Number(card.dataset.span), x: round(r.left - box.left - px(style.paddingLeft)), y: round(r.top - box.top), w: round(r.width) };
      }),
    };
  }
  return signature;
}

/**
 * The ways a dashboard grid breaks its row and width rule, as strings; empty when it holds. Every row is
 * full: the columns its cards take sum to the grid's columns, with no gap left at the end. Every card is
 * the width its span names at the grid's column count: one column, two columns and the gap between
 * them, or the whole grid; a span wider than the grid takes the whole row. A span other than 1, 2 or 4 is
 * refused. `grid` is `probe`'s `dashboardGrid`; `tolerance` is in px.
 */
export function compareDashboardGrid(grid, tolerance = 1) {
  if (!grid || grid.cards.length === 0) return [];
  const { width, gap, columns, cards } = grid;
  const problems = [];
  const off = (a, b) => Math.abs(a - b) > tolerance;
  const column = (width - gap * (columns - 1)) / columns;
  const widthOf = (take) => column * take + gap * (take - 1);
  for (const [index, card] of cards.entries()) {
    if (![1, 2, 4].includes(card.span)) {
      problems.push(`dashboard grid: card ${index + 1} has span ${card.span}, not 1, 2 or 4`);
      continue;
    }
    const take = Math.min(card.span, columns);
    if (off(card.w, widthOf(take))) problems.push(`dashboard grid: card ${index + 1} (span ${card.span}) is ${card.w}px wide, ${Math.round(widthOf(take) * 100) / 100}px at ${columns} columns`);
  }
  const rows = [];
  for (const card of cards) {
    const row = rows.find((one) => !off(one.y, card.y));
    if (row) row.cards.push(card);
    else rows.push({ y: card.y, cards: [card] });
  }
  rows.forEach((row, index) => {
    const taken = row.cards.reduce((sum, card) => sum + Math.min(card.span, columns), 0);
    const right = Math.max(...row.cards.map((card) => card.x + card.w));
    if (taken !== columns || off(right, width)) problems.push(`dashboard grid: row ${index + 1} takes ${taken} of ${columns} columns and ends ${Math.round((width - right) * 100) / 100}px short of the grid's edge`);
  });
  return problems;
}

/**
 * The ways one card grid breaks the one card width rule, as strings; empty when it holds. The columns
 * are decided by the list's own width and the card minimum token alone: as many as hold a card no
 * narrower than the minimum, each an equal share, every card the width of its column, the first card at
 * the list's left padding and neighbours one grid gap apart. `grid` is `probe`'s `cardGrid`; `tolerance`
 * is in px.
 */
export function compareCardGrid(grid, tolerance = 1) {
  if (!grid || grid.cards.length === 0) return [];
  const { listWidth, gap, rowGap, cardMin, tracks, cards } = grid;
  const problems = [];
  const columns = Math.max(1, Math.floor((listWidth + gap) / (cardMin + gap) + 1e-9));
  const columnWidth = (listWidth - gap * (columns - 1)) / columns;
  const off = (a, b) => Math.abs(a - b) > tolerance;
  if (tracks !== columns) problems.push(`card grid: ${tracks} columns at a list width of ${listWidth}px, the card minimum ${cardMin}px and a gap of ${gap}px decide ${columns}`);
  const widths = cards.filter((card) => off(card.w, columnWidth));
  if (widths.length) problems.push(`card grid: ${widths.length} of ${cards.length} cards are not the column width ${Math.round(columnWidth * 100) / 100}px (${widths.slice(0, 3).map((card) => `${card.w}px`).join(", ")})`);
  if (cards.some((card) => off(card.w, cards[0].w))) problems.push("card grid: the cards differ in width from the first card");
  if (off(cards[0].x, 0)) problems.push(`card grid: the first card starts ${cards[0].x}px from the list's left padding, not at it`);
  const rows = [];
  for (const card of cards) {
    const row = rows.find((one) => !off(one.y, card.y));
    if (row) row.cards.push(card);
    else rows.push({ y: card.y, cards: [card] });
  }
  for (const row of rows) {
    const ordered = [...row.cards].sort((a, b) => a.x - b.x);
    for (let i = 1; i < ordered.length; i++) {
      const between = ordered[i].x - (ordered[i - 1].x + ordered[i - 1].w);
      if (off(between, gap)) problems.push(`card grid: ${Math.round(between * 100) / 100}px between neighbours, the grid gap is ${gap}px`);
    }
  }
  for (let i = 1; i < rows.length; i++) {
    const above = Math.max(...rows[i - 1].cards.map((card) => card.y + card.h));
    const between = rows[i].y - above;
    if (off(between, rowGap)) problems.push(`card grid: ${Math.round(between * 100) / 100}px between rows, the grid row gap is ${rowGap}px`);
  }
  return problems;
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
  const { rows = 0, unboxedCards = 0, cardGrid, dashboardGrid, ...regions } = signature;
  if (unboxedCards > 0) problems.push(`cards: ${unboxedCards} card${unboxedCards === 1 ? "" : "s"} of the grid view drawn with no border on every side or no radius, so the cards read as loose text`);
  problems.push(...compareCardGrid(cardGrid));
  problems.push(...compareDashboardGrid(dashboardGrid));
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
  // The card grid holds one width rule: columns from the list width and the card minimum, every card the
  // column width, the first at the left padding, neighbours one gap apart.
  const gridOf = (over = {}, cards) => ({ listWidth: 1103, gap: 8, rowGap: 8, cardMin: 320, tracks: 3, cards: cards ?? [0, 1, 2, 3].map((i) => ({ x: (i % 3) * (362.33 + 8), y: Math.floor(i / 3) * 208, w: 362.33, h: 200 })), ...over });
  const gridGood = compareCardGrid(gridOf());
  const gridFewCards = compareCardGrid(gridOf({}, [{ x: 0, y: 0, w: 362.33, h: 200 }]));
  const gridOneColumn = compareCardGrid({ listWidth: 306, gap: 8, rowGap: 8, cardMin: 320, tracks: 1, cards: [{ x: 0, y: 0, w: 306, h: 90 }, { x: 0, y: 98, w: 306, h: 90 }] });
  const gridWide = compareCardGrid(gridOf({}, [0, 1, 2, 3].map((i) => ({ x: (i % 3) * (362.33 + 8), y: Math.floor(i / 3) * 208, w: i === 1 ? 420 : 362.33, h: 200 }))));
  const gridColumns = compareCardGrid(gridOf({ tracks: 2 }));
  const gridStart = compareCardGrid(gridOf({}, [0, 1, 2, 3].map((i) => ({ x: 24 + (i % 3) * (362.33 + 8), y: Math.floor(i / 3) * 208, w: 362.33, h: 200 }))));
  const gridGap = compareCardGrid(gridOf({ gap: 16 }));
  const gridRows = compareCardGrid(gridOf({ rowGap: 24 }));
  const gridAbsent = compareCardGrid(undefined);
  const gridInCompare = compare({ ...cards, rows: 4, cardGrid: gridOf({ tracks: 2 }) }, "list-detail");
  const says = (found, pattern) => found.some((problem) => pattern.test(problem));
  const gridOk =
    gridGood.length === 0 && gridFewCards.length === 0 && gridOneColumn.length === 0 && gridAbsent.length === 0 &&
    says(gridWide, /1 of 4 cards are not the column width/) && says(gridWide, /differ in width from the first card/) &&
    says(gridColumns, /2 columns at a list width of 1103px.*decide 3/) &&
    says(gridStart, /first card starts 24px from the list's left padding/) &&
    says(gridGap, /neighbours, the grid gap is 16px/) &&
    says(gridRows, /between rows, the grid row gap is 24px/) &&
    gridInCompare.length === 1;
  // The dashboard grid: rows full and cards as wide as their spans, at four, two and one columns.
  // 1124px at four columns with a 12px gap: a column is 272px, two are 556px, four are the whole 1124px.
  const dash = (columns, width, cards) => ({ width, gap: 12, columns, cards });
  const dashGood = compareDashboardGrid(dash(4, 1124, [
    { span: 1, x: 0, y: 0, w: 272 }, { span: 1, x: 284, y: 0, w: 272 }, { span: 2, x: 568, y: 0, w: 556 },
    { span: 4, x: 0, y: 300, w: 1124 },
  ]));
  // At two columns (760px: a column is 374px) a span of 2 and of 4 both take the row.
  const dashTwo = compareDashboardGrid(dash(2, 760, [
    { span: 1, x: 0, y: 0, w: 374 }, { span: 1, x: 386, y: 0, w: 374 }, { span: 2, x: 0, y: 300, w: 760 }, { span: 4, x: 0, y: 600, w: 760 },
  ]));
  const dashOne = compareDashboardGrid(dash(1, 358, [{ span: 2, x: 0, y: 0, w: 358 }, { span: 1, x: 0, y: 300, w: 358 }]));
  const dashGap = compareDashboardGrid(dash(4, 1124, [{ span: 1, x: 0, y: 0, w: 272 }, { span: 2, x: 284, y: 0, w: 556 }]));
  const dashWide = compareDashboardGrid(dash(4, 1124, [{ span: 2, x: 0, y: 0, w: 600 }, { span: 2, x: 612, y: 0, w: 512 }]));
  const dashThree = compareDashboardGrid(dash(4, 1124, [{ span: 3, x: 0, y: 0, w: 840 }, { span: 1, x: 852, y: 0, w: 272 }]));
  const dashInCompare = compare({ dashboardGrid: dash(4, 1124, [{ span: 1, x: 0, y: 0, w: 272 }]), rows: 0 }, "dashboard");
  const dashOk =
    dashGood.length === 0 && dashTwo.length === 0 && dashOne.length === 0 && compareDashboardGrid(undefined).length === 0 &&
    says(dashGap, /row 1 takes 3 of 4 columns/) &&
    says(dashWide, /card 1 \(span 2\) is 600px wide, 556px at 4 columns/) && says(dashWide, /card 2 \(span 2\) is 512px wide/) &&
    says(dashThree, /card 1 has span 3, not 1, 2 or 4/) &&
    dashInCompare.length === 1;
  const ok = dashOk && gridOk && unboxed.length === 1 && boxed.length === 0 && cardList.length === 0 && cardsNoStrip.length === 1 && switchInCell.length === 1 && linkTile.length === 0 && buttonTile.length === 1 && rampHit.length === 1 && rampMiss.length === 0 && vacuous.length === 1 && tokHit.length === 1 && tokMiss.length === 0 && miss.length === 0 && noStrip.length === 1 && empty.length === 0 && hit.length === 4 && compare(good, "system").length === 4;
  console.log(ok ? "regions-rendered selftest: 13 region cases, 11 card grid cases and 7 dashboard grid cases hold" : `regions-rendered selftest FAILED\nhit: ${hit.join("\n")}\nmiss: ${miss.join("\n")}\ngrid: ${[gridGood, gridFewCards, gridOneColumn, gridWide, gridColumns, gridStart, gridGap, gridRows, gridInCompare].map((one) => one.join(" | ")).join("\n      ")}\ndashboard: ${[dashGood, dashTwo, dashOne, dashGap, dashWide, dashThree, dashInCompare].map((one) => one.join(" | ")).join("\n      ")}`);
  process.exit(ok ? 0 : 1);
}
