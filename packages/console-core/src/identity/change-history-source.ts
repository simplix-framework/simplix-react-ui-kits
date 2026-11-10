import { createContext, useContext } from "react";

/** One value a change moved, as the recorder wrote it. */
export interface ChangeHistoryChange {
  /** The field's own name, as the entity's catalogue keys it. */
  readonly field?: string;
  /** What it read before. */
  readonly before?: string;
  /** What it reads now. */
  readonly after?: string;
  /**
   * Which enum both values belong to, where they are one.
   *
   * <p>A constant is not a label: a change to a categorised field stores `MANAGEMENT`, and the
   * value alone does not say which catalogue to look it up in — two enums may share a constant.
   * The recorder names the enum, and the screen resolves it exactly.
   */
  readonly valueEnum?: string;
}

/**
 * One recorded event, in the shape this table draws.
 *
 * <p>Deliberately not the audit DTO: the DTO belongs to whichever module owns the audit endpoint,
 * and this package must not know that module exists. The adapter maps one to the other, which is
 * also what stops a regenerated client silently changing what the table renders.
 */
export interface ChangeHistoryEvent {
  /** Stable within the page — the table keys its rows on it. */
  readonly eventId: string;
  /** When it happened, as an instant the caller's zone reads. */
  readonly occurredAt?: string;
  /** Who did it, by the name a person recognises. */
  readonly actor?: string;
  /**
   * What was done, raw.
   *
   * <p>Unresolved on purpose: the badge that draws it resolves the boot envelope itself, and
   * resolving here would leave the badge looking up a string that is already a label.
   */
  readonly action?: unknown;
  /** Why, as whoever did it wrote it. */
  readonly reason?: string;
  /** The values that moved. Empty where the event named none — a sign-in, a read, a delete. */
  readonly changes?: readonly ChangeHistoryChange[];
}

/** What one page of a record's history asks for. */
export interface ChangeHistoryRequest {
  /** The audited entity's simple name, as the recorder writes it. */
  readonly entityType: string;
  /** One record's history rather than the whole type's. */
  readonly entityId?: string;
  /** The kinds of change this read is about, rather than every event the type records. */
  readonly actions?: readonly string[];
  readonly page: number;
  readonly size: number;
  /**
   * How the reader asked the rows to be ordered, in the server's own grammar
   * (`occurredAt.desc`).
   *
   * <p>Absent, the newest first — which is the order an audit trail is read in and the one the
   * table opens on.
   */
  readonly sort?: readonly string[];
  /**
   * What the reader narrowed by, in the server's own filter grammar
   * (`actorUsername.contains`, `occurredAt.between`).
   *
   * <p><b>A history is a list, so it is searchable.</b> A tab that pages and offers nothing else
   * leaves somebody looking at 「전체 240건」 with no way to find one of them (frontend invariant
   * #71).
   */
  readonly filters?: Record<string, unknown>;
}

/** What the reader answered. */
export interface ChangeHistoryAnswer {
  readonly events: readonly ChangeHistoryEvent[];
  readonly totalPages: number;
  /** Absent while the read has not answered and absent again when it failed. */
  readonly totalElements: number | undefined;
  readonly isLoading: boolean;
  readonly isError: boolean;
}

/**
 * Reads one page of a record's history.
 *
 * <p><b>It is a hook, and it is held in a context.</b> The value stored is a module-level function
 * that the installation registers once, so it is the same function on every render and the rules
 * of hooks hold — {@link useChangeHistory} calls it exactly once, unconditionally.
 */
export type ChangeHistoryReader = ((
  request: ChangeHistoryRequest,
  enabled: boolean,
) => ChangeHistoryAnswer) & {
  /**
   * The prefix of the reader's query keys (the audit endpoint's path), which a save invalidates so
   * every history over it reads again.
   *
   * <p>The installation owns the audit endpoint, so the installation names it; a history whose
   * reader names a different address than the one invalidated never refreshes after a save.
   */
  readonly address?: string;
};

const MISSING_SOURCE =
  "No ChangeHistorySourceProvider is mounted. The change-history panel (P-18) is a pattern and " +
  "lives here; the audit read belongs to the module that owns the audit endpoint. Mount that " +
  "module's provider at the app root, above every screen that shows a record's history.";

const ChangeHistorySourceContext = createContext<ChangeHistoryReader | null>(null);

/**
 * Supplies the audit read the change-history panel draws.
 *
 * <p><b>Why this is a port.</b> A console kit depends on no product API. The change-history panel
 * is a pattern, so it stays in the kit, and this port is how the product's audit read reaches it.
 */
export const ChangeHistorySourceProvider = ChangeHistorySourceContext.Provider;

/**
 * @returns the installation's audit reader
 * @throws when no {@link ChangeHistorySourceProvider} is mounted
 */
/**
 * @returns the mounted reader, or `null` where none is mounted (a save outside any history)
 */
export function useOptionalChangeHistorySource(): ChangeHistoryReader | null {
  return useContext(ChangeHistorySourceContext);
}

export function useChangeHistorySource(): ChangeHistoryReader {
  const reader = useContext(ChangeHistorySourceContext);
  if (!reader) throw new Error(MISSING_SOURCE);
  return reader;
}
