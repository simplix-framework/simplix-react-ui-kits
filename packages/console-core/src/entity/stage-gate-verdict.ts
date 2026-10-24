/** Where one precondition of a command stands. `held` waits on an interpretation nobody has made yet. */
export type StageConditionState = "met" | "unmet" | "held";

/** The counts a {@link StageGate} decides from, and whether its command may run. */
export interface StageGateVerdict {
  /** True only when every condition is met; an empty list is met. */
  readonly enabled: boolean;
  readonly met: number;
  readonly unmet: number;
  readonly held: number;
  /** What keeps the command disabled: an unmet condition first, then a held one. */
  readonly blockedBy: "unmet" | "held" | null;
}

/**
 * Decides whether a command whose preconditions are these may run.
 *
 * <p>A held condition blocks exactly as an unmet one does: an interpretation still open is not a
 * condition met, and a gate that let it through would run the command on a rule nobody has read.
 *
 * @param conditions the preconditions in any order
 * @returns the counts and the enable decision
 */
export function stageGateVerdict(conditions: readonly { readonly state: StageConditionState }[]): StageGateVerdict {
  let met = 0;
  let unmet = 0;
  let held = 0;
  for (const condition of conditions) {
    if (condition.state === "met") met += 1;
    else if (condition.state === "unmet") unmet += 1;
    else held += 1;
  }
  const blockedBy = unmet > 0 ? "unmet" : held > 0 ? "held" : null;
  return { enabled: blockedBy === null, met, unmet, held, blockedBy };
}
