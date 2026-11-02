import { useEffect, useState, useSyncExternalStore, type ReactNode } from "react";

/** One record a search source found, as the palette draws and opens it. */
export interface FederatedSearchResult {
  /** What identifies it among its source's results. */
  readonly id: string;
  /** The record's name in the interface language, never its id. */
  readonly title: string;
  /** One or two values that tell two records of the same name apart: a status, an owner, a date. */
  readonly sub?: string;
  /** Where the record opens: its screen with the record selected. */
  readonly href: string;
}

/**
 * One place the console's search looks for records: an entity the account may list whose search
 * matches a typed text. The kit knows no entity; the product declares each source with its own
 * generated search call and the words its records are named with.
 */
export interface FederatedSearchSource<Row = unknown> {
  /** What identifies it among the sources, also its group's key. */
  readonly key: string;
  /** The group's name: the entity's plural in the interface language. */
  readonly label: string;
  readonly icon?: ReactNode;
  /**
   * Whether the account may list these records. A source that may not is never asked, so the
   * search fires no request the server would refuse. Absent, it may.
   */
  readonly allowed?: boolean;
  /**
   * Asks for the records matching the text. Rejects when the server refuses or fails (an envelope
   * whose type is not a success included), which the group shows as its own failure.
   */
  readonly search: (query: string, signal: AbortSignal) => Promise<readonly Row[]>;
  /** A row as a result, or undefined for a row that cannot be named or opened. */
  readonly toResult: (row: Row) => FederatedSearchResult | undefined;
  /** The source's list screen searched for the same text, drawn as the group's "show all" row. */
  readonly listHref?: (query: string) => string;
}

/**
 * A source over its own row type, made one of a list of sources over different entities: each
 * source reads back only the rows its own search returned, so the row type is kept where it is
 * written and given up where the list holds them together.
 */
export function searchSource<Row>(source: FederatedSearchSource<Row>): FederatedSearchSource {
  return source as unknown as FederatedSearchSource;
}

/** How far a source's answer to the current text has come. */
export type FederatedSearchStatus = "loading" | "done" | "failed";

/** One source's answer to the current text. */
export interface FederatedSearchGroup {
  readonly key: string;
  readonly label: string;
  readonly icon?: ReactNode;
  readonly status: FederatedSearchStatus;
  readonly results: readonly FederatedSearchResult[];
  /** The list screen searched for the text, where the source has one. */
  readonly listHref?: string;
}

/** What the search stands at. */
export interface FederatedSearchState {
  /** The text the groups answer; empty while no search runs. */
  readonly query: string;
  /** Whether a text was typed that has not been asked yet (the pause after the last key). */
  readonly waiting: boolean;
  /** One group per source asked, in the sources' order. */
  readonly groups: readonly FederatedSearchGroup[];
}

/** What a search state says about the text typed now, as a palette words it. */
export interface FederatedSearchSummary {
  /** Some source is still being asked, or the pause after the last key has not passed. */
  readonly looking: boolean;
  /** Every source asked for this text answered or failed, at least one answered, and none found a record. */
  readonly noRecords: boolean;
}

/**
 * Reads a search state against the text typed now. An answer for an older text says nothing about
 * this one, so it is neither looking nor empty for it.
 *
 * @param state the search's state
 * @param query the text typed now, trimmed
 */
export function summarizeSearch(state: FederatedSearchState, query: string): FederatedSearchSummary {
  const looking = state.waiting || state.groups.some((group) => group.status === "loading");
  const current = state.query === query && !state.waiting;
  const settled = current && state.groups.every((group) => group.status !== "loading");
  const found = state.groups.reduce((sum, group) => sum + group.results.length, 0);
  return { looking, noRecords: settled && state.groups.some((group) => group.status === "done") && found === 0 };
}

/** How the search treats a text. */
export interface FederatedSearchOptions {
  /** How long after the last key the sources are asked. Default 250 ms. */
  readonly debounceMs?: number;
  /** The fewest characters a text needs before any source is asked. Default 2. */
  readonly minLength?: number;
  /** The most results a group keeps. Default 5. */
  readonly limit?: number;
  /** Whether a text is worth asking the sources at all (a text no server search can match is not). */
  readonly accepts?: (query: string) => boolean;
}

/** The search's moving parts, outside React so its timing can be proved on its own. */
export interface FederatedSearchController<Row = unknown> {
  /** The sources the next ask goes to. A change does not re-ask the current text. */
  setSources(sources: readonly FederatedSearchSource<Row>[]): void;
  /** The text typed. Asks the sources once the pause after it has passed. */
  setQuery(query: string): void;
  getState(): FederatedSearchState;
  subscribe(listener: () => void): () => void;
  /** Stops the pause and every answer still on its way. */
  dispose(): void;
}

const IDLE: FederatedSearchState = { query: "", waiting: false, groups: [] };

/**
 * Creates the search behind the console's palette: it waits for the pause after the last key, asks
 * every allowed source at once, and keeps each source's answer apart, so a failed source never
 * empties the others.
 *
 * <p>An answer for an older text never replaces a newer one: each ask cancels the one before it
 * through its signal, and an answer that arrives anyway is dropped because it belongs to an ask
 * that is no longer the current one.
 */
export function createFederatedSearch<Row = unknown>(options: FederatedSearchOptions = {}): FederatedSearchController<Row> {
  const debounceMs = options.debounceMs ?? 250;
  const minLength = options.minLength ?? 2;
  const limit = options.limit ?? 5;
  let sources: readonly FederatedSearchSource<Row>[] = [];
  let state: FederatedSearchState = IDLE;
  let typed = "";
  let timer: ReturnType<typeof setTimeout> | undefined;
  let running: AbortController | undefined;
  let ask = 0;
  const listeners = new Set<() => void>();

  const publish = (next: FederatedSearchState) => {
    state = next;
    for (const listener of listeners) listener();
  };

  const stop = () => {
    if (timer !== undefined) clearTimeout(timer);
    timer = undefined;
    running?.abort();
    running = undefined;
    ask += 1;
  };

  const answer = (current: number, key: string, change: Pick<FederatedSearchGroup, "status" | "results">) => {
    if (current !== ask) return;
    publish({ ...state, groups: state.groups.map((group) => (group.key === key ? { ...group, ...change } : group)) });
  };

  const run = (query: string) => {
    timer = undefined;
    const current = ask;
    const abort = new AbortController();
    running = abort;
    const asked = sources.filter((source) => source.allowed !== false);
    publish({
      query,
      waiting: false,
      groups: asked.map((source) => ({
        key: source.key,
        label: source.label,
        icon: source.icon,
        status: "loading",
        results: [],
        listHref: source.listHref?.(query),
      })),
    });
    for (const source of asked) {
      // Asked at once, so every source's request leaves in the same tick; a source that throws
      // before it builds a request is failing like one whose request was refused.
      let pending: Promise<readonly Row[]>;
      try {
        pending = Promise.resolve(source.search(query, abort.signal));
      } catch (error) {
        pending = Promise.reject(error);
      }
      pending
        .then((rows) => {
          // A body that is not a list of rows is the source failing, not an empty answer.
          if (!Array.isArray(rows)) throw new TypeError(`search source ${source.key} answered no list`);
          const results = rows.flatMap((row) => {
            const result = source.toResult(row);
            return result ? [result] : [];
          });
          answer(current, source.key, { status: "done", results: results.slice(0, limit) });
        })
        .catch(() => answer(current, source.key, { status: "failed", results: [] }));
    }
  };

  return {
    setSources(next) {
      sources = next;
    },
    setQuery(query) {
      const text = query.trim();
      if (text === typed) return;
      typed = text;
      stop();
      if (text.length < minLength || (options.accepts && !options.accepts(text))) {
        publish(IDLE);
        return;
      }
      publish({ ...state, waiting: true });
      const current = ask;
      timer = setTimeout(() => {
        if (current === ask) run(text);
      }, debounceMs);
    },
    getState: () => state,
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    dispose() {
      stop();
      typed = "";
      state = IDLE;
    },
  };
}

/**
 * The console's record search over the given sources, for as long as `enabled` holds: a closed
 * palette asks nothing and forgets its text.
 *
 * @param sources the places to look; a new array each render is fine
 * @param query the text typed
 * @param enabled whether the search runs (the palette is open)
 */
export function useFederatedSearch<Row = unknown>(
  sources: readonly FederatedSearchSource<Row>[],
  query: string,
  enabled: boolean,
  options?: FederatedSearchOptions,
): FederatedSearchState {
  const [controller] = useState(() => createFederatedSearch<Row>(options));
  controller.setSources(sources);
  useEffect(() => {
    controller.setQuery(enabled ? query : "");
  }, [controller, enabled, query]);
  useEffect(() => () => controller.dispose(), [controller]);
  return useSyncExternalStore(controller.subscribe, controller.getState, controller.getState);
}
