import type { StatusVariant } from "./status-variant";

/**
 * Badge tone per kind of area node.
 *
 * @remarks
 * A safety zone is the node an operator treats differently - it is the one carrying the rules a
 * permit is checked against - so it is what a reader scanning a tree of areas has to pick out. An
 * ordinary area is the routine case.
 */
export const AREA_KIND_VARIANT: Record<string, StatusVariant> = {
  AREA: "outline",
  ZONE: "default",
};

/**
 * Badge tone per whether an area is still in use.
 *
 * @remarks
 * In use is the routine case; retired is over, and the node stays in the tree because the records
 * that name it still do.
 *
 * @remarks
 * The same two rows as {@link LINEAR_ASSET_STATUS_VARIANT}, and a table of its own for the reason
 * {@link SITE_STATUS_VARIANT} is one: two enums that happen to agree today are two vocabularies,
 * and either can learn something the other has not.
 */
export const AREA_STATUS_VARIANT: Record<string, StatusVariant> = {
  ACTIVE: "outline",
  RETIRED: "secondary",
};

/**
 * Badge tone per how far one step of a workplace's setup has got.
 *
 * @remarks
 * A finished step is one of the few places `success` earns its green: the card is a checklist
 * somebody works through and what it exists to show is progress. A step nobody has reached is the
 * routine state of such a list rather than something owed, and a deferred one is a decision
 * already taken.
 */
export const SITE_ONBOARDING_STEP_STATUS_VARIANT: Record<string, StatusVariant> = {
  PENDING: "outline",
  DONE: "success",
  DEFERRED: "secondary",
};

/**
 * Badge tone per how far a source settled a holiday's date.
 *
 * @remarks
 * A date cited to a statute and a day that is not statutory at all are both settled - nothing is
 * owed on either. The other three say the date rests on something nobody here has checked: a
 * statute that names the day elsewhere, a lunar date, a designation the law delegates. Those are
 * wrong until somebody verifies them, and the panel draws a notice under them for the same reason.
 */
export const HOLIDAY_VERIFICATION_VARIANT: Record<string, StatusVariant> = {
  CITED: "outline",
  NOT_STATUTORY: "outline",
  DATE_IN_ANOTHER_STATUTE: "warning",
  DATE_IS_LUNAR: "warning",
  DESIGNATION_IS_DELEGATED: "warning",
};

/**
 * Badge tone per what reads a holiday calendar.
 *
 * @remarks
 * Keyed by the help card's own vocabulary rather than by an enum - what reads the calendar is a
 * question the card answers rather than a state any record is in. {@link
 * IMPORT_ROLLBACK_VERDICT_VARIANT} is the precedent for a table the kit holds on a help card's
 * behalf.
 *
 * @remarks
 * The work permit is the one to look at, and it is the only row that is not like the others: every
 * other reader skips holidays, and a permit counts calendar days so a holiday counts against it.
 * That is the difference the card exists to state.
 */
export const HOLIDAY_READER_VARIANT: Record<string, StatusVariant> = {
  businessDay: "outline",
  halfYear: "outline",
  schedule: "outline",
  duty: "outline",
  permit: "default",
};

/**
 * Badge tone per where one version of a drawing stands.
 *
 * @remarks
 * The published version is the one in force and reads as routine. A superseded one is over and a
 * draft has not begun - neither is asking for anything, so both are quiet and it is the word that
 * separates them.
 */
export const FLOOR_PLAN_STATUS_VARIANT: Record<string, StatusVariant> = {
  DRAFT: "secondary",
  PUBLISHED: "outline",
  SUPERSEDED: "secondary",
};
