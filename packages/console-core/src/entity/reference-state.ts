import { getHttpStatus } from "@simplix-react/api";
import { useQuery } from "@tanstack/react-query";

import { useAllowed, type OperationAccess } from "./allowed";

/**
 * Whether the record a reference names can be opened: it exists and the reader may read it
 * (`live`), it no longer exists (`deleted`), the reader may not read records of its kind
 * (`unavailable`), or the answer is still on its way (`loading`).
 */
export type ReferenceState = "live" | "deleted" | "unavailable" | "loading";

/**
 * How the console learns which records of one kind still exist: the kind's own list search,
 * narrowed to the ids asked about (`<idField>.in=a,b,c`).
 *
 * <p>The search returns only rows that exist and that the reader may read; a soft-deleted row is
 * not returned. An id asked about and not returned is therefore a record that is gone. A refusal
 * of the whole search (HTTP 403) means the reader may not read that kind at all, so every id of it
 * is unavailable; any other failure decides nothing and the references stay links.
 */
export interface ReferenceLookup {
  /**
   * Asks the kind's search for these ids and answers the ids it returned. Throws what the request
   * threw; a 403 is read as the reader lacking access.
   */
  readonly find: (ids: readonly string[]) => Promise<readonly string[]>;
  /** What the search requires of the reader; a reader it refuses gets `unavailable` without a request. */
  readonly access?: OperationAccess;
}

/**
 * A {@link ReferenceLookup} built from a kind's generated list call: it asks for the ids under
 * `<idField>.in`, one page as large as the batch, and answers the ids the page holds.
 *
 * @param list the kind's list (search) call, which resolves to a page with `content`
 * @param idField the kind's id field, which is both the filter key and the field read back
 * @param access what the list requires of the reader (its generated `list<Entity>Access`)
 */
export function lookupFromList<P, Row>(
  list: (params: P) => Promise<{ readonly content?: readonly Row[] | null }>,
  idField: string,
  access?: OperationAccess,
): ReferenceLookup {
  return {
    find: async (ids) => {
      // The generated params name every filter key; the id filter is built here by its name.
      const params = { [`${idField}.in`]: ids.join(","), page: 0, size: ids.length } as unknown as P;
      const page = await list(params);
      return (page.content ?? []).flatMap((row) => {
        const id = (row as Record<string, unknown>)[idField];
        return id === undefined || id === null ? [] : [String(id)];
      });
    },
    access,
  };
}

const lookups = new Map<string, ReferenceLookup>();

/**
 * Teaches the console how to tell whether records of one kind still exist. Registered by the app
 * beside the kind's peek (`registerPeek`), since the app is the one place that imports every
 * domain package.
 *
 * @param kind the entity's name, as a reference field's `peekKind` names it
 * @param lookup the kind's search narrowed to ids
 */
export function registerReferenceLookup(kind: string, lookup: ReferenceLookup): void {
  lookups.set(kind, lookup);
}

/** The lookup registered for a kind, or `undefined` where none is. */
export function referenceLookupFor(kind: string): ReferenceLookup | undefined {
  return lookups.get(kind);
}

/** How many ids one search asks about, so the query string stays well under any URL limit. */
export const REFERENCE_BATCH_SIZE = 50;

/** Answers the state of one record, asking the kind's search once for every id asked in the same tick. */
export type ReferenceStateLoader = (kind: string, id: string) => Promise<Exclude<ReferenceState, "loading">>;

/**
 * A loader that batches: every id asked about during one turn of the event loop is answered by one
 * search per kind (one per {@link REFERENCE_BATCH_SIZE} ids). A page of rows naming the same few
 * people therefore costs one request, however many cells, fields and labels draw them.
 *
 * @param lookupFor where a kind's lookup is found; the registry by default
 * @param defer how the batch is held open; a zero timeout by default
 */
export function createReferenceStateLoader(
  lookupFor: (kind: string) => ReferenceLookup | undefined = referenceLookupFor,
  defer: (flush: () => void) => void = (flush) => setTimeout(flush, 0),
): ReferenceStateLoader {
  type Waiter = { resolve: (state: "live" | "deleted" | "unavailable") => void; reject: (error: unknown) => void };
  const pending = new Map<string, Map<string, Waiter[]>>();
  let scheduled = false;

  const settle = (waiting: Map<string, Waiter[]>, answer: (id: string) => "live" | "deleted" | "unavailable") => {
    for (const [id, waiters] of waiting) for (const waiter of waiters) waiter.resolve(answer(id));
  };

  const ask = async (lookup: ReferenceLookup, waiting: Map<string, Waiter[]>) => {
    try {
      const found = new Set(await lookup.find([...waiting.keys()]));
      settle(waiting, (id) => (found.has(id) ? "live" : "deleted"));
    } catch (error) {
      if (getHttpStatus(error) === 403) {
        settle(waiting, () => "unavailable");
        return;
      }
      for (const waiters of waiting.values()) for (const waiter of waiters) waiter.reject(error);
    }
  };

  const flush = () => {
    scheduled = false;
    const batches = [...pending];
    pending.clear();
    for (const [kind, ids] of batches) {
      const lookup = lookupFor(kind);
      if (!lookup) {
        settle(ids, () => "live");
        continue;
      }
      const entries = [...ids];
      for (let start = 0; start < entries.length; start += REFERENCE_BATCH_SIZE) {
        void ask(lookup, new Map(entries.slice(start, start + REFERENCE_BATCH_SIZE)));
      }
    }
  };

  return (kind, id) =>
    new Promise((resolve, reject) => {
      const ids = pending.get(kind) ?? new Map<string, Waiter[]>();
      pending.set(kind, ids);
      ids.set(id, [...(ids.get(id) ?? []), { resolve, reject }]);
      if (!scheduled) {
        scheduled = true;
        defer(flush);
      }
    });
}

const sharedLoader = createReferenceStateLoader();

/** The query key a reference's state is cached under, so a write to the kind can invalidate it. */
export const referenceStateKey = (kind: string, id: string) => ["console-reference-state", kind, id] as const;

/**
 * Whether the record a reference names can be opened, answered before anybody presses it.
 *
 * <p>A kind with no registered lookup, and an empty id, are `live`: nothing is known against them,
 * so the reference stays as it was drawn. A reader the kind's search refuses is `unavailable`
 * without a request. While the answer is on its way the state is `loading`, which a cell draws as
 * the link it was, never as gone. A failed request other than a refusal decides nothing (`live`).
 *
 * @param kind the referenced entity's name (a reference field's `peekKind`), or `undefined`
 * @param id the referenced record's id, or `undefined`
 */
export function useReferenceState(kind: string | undefined, id: string | undefined): ReferenceState {
  const lookup = kind ? referenceLookupFor(kind) : undefined;
  const allowed = useAllowed(lookup?.access);
  const asks = Boolean(lookup && kind && id && allowed);
  const query = useQuery({
    queryKey: referenceStateKey(kind ?? "", id ?? ""),
    queryFn: () => sharedLoader(kind!, id!),
    enabled: asks,
    staleTime: 60_000,
    retry: false,
    // A reference that cannot be checked stays a link; its failure is no reason for a dialog.
    meta: { suppressErrorDialog: true },
  });
  if (!lookup || !kind || !id) return "live";
  if (!allowed) return "unavailable";
  if (query.isPending) return "loading";
  if (query.isError) return "live";
  return query.data;
}
