import type { ReactNode } from "react";

import { Badge, type BadgeProps, EmptyValue } from "@simplix-react/ui";
import { resolveBootEnum } from "@simplix-react-ext/simplix-boot-utils";

import { statusVariant, type StatusVariant } from "./status-variant";

/**
 * <b>The framework exports a `StatusBadge` too, and it is a different component.</b> Its takes a
 * `tone` and a `label`; this one takes a value and a variant map. A file drawing both imports this
 * one as `EnumStatusBadge`, the way `site/widgets/area/*` does - and the reason to know that in
 * advance is that TypeScript reports the collision as `Duplicate identifier`, which says nothing
 * about badges and sends a reader looking for a repeated import.
 */

/** Props for {@link StatusBadge}. */
export interface StatusBadgeProps {
  /** Shared enum simple name (e.g. `VisitApprovalStatus`, `LeaveRequestStatus`). */
  enumName: string;
  /** Raw status value from the DTO (string or boot-enum object). */
  value: unknown;
  /**
   * Labels the resolved enum value. Optional - enum message keys are merged
   * globally (`enums.{Name}.{CONST}`), so a caller may pass its own `enumLabel`;
   * without one the raw value is shown.
   */
  enumLabel?: (enumName: string, value: string) => string;
  /** Tone map keyed by raw status value - the domain's pill vocabulary. */
  variantMap: Record<string, StatusVariant>;
  /**
   * What stands where the value is absent.
   *
   * <p><b>`<EmptyValue />` by default</b> - the shared no-value affordance every other absent value
   * in this console draws. It is the default rather than something a list cell passes because the
   * list population is the larger and the more visible one, and a cell that renders nothing at all
   * reads as a screen that failed rather than as a row with no value. What it must never be is a
   * hand-typed dash: six screens typing their own arrived at three different characters.
   *
   * <p><b>Pass `null` to draw nothing</b>, which is the detail row's case: a detail row whose value
   * can legitimately be absent uses `DetailFields.DetailBadgeField`, and that wrapper draws the
   * affordance itself - a second one inside it would be two em-dashes in one row.
   */
  fallback?: ReactNode;
}

/**
 * Status pill for an entity row. Normalizes the boot enum, tones the badge by
 * status through the domain's variant map, and labels it through the shared
 * enum translations. Draws the shared no-value affordance for an absent value - a detail row
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
 * itself. An enum pill is sometimes a control - the source badge beside a resolved policy value
 * opens the precedence record that explains it - and without the pass-through such a pill was
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
   * SECOND value - two facts in one pill read as one, and the second one has no catalogue behind
   * it, so it stops following the catalogue into the next language while the first goes on doing
   * so. Where the qualifier is a fact of its own, it is its own badge beside this one.
   */
  suffix?: ReactNode;
  /**
   * What stands where the value is absent - the shared no-value affordance by default, `null` in a
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
  /** What the switched-on state is called - never a bare "Yes". */
  onLabel: string;
  /** What the switched-off state is called - the other setting, not the absence of one. */
  offLabel: string;
  /**
   * The tone for the switched-on state, where quiet is wrong for it.
   *
   * @remarks
   * Left out, both states are quiet and that is the right default - see the note on the component.
   *
   * <p><b>Passing ONE tone is the silent failure; passing neither is symmetric and safe.</b> The
   * unnamed end takes a default the caller never read, and the two can land on the same token - at
   * which point the badge has stopped saying anything and nothing fails. That is the shape of it;
   * naming both is the remedy. A conversion that inverts the predicate is where it happens, because
   * **flipping which side is `on` flips which default you inherit**: `on={row.isActive !== false}`
   * with only `offVariant` given draws both states alike, and the screen it replaced did not.
   * Passed, it says this setting's state is one an operator acts on: a workplace whose setup is
   * unfinished, a rank nobody may be given, a holiday that still counts as a business day. **The
   * tone vocabulary above decides which**, and `default` is almost always the answer - it is the
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
 * nothing there would read as unanswered. Both tones stay quiet by default - a setting is
 * routine traffic, and the loud tones are reserved for the states an operator must act on.
 *
 * <p><b>Some settings are that.</b> A workplace whose setup is unfinished and a rank nobody may be
 * given are switches, not statuses - the flag is the right component - and drawing them in the
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
  /** What the true end is called - never a bare "Yes". */
  trueLabel: string;
  /** What the false end is called - the other state, not the absence of one. */
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
 * and a reason, never through a switch in a form - so drawing it with a component whose prop is
 * called `on` says the reader could flip it, and they cannot. The same holds for a value nobody
 * sets at all: whether a name is frozen at the time of record, whether a holiday reaches a
 * workplace, whether an onboarding is finished.
 *
 * <b>The prop is `value` and that is the whole point.</b> A conversion inverting the predicate to
 * suit its labels - `on={row.isActive === false}` with `onLabel` 「폐쇄」 - draws the right pixels
 * and says the opposite of what it means, and the next reader believes the prop. `value` cannot be
 * read that way.
 *
 * <b>Both tones default to the quiet pair</b>, as a flag's do, and for the same reason: most states
 * are routine and the loud tones are scarce on purpose. The tone vocabulary above decides when one
 * is earned - and **passing one tone rather than both is the silent failure**, because the unnamed
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
// screen to badge that value finds it. Where the vocabulary is not a generated enum at all - a
// verdict the server names, a kind the pattern defines - the table says that in its remarks.
