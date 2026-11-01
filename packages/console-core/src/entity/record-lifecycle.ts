import type { HistoryNode } from "../screen/history-rail";

/** One step of a record's lifecycle: received, processed; queued, running, finished. */
export interface LifecycleStep {
  readonly key: string;
  readonly label: string;
  /** When the record reached it, as the reader reads it; absent while it has not. */
  readonly at?: string | null;
  /** How the step ended where reaching it is not the whole story (a failure). */
  readonly tone?: HistoryNode["tone"];
  /** What the step says beyond its time: an error, who acted. */
  readonly detail?: string;
}

/** What {@link lifecycleNodes} reads besides the steps. */
export interface LifecycleOptions {
  /**
   * The record has stopped moving (finished, failed, cancelled), so its last reached step is done
   * rather than current and the steps after it will not happen.
   */
  readonly ended?: boolean;
}

/**
 * The rail a record's lifecycle is drawn as, from its steps in order.
 *
 * <p>A step with a time is reached. The last reached step is the current one while the record is
 * still moving, and done once it has ended. A step before it with no time was passed over (a
 * record that went from received to failed was never processed), and a step after it is still to
 * come, or never, once the record has ended.
 *
 * @param steps the steps, in the order the record moves through them
 * @param options whether the record has stopped moving
 * @returns the nodes of a {@link HistoryRail}
 */
export function lifecycleNodes(steps: readonly LifecycleStep[], options: LifecycleOptions = {}): HistoryNode[] {
  const reached = (step: LifecycleStep) => step.at !== undefined && step.at !== null && step.at !== "";
  let last = -1;
  steps.forEach((step, index) => {
    if (reached(step)) last = index;
  });
  return steps.map((step, index) => {
    const state: HistoryNode["state"] =
      index < last ? (reached(step) ? "done" : "skip") : index === last ? (options.ended ? "done" : "active") : options.ended ? "skip" : "pending";
    return {
      key: step.key,
      label: step.label,
      state,
      ...(step.tone && reached(step) ? { tone: step.tone } : {}),
      ...(reached(step) ? { trail: step.at } : {}),
      ...(step.detail ? { body: step.detail } : {}),
    };
  });
}
