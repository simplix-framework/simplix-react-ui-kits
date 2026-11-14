import type { StatusVariant } from "./status-variant";

/**
 * Badge tone per signing key state.
 *
 * @remarks
 * Shared rather than kept per module because the same key is badged on three different screens -
 * the issuing identity, the closed-network issuance history, and one installation's detail - and
 * a key that reads as two different things depending on which screen an operator opened is the
 * defect these tones exist to prevent.
 *
 * @remarks
 * Neither signing nor retirement is a failure: a retired key is doing exactly what it is kept
 * for. So the signing key reads as the live one and a retired one stays quiet. A compromised key
 * is a caution rather than a failure - nothing in the field stops and no customer loses anything,
 * so `destructive` would say something untrue; what it does need is to stand apart from the
 * retired keys beside it, because the operator's next question is which customers it caps.
 */
export const SIGNING_KEY_STATUS_VARIANT: Record<string, StatusVariant> = {
  SIGNING: "success",
  VERIFY_ONLY: "secondary",
  COMPROMISED: "warning",
};

/**
 * Badge tone per service-account credential state.
 *
 * @remarks
 * 만료 is the column the service-account register is read for, and the badge there carries the
 * standing rather than the date alone - a credential still working reads as routine, and one that
 * has stopped reads as something to open.
 *
 * @remarks
 * `EXPIRED` is `default` here and `secondary` in {@link EXPORT_STATUS_VARIANT}, which is the same
 * word about two different things. An export file past its deadline is over and nothing is owed;
 * a credential past its expiry is still being called, and every one of those calls is refused
 * until somebody issues a new one. `REVOKED` is the state that genuinely is over - somebody
 * withdrew it on purpose, the way a retired signing key is doing what it is kept for.
 */
export const API_CLIENT_STATUS_VARIANT: Record<string, StatusVariant> = {
  ACTIVE: "outline",
  EXPIRED: "default",
  REVOKED: "secondary",
};

/**
 * Badge tone per import run state.
 *
 * @remarks
 * A run that half worked is the one an operator has to act on, so it is the only loud state here;
 * a run that landed whole is finished and reads as routine, and everything still moving through
 * the wizard - uploaded, mapped, validated - is quiet because nothing is being asked of anybody
 * yet. A failed run and a reversed one join them: both are over, and neither leaves rows behind
 * for somebody to chase.
 */
export const IMPORT_STATUS_VARIANT: Record<string, StatusVariant> = {
  UPLOADED: "secondary",
  MAPPING: "secondary",
  VALIDATED: "secondary",
  APPLIED: "outline",
  PARTIALLY_APPLIED: "default",
  ROLLED_BACK: "secondary",
  FAILED: "secondary",
};

/**
 * Badge tone per export state.
 *
 * @remarks
 * Shared rather than kept per screen because the same export is badged on the ledger, in its
 * detail and again in the card explaining what each state means - and a copy that reads as
 * finished on one screen and as failed on the next is the defect these tones exist to prevent.
 *
 * @remarks
 * A failed export is the loud one: it is the state where somebody asked for evidence and has none.
 * A file still fetchable reads as the live one; a file being built and a file past its deadline
 * are both quiet, because neither is anything to do now - one is waiting and the other is over.
 */
export const EXPORT_STATUS_VARIANT: Record<string, StatusVariant> = {
  BUILDING: "secondary",
  READY: "outline",
  EXPIRED: "secondary",
  FAILED: "default",
};

/**
 * Badge tone per duplicate-pair decision.
 *
 * @remarks
 * An undecided pair is the only one that asks anything of a reader, so it is the loud one. A pair
 * somebody has merged and a pair somebody has ruled two people are both decisions already taken.
 */
export const DUPLICATE_DECISION_VARIANT: Record<string, StatusVariant> = {
  SUSPECTED: "default",
  MERGED: "outline",
  DISTINCT: "outline",
};

/**
 * Badge tone per verdict on one compared field of a duplicate pair.
 *
 * @remarks
 * Keyed by the verdict the server names rather than by an enum, because a comparison's verdict is
 * a sentence about two values rather than a state either record is in.
 *
 * @remarks
 * Two verdicts are loud and they are loud for opposite reasons: two assignments overlapping in
 * time is the argument AGAINST calling them one person, and a field that simply differs is the
 * one a reader has to choose between. A field neither record fills in is quiet - there is nothing
 * to decide - and a field that matches is the ordinary case.
 */
export const MERGE_FIELD_VERDICT_VARIANT: Record<string, StatusVariant> = {
  periodsOverlap: "default",
  bothAbsent: "secondary",
  same: "outline",
  differs: "default",
};

/**
 * Badge tone per outcome of carrying one kind of record across a merge.
 *
 * @remarks
 * A kind the merge cannot decide by itself is the loud one, because it is the only row that stops
 * the merge being a single press. A kind that merges and a kind joined by its period are both
 * settled by the rule.
 */
export const MERGE_CARRY_OVER_OUTCOME_VARIANT: Record<string, StatusVariant> = {
  MERGED: "outline",
  JOINED_BY_PERIOD: "outline",
  PERSON_DECIDES: "default",
};

/**
 * Badge tone per bulk-run trigger.
 *
 * @remarks
 * A run somebody started reads as the ordinary case and a run the system started reads as the
 * quiet one - the tones are the other way round from a status, because neither is a state to act
 * on and what a reader is scanning for is which of their own runs is which.
 */
export const BULK_OPERATION_TRIGGER_VARIANT: Record<string, StatusVariant> = {
  OPERATOR: "secondary",
  AUTOMATIC: "outline",
};

/**
 * Badge tone per how much of a bulk run can be taken back.
 *
 * @remarks
 * Only 「part of it」 is loud, and that is the whole screen: a run that can be taken back whole and
 * a run that cannot be taken back at all are both one decision, while a run where some targets can
 * go back and others cannot is the one somebody has to work through row by row.
 */
export const BULK_REVERSIBILITY_VARIANT: Record<string, StatusVariant> = {
  FULL: "outline",
  PARTIAL: "default",
  REVERSED: "outline",
  DEADLINE_PASSED: "outline",
  IRREVERSIBLE: "outline",
};

/**
 * Badge tone per who fixes an import row the run refused.
 *
 * @remarks
 * A refusal this installation has to clear is the loud one - 「없는 협력사」 waits on somebody here
 * and on nobody else, while a refusal the uploader fixes goes back with the file.
 */
export const IMPORT_ISSUE_OWNER_VARIANT: Record<string, StatusVariant> = {
  UPLOADER: "outline",
  HOST: "default",
};

/**
 * Badge tone per severity of an import row's issue.
 *
 * @remarks
 * An error kept the row out and a warning let it in, so only the error is asking for anything.
 */
export const IMPORT_ISSUE_SEVERITY_VARIANT: Record<string, StatusVariant> = {
  ERROR: "default",
  WARNING: "outline",
};

/**
 * Badge tone per transformation applied to one column of an import file.
 *
 * @remarks
 * A column carried across untouched and a column reshaped on the way are both ordinary; a column
 * left out is the one that surprises a reader afterwards, and it is drawn quiet rather than loud
 * because leaving a column out is usually what was meant.
 */
export const IMPORT_COLUMN_TRANSFORM_VARIANT: Record<string, StatusVariant> = {
  AS_IS: "outline",
  DATE_FORMAT: "outline",
  PHONE_PREFIX: "outline",
  NAME_LOOKUP: "outline",
  DERIVED: "outline",
  NOT_IMPORTED: "secondary",
};

/**
 * Badge tone per verdict on whether one import run can still be taken back.
 *
 * @remarks
 * Keyed by the verdict the help card names rather than by an enum, because it is a judgement about
 * a run rather than a state stored on one. 「조건부」 is the loud one: it is the only answer that
 * needs reading before pressing, since taking that run back removes changes made since.
 */
export const IMPORT_ROLLBACK_VERDICT_VARIANT: Record<string, StatusVariant> = {
  yes: "outline",
  caution: "default",
  no: "secondary",
};

/**
 * Badge tone per whether a copy was fetched from inside this installation's network.
 *
 * @remarks
 * A fetch from outside is the loud one, and it is the question the download record exists to
 * answer: a file of personal data opened from an address nobody here controls is the line an
 * auditor follows first.
 */
export const DOWNLOAD_ORIGIN_VARIANT: Record<string, StatusVariant> = {
  inside: "outline",
  outside: "default",
};

/**
 * Badge tone per whether a mapped column could be read at all.
 *
 * @remarks
 * A column the run could not read is loud because it is the reason rows were refused; a column it
 * read is drawn as its transformation rather than as a state.
 */
export const IMPORT_COLUMN_READ_VARIANT: Record<string, StatusVariant> = {
  unread: "default",
  read: "outline",
};

/**
 * Badge tone per how a language is cut into searchable pieces.
 *
 * @remarks
 * Tinted where the answer is n-gram, because that is the one that costs index size and the
 * operator's next question is which languages are on it.
 */
export const LANGUAGE_SEGMENTATION_VARIANT: Record<string, StatusVariant> = {
  NGRAM: "warning",
};
