import type { TranslateFunction } from "@simplix-react/i18n/react";
import type { CrudListFilters } from "@simplix-react/ui";

import type { CrudPageNotice } from "./crud-page";
import type { PageNoticeSpec } from "./types";

/** The narrowing a count notice's action writes: one filter key and its value, or several at once. */
export type CountNoticeNarrowing =
  | { readonly field: string; readonly value: unknown }
  | { readonly values: Readonly<Record<string, unknown>> };

/** What {@link countNotice} raises a notice from. */
export interface CountNoticeSpec {
  /** The notice's constant, which its dismissal is remembered by. */
  readonly key: string;
  readonly kind: PageNoticeSpec["kind"];
  /** How many rows are in the state the notice is about; `undefined` while it is being read. */
  readonly count: number | undefined;
  /**
   * Whether the read of the count failed. The page then raises a warning that it cannot say whether
   * any row is in the state, instead of drawing no notice, which would read as none being there.
   * The words come from the same prefix as `unreadTitle` and `unreadHint`, and the notice is
   * remembered under its own key, so putting the count notice away does not hide it.
   */
  readonly unread?: boolean;
  /**
   * The list narrowing the notice's action writes, in the filter bar's own keys (`status.in`,
   * `signatureVerified.equals`), so the list lands on exactly the rows the notice counts
   * (frontend invariant #48).
   */
  readonly narrow: CountNoticeNarrowing;
  /**
   * Where the words are: the catalog's `t` and the key prefix holding `title` (pluralised by
   * `count`), `hint` and `action`, and `unreadTitle` and `unreadHint` for the unread form.
   */
  readonly words: { readonly t: TranslateFunction; readonly prefix: string };
}

/**
 * A page notice raised while a count is above zero, whose action narrows the list to the rows it
 * counts: the "N payments failed, show them" shape, written once. Where the read of the count
 * failed it is the unread warning instead, which names no count and offers no action.
 *
 * @param spec the count, the narrowing and the words
 * @param filters the list's filter state the action commits to
 * @returns the notice, raised only while the count is above zero
 */
export function countNotice(spec: CountNoticeSpec, filters: Pick<CrudListFilters, "commitValue" | "commitValues">): CrudPageNotice {
  const { t, prefix } = spec.words;
  if (spec.unread) {
    return { key: `${spec.key}-unread`, kind: "warning", when: true, title: t(`${prefix}.unreadTitle`), hint: t(`${prefix}.unreadHint`) };
  }
  const count = spec.count ?? 0;
  const narrow = spec.narrow;
  return {
    key: spec.key,
    kind: spec.kind,
    when: count > 0,
    title: t(`${prefix}.title`, { count }),
    hint: t(`${prefix}.hint`),
    actionLabel: t(`${prefix}.action`),
    onAction: () => ("values" in narrow ? filters.commitValues({ ...narrow.values }) : filters.commitValue(narrow.field, narrow.value)),
  };
}
