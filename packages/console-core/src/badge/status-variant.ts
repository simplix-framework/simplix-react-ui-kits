/** Badge tone vocabulary shared by every status/category pill in this project. */
export type StatusVariant =
  | "default"
  | "secondary"
  | "outline"
  | "destructive"
  | "success"
  | "warning";

/**
 * **What each tone means, so a table is not a matter of taste.**
 *
 * <p>The vocabulary is written once so that every table reads the same: a two-state setting is
 * never `warning` on one screen and `outline` on the next. Read this before adding a table, and
 * add a row here rather than a new tone.
 *
 * | tone | what it says | examples |
 * | --- | --- | --- |
 * | `outline` | routine, settled, the state a record spends most of its life in | `APPLIED` · `MERGED` · `READY` |
 * | `secondary` | inactive, not yet begun, or over - nothing is owed | `UPLOADED` · `EXPIRED` · `VERIFY_ONLY` |
 * | `default` | **a person has to look**, and this is the only tone that says so | `PARTIALLY_APPLIED` · `SUSPECTED` · `PERSON_DECIDES` · `FAILED` |
 * | `success` | actively good rather than merely fine - rare, and it earns its green | `SIGNING` |
 * | `warning` | wrong now and wrong until somebody fixes it | `COMPROMISED` |
 * | `destructive` | reserved for a control that destroys, not for a state |  |
 *
 * <p><b>The loud tones are scarce on purpose.</b> `FAILED` is `default` rather than red because a
 * screen where three states shout has told the reader nothing about which one to open first - the
 * scarcity is what makes `default` readable at a glance, and every table that spends it on a
 * routine state spends it for every other table too.
 */

/** Resolves a status value to its Badge tone, defaulting to `outline`. */
export function statusVariant(map: Record<string, StatusVariant>, value: string): StatusVariant {
  return map[value] ?? "outline";
}
