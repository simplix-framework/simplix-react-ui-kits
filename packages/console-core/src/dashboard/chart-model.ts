// The arithmetic the dashboard's small charts draw from, kept apart from the drawing so it can be
// tested without a renderer: segment widths of a stage bar, the arc of a progress ring, the heat
// of a cell against its column, and the points of a sparkline.

/** One segment of a stage bar, as a share of the bar's width. */
export interface StageSpan {
  readonly key: string;
  /** Where the segment starts, 0 to 1. */
  readonly start: number;
  /** How wide it is, 0 to 1. */
  readonly width: number;
}

/**
 * The spans of a stage bar: each stage with a count takes its share of the total, and no counted
 * stage is drawn narrower than `minShare`, so a stage holding one of a hundred items stays visible
 * and clickable. The shares taken by the narrow stages come out of the wide ones in proportion.
 * Stages with nothing in them take no width.
 *
 * @param stages the stages in flow order, with their counts
 * @param minShare the narrowest share a counted stage is drawn at
 */
export function stageSpans(stages: readonly { readonly key: string; readonly value: number }[], minShare = 0.06): StageSpan[] {
  const counted = stages.filter((s) => s.value > 0);
  const total = counted.reduce((sum, s) => sum + s.value, 0);
  if (total === 0) return [];
  const floor = Math.min(minShare, 1 / counted.length);
  const raw = counted.map((s) => s.value / total);
  const narrow = raw.map((share) => share < floor);
  const reserved = narrow.filter(Boolean).length * floor;
  const wideTotal = raw.reduce((sum, share, i) => (narrow[i] ? sum : sum + share), 0);
  let start = 0;
  return counted.map((s, i) => {
    const width = narrow[i] ? floor : wideTotal > 0 ? (raw[i] / wideTotal) * (1 - reserved) : floor;
    const span = { key: s.key, start, width };
    start += width;
    return span;
  });
}

/** How much of a ring is filled, and the tone its fill carries. */
export interface RingReading {
  /** Done over due, 0 to 1; 0 when nothing was due. */
  readonly ratio: number;
  /** The rounded percentage the ring prints, or null when nothing was due. */
  readonly percent: number | null;
  readonly tone: "accent" | "warning" | "danger" | "neutral";
}

/**
 * Reads a done-against-due figure for a ring: full at or past what was due, warning below
 * `warnBelow`, danger below `dangerBelow`, and neutral when nothing was due.
 */
export function ringReading(done: number, due: number, warnBelow = 1, dangerBelow = 0.6): RingReading {
  if (due <= 0) return { ratio: 0, percent: null, tone: "neutral" };
  const ratio = Math.max(0, Math.min(1, done / due));
  const tone = ratio < dangerBelow ? "danger" : ratio < warnBelow ? "warning" : "accent";
  return { ratio, percent: Math.round(ratio * 100), tone };
}

/** The dash pattern that fills `ratio` of a circle of radius `r`, starting at twelve o'clock. */
export function ringDash(ratio: number, r: number): { readonly length: number; readonly dasharray: string } {
  const length = 2 * Math.PI * r;
  const filled = Math.max(0, Math.min(1, ratio)) * length;
  return { length, dasharray: `${filled.toFixed(2)} ${length.toFixed(2)}` };
}

/**
 * How hot a cell is against the largest value of its column, in five steps from 0 (nothing) to 4.
 * A zero is always step 0, and any non-zero value is at least step 1 so it never reads as nothing.
 */
export function heatStep(value: number, columnMax: number): 0 | 1 | 2 | 3 | 4 {
  if (value <= 0 || columnMax <= 0) return 0;
  return Math.max(1, Math.min(4, Math.ceil((value / columnMax) * 4))) as 1 | 2 | 3 | 4;
}

/** The points of a sparkline in a box of `width` by `height`, with `pad` kept clear at top and bottom. */
export function sparkPoints(values: readonly number[], width: number, height: number, pad = 3): { readonly x: number; readonly y: number }[] {
  if (values.length === 0) return [];
  const max = Math.max(...values);
  const min = Math.min(0, ...values);
  const span = max - min || 1;
  const step = values.length > 1 ? width / (values.length - 1) : 0;
  return values.map((v, i) => ({ x: values.length > 1 ? i * step : width / 2, y: pad + (height - 2 * pad) * (1 - (v - min) / span) }));
}

/** The change from the first value to the last, signed, for the sparkline's context line. */
export function sparkChange(values: readonly number[]): number {
  return values.length < 2 ? 0 : values[values.length - 1] - values[0];
}

/**
 * One value per category, summed from rows that each name their category: the series a column or
 * line chart draws from a read that returns rows rather than one figure per category (a day's rows
 * per feature and provider, summed to the day). A category no row names is 0; a row whose category
 * is not listed is left out.
 *
 * @param rows the rows read
 * @param categoryOf the category a row belongs to, such as its day
 * @param categories the categories in the order the chart draws them
 * @param valueOf what a row adds to its category
 */
export function sumByCategory<R>(rows: readonly R[], categoryOf: (row: R) => string | null | undefined, categories: readonly string[], valueOf: (row: R) => number | null | undefined): number[] {
  const at = new Map(categories.map((category, index) => [category, index]));
  const sums = categories.map(() => 0);
  for (const row of rows) {
    const index = at.get(categoryOf(row) ?? "");
    if (index !== undefined) sums[index] += valueOf(row) ?? 0;
  }
  return sums;
}

/**
 * The rows summed by a key the read does not group by (the provider a cost came from), largest
 * first and then by key, so a ranked list draws the same order on every read. A row with no key is
 * left out; a key whose sum is 0 is kept.
 *
 * @param rows the rows read
 * @param keyOf the key a row is summed under
 * @param valueOf what a row adds to its key
 */
export function sumsByKey<R>(rows: readonly R[], keyOf: (row: R) => string | null | undefined, valueOf: (row: R) => number | null | undefined): { readonly key: string; readonly value: number }[] {
  const sums = new Map<string, number>();
  for (const row of rows) {
    const key = keyOf(row);
    if (!key) continue;
    sums.set(key, (sums.get(key) ?? 0) + (valueOf(row) ?? 0));
  }
  return [...sums].map(([key, value]) => ({ key, value })).sort((a, b) => b.value - a.value || a.key.localeCompare(b.key));
}
