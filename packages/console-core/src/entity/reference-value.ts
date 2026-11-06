import { useCallback } from "react";
import { useTranslation } from "@simplix-react/i18n/react";

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
  /** The name the record had when this one was written; the id where none was recorded. */
  readonly name: string;
  /** The field of the referenced record `id` is a value of, where it is not its id. */
  readonly by?: string;
  /**
   * Whether the record names a person: drawn as the avatar, the name and a second line. A reference
   * of {@link PERSON_KIND} is a person without being told.
   */
  readonly person?: boolean;
  /** The second line under a person's name; the word for a user by default. */
  readonly sub?: string;
  /** The noun the gone explanation names, where the kind has no word of its own (an owner's type). */
  readonly noun?: string;
  /** What the record that holds the reference already says about it: `DELETED`, `UNAVAILABLE`, else live. */
  readonly state?: string;
}

/**
 * Builds the value every reference is drawn from, so a person or a record is drawn one way on every
 * screen: the name that opens the record's peek, a person with the avatar seeded by their id and a
 * second line, and the record's existence asked before anybody presses it. A record the holding row
 * already marks as gone, or that the lookup answers is gone, is drawn as muted text with a badge
 * saying why (`gone`), never as a link.
 *
 * @returns `(target) => RecordValue`
 */
export function useReferenceValue(): (target: ReferenceTarget) => RecordValue {
  const { t } = useTranslation(PACKAGE_NAMESPACE + "/features");
  const peek = usePeekHost();
  return useCallback(
    (target: ReferenceTarget): RecordValue => {
      const { kind, id, name, by, noun, state } = target;
      const person = target.person ?? kind === PERSON_KIND;
      const look = person ? { avatar: id, sub: target.sub ?? t("recordGone.personLine") } : {};
      const kindName = t(`recordGone.kinds.${kind || noun || "record"}`, { defaultValue: t("recordGone.kinds.record") });
      const goneAs = (reason: "deleted" | "unavailable"): RecordGone => ({
        name,
        reason,
        ...look,
        badge: t(`recordGone.reasons.${reason}.badge`),
        title: t(`recordGone.reasons.${reason}.title`, { kind: kindName }),
      });
      if (state === "DELETED" || state === "UNAVAILABLE") return { gone: goneAs(state === "DELETED" ? "deleted" : "unavailable") };
      if (!kind) return { link: name, ...look };
      return {
        link: name,
        ...look,
        onClick: () => peek.open({ kind, target: { id, name, ...(by ? { by } : {}) } }),
        // A value that is another field than the id cannot be looked up by id.
        ...(by ? {} : { check: { kind, id, gone: { deleted: goneAs("deleted"), unavailable: goneAs("unavailable") } } }),
      };
    },
    [peek, t],
  );
}
