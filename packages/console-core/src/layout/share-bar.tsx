import { Flex, Stack, Text } from "@simplix-react/ui";
import { shareSegmentStyle, shareSwatchStyle, shareTrackStyle } from "./share-bar.style";
import { slotAttributes } from "@simplix-react/ui/design";

/** One share of the whole, as it is drawn and as it is named. */
export interface Share {
  /** A stable key, so React can tell the segments apart. */
  readonly key: string;
  /** What this share is called, in the reader's language. */
  readonly label: string;
  /** How many of the whole fall in it. */
  readonly count: number;
  /** Which of the four tints draws it. */
  readonly tone: "primary" | "secondary" | "muted" | "warning";
}

interface ShareBarProps {
  /** What the bar divides, as a heading over it. */
  readonly title: string;
  /** The shares, in the order they are drawn from the left. */
  readonly shares: readonly Share[];
  /** The sentence under the bar, saying what the shares mean. */
  readonly note?: string;
}

/**
 * One population divided into named shares, drawn as a single bar.
 *
 * <p><b>Here rather than as a chart.</b> A chart runtime answers a question this does not ask: a
 * share bar has no axis, no time and no series — it is a whole cut into parts, and the parts are
 * named beside it. Reaching for the chart adapter would make every screen that divides a population
 * depend on a runtime the console does not otherwise need.
 *
 * <p><b>Every share is named, including the empty one.</b> A category with nobody in it is a fact
 * about the population — 「아직 없음 0명」 says everybody has been reached — so the legend carries it
 * even though the bar draws nothing for it.
 *
 * <p><b>The counts are the legend, not a tooltip.</b> A figure only a hovering mouse can reach is
 * absent from a printed page, from a screenshot and from a touch screen.
 */
export function ShareBar({ title, shares, note }: ShareBarProps) {
  const total = shares.reduce((sum, share) => sum + share.count, 0);

  return (
    <Stack gap="sm">
      <Text weight="medium">{title}</Text>
      {/* raw layout: a stacked proportion bar; the framework ships no share primitive */}
      <div className="flex h-3 w-full overflow-hidden" {...slotAttributes(shareTrackStyle, {})}>
        {shares.map((share) => (
          <div
            key={share.key}
            style={{ width: total > 0 ? `${(share.count / total) * 100}%` : "0%" }}
            {...slotAttributes(shareSegmentStyle, { tone: share.tone })}
          />
        ))}
      </div>
      <Flex gap="md" wrap>
        {shares.map((share) => (
          <Flex key={share.key} gap="xs" align="center">
            {/* raw layout: a legend swatch matching the segment above it */}
            <span className="size-2" aria-hidden {...slotAttributes(shareSwatchStyle, { tone: share.tone })} />
            <Text size="caption" tone="muted">
              {share.label} {share.count}
            </Text>
          </Flex>
        ))}
      </Flex>
      {note ? (
        <Text size="caption" tone="muted">
          {note}
        </Text>
      ) : undefined}
    </Stack>
  );
}
