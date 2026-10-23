import { slotAttributes } from "@simplix-react/ui/design";

import { progressFillStyle, progressTrackStyle } from "./progress-bar.style";

interface ProgressBarProps {
  /** How far along, 0–100. Values outside that range are clamped rather than overflowing. */
  percent: number;
  /** What the bar is reporting, for a reader who cannot see it. */
  label?: string;
}

/**
 * A determinate progress bar.
 *
 * <p>Here rather than in each screen because the framework ships no progress primitive and two
 * places already needed one — an upload in flight and a file being written. Two hand-rolled
 * copies drift on the parts a reader notices: the height, the radius, and whether the fill
 * animates.
 *
 * <p>Determinate only. A bar that cannot say how far along it is tells the reader less than a
 * sentence does, and an indeterminate stripe invites them to wait for a percentage that will
 * never arrive.
 */
export function ProgressBar({ percent, label }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, Number.isFinite(percent) ? percent : 0));
  return (
    // raw layout: a determinate progress bar; the framework ships no progress primitive
    <div
      className="h-2 overflow-hidden"
      role="progressbar"
      aria-valuenow={Math.round(clamped)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
      {...slotAttributes(progressTrackStyle, {})}
    >
      <div className="h-full" style={{ width: `${clamped}%` }} {...slotAttributes(progressFillStyle, {})} />
    </div>
  );
}
