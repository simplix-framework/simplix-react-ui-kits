// The rendered half of tile-columns.json. `probe` runs inside a page (any driver's evaluate) and
// reads every figure tile grid as painted: how many tiles, how wide the page column is, and how
// many columns the tiles actually stand in. `compare` judges one grid against the column rule, and
// `compareCase` judges it against the contract's written-out cases at a target page column width.
// A product's runner signs in, opens a page per tile count, sets the window so the page column is
// each target width, and prints the report; this file names no product and no route.
//   node scripts/tile-columns-rendered.mjs --selftest
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(dirname(fileURLToPath(import.meta.url)));
export const contract = JSON.parse(readFileSync(resolve(here, "tile-columns.json"), "utf8"));

/**
 * Runs in the page. Returns { grids: [...] } with, per tile grid under `root`: the tile count, the
 * grid's width and column gap in px, the minimum tile width the `--tile-min-width` token resolves
 * to in px (0 when it does not resolve), the columns the tiles stand in as drawn (the most tiles
 * sharing a top), the tiles per row, the narrowest and widest tile, and the tracks the grid declares.
 * Self-contained so a driver can serialise it.
 */
export function probe(root = "main") {
  const scope = document.querySelector(root);
  if (!scope) return { missing: root };
  const tiles = [...scope.querySelectorAll("[data-flip-key][data-slot=console-tile]")];
  const hosts = [...new Set(tiles.map((tile) => tile.parentElement))];
  const grids = hosts.map((host) => {
    const own = tiles.filter((tile) => tile.parentElement === host);
    const style = getComputedStyle(host);
    // The token is resolved by the browser as a length, so rem, px and calc() all read as px.
    const ruler = document.createElement("div");
    ruler.style.cssText = "position:absolute;visibility:hidden;height:0;width:var(--tile-min-width)";
    host.appendChild(ruler);
    const min = ruler.getBoundingClientRect().width;
    ruler.remove();
    const boxes = own.map((tile) => tile.getBoundingClientRect());
    const perTop = new Map();
    for (const box of boxes) {
      const top = Math.round(box.top);
      perTop.set(top, (perTop.get(top) ?? 0) + 1);
    }
    const rows = [...perTop.entries()].sort((a, b) => a[0] - b[0]).map(([, count]) => count);
    return {
      tiles: own.length,
      width: host.clientWidth,
      gap: Number.parseFloat(style.columnGap) || 0,
      min,
      columns: Math.max(...rows),
      rows,
      narrowest: Math.min(...boxes.map((box) => box.width)),
      widest: Math.max(...boxes.map((box) => box.width)),
      tracks: style.gridTemplateColumns.split(" ").filter(Boolean).length,
    };
  });
  return { grids };
}

/**
 * The column count the rule gives, worked out by counting instead of by the formula the kit's
 * code uses, so the two cannot share a slip: the widest row that fits at the minimum tile width,
 * then the fewest columns that keep the rows that many gives.
 */
export function expectedColumns(tiles, width, gap, min, cap = contract.max) {
  let fit = 1;
  for (let c = 2; c <= cap; c++) if (c * min + (c - 1) * gap <= width) fit = c;
  if (tiles <= fit) return tiles;
  const rows = Math.ceil(tiles / fit);
  for (let c = 1; c <= fit; c++) if (Math.ceil(tiles / c) === rows) return c;
  return fit;
}

/** The ways one painted grid breaks the column rule, as strings; empty when it holds. */
export function compare(grid, cap = contract.max) {
  const problems = [];
  const at = `${grid.tiles} tiles in a ${grid.width}px column`;
  if (!(grid.min > 0)) return [`${at}: --tile-min-width does not resolve to a length on the grid, so no width is read`];
  if (grid.columns > cap) problems.push(`${at}: ${grid.columns} columns, more than the ${cap} a row may hold`);
  const expected = expectedColumns(grid.tiles, grid.width, grid.gap, grid.min, cap);
  if (grid.columns !== expected) problems.push(`${at}: ${grid.columns} columns drawn, ${expected} expected at a ${grid.min}px minimum and a ${grid.gap}px gap`);
  if (grid.tracks !== grid.columns) problems.push(`${at}: the grid declares ${grid.tracks} columns and the tiles stand in ${grid.columns}`);
  if (grid.columns > 1 && grid.narrowest < grid.min - 0.5) problems.push(`${at}: a tile is ${Math.round(grid.narrowest * 10) / 10}px wide, under the ${grid.min}px minimum`);
  const last = grid.rows.length - 1;
  grid.rows.forEach((count, i) => {
    if (i < last && count !== grid.columns) problems.push(`${at}: row ${i + 1} holds ${count} tiles of ${grid.columns} columns`);
  });
  return problems;
}

/**
 * The ways a grid painted at a target page column width breaks the contract's cases, as strings.
 * `observation` is { tiles, target, grid }. The written-out cases apply to the reference geometry
 * only; a product that sets another minimum or gap is judged by `compare` alone.
 */
export function compareCase(observation, c = contract) {
  const { target, grid } = observation;
  const problems = [];
  if (Math.abs(grid.width - target) > 1) problems.push(`the page column is ${grid.width}px, not the ${target}px asked for, so the case was not read`);
  const entry = c.cases.find((e) => e.tiles === grid.tiles);
  const geometry = grid.min === c.reference.minWidth && grid.gap === c.reference.gap;
  const wanted = entry?.columns[String(target)];
  if (entry && wanted === undefined) problems.push(`${grid.tiles} tiles have no written case at ${target}px`);
  if (geometry && wanted !== undefined && grid.columns !== wanted) problems.push(`${grid.tiles} tiles at ${target}px: ${grid.columns} columns drawn, the contract says ${wanted}`);
  return problems;
}

if (process.argv.includes("--selftest")) {
  const grid = (tiles, width, columns, over = {}) => {
    const rows = [];
    for (let left = tiles; left > 0; left -= columns) rows.push(Math.min(columns, left));
    const gap = 16;
    return { tiles, width, gap, min: 192, columns, rows, narrowest: (width - gap * (columns - 1)) / columns, widest: (width - gap * (columns - 1)) / columns, tracks: columns, ...over };
  };
  const good = [grid(4, 1440, 4), grid(4, 1024, 4), grid(4, 640, 2), grid(6, 1440, 3), grid(6, 640, 3), grid(9, 1024, 5), grid(9, 640, 3), grid(7, 1440, 4), grid(3, 640, 3), grid(5, 400, 2, { tiles: 5 })];
  // A hit per way the rule can break; each is the form `compare` must refuse.
  const bad = {
    "a lone tile": grid(6, 1440, 5),
    "too many for the width": grid(9, 640, 5),
    "too few for the width": grid(9, 1440, 3),
    "past the cap": grid(12, 1800, 6, { width: 1800 }),
    "an unresolved token": grid(6, 1440, 3, { min: 0 }),
    "tracks apart from the tiles": grid(6, 1440, 3, { tracks: 5 }),
    "a tile under the minimum": grid(4, 1440, 4, { narrowest: 150 }),
    "an uneven row": grid(6, 1440, 3, { rows: [2, 3, 1] }),
  };
  const missed = good.flatMap((g) => compare(g).map((p) => `miss: ${p}`));
  const hits = Object.entries(bad).filter(([, g]) => compare(g).length === 0).map(([name]) => `no hit for ${name}`);
  // The contract's written cases and the counting oracle agree at the reference geometry.
  const drift = [];
  for (const entry of contract.cases) {
    for (const width of contract.widths) {
      const got = expectedColumns(entry.tiles, width, contract.reference.gap, contract.reference.minWidth);
      if (got !== entry.columns[String(width)]) drift.push(`${entry.tiles} tiles at ${width}px: oracle ${got}, contract ${entry.columns[String(width)]}`);
    }
  }
  const caseHit = compareCase({ tiles: 6, target: 1440, grid: grid(6, 1440, 5) });
  const caseMiss = compareCase({ tiles: 6, target: 1440, grid: grid(6, 1440, 3) });
  const offTarget = compareCase({ tiles: 6, target: 1440, grid: grid(6, 1100, 3) });
  const otherGeometry = compareCase({ tiles: 6, target: 1440, grid: grid(6, 1440, 4, { min: 240 }) });
  const ok = missed.length === 0 && hits.length === 0 && drift.length === 0 && caseHit.length === 1 && caseMiss.length === 0 && offTarget.length === 1 && otherGeometry.length === 0;
  console.log(ok ? `tile-columns-rendered selftest: hit ${Object.keys(bad).length + 2}, miss 0` : `tile-columns-rendered selftest FAILED\n${[...missed, ...hits, ...drift, ...caseHit.slice(1), ...caseMiss, ...offTarget.slice(1), ...otherGeometry].join("\n")}`);
  process.exit(ok ? 0 : 1);
}
