import type { StatusVariant } from "./status-variant";

/**
 * Badge tone per delegation standing.
 *
 * @remarks
 * A delegation is a standing exception to who approves, and every one of its states is a state
 * somebody meant - so none of them shouts. `ACTIVE` is where a delegation spends its working life
 * and is what the reader is scanning for; that it is worth finding does not make it worth
 * tinting, and reserving `default` here would leave nothing for a row that needs opening.
 * Scheduled has not begun and both endings are over, so all three are quiet on their own side of
 * `outline`.
 */
export const DELEGATION_STATUS_VARIANT: Record<string, StatusVariant> = {
  SCHEDULED: "secondary",
  ACTIVE: "outline",
  ENDED: "secondary",
  RELEASED: "secondary",
};

/**
 * Badge tone per approval line template standing.
 *
 * @remarks
 * The same three-way shape as any template that is drafted, used, and retired: only the one in
 * use is live, and a draft and a retirement are equally quiet because neither is owed anything.
 * A retired line is doing what retirement is for, so it is not a caution.
 */
export const APPROVAL_LINE_STATUS_VARIANT: Record<string, StatusVariant> = {
  ACTIVE: "outline",
  DRAFT: "secondary",
  RETIRED: "secondary",
};

/**
 * Badge tone per proxy allowance on an approval kind.
 *
 * @remarks
 * Both rows are policy somebody configured, so neither is a fault to be flagged. `FORBIDDEN` was
 * drawn `destructive` on the two screens this replaces, which read as an error where the truth is
 * that an installation decided this kind may not be proxied - the tone is reserved for a control
 * that destroys, and spending it here would spend it everywhere.
 */
export const PROXY_ALLOWANCE_VARIANT: Record<string, StatusVariant> = {
  ALLOWED: "outline",
  FORBIDDEN: "secondary",
};

/**
 * Badge tone per outcome of a test mail.
 *
 * @remarks
 * Two of the four need a person and two do not, which is what separates this from a status where
 * only the ending matters. A bounce names a bad address and a block names a refusing server, and
 * both wait for somebody; a delay is still in flight and nothing is owed until it settles.
 * Delivery is merely fine rather than actively good, so it stays `outline` and leaves the green
 * unspent.
 */
export const MAIL_TEST_OUTCOME_VARIANT: Record<string, StatusVariant> = {
  DELIVERED: "outline",
  BOUNCED: "default",
  DELAYED: "secondary",
  BLOCKED: "default",
};

/**
 * Badge tone per review standing of a message template.
 *
 * @remarks
 * Only the wording waiting on a reviewer is anybody's job, and it is the row this pill exists to
 * surface. A template whose review is not required is not a lesser state than an approved one -
 * both are settled, and the reader has nothing to do about either.
 */
export const TEMPLATE_REVIEW_STATE_VARIANT: Record<string, StatusVariant> = {
  NOT_REQUIRED: "secondary",
  APPROVED: "outline",
  PENDING_REVIEW: "default",
};

/**
 * Badge tone per connection state of a message channel.
 *
 * @remarks
 * A channel this installation has not connected is the one row on that screen anybody is there to
 * act on, so it takes `default`. It is not `warning`: nothing is broken and nothing has failed -
 * the channel was never wired up, and a tone meaning 「wrong until fixed」 would say an operator
 * had made a mistake where they have simply not finished.
 */
export const CHANNEL_CONNECTION_STATE_VARIANT: Record<string, StatusVariant> = {
  CONNECTED: "outline",
  NOT_CONNECTED: "default",
};

/**
 * Badge tone per notification grade.
 *
 * @remarks
 * A grade is a class of rule rather than a state, and the tint carries the whole distinction where
 * the column is dropped at a narrow width - a 도달 확인 필요 rule then reads exactly like a
 * 일반 통지 one, which is what the screen exists to tell apart. `DELIVERY_CONFIRMED` earns
 * `default` because it is the grade that obliges somebody to confirm; the five screens this
 * replaces all drew it `warning`, which said the rule was wrong rather than stricter.
 */
export const NOTIFICATION_GRADE_VARIANT: Record<string, StatusVariant> = {
  GENERAL: "outline",
  DELIVERY_CONFIRMED: "default",
};

/**
 * Badge tone per outcome of one notification reaching one person.
 *
 * @remarks
 * Only a failure is anybody's job. A notification that arrived and was opened and one that arrived
 * and was not are both delivered as far as the sender is concerned - whether somebody read it is
 * the 도달 확인 필요 grade's question, asked in the column that counts it rather than in this tint.
 *
 * @remarks
 * The pill this replaces toned on `readAt` while labelling from `outcome`, so a row whose outcome
 * was 실패 drew the quiet tone whenever the delivery happened to carry a read stamp - the word said
 * one thing and the colour said another, and a reader takes the two as one statement.
 */
export const DELIVERY_OUTCOME_VARIANT: Record<string, StatusVariant> = {
  READ: "outline",
  DELIVERED_ONLY: "secondary",
  FAILED: "default",
};

/**
 * Badge tone per outcome of proving an emergency contact still answers.
 *
 * @remarks
 * Not a generated enum - the DTO carries a boolean and the screen names its two ends, which is why
 * the keys are this table's own vocabulary rather than a server's. It is still a status and not a
 * setting: nobody switched it, it is what happened when somebody rang the number, and one end
 * leaves a number that has to be chased.
 */
export const CONTACT_VERIFICATION_OUTCOME_VARIANT: Record<string, StatusVariant> = {
  SUCCEEDED: "outline",
  FAILED: "default",
};

/**
 * Badge tone per whether a duty roster change reached the person it moved.
 *
 * @remarks
 * The same shape as the verification above and named the same way, from a boolean the DTO carries.
 * An unnotified change is somebody rostered for a night they have not been told about, so it is
 * the row an operator is on the screen to find.
 */
export const ROSTER_CHANGE_NOTICE_VARIANT: Record<string, StatusVariant> = {
  NOTIFIED: "outline",
  NOT_NOTIFIED: "default",
};

/**
 * Badge tone per whether a notice has been written in one language.
 *
 * @remarks
 * From a per-language boolean rather than an enum, like the two above. A missing translation is a
 * reader who cannot read the notice, so somebody has to write it - but nothing is wrong with what
 * is already there, which is why it is `default` rather than `warning`.
 */
export const NOTICE_TRANSLATION_STATE_VARIANT: Record<string, StatusVariant> = {
  WRITTEN: "outline",
  MISSING: "default",
};
