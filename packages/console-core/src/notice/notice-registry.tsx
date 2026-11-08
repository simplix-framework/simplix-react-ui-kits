import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";

import type { DismissibleNoticeKind } from "./notice-kind";

/** One notice card, as the header reads it. */
export interface NoticeEntry {
  /** The constant its definition site declares. Never built from where the card sits. */
  readonly noticeKey: string;
  /** Which of the three the card is. */
  readonly kind: DismissibleNoticeKind;
  /** What the card is called, on the card and again in the dropdown. */
  readonly title: string;
  /** The line under it saying what the card settles. */
  readonly hint?: string;
  /** What the card's own button says, when it has one. */
  readonly actionLabel?: string;
  /**
   * What that button does.
   *
   * <p>Held as a callback rather than as the button itself so the header can draw the control in
   * its own shape, and so a card whose surface is hidden still answers from the dropdown — the
   * dialog a 「설명 보기」 opens belongs to the card, and the card stays mounted whether or not
   * its surface is drawn.
   *
   * <p>Give it a stable identity ({@link useCallback}); it is compared on every render.
   */
  readonly onAction?: () => void;
  /**
   * Whether the entry stays on the list after the last card or declaration that wrote it has
   * unmounted.
   *
   * <p>For a card whose surface is a modal (a record's drawer, an action dialog). Its dismissal is
   * remembered per operator and outlives the surface, so an entry that left with the surface would
   * leave the header's control with nothing to list: the reader put the card away and, with the
   * surface closed, has no route back to it. A retained entry keeps the title and the hint, drops
   * the action (the callback belongs to an unmounted surface) and goes when the registry does,
   * which is when the routed screen does.
   */
  readonly retain?: boolean;
  /**
   * True while a retained entry has no card drawing it, because the surface that held the card is
   * closed. Set by the registry, never by a caller. The header lists such an entry only while the
   * card is put away, since a card that is not hidden and not drawn is nothing to come back to.
   */
  readonly lingering?: boolean;
}

/**
 * The screen's notice cards, held where the header can read them.
 *
 * <p><b>One key, several registrants.</b> A notice inside an explanation is declared twice — by the
 * card itself, which draws it, and by the explanation that holds it, which is what keeps the entry
 * standing while the dialog is not mounted. Both write the same key on purpose, so the two are one
 * entry rather than two. The `owner` on the two writes is what tells them apart: without it the
 * card's own cleanup takes the explanation's declaration off the list with it, and the entry
 * disappears at exactly the moment it is needed — the reader dismissed the card, so the card
 * unmounted, so the header stopped listing the only thing that could bring it back.
 */
interface NoticeStore {
  get(): readonly NoticeEntry[];
  register(owner: symbol, entry: NoticeEntry): void;
  unregister(owner: symbol, noticeKey: string): void;
  subscribe(listener: () => void): () => void;
}

/** The one empty value, so "no cards on this screen" keeps a stable identity across reads. */
const EMPTY: readonly NoticeEntry[] = [];

/**
 * @param a one entry
 * @param b another
 * @returns whether the two say the same thing
 */
function same(a: NoticeEntry, b: NoticeEntry): boolean {
  return a.noticeKey === b.noticeKey
    && a.kind === b.kind
    && a.title === b.title
    && a.hint === b.hint
    && a.actionLabel === b.actionLabel
    && a.onAction === b.onAction
    && a.retain === b.retain
    && a.lingering === b.lingering;
}

/**
 * @returns a store holding one screen's notice cards
 */
function createNoticeStore(): NoticeStore {
  let entries: readonly NoticeEntry[] = EMPTY;
  const listeners = new Set<() => void>();
  /**
   * What each holder of a key wrote. The entry stands while this map is not empty, and what the
   * header draws is composed from it — see {@link composed}.
   */
  const owners = new Map<string, Map<symbol, NoticeEntry>>();

  /**
   * What the header draws for a key several holders wrote.
   *
   * <p><b>The way in comes from whichever holder has one.</b> A nested card writes no action — its
   * own 「설명 보기」 is the explanation's, not its — and the explanation writes one. Taking the
   * latest write alone would drop that button for as long as the dialog is open, which is the one
   * moment the reader is looking straight at it.
   *
   * @param held what each holder wrote
   * @returns the entry, with the words from the newest write and the action from whoever has one
   */
  const composed = (held: Map<symbol, NoticeEntry>): NoticeEntry => {
    const written = [...held.values()];
    const latest = written[written.length - 1];
    const acting = written.find((entry) => entry.onAction != null);
    return acting == null || acting === latest
      ? latest
      : { ...latest, actionLabel: acting.actionLabel, onAction: acting.onAction };
  };

  const publish = () => listeners.forEach((listener) => listener());

  return {
    // Returned by identity, never rebuilt: `useSyncExternalStore` reads this during render, and a
    // fresh array on every read is an infinite re-render.
    get: () => entries,
    register(owner, entry) {
      const held = owners.get(entry.noticeKey) ?? new Map<symbol, NoticeEntry>();
      held.set(owner, entry);
      owners.set(entry.noticeKey, held);
      const shown = composed(held);
      const at = entries.findIndex((candidate) => candidate.noticeKey === entry.noticeKey);
      if (at >= 0) {
        if (same(entries[at], shown)) return;
        const next = entries.slice();
        next[at] = shown;
        entries = next;
      } else {
        entries = [...entries, shown];
      }
      publish();
    },
    unregister(owner, noticeKey) {
      const held = owners.get(noticeKey);
      if (held) {
        held.delete(owner);
        // Still held by somebody else — the explanation that declared it, or the card that draws
        // it — so the entry stands, recomposed from whoever is left. Recomposed rather than left
        // alone: what the departing holder wrote may be what the header is currently showing.
        if (held.size > 0) {
          const at = entries.findIndex((candidate) => candidate.noticeKey === noticeKey);
          const shown = composed(held);
          if (at >= 0 && !same(entries[at], shown)) {
            const next = entries.slice();
            next[at] = shown;
            entries = next;
            publish();
          }
          return;
        }
        owners.delete(noticeKey);
      }
      const at = entries.findIndex((candidate) => candidate.noticeKey === noticeKey);
      if (at >= 0 && entries[at].retain) {
        // The surface that drew the card is gone, and the entry stays for the way back. Its action
        // belonged to that surface, so it goes; the words stay so the dropdown can name the card.
        const kept = { ...entries[at], actionLabel: undefined, onAction: undefined, lingering: true };
        if (same(entries[at], kept)) return;
        const next = entries.slice();
        next[at] = kept;
        entries = next;
        publish();
        return;
      }
      const next = entries.filter((candidate) => candidate.noticeKey !== noticeKey);
      if (next.length === entries.length) return;
      entries = next.length > 0 ? next : EMPTY;
      publish();
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}

const NoticeContext = createContext<NoticeStore | null>(null);

/**
 * Where a screen's notice cards are collected for the header to draw.
 *
 * <p>A store rather than provider state, for the reason the page header's own store gives: every
 * write would otherwise re-render the whole subtree beneath the provider — which is the routed
 * screen, including the cards doing the writing.
 *
 * <p>It sits around the routed content rather than around the whole console, so navigating away
 * unmounts the cards and empties the header on its own. Nothing has to remember to clear it.
 */
export function NoticeRegistryProvider({ children }: { children: ReactNode }) {
  // Created once. A store rebuilt on re-render would drop every subscriber it had.
  const [store] = useState(createNoticeStore);
  return <NoticeContext.Provider value={store}>{children}</NoticeContext.Provider>;
}

/**
 * Puts a card on the header's list for as long as the card is mounted.
 *
 * <p>Published on every render, so the title a translation changed and the callback a re-render
 * rebuilt are the current ones rather than the ones that existed at mount. A render that changes
 * nothing publishes nothing.
 *
 * @param entry what the header should show for this card
 */
export function useRegisterNotice(entry: NoticeEntry): void {
  const store = useContext(NoticeContext);
  const installed = useRef<NoticeEntry | null>(null);
  // This hook call's own identity, so its cleanup takes off what it put on and nothing else. Two
  // callers writing one key is the arrangement rather than a mistake, and a cleanup that went by
  // key alone would take the other one's declaration with it.
  const owner = useRef<symbol>(undefined as unknown as symbol);
  if (owner.current === undefined) owner.current = Symbol("notice");

  // No dependency list: this runs after every render of the card, which is what keeps the entry
  // current. It cannot loop — the store's subscribers are the header, never this subtree.
  useEffect(() => {
    if (!store) return;
    if (installed.current != null && same(installed.current, entry)) return;
    installed.current = entry;
    store.register(owner.current, entry);
  });

  // Keyed on the card's own key so a card whose key changed takes the old entry off the list with
  // it. Reading `installed` here would take the entry off on every render that changed anything.
  useEffect(() => {
    return () => {
      installed.current = null;
      store?.unregister(owner.current, entry.noticeKey);
    };
  }, [store, entry.noticeKey]);
}

/**
 * @returns every notice card on the screen right now, in the order they were drawn
 */
export function useNoticeEntries(): readonly NoticeEntry[] {
  const store = useContext(NoticeContext);
  return useSyncExternalStore(
    store ? store.subscribe : noSubscribe,
    store ? store.get : readEmpty,
    store ? store.get : readEmpty,
  );
}

/** Outside a provider there is nothing to subscribe to, and nothing ever changes. */
function noSubscribe(): () => void {
  return () => {};
}

function readEmpty(): readonly NoticeEntry[] {
  return EMPTY;
}
