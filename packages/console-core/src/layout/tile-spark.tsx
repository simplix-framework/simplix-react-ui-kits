import { cn, STATUS_TONES, type StatusTone } from "@simplix-react/ui";

/** The board's two shapes: a measure over time, and counts per period. */
export type TileSparkShape = "line" | "bars";

/** The slot {@link StatCard} reserves beside the figure, in the board's own numbers. */
const SLOT_WIDTH = 84;
const SLOT_HEIGHT = 26;

/** How wide the gap between two bars is, at the slot's own scale. */
const BAR_GAP = 3;

/**
 * How far the line is held off the slot's top and bottom edges.
 *
 * <p>An `svg` element hides its own overflow, so a point at `y = 0` loses the upper half of its
 * stroke and the highest reading in the series is drawn thinner than every other one.
 */
const LINE_INSET = 1;

/**
 * The shortest bar drawn for a period that is not zero.
 *
 * <p>Without it a quiet day beside a busy one is one pixel of ink and reads as nothing happening,
 * which is a different claim from 「적었다」. A period that really is zero draws no bar at all.
 */
const BAR_FLOOR = 2;

interface TileSparkProps {
  /**
   * Which shape, taken from the frame that draws this tile.
   *
   * <p>`line` for a measure read over time — a rate, an average, a percentage; `bars` for a count
   * per period. The board fixes the form because the form is what the question decides (P-25), so
   * a screen reads it off its own frame rather than choosing.
   */
  readonly shape: TileSparkShape;
  /**
   * The series behind the figure, oldest first.
   *
   * <p><b>A real series or nothing.</b> P-24: 「시계열이 없는 값(지금 참인 것의 개수)에는 넣지
   * 않는다 — 없는 추세를 지어내는 셈이 된다」. Fewer than two points is not a series, and this
   * draws nothing rather than a mark that would be read as one.
   */
  readonly series: readonly number[];
  /**
   * The tile's own tone, where it has crossed a threshold.
   *
   * <p>Passed so the shape is tinted with the card it sits on rather than left in the text colour
   * over a warning tint, which is the one place the two disagree.
   */
  readonly tone?: StatusTone;
}

/**
 * The shape behind a tile's figure — no axis, no gridlines, no labels (P-24).
 *
 * <p><b>What it is for.</b> 「지난달보다 5% 늘었다」 answers what changed between two points and
 * hides everything between them: a figure that fell for three weeks and jumped in the last two days
 * reads the same as one that climbed steadily, and only one of those is a problem. The number above
 * is what is read; this says whether that number is where it has been heading.
 *
 * <p><b>It is a shape and not a chart</b>, which is why it is drawn here rather than taken from
 * `useChartAdapter()`. Every member of that adapter is a full plot with axes, gridlines and a
 * toolbar sized for a panel; none of them has a sparkline mode, and one squeezed into 84×26 draws
 * its furniture and nothing else. **Where this belongs is a seventh member of `ChartAdapter` in
 * `@simplix-react/ui`**, beside the six plots, so every console that draws a stat tile gets it.
 * Until that exists this holds the two shapes so no screen invents a third.
 *
 * <p><b>It is drawn in `currentColor`.</b> A saturated series colour on a console with no saturated
 * pixel anywhere else reads as a chart library's default rather than as part of the card, and the
 * card already carries the colour the tile is meant to be read in — plain, or its tone where it has
 * crossed a threshold.
 *
 * <p>Marked `aria-hidden`: it carries no value the figure and its basis do not already carry, and a
 * screen reader announcing seven unnamed numbers between the figure and its basis is noise.
 *
 * @param props the shape, the series behind the figure, and the tile's tone
 * @returns the shape, or nothing where there is no series to draw
 */
export function TileSpark({ shape, series, tone }: TileSparkProps) {
  // One point is a reading rather than a trend, and none is nothing. Either way the tile draws its
  // figure and no shape, which is what the board asks for where a measure has no series.
  if (series.length < 2) return null;

  const tint = tone ? STATUS_TONES[tone].icon : "text-muted-foreground";
  const className = cn("block h-[26px] w-full", tint);

  if (shape === "bars") {
    // Counts per period start at zero, so the bars are drawn from zero: a baseline anywhere else
    // makes 41 beside 38 look like a doubling. The tallest period fills the slot, which is what
    // makes the shape readable when every value is small.
    const top = Math.max(...series, 0);
    const step = SLOT_WIDTH / series.length;
    const width = Math.max(step - BAR_GAP, 1);
    return (
      <svg
        viewBox={`0 0 ${SLOT_WIDTH} ${SLOT_HEIGHT}`}
        className={className}
        aria-hidden
        focusable="false"
      >
        {series.map((value, index) => {
          const height = top > 0 && value > 0
            ? Math.max((value / top) * SLOT_HEIGHT, BAR_FLOOR)
            : 0;
          return height === 0 ? null : (
            <rect
              // The index IS the identity here: a series is a position per period, and two periods
              // with the same count are not the same period.
              key={index}
              x={index * step}
              y={SLOT_HEIGHT - height}
              width={width}
              height={height}
              rx={1}
              fill="currentColor"
              opacity={0.45}
            />
          );
        })}
      </svg>
    );
  }

  // A measure over time is read for its direction, so the line spans what the series actually did
  // rather than the distance from zero — pinned to zero, a rate that moved from 78% to 92% is a
  // flat line across the top of the slot and says the opposite of what happened.
  const low = Math.min(...series);
  const high = Math.max(...series);
  const span = high - low;
  const points = series
    .map((value, index) => {
      const x = (index / (series.length - 1)) * SLOT_WIDTH;
      const floor = SLOT_HEIGHT - LINE_INSET;
      // A series that never moved is drawn along the middle rather than at either edge: on the
      // floor it reads as zero throughout, at the ceiling as a maximum held.
      const y = span === 0
        ? SLOT_HEIGHT / 2
        : floor - ((value - low) / span) * (floor - LINE_INSET);
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg
      viewBox={`0 0 ${SLOT_WIDTH} ${SLOT_HEIGHT}`}
      // Stretched to whatever the slot is, so the shape keeps the board's proportions at the one
      // width the card gives it. The stroke is held out of that stretch below, or a slot narrower
      // than 84px would draw a line thinner at one end than the other.
      preserveAspectRatio="none"
      className={className}
      aria-hidden
      focusable="false"
    >
      <polyline
        points={points}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
