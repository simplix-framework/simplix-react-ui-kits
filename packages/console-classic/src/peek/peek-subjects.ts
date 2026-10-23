import { SUBJECTS } from "../identity/subjects";

/**
 * What a reader must be allowed to view before a record of each kind is offered as a control.
 *
 * <p><b>Here rather than on each screen, because a screen does not always know the kind.</b> A
 * field copied out of another record carries the kind with it — an approval's filed 「구역」 says
 * `area`, its 「신청자」 says `userAccount` — so the screen drawing it hands the host whatever the
 * record filed. What it still owes the reader is the permission check, and a table written per
 * screen would answer the same question differently on the next one.
 *
 * <p><b>A kind absent from this table draws its value as text.</b> A trigger that opens nothing
 * reads as a broken screen, and a reference to a part of the product this console cannot open is a
 * value rather than a defect — so the absence is the safe answer, not an omission to fill in.
 *
 * <p><b>This table is also where a data-driven opener declares what it can open.</b> Nothing else
 * in the source names those kinds: `peekKindsAreRegistered` reads a `kind="…"` written at a call
 * site, and a field whose kind arrives with the data writes none. Adding a row here is what says
 * the console is prepared to open that kind.
 */
export const PEEK_SUBJECT: Record<string, string> = {
  area: SUBJECTS.site,
  organization: SUBJECTS.organization,
  role: SUBJECTS.userRole,
  userAccount: SUBJECTS.userAccount,
};
