import type { StatusVariant } from "./status-variant";

/**
 * Badge tone per machine standing.
 *
 * @remarks
 * Shared rather than kept per screen because the same machine is badged in the area panel and
 * again on the zone policy screen - and a machine that reads as routine on one and as a caution on
 * the other is the defect these tones exist to prevent.
 *
 * @remarks
 * Running is the ordinary case and carries no tint. Stopped is a state somebody has to end before
 * the machine works again, and it is also the row a reader checking a zone's coverage has to see,
 * because a zone's rules stop reaching a machine that is not running. Disposed is the end of it
 * and reads as past, so a row arriving through a stale narrowing says so rather than reading as
 * running.
 */
export const EQUIPMENT_STATUS_VARIANT: Record<string, StatusVariant> = {
  OPERATING: "outline",
  STOPPED: "warning",
  DISPOSED: "secondary",
};

/**
 * Badge tone per whether a line is still in service.
 *
 * @remarks
 * A line in use is the ordinary case and carries no tint; one that has been taken out of service
 * is the end of it and reads as past - and it still has work booked against it in the records that
 * name it, which is why it stays in the register.
 */
export const LINEAR_ASSET_STATUS_VARIANT: Record<string, StatusVariant> = {
  ACTIVE: "outline",
  RETIRED: "secondary",
};

/**
 * Badge tone per workplace standing.
 *
 * @remarks
 * Running is the ordinary case and carries no tint; a workplace that has not opened yet is one
 * somebody still has work to do on; a closed one is evidence now and reads as past.
 *
 * @remarks
 * `OPERATING` here is a workplace and `OPERATING` in {@link EQUIPMENT_STATUS_VARIANT} is a
 * machine. Two enums sharing a constant name are two vocabularies, so they stay two tables however
 * alike the rows look.
 */
export const SITE_STATUS_VARIANT: Record<string, StatusVariant> = {
  OPERATING: "outline",
  PREPARING: "warning",
  CLOSED: "secondary",
};

/**
 * Badge tone per where a person stands on the roster.
 *
 * @remarks
 * Being worked is the ordinary case and carries no tint; nobody is alarmed by somebody on the
 * books with no work on them; leaving is the end of it and reads as past.
 */
export const WORKER_STATUS_VARIANT: Record<string, StatusVariant> = {
  ASSIGNED: "outline",
  UNASSIGNED: "warning",
  TERMINATED: "secondary",
};

/**
 * Badge tone per verdict on whether a person may be put to work today.
 *
 * @remarks
 * The only genuinely destructive tone in this file, and it earns it: a blocked person put to work
 * is the failure the verdict exists to prevent. Expiring is the caution - the clearance still
 * holds today and somebody has to act before it does not - and met is the ordinary case.
 */
export const WORKER_CLEARANCE_VERDICT_VARIANT: Record<string, StatusVariant> = {
  MET: "outline",
  BLOCKED: "destructive",
  EXPIRING: "warning",
};

/**
 * Badge tone per how a person identifies themselves at the gate.
 *
 * @remarks
 * The app and the card are both answers and read alike; having neither is the row somebody has to
 * clear, because a person with no method cannot be let through by any of them.
 */
export const WORKER_IDENTITY_METHOD_VARIANT: Record<string, StatusVariant> = {
  APP: "outline",
  CARD: "outline",
  NONE: "warning",
};

/**
 * Badge tone per how far a person's invitation has got.
 *
 * @remarks
 * An invitation that went out and bounced is the loud one: somebody was invited, believes they
 * were not, and nothing else on the row says so. Sent and accepted are both progress and read
 * alike; not yet sent is quiet, because it is waiting on a decision rather than on a fix.
 */
export const WORKER_INVITATION_STATE_VARIANT: Record<string, StatusVariant> = {
  NOT_SENT: "secondary",
  SENT: "outline",
  ACCEPTED: "outline",
  UNDELIVERED: "destructive",
};

/**
 * Badge tone per band a job position sits in.
 *
 * @remarks
 * Every band reads the same way, because none of them is a standing - 임원 · 관리 · 현장 · 사원 say
 * where a rank sits, not how it is doing, and a toned badge would read as a state somebody is in.
 */
export const JOB_POSITION_CATEGORY_VARIANT: Record<string, StatusVariant> = {
  EXECUTIVE: "outline",
  MANAGEMENT: "outline",
  FIELD: "outline",
  STAFF: "outline",
};

/**
 * Badge tone per registered kind of organization node.
 *
 * @remarks
 * Keyed by the registration's own identifier rather than by an enum: what kinds exist is a thing
 * each installation registers, so a kind this table does not carry falls through to the badge's
 * own default - which is the same neutral it would have been given.
 *
 * @remarks
 * Neutral throughout, because a kind is not a verdict.
 */
export const ORGANIZATION_TYPE_VARIANT: Record<string, StatusVariant> = {
  COMPANY: "secondary",
  SITE: "default",
  DEPARTMENT: "outline",
  TEAM: "outline",
  CONTRACTOR: "secondary",
};

/**
 * Badge tone per severity a dashboard row carries.
 *
 * @remarks
 * Keyed by the word the server puts on the row rather than by an enum - the field is a plain
 * string, so what a panel may say is decided by whatever composes it.
 *
 * @remarks
 * The four are a severity scale rather than a lifecycle, which is why this is the one table where
 * `success` is used: a row that is done is the good news a dashboard exists to show, and the
 * scale needs an end that is not the same tint as its middle.
 */
export const DASHBOARD_ROW_TONE_VARIANT: Record<string, StatusVariant> = {
  NEUTRAL: "outline",
  WARN: "warning",
  CRITICAL: "destructive",
  DONE: "success",
};
