import { useCan } from "@simplix-react/access/react";
import { useTranslation } from "@simplix-react/i18n/react";
import { useCrudList, useInvalidateEntity, adaptOrvalList, type OrvalListHookLike } from "@simplix-react/ui";

import { useChangeHistorySource, useOptionalChangeHistorySource, type ChangeHistoryEvent } from "./change-history-source";
import { useConsoleSubject } from "./console-product";
import { PACKAGE_NAMESPACE as ENTITY_NAMESPACE } from "../entity/locales";

/** How many events one page of a history tab carries. */
const PAGE_SIZE = 20;

/** How a caller narrows the history below the entity type. */
export interface ChangeHistoryScope {
  /**
   * One record's history rather than the whole type's.
   *
   * <p>An installation-wide setting has exactly one record, so the type alone is the record. A
   * workplace does not: B-02's history tab is about the workplace on screen, and the type alone would
   * answer with every workplace's changes under a heading that says otherwise.
   */
  readonly entityId?: string;
  /**
   * The kinds of change this tab is about, rather than every event the type records.
   *
   * <p>N-03's changes tab is about what a role may do, and `UserRole` also records renames. An
   * account's is about what was done TO the account (a profile edit, a rank change, a suspension),
   * while the same entity type carries every sign-in that account ever made, so a tab that did
   * not narrow would bury three edits under eighty-eight sign-ins.
   *
   * <p>Several rather than one, because a record's life is rarely one action: creation, update,
   * deactivation and role change are all "changes made to this account".
   */
  readonly actions?: readonly string[];
}

/**
 * What a record's change history reads as, for the screen that owns the record.
 *
 * <p><b>One read serves the tab badge and the tab body.</b> The count on the tab and the rows
 * under it are the same question asked once; two reads would let the badge say four while the
 * table shows three for as long as the second is in flight.
 *
 * <p><b>The audit permission is checked here, not by the caller.</b> The endpoint is the audit
 * log's, guarded by the evidence and retention group, and a caller passing its own screen's permission instead sends a
 * request the server refuses: the reader then meets a bare "insufficient permission" dialog over a
 * record that opened perfectly well, with nothing on the page to say what was refused or why. A
 * A health manager opening B-02 was exactly that: `SAFETY_SITE` list is enough for the workplace and not
 * for its history. Putting the condition beside the request makes forgetting it impossible rather
 * than unlikely.
 *
 * <p><b>One tab of one record is still the audit log.</b> This panel reads the same surface J-08
 * reads, narrowed to one entity, so it gates on the same group, which is what lets a role that
 * may read the log read a record's history without holding the installation's own machinery.
 *
 * @param entityType the audited entity's simple name, as the recorder writes it
 * @param enabled whether the screen wants the history at all, combined with, never instead of,
 *        the audit permission this hook checks for itself
 * @param scope which record to narrow to, when the type holds more than one
 * @returns the events newest first, how many there are in total, and whether the read has answered
 */
/**
 * Where the audit log answers when the mounted reader names no address of its own, so a save can
 * tell every history over it to read again.
 */
const DEFAULT_AUDIT_ADDRESS = "/api/v1/admin/audit-log";

/** The prefix a save invalidates: the mounted reader's own address, else the default. */
function useAuditAddress(): string {
  return useOptionalChangeHistorySource()?.address ?? DEFAULT_AUDIT_ADDRESS;
}

/**
 * Tells every change history to read itself again.
 *
 * <p><b>For the save, which is rarely where the history is held.</b> A screen reads its history in
 * the page and writes the record in a widget, so the save has no history to call `refresh` on,
 * and without this it refetches the record, leaves the log as it was, and the operator who just
 * changed a value opens the tab and does not find what they did. Reported that way on the sign-in integration screen.
 *
 * <p>By the audit log's own address, so one call reaches every history over every entity. A save
 * writes one row and nothing else moved; refetching a handful of tabs nobody has open costs a
 * request each and is what makes the tab the reader DOES have open correct.
 *
 * @returns a function to call once the save has answered
 */
export function useRefreshChangeHistory(): () => Promise<void> {
  return useInvalidateEntity(useAuditAddress());
}

/** The key every record's changes tab is opened by (`?tab=changes`). */
export const CHANGES_TAB_KEY = "changes";

/** A record's changes tab as {@link useChangeHistory}'s `tab` builds it: the shape a detail's `RecordTab` takes. */
export interface ChangeHistoryTab {
  readonly key: string;
  readonly label: string;
  readonly count?: number;
  readonly changes: { readonly history: ChangeHistoryRead; readonly emptyBody?: string };
}

/** What {@link useChangeHistory} reads, without the tab it builds from it. */
export type ChangeHistoryRead = ReturnType<typeof useChangeHistoryRead>;

/**
 * A record's change history and its ready tab: what {@link useChangeHistoryRead} answers, and
 * `tab(emptyBody)` that a detail spreads into its tabs.
 *
 * @param entityType the audited entity's simple name, as the recorder writes it
 * @param enabled whether the screen wants the history at all
 * @param scope which record to narrow to, when the type holds more than one
 */
export function useChangeHistory(entityType: string, enabled: boolean, scope: ChangeHistoryScope = {}) {
  const history = useChangeHistoryRead(entityType, enabled, scope);
  // The tab's label is the kit's one word for it, the word every generated detail reads.
  const { t: entityWords } = useTranslation(ENTITY_NAMESPACE + "/features");
  const changesLabel = entityWords("screen.changes");
  return {
    ...history,
    /**
     * The record's changes tab, ready for a detail's `tabs`: one tab labelled by the kit's word,
     * counted by this read and drawing this history, or none at all where the reader may not read
     * the audit log, so nobody presses a tab that opens on a refusal (frontend invariant #76).
     *
     * @param emptyBody what the tab says while nothing has changed; absent, the table's own sentence
     */
    tab: (emptyBody?: string): readonly ChangeHistoryTab[] => changesTabOf(history, changesLabel, emptyBody),
  };
}

/**
 * A record's changes tab over a history read: one tab, counted by the read and labelled `label`, or
 * none where the reader may not read the audit log.
 *
 * @param history what the history read answered
 * @param label the tab's label, the kit's word for it
 * @param emptyBody what the tab says while nothing has changed; absent, the table's own sentence
 */
export function changesTabOf(history: ChangeHistoryRead, label: string, emptyBody?: string): readonly ChangeHistoryTab[] {
  if (!history.readable) return [];
  return [{ key: CHANGES_TAB_KEY, label, count: history.total, changes: { history, ...(emptyBody !== undefined ? { emptyBody } : {}) } }];
}

/** The read behind {@link useChangeHistory}: the events, their count, and whether the reader may read them. */
export function useChangeHistoryRead(
  entityType: string,
  enabled: boolean,
  scope: ChangeHistoryScope = {},
) {
  const mayReadAudit = useCan("list", useConsoleSubject("auditLog"));
  // By the audit log's own address rather than by this tab's parameters: a save writes a row that
  // every history over that entity may want, and naming the prefix takes them all.
  const invalidateAudit = useInvalidateEntity(useAuditAddress());
  const asked = enabled && mayReadAudit;
  const read = useChangeHistorySource();
  // A caller that narrows to a record has nothing to ask until it knows which record.
  const ready = asked && (scope.entityId === undefined || scope.entityId.length > 0);

  // The reader, wrapped as the shape `adaptOrvalList` takes, so the translation from the list's
  // own state (a one-based page, a `{ field, direction }` sort, a filter map) into the server's
  // grammar is the framework's one implementation rather than a second copy here. Written by hand
  // the first attempt read the list's params as though they were already the server's, and every
  // read came back a failure the screen drew as "could not be loaded".
  const orvalLike: OrvalListHookLike = (params, options) => {
    const { page, size, sort, ...filters } = (params ?? {}) as Record<string, unknown>;
    const answer = read(
      {
        entityType,
        entityId: scope.entityId,
        actions: scope.actions,
        page: typeof page === "number" ? page : 0,
        size: typeof size === "number" ? size : PAGE_SIZE,
        sort: Array.isArray(sort) ? (sort as string[]) : undefined,
        filters,
      },
      ready && options?.query?.enabled !== false,
    );
    return {
      data: {
        content: answer.events,
        totalElements: answer.totalElements,
        totalPages: answer.totalPages,
      },
      isLoading: answer.isLoading,
      error: answer.isError ? new Error("change-history read failed") : null,
    };
  };

  const listHook = adaptOrvalList<ChangeHistoryEvent>(orvalLike);

  const list = useCrudList<ChangeHistoryEvent>(listHook, {
    stateMode: "server",
    defaultPageSize: PAGE_SIZE,
    defaultSort: { field: "occurredAt", direction: "desc" },
    filterMode: "deferred",
  });

  const answered = {
    events: list.data,
    totalPages: list.pagination.totalPages,
    totalElements: list.pagination.total,
    isLoading: list.isLoading,
    isError: list.error !== null,
  };

  const history = {
    events: answered.events,
    /**
     * Reads the history again, for a caller that has just written something into it.
     *
     * <p><b>A save on the screen puts a row in this tab and nothing tells the tab.</b> The two
     * are different queries (one over the record, one over the audit log), so a save that
     * refetches the record leaves the history exactly as it was, and the operator who just
     * changed a value opens the tab, does not find it, and concludes the log does not work. It
     * was reported that way.
     *
     * <p>Called after the save rather than on an interval: the moment a row appears is known
     * exactly, and polling an audit log to notice one's own write is the shape that costs a
     * request a second for a page nobody is looking at.
     */
    refresh: invalidateAudit,
    /**
     * Whether this account may read the audit log at all.
     *
     * <p>Read by a caller that decides whether to draw the tab: a tab that is there and refuses
     * is worse than one that is not, because the reader presses it, meets a refusal, and cannot
     * tell whether the record has no history or they may not see it. The hook checks the same
     * permission the request needs, so the caller cannot check a different one.
     */
    readable: mayReadAudit,
    /** Which entity's history this is, so the table can read that entity's field labels. */
    entityType,
    /** The list controller the table draws from: its filters, its sort, its pager. */
    list,
    /**
     * Absent rather than zero while the read has not answered, and absent again when it failed:
     * a tab reading "Changes 0" over a failed read tells the operator this setting has never
     * been changed, which is a claim nobody made.
     */
    total: asked && !answered.isError ? answered.totalElements : undefined,
    isLoading: answered.isLoading,
    /**
     * Whether the read failed.
     *
     * <p>Kept apart from an empty result: both hand back no rows, and drawn the same way the
     * failure reads as "this setting was never changed", the one conclusion an audit trail must never
     * invite when it is simply unreachable.
     */
    isError: answered.isError,
  };
  return history;
}
