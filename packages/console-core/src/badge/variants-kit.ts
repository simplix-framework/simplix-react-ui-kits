import type { ImpactKind } from "../screen/impact-analysis";
import type { JobState } from "../screen/job-tray";

import type { StatusVariant } from "./status-variant";

/**
 * Badge tone per kind of thing an impact analysis groups.
 *
 * @remarks
 * Keyed by the pattern's own vocabulary rather than by an enum: what leans on a record is a
 * question the pattern asks, not a state any record is in.
 *
 * @remarks
 * Only the group a person must judge again is tinted. What follows automatically and what stays
 * exactly as it was submitted are both settled, and tinting them would hide the one group that
 * needs doing.
 */
// **Keyed by the union rather than by `string`, because this one is the kit's own.** A table
// keyed exhaustively refuses to compile when a fourth kind arrives without a tone, and that check
// is worth more than the uniformity: a state nobody gave a tone to is a state drawn in whatever
// the fallback is, silently and forever. The tables below that key by `string` do so because their
// enum lives in a product's domain package, which this package cannot import; where the union is
// declared here, it is used.
export const IMPACT_KIND_VARIANT: Record<ImpactKind, StatusVariant> = {
  automatic: "outline",
  rejudge: "default",
  retained: "secondary",
};

/**
 * Badge tone per state a long-running job is in.
 *
 * @remarks
 * Keyed by the tray's own vocabulary rather than by an enum: a job's state is what the tray tracks
 * while the work outlives the press that started it.
 *
 * @remarks
 * Only the state that needs a person is tinted. A job that failed is the one to open; queued is
 * quiet because it is waiting on nothing but its turn, and running and done both read as the work
 * going as it should.
 */
export const JOB_STATE_VARIANT: Record<JobState, StatusVariant> = {
  queued: "secondary",
  running: "outline",
  done: "outline",
  failed: "default",
};
