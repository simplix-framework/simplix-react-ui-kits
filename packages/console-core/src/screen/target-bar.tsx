import { Flex, Stack, Text } from "@simplix-react/ui";

/** One measure and the target it is being read against. */
export interface TargetBarRow {
  /** Stable key, unique within the chart. */
  readonly key: string;
  /** What is being measured — 위험성평가 이행률 · 교육 이수율. */
  readonly label: string;
  /** Where it stands now. */
  readonly value: number;
  /** What it is aiming at. Drawn as a rule across the track, not as a second bar. */
  readonly target: number;
  /** What both numbers are counted in — `%` · 건 · 명. */
  readonly unit?: string;
}

/** Props for {@link TargetBar}. */
export interface TargetBarProps {
  readonly rows: readonly TargetBarRow[];
  /**
   * The top of the scale every row is drawn against.
   *
   * <p>One scale for the whole chart, so two rows of the same length mean the same thing. Defaults
   * to the largest value or target present, which is right for a set counted in one unit and wrong
   * for a set that is not — 「축은 하나다」 is the board's rule and this is where it is kept.
   */
  readonly max?: number;
}

/**
 * 목표까지의 진척 (P-25) — a bar with the target drawn across it.
 *
 * <p><b>The one shape of the board's five the framework cannot express.</b> 선 · 막대 · 누적 ·
 * 분포 are `LineChart`, `BarChart`, a stacked `BarChart` and a `BarChart` over bins; none of the
 * framework's chart props carries an annotation, so a target has nowhere to go and the reader is
 * left comparing a bar against a number written somewhere else.
 *
 * <p><b>The target is a rule, not a second bar.</b> Two bars invite the reader to compare their
 * lengths and answer 「어느 쪽이 큰가」; a rule answers the question that was asked — 「목표에
 * 닿았는가」 — with one glance and no arithmetic.
 *
 * <p><b>The numbers are beside the shape, so nothing is read off pixels.</b> That is also the
 * board's 「같은 데이터를 표로도 제공한다」 rule met at the size this shape has: a reader using a
 * screen reader gets the two figures rather than a picture with no values in it.
 */
export function TargetBar({ rows, max }: TargetBarProps) {
  const ceiling =
    max ?? rows.reduce((high, row) => Math.max(high, row.value, row.target), 0) ?? 0;

  return (
    <Stack gap="sm">
      {rows.map((row) => {
        // Guarded rather than trusted: a ceiling of zero is what an empty period answers with, and
        // dividing by it paints every track full — the reading furthest from the truth.
        const share = ceiling > 0 ? Math.min(100, (row.value / ceiling) * 100) : 0;
        const mark = ceiling > 0 ? Math.min(100, (row.target / ceiling) * 100) : 0;
        const reached = row.value >= row.target;
        const unit = row.unit ?? "";
        return (
          <Stack key={row.key} gap="xs">
            <Flex align="baseline" justify="between" gap="sm">
              <Text size="sm" className="min-w-0 truncate">
                {row.label}
              </Text>
              <Text size="caption" tone="muted" className="shrink-0">
                {`${row.value}${unit} / ${row.target}${unit}`}
              </Text>
            </Flex>
            {/* A track and a rule are a drawing rather than a layout, and the framework has no
                primitive for either — `Flex` and `Stack` arrange things, they do not paint one.
                The figures above carry the same two numbers, so nothing here is read off pixels. */}
            <div
              className="relative h-2 w-full overflow-hidden rounded-full bg-muted"
              role="img"
              aria-label={`${row.label} ${row.value}${unit} / ${row.target}${unit}`}
            >
              <div
                className={`h-full rounded-full ${reached ? "bg-primary" : "bg-muted-foreground/60"}`}
                style={{ width: `${share}%` }}
              />
              <div
                className="absolute inset-y-0 w-px bg-foreground"
                style={{ left: `${mark}%` }}
                aria-hidden
              />
            </div>
          </Stack>
        );
      })}
    </Stack>
  );
}
