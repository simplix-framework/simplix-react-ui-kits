import { useCallback } from "react";
import { useI18n, useTranslation } from "@simplix-react/i18n/react";

import { usePeekHost } from "../peek";

import { PACKAGE_NAMESPACE } from "./locales";
import type { RecordGone, RecordValue } from "./record-value";

/** The kind of record a person reference opens; a user owner and an actor are accounts too. */
export const PERSON_KIND = "userAccount";

/** One reference to another record, as a cell, a detail field, a notice or a tab row names it. */
export interface ReferenceTarget {
  /** The referenced entity's name (its peek kind); absent where the console cannot open it. */
  readonly kind?: string;
  /** The value the reference holds: the record's id, or the field `by` names. */
  readonly id: string;
  /**
   * The name the record had when this one was written. Absent where the holding record names
   * nothing: the reference is drawn as the referenced entity's label and the start of its id
   * (「Credit hold 01a1af93」), still opening its peek and asking whether it is gone.
   */
  readonly name?: string;
  /** The field of the referenced record `id` is a value of, where it is not its id. */
  readonly by?: string;
  /**
   * Whether the record names a person: drawn as the avatar and the name. A reference of
   * {@link PERSON_KIND} is a person without being told.
   */
  readonly person?: boolean;
  /**
   * The second line under a person's name; none by default. A screen passes it only where it tells
   * people apart (an actor's type, an owner's kind, a sign-in name or an email), never as a word
   * every row repeats. A gone person keeps it out as well.
   */
  readonly sub?: string;
  /** The noun the gone explanation names, where the kind has no word of its own (an owner's type). */
  readonly noun?: string;
  /** What the record that holds the reference already says about it: `DELETED`, `UNAVAILABLE`, else live. */
  readonly state?: string;
}

/**
 * Builds the value every reference is drawn from, so a person or a record is drawn one way on every
 * screen: the name that opens the record's peek, a person with the avatar seeded by their id and a
 * optional caption, and the record's existence asked before anybody presses it. A record the holding row
 * already marks as gone, or that the lookup answers is gone, is drawn as muted text with an icon
 * saying why (`gone`), never as a link.
 *
 * @returns `(target) => RecordValue`
 */
export function useReferenceValue(): (target: ReferenceTarget) => RecordValue {
  const { t } = useTranslation(PACKAGE_NAMESPACE + "/features");
  const peek = usePeekHost();
  const unnamedText = useUnnamedText();
  return useCallback(
    (target: ReferenceTarget): RecordValue => {
      const { kind, id, by, noun, state } = target;
      const name = target.name ?? unnamedText(kind, id);
      // A person nothing names has no initials to draw.
      const person = target.name !== undefined && (target.person ?? kind === PERSON_KIND);
      const look = person ? { avatar: id } : {};
      const live = person && target.sub ? { ...look, sub: target.sub } : look;
      const kindName = t(`recordGone.kinds.${kind || noun || "record"}`, { defaultValue: t("recordGone.kinds.record") });
      const goneAs = (reason: "deleted" | "unavailable"): RecordGone => ({
        name,
        reason,
        ...look,
        badge: t(`recordGone.reasons.${reason}.badge`),
        title: t(`recordGone.reasons.${reason}.title`, { kind: kindName }),
      });
      if (state === "DELETED" || state === "UNAVAILABLE") return { gone: goneAs(state === "DELETED" ? "deleted" : "unavailable") };
      if (!kind) return { link: name, ...live };
      return {
        link: name,
        ...live,
        onClick: () => peek.open({ kind, target: { id, name, ...(by ? { by } : {}) } }),
        // A value that is another field than the id cannot be looked up by id.
        ...(by ? {} : { check: { kind, id, gone: { deleted: goneAs("deleted"), unavailable: goneAs("unavailable") } } }),
      };
    },
    [peek, t, unnamedText],
  );
}

/** How many characters of a long id a reference nothing names shows: enough to tell rows apart. */
const ID_PREFIX = 8;

/**
 * The text of a reference whose holding record names nothing: the referenced entity's label from
 * its domain catalog (`entity/<kind>` `_label`, as {@link useScreenWords} reads it) and the start of
 * its id; the whole id where the catalog states no label or the id is short.
 */
function useUnnamedText(): (kind: string | undefined, id: string) => string {
  const { t } = useTranslation(PACKAGE_NAMESPACE + "/features");
  const i18n = useI18n();
  return useCallback(
    (kind: string | undefined, id: string) => {
      const label = kind && i18n?.exists("_label", `entity/${kind}`) ? i18n.tn(`entity/${kind}`, "_label") : undefined;
      if (!label) return id;
      const shown = id.length > ID_PREFIX + 4 ? id.slice(0, ID_PREFIX) : id;
      return t("recordValue.unnamedReference", { label, id: shown });
    },
    [i18n, t],
  );
}
