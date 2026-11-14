import type { StatusVariant } from "./status-variant";

/**
 * Badge tone per verdict on whether one duty applies.
 *
 * @remarks
 * Only the applied verdict is drawn filled. The two negatives are different answers and both mean
 * the duty is off the list, so tinting them apart from the positive is what a reader scanning the
 * column needs - applying is the verdict that carries work with it.
 */
export const OBLIGATION_VERDICT_VARIANT: Record<string, StatusVariant> = {
  APPLIED: "default",
};

/**
 * Badge tone per whether a statute in the register reaches this installation.
 *
 * @remarks
 * The applied verdict is the one drawn filled, because it is the one that carries work with it -
 * an excluded row is on the screen so a reader can see the judgement was made, not so they act on
 * it. Sibling of {@link OBLIGATION_VERDICT_VARIANT} and deliberately not shared with it: one names
 * a statute's reach and the other one duty's, and the day either wants a second tone it wants it
 * alone.
 */
export const REGISTER_APPLICABILITY_VARIANT: Record<string, StatusVariant> = {
  APPLIED: "default",
};

/**
 * Badge tone per what a pre-assignment rule does when it fires.
 *
 * @remarks
 * Blocking is the one that stops somebody at the gate, so it is the one that is tinted; warning
 * lets the assignment through and reads as routine.
 */
export const GATE_ACTION_VARIANT: Record<string, StatusVariant> = {
  BLOCK: "warning",
};

/**
 * Badge tone per where a regulation pack stands, when nothing more urgent is true of it.
 *
 * @remarks
 * Every state reads quietly: what an operator acts on is a pack that is unlicensed or has an
 * update waiting, and both of those replace this badge rather than standing beside it.
 */
export const REGULATION_PACK_STATUS_VARIANT: Record<string, StatusVariant> = {};

/**
 * Badge tone per how a duty is met.
 *
 * @remarks
 * A duty nobody has a way of meeting is the one an operator acts on, so it is the one tinted.
 */
export const DUTY_FULFILMENT_METHOD_VARIANT: Record<string, StatusVariant> = {
  NO_METHOD: "warning",
};

/**
 * Badge tone per how one duty came out of a compliance run.
 *
 * @remarks
 * Only the unmet result is tinted. 확인됨 and 일부 and 수기 판정 are all answers somebody gave, and
 * a run whose every line reads amber says nothing about which line to open first.
 */
export const COMPLIANCE_RESULT_VARIANT: Record<string, StatusVariant> = {
  NOT_MET: "warning",
};

/**
 * Badge tone per when the clock on a retained record starts.
 *
 * @remarks
 * Tinted where it starts at the end of an event rather than at creation, because that is the mode
 * whose expiry date cannot be read off the row.
 */
export const RETENTION_EXPIRY_MODE_VARIANT: Record<string, StatusVariant> = {
  EVENT_END: "warning",
};
