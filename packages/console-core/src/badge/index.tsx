import type { ReactNode } from "react";
import type { ImpactKind } from "../screen/impact-analysis";
import type { JobState } from "../screen/job-tray";

import { Badge, type BadgeProps, EmptyValue } from "@simplix-react/ui";
import { resolveBootEnum } from "@simplix-react-ext/simplix-boot-utils";

/** Badge tone vocabulary shared by every status/category pill in this project. */
export type StatusVariant =
  | "default"
  | "secondary"
  | "outline"
  | "destructive"
  | "success"
  | "warning";

/**
 * <b>The framework exports a `StatusBadge` too, and it is a different component.</b> Its takes a
 * `tone` and a `label`; this one takes a value and a variant map. A file drawing both imports this
 * one as `EnumStatusBadge`, the way `site/widgets/area/*` does — and the reason to know that in
 * advance is that TypeScript reports the collision as `Duplicate identifier`, which says nothing
 * about badges and sends a reader looking for a repeated import.
 */

/** Resolves a status value to its Badge tone, defaulting to `outline`. */
export function statusVariant(map: Record<string, StatusVariant>, value: string): StatusVariant {
  return map[value] ?? "outline";
}

/** Props for {@link StatusBadge}. */
export interface StatusBadgeProps {
  /** Shared enum simple name (e.g. `VisitApprovalStatus`, `LeaveRequestStatus`). */
  enumName: string;
  /** Raw status value from the DTO (string or boot-enum object). */
  value: unknown;
  /**
   * Labels the resolved enum value. Optional — enum message keys are merged
   * globally (`enums.{Name}.{CONST}`), so a caller may pass its own `enumLabel`;
   * without one the raw value is shown.
   */
  enumLabel?: (enumName: string, value: string) => string;
  /** Tone map keyed by raw status value — the domain's pill vocabulary. */
  variantMap: Record<string, StatusVariant>;
  /**
   * What stands where the value is absent.
   *
   * <p><b>`<EmptyValue />` by default</b> — the shared no-value affordance every other absent value
   * in this console draws. It is the default rather than something a list cell passes because the
   * list population is the larger and the more visible one, and a cell that renders nothing at all
   * reads as a screen that failed rather than as a row with no value. What it must never be is a
   * hand-typed dash: six screens typing their own arrived at three different characters.
   *
   * <p><b>Pass `null` to draw nothing</b>, which is the detail row's case: a detail row whose value
   * can legitimately be absent uses `DetailFields.DetailBadgeField`, and that wrapper draws the
   * affordance itself — a second one inside it would be two em-dashes in one row.
   */
  fallback?: ReactNode;
}

/**
 * Status pill for an entity row. Normalizes the boot enum, tones the badge by
 * status through the domain's variant map, and labels it through the shared
 * enum translations. Draws the shared no-value affordance for an absent value — a detail row
 * whose value can legitimately be absent uses `DetailFields.DetailBadgeField`, which draws its
 * own, and passes `fallback={null}` so there are not two.
 *
 * Domain modules re-export this with their default variant map applied, so
 * call sites keep their short local import.
 */
export function StatusBadge({
  enumName,
  value,
  enumLabel,
  variantMap,
  fallback = <EmptyValue />,
}: StatusBadgeProps) {
  const resolved = resolveBootEnum(value);
  if (!resolved) return <>{fallback}</>;
  const label = enumLabel ? enumLabel(enumName, resolved) : resolved;
  return <Badge variant={statusVariant(variantMap, resolved)}>{label}</Badge>;
}

/**
 * Props for {@link EnumBadge}.
 *
 * @remarks
 * <b>Everything a `Badge` takes passes through</b>, minus the two this component decides for
 * itself. An enum pill is sometimes a control — the source badge beside a resolved policy value
 * opens the precedence record that explains it — and without the pass-through such a pill was
 * drawn by hand, which is how it lost the boot-enum resolution, the catalogue word and the
 * absent-value affordance that this component exists to carry.
 */
export interface EnumBadgeProps extends Omit<BadgeProps, "variant" | "children" | "ref"> {
  /** Shared enum simple name (e.g. `CardIssuanceMode`, `WorkLocationType`). */
  enumName: string;
  /** Raw enum value from the DTO (string or boot-enum object). */
  value: unknown;
  /** Labels the resolved enum value. Pass the entity's `enumLabel`. */
  enumLabel: (enumName: string, value: string) => string;
  /** Badge tone (defaults to `secondary` for categorical kinds/types/modes). */
  variant?: StatusVariant;
  /**
   * A qualifier about the SAME value, drawn inside the pill after the catalogue word.
   *
   * @remarks
   * 「출입문 · 수기」 is one enforcement point said fully: the value is the door, and the qualifier
   * is that this site has no door integration to enforce it with. What it must never carry is a
   * SECOND value — two facts in one pill read as one, and the second one has no catalogue behind
   * it, so it stops following the catalogue into the next language while the first goes on doing
   * so. Where the qualifier is a fact of its own, it is its own badge beside this one.
   */
  suffix?: ReactNode;
  /**
   * What stands where the value is absent — the shared no-value affordance by default, `null` in a
   * detail row, where `DetailFields.DetailBadgeField` already draws one. Same contract as
   * {@link StatusBadgeProps.fallback}, and defaulted the same way so the two siblings cannot be
   * copied from each other into different behaviour.
   */
  fallback?: ReactNode;
}

/**
 * Categorical enum pill (kind / type / mode / role / channel / unit). Normalizes
 * the boot enum and labels it through the shared enum translations.
 */
export function EnumBadge({
  enumName,
  value,
  enumLabel,
  variant = "secondary",
  fallback = <EmptyValue />,
  suffix,
  ...badge
}: EnumBadgeProps) {
  const resolved = resolveBootEnum(value);
  if (!resolved) return <>{fallback}</>;
  return (
    <Badge variant={variant} {...badge}>
      {enumLabel(enumName, resolved)}
      {suffix}
    </Badge>
  );
}

/** Props for {@link FlagBadge}. */
export interface FlagBadgeProps {
  /** Which of the two states the record is in. */
  on: boolean | undefined | null;
  /** What the switched-on state is called — never a bare "Yes". */
  onLabel: string;
  /** What the switched-off state is called — the other setting, not the absence of one. */
  offLabel: string;
  /**
   * The tone for the switched-on state, where quiet is wrong for it.
   *
   * @remarks
   * Left out, both states are quiet and that is the right default — see the note on the component.
   *
   * <p><b>Passing ONE tone is the silent failure; passing neither is symmetric and safe.</b> The
   * unnamed end takes a default the caller never read, and the two can land on the same token — at
   * which point the badge has stopped saying anything and nothing fails. That is the shape of it;
   * naming both is the remedy. A conversion that inverts the predicate is where it happens, because
   * **flipping which side is `on` flips which default you inherit**: `on={row.isActive !== false}`
   * with only `offVariant` given draws both states alike, and the screen it replaced did not.
   * Passed, it says this setting's state is one an operator acts on: a workplace whose setup is
   * unfinished, a rank nobody may be given, a holiday that still counts as a business day. **The
   * tone vocabulary above decides which**, and `default` is almost always the answer — it is the
   * one tone that means a person has to look, and spending `warning` on a setting spends it for
   * every table in this file.
   */
  onVariant?: StatusVariant;
  /** The tone for the switched-off state, on the same terms. */
  offVariant?: StatusVariant;
}

/**
 * Two-state pill for a boolean setting an operator can switch.
 *
 * @remarks
 * Both states are named, because a flag's off state is a setting of its own rather than
 * a missing value: a product that is not self-serve is issued by an operator, and printing
 * nothing there would read as unanswered. Both tones stay quiet by default — a setting is
 * routine traffic, and the loud tones are reserved for the states an operator must act on.
 *
 * <p><b>Some settings are that.</b> A workplace whose setup is unfinished and a rank nobody may be
 * given are switches, not statuses — the flag is the right component — and drawing them in the
 * same grey as 「자동 갱신 켬」 loses the only thing the screen had to say about them. So the two
 * tones can be given, and the default stays quiet because most settings are.
 *
 * <p><b>What keeps that from becoming a licence to shout is the vocabulary rather than the
 * component.</b> A table could always have spent `default` on a routine state; nothing stopped it
 * but the note above these tables, and that note governs this prop the same way. A flag that
 * passes a tone is claiming its state is one a person has to look at, and it is read the same as
 * any other table making that claim.
 */
export function FlagBadge({ on, onLabel, offLabel, onVariant, offVariant }: FlagBadgeProps) {
  const tone = on ? (onVariant ?? "secondary") : (offVariant ?? "outline");
  return <Badge variant={tone}>{on ? onLabel : offLabel}</Badge>;
}

/** What a two-valued state is called at each end, and how loudly each is drawn. */
export interface StateBadgeProps {
  /** Which end the record is at. */
  value: boolean | undefined | null;
  /** What the true end is called — never a bare "Yes". */
  trueLabel: string;
  /** What the false end is called — the other state, not the absence of one. */
  falseLabel: string;
  /** The tone for the true end. */
  trueVariant?: StatusVariant;
  /** The tone for the false end. */
  falseVariant?: StatusVariant;
}

/**
 * Two-state pill for a value that is a **state** rather than a setting.
 *
 * @remarks
 * <b>The difference from {@link FlagBadge} is who put the record here.</b> A setting is switched by
 * an operator; a state is where the record has got to. Invariant #74 draws the line and draws it
 * hard: a record's active / suspended / closed state moves through an action with a confirmation
 * and a reason, never through a switch in a form — so drawing it with a component whose prop is
 * called `on` says the reader could flip it, and they cannot. The same holds for a value nobody
 * sets at all: whether a name is frozen at the time of record, whether a holiday reaches a
 * workplace, whether an onboarding is finished.
 *
 * <b>The prop is `value` and that is the whole point.</b> A conversion inverting the predicate to
 * suit its labels — `on={row.isActive === false}` with `onLabel` 「폐쇄」 — draws the right pixels
 * and says the opposite of what it means, and the next reader believes the prop. `value` cannot be
 * read that way.
 *
 * <b>Both tones default to the quiet pair</b>, as a flag's do, and for the same reason: most states
 * are routine and the loud tones are scarce on purpose. The tone vocabulary above decides when one
 * is earned — and **passing one tone rather than both is the silent failure**, because the unnamed
 * end takes a default nobody read and the two can land on the same token. Neither, or both.
 */
export function StateBadge({
  value, trueLabel, falseLabel, trueVariant, falseVariant,
}: StateBadgeProps) {
  const tone = value ? (trueVariant ?? "secondary") : (falseVariant ?? "outline");
  return <Badge variant={tone}>{value ? trueLabel : falseLabel}</Badge>;
}

// ── The tone tables ────────────────────────────────────────────────────────
//
// **Every table below keys by the raw string the server sends, never by a constant imported from
// a domain package.** This kit is the product-neutral layer and does not depend on
// a product's domain packages (`@<scope>/domain-*`), so `[EquipmentStatus.OPERATING]` cannot be written here even where the
// screen that first drew the table wrote it that way. Each generated enum's constant name is
// checked against its value before its table is written (`OPERATING: 'OPERATING'`), and the plain
// key is safe only because that holds. An enum whose constants and values differ needs the value,
// not the constant's name, and the table says so on its own row.
//
// **A table is named for what it maps, not for the screen that drew it first**, so the second
// screen to badge that value finds it. Where the vocabulary is not a generated enum at all — a
// verdict the server names, a kind the pattern defines — the table says that in its remarks.

/**
 * **What each tone means, so a table is not a matter of taste.**
 *
 * <p>Eleven screens picked their own tones for the same shape before these tables were gathered —
 * a two-state setting drew `warning` on one screen and `outline` on the next — and none of them was
 * careless: the vocabulary was never written down, so every author derived it again. Read this
 * before adding a table, and add a row here rather than a new tone.
 *
 * | tone | what it says | examples in this file |
 * | --- | --- | --- |
 * | `outline` | routine, settled, the state a record spends most of its life in | `APPLIED` · `MERGED` · `READY` |
 * | `secondary` | inactive, not yet begun, or over — nothing is owed | `UPLOADED` · `EXPIRED` · `VERIFY_ONLY` |
 * | `default` | **a person has to look**, and this is the only tone that says so | `PARTIALLY_APPLIED` · `SUSPECTED` · `PERSON_DECIDES` · `FAILED` |
 * | `success` | actively good rather than merely fine — rare, and it earns its green | `SIGNING` |
 * | `warning` | wrong now and wrong until somebody fixes it | `COMPROMISED` |
 * | `destructive` | reserved for a control that destroys, not for a state |  |
 *
 * <p><b>The loud tones are scarce on purpose.</b> `FAILED` is `default` rather than red because a
 * screen where three states shout has told the reader nothing about which one to open first — the
 * scarcity is what makes `default` readable at a glance, and every table that spends it on a
 * routine state spends it for every other table too.
 */
/**
 * Badge tone per signing key state.
 *
 * @remarks
 * Shared rather than kept per module because the same key is badged on three different screens —
 * the issuing identity, the closed-network issuance history, and one installation's detail — and
 * a key that reads as two different things depending on which screen an operator opened is the
 * defect these tones exist to prevent.
 *
 * @remarks
 * Neither signing nor retirement is a failure: a retired key is doing exactly what it is kept
 * for. So the signing key reads as the live one and a retired one stays quiet. A compromised key
 * is a caution rather than a failure — nothing in the field stops and no customer loses anything,
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
 * standing rather than the date alone — a credential still working reads as routine, and one that
 * has stopped reads as something to open.
 *
 * @remarks
 * `EXPIRED` is `default` here and `secondary` in {@link EXPORT_STATUS_VARIANT}, which is the same
 * word about two different things. An export file past its deadline is over and nothing is owed;
 * a credential past its expiry is still being called, and every one of those calls is refused
 * until somebody issues a new one. `REVOKED` is the state that genuinely is over — somebody
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
 * the wizard — uploaded, mapped, validated — is quiet because nothing is being asked of anybody
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
 * detail and again in the card explaining what each state means — and a copy that reads as
 * finished on one screen and as failed on the next is the defect these tones exist to prevent.
 *
 * @remarks
 * A failed export is the loud one: it is the state where somebody asked for evidence and has none.
 * A file still fetchable reads as the live one; a file being built and a file past its deadline
 * are both quiet, because neither is anything to do now — one is waiting and the other is over.
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
 * one a reader has to choose between. A field neither record fills in is quiet — there is nothing
 * to decide — and a field that matches is the ordinary case.
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
 * quiet one — the tones are the other way round from a status, because neither is a state to act
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
 * A refusal this installation has to clear is the loud one — 「없는 협력사」 waits on somebody here
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

/**
 * Badge tone per verdict on whether one duty applies.
 *
 * @remarks
 * Only the applied verdict is drawn filled. The two negatives are different answers and both mean
 * the duty is off the list, so tinting them apart from the positive is what a reader scanning the
 * column needs — applying is the verdict that carries work with it.
 */
export const OBLIGATION_VERDICT_VARIANT: Record<string, StatusVariant> = {
  APPLIED: "default",
};

/**
 * Badge tone per whether a statute in the register reaches this installation.
 *
 * @remarks
 * The applied verdict is the one drawn filled, because it is the one that carries work with it —
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

/**
 * Badge tone per machine standing.
 *
 * @remarks
 * Shared rather than kept per screen because the same machine is badged in the area panel and
 * again on the zone policy screen — and a machine that reads as routine on one and as a caution on
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
 * is the end of it and reads as past — and it still has work booked against it in the records that
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
 * is the failure the verdict exists to prevent. Expiring is the caution — the clearance still
 * holds today and somebody has to act before it does not — and met is the ordinary case.
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
 * Every band reads the same way, because none of them is a standing — 임원 · 관리 · 현장 · 사원 say
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
 * own default — which is the same neutral it would have been given.
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
 * Keyed by the word the server puts on the row rather than by an enum — the field is a plain
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

/**
 * Badge tone per delegation standing.
 *
 * @remarks
 * A delegation is a standing exception to who approves, and every one of its states is a state
 * somebody meant — so none of them shouts. `ACTIVE` is where a delegation spends its working life
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
 * that an installation decided this kind may not be proxied — the tone is reserved for a control
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
 * surface. A template whose review is not required is not a lesser state than an approved one —
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
 * act on, so it takes `default`. It is not `warning`: nothing is broken and nothing has failed —
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
 * the column is dropped at a narrow width — a 도달 확인 필요 rule then reads exactly like a
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
 * and was not are both delivered as far as the sender is concerned — whether somebody read it is
 * the 도달 확인 필요 grade's question, asked in the column that counts it rather than in this tint.
 *
 * @remarks
 * The pill this replaces toned on `readAt` while labelling from `outcome`, so a row whose outcome
 * was 실패 drew the quiet tone whenever the delivery happened to carry a read stamp — the word said
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
 * Not a generated enum — the DTO carries a boolean and the screen names its two ends, which is why
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
 * reader who cannot read the notice, so somebody has to write it — but nothing is wrong with what
 * is already there, which is why it is `default` rather than `warning`.
 */
export const NOTICE_TRANSLATION_STATE_VARIANT: Record<string, StatusVariant> = {
  WRITTEN: "outline",
  MISSING: "default",
};

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

/**
 * Badge tone per kind of area node.
 *
 * @remarks
 * A safety zone is the node an operator treats differently — it is the one carrying the rules a
 * permit is checked against — so it is what a reader scanning a tree of areas has to pick out. An
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
 * A date cited to a statute and a day that is not statutory at all are both settled — nothing is
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
 * Keyed by the help card's own vocabulary rather than by an enum — what reads the calendar is a
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
 * draft has not begun — neither is asking for anything, so both are quiet and it is the word that
 * separates them.
 */
export const FLOOR_PLAN_STATUS_VARIANT: Record<string, StatusVariant> = {
  DRAFT: "secondary",
  PUBLISHED: "outline",
  SUPERSEDED: "secondary",
};
