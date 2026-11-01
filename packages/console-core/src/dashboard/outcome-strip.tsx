import type { CSSProperties } from "react";
import { slotAttributes } from "@simplix-react/ui/design";

import { markColor } from "./chart-tip";
import { outcomeCellStyle, outcomeStripStyle } from "./figure-parts.style";

/** How one attempt ended. */
export type OutcomeTone = "success" | "warning" | "danger" | "neutral";

/** One recent attempt: a request to a provider, a run of a job. */
export interface Outcome {
  readonly key: string;
  readonly tone: OutcomeTone;
  /** What the attempt was and when, under the pointer and to a screen reader. */
  readonly label: string;
}

/**
 * How many of the attempts ended each way, so the strip's reading names the count of failures
 * rather than leaving the reader to count red cells.
 *
 * @param outcomes the attempts
 */
export function outcomeTally(outcomes: readonly Pick<Outcome, "tone">[]): Readonly<Record<OutcomeTone, number>> {
  const tally: Record<OutcomeTone, number> = { success: 0, warning: 0, danger: 0, neutral: 0 };
  for (const one of outcomes) tally[one.tone] += 1;
  return tally;
}

/** Props for {@link OutcomeStrip}. */
export interface OutcomeStripProps {
  /** What the strip reads, with its tally, for a screen reader (「Last 20 requests: 2 failed」). */
  readonly label: string;
  /** The attempts, oldest first, so the newest stands at the right edge. */
  readonly outcomes: readonly Outcome[];
}

/**
 * A row of recent attempts, oldest to newest, one cell each coloured by how it ended: a provider's
 * or a job's health read at a glance, where a red run at the right edge is a failure still going on.
 */
export function OutcomeStrip({ label, outcomes }: OutcomeStripProps) {
  return (
    <div role="img" aria-label={label} {...slotAttributes(outcomeStripStyle, {})}>
      {outcomes.map((one) => (
        <span key={one.key} title={one.label} style={{ "--mark": markColor(one.tone) } as CSSProperties} {...slotAttributes(outcomeCellStyle, {})} />
      ))}
    </div>
  );
}
