import { useId, useState, type ReactNode } from "react";
import { useTranslation } from "@simplix-react/i18n/react";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import { Grid, SearchOperator, StatCard, type CrudListFilters, type StatusTone } from "@simplix-react/ui";
import { partAttributes, slotAttributes } from "@simplix-react/ui/design";
import { DigitRoll } from "@simplix-react/ui/interaction";

import { browserStorage, type PresentationStorage } from "../page/browser-storage";

import { PACKAGE_NAMESPACE } from "./locales";
import {
  statusCardFoldStyle,
  statusCardHeadStyle,
  statusCardStripStyle,
  statusCardStyle,
  statusCardSummaryItemStyle,
  statusCardSummaryStyle,
  statusCardToggleStyle,
} from "./status-card-strip.style";

/** The list narrowing a {@link StatusCard} stands for: one value of one field, written as the chip row's `<field>.in`. */
export interface StatusCardValueFilter {
  readonly field: string;
  readonly value: string;
}

/**
 * A narrowing no chip writes: a set of filter keys and their values, each written as the filter
 * bar writes it (`occurredAt.greaterThanOrEqualTo`, `httpStatus.greaterThanOrEqualTo`), so the
 * filter bar's own badges show what the card chose and can lift it.
 */
export interface StatusCardValuesFilter {
  readonly values: Readonly<Record<string, string | number>>;
}

/** The list narrowing a {@link StatusCard} stands for. */
export type StatusCardFilter = StatusCardValueFilter | StatusCardValuesFilter;

/** One figure over a list. */
export interface StatusCard {
  readonly key: string;
  readonly label: string;
  /** A count, a sum or a word; `undefined` while it has not been read. */
  readonly value: number | string | undefined;
  readonly unit?: string;
  /**
   * `danger` only for a set the reader must act on now, `warning` for one to act on soon (frontend
   * invariant #48). A figure of 0 is drawn muted whatever its tone.
   */
  readonly tone?: StatusTone;
  /** What the figure is counted over, under it (「last 24 hours」). */
  readonly basis?: ReactNode;
  /** A small drawing beside the figure, such as a meter. */
  readonly chart?: ReactNode;
  /**
   * The rows the figure counts. Given, pressing the card narrows the list to them, the same
   * narrowing the chip row writes, and pressing it again lifts it.
   */
  readonly filter?: StatusCardFilter;
}

/** Props for {@link StatusCardStrip}. */
export interface StatusCardStripProps {
  readonly cards: readonly StatusCard[];
  /** The list's filter state the cards narrow, the one its chip row reads. */
  readonly filters?: Pick<CrudListFilters, "committedValues" | "commitValue" | "commitValues">;
  readonly loading?: boolean;
  readonly columns?: 1 | 2 | 3 | 4;
  /**
   * The page the strip stands on, under which the reader's fold is remembered in this browser.
   * Absent, the strip can still be folded, and the fold lasts as long as the page.
   */
  readonly foldKey?: string;
  /** Where the fold is remembered; the browser's local storage when absent. */
  readonly storage?: PresentationStorage;
}

const FOLD_PREFIX = "console.status-cards.folded:";

/**
 * Whether the reader folded this page's strip, as remembered; unfolded when nothing is remembered
 * or the storage cannot be read.
 *
 * @param storage where the fold is remembered
 * @param key the page the strip stands on
 */
export function readFolded(storage: PresentationStorage | undefined, key: string | undefined): boolean {
  if (!storage || !key) return false;
  try {
    return storage.getItem(FOLD_PREFIX + key) === "1";
  } catch (error) {
    if (error instanceof DOMException || error instanceof TypeError) return false;
    throw error;
  }
}

/**
 * Remembers the reader's fold of this page's strip; a storage that refuses the write leaves the fold
 * to last as long as the page.
 *
 * @param storage where the fold is remembered
 * @param key the page the strip stands on
 * @param folded whether the strip is folded
 */
export function writeFolded(storage: PresentationStorage | undefined, key: string | undefined, folded: boolean): void {
  if (!storage || !key) return;
  try {
    if (folded) storage.setItem(FOLD_PREFIX + key, "1");
    else storage.removeItem(FOLD_PREFIX + key);
  } catch (error) {
    if (error instanceof DOMException || error instanceof TypeError) return;
    throw error;
  }
}

/**
 * The one line a folded strip reads as: each card's label and figure, so folding hides the cards
 * and loses none of their figures. A figure not read yet is left out.
 *
 * @param cards the strip's cards
 */
export function foldedSummary(cards: readonly Pick<StatusCard, "key" | "label" | "value" | "unit">[]): { key: string; label: string; figure: string }[] {
  return cards
    .filter((card) => card.value !== undefined)
    .map((card) => ({
      key: card.key,
      label: card.label,
      figure: `${typeof card.value === "number" ? card.value.toLocaleString() : String(card.value)}${card.unit ? ` ${card.unit}` : ""}`,
    }));
}

/**
 * The filter key a card's narrowing is written under: the chip row's, so both read one state.
 *
 * @param filter a one-value narrowing
 */
export function cardFilterKey(filter: StatusCardValueFilter): string {
  return `${filter.field}.${SearchOperator.IN}`;
}

/**
 * The filter values a card's narrowing writes, by filter key.
 *
 * @param filter the card's narrowing
 */
export function cardFilterValues(filter: StatusCardFilter): Readonly<Record<string, unknown>> {
  return "values" in filter ? filter.values : { [cardFilterKey(filter)]: [filter.value] };
}

/**
 * Whether the list stands narrowed to exactly the card's rows.
 *
 * @param filter the card's narrowing
 * @param committed the list's committed filter values
 */
export function isCardPressed(filter: StatusCardFilter, committed: Readonly<Record<string, unknown>>): boolean {
  if ("values" in filter) {
    const keys = Object.keys(filter.values);
    return keys.length > 0 && keys.every((key) => committed[key] !== undefined && String(committed[key]) === String(filter.values[key]));
  }
  const chosen = committed[cardFilterKey(filter)];
  if (Array.isArray(chosen)) return chosen.length === 1 && String(chosen[0]) === filter.value;
  return chosen === filter.value;
}

/**
 * Which cards stand pressed. A card whose narrowing another pressed card's narrowing contains is
 * not pressed itself: pressing 「server errors in the last day」 also satisfies 「errors in the last
 * day」, and only the card the reader chose is drawn as chosen.
 *
 * @param cards the strip's cards
 * @param committed the list's committed filter values
 * @returns the keys of the pressed cards
 */
export function pressedCardKeys(cards: readonly Pick<StatusCard, "key" | "filter">[], committed: Readonly<Record<string, unknown>>): Set<string> {
  const matching = cards.filter((card) => card.filter && isCardPressed(card.filter, committed));
  const keysOf = (card: (typeof matching)[number]) => Object.keys(cardFilterValues(card.filter as StatusCardFilter));
  return new Set(
    matching
      .filter((card) => {
        const own = keysOf(card);
        return !matching.some((other) => other !== card && keysOf(other).length > own.length && own.every((key) => keysOf(other).includes(key)));
      })
      .map((card) => card.key),
  );
}

/**
 * The value a one-value press writes: the card's rows, or nothing when the list already stands on them.
 *
 * @param filter the card's narrowing
 * @param committed the list's committed filter values
 */
export function pressedValue(filter: StatusCardValueFilter, committed: Readonly<Record<string, unknown>>): string[] | undefined {
  return isCardPressed(filter, committed) ? undefined : [filter.value];
}

/**
 * Every filter value a press writes, by key: the card's narrowing, or each of its keys lifted
 * when the list already stands on it.
 *
 * @param filter the card's narrowing
 * @param committed the list's committed filter values
 */
export function pressedValues(filter: StatusCardFilter, committed: Readonly<Record<string, unknown>>): Record<string, unknown> {
  const values = cardFilterValues(filter);
  const lift = isCardPressed(filter, committed);
  return Object.fromEntries(Object.entries(values).map(([key, value]) => [key, lift ? undefined : value]));
}

/**
 * Every filter value a press on an unpressed card writes: its own narrowing, with the keys only
 * the other cards write lifted, so moving from 「server errors in the last day」 to 「errors in the
 * last day」 drops the status the first one wrote.
 *
 * @param filter the pressed card's narrowing
 * @param cards the strip's cards
 * @param committed the list's committed filter values
 */
export function narrowedValues(filter: StatusCardFilter, cards: readonly Pick<StatusCard, "filter">[], committed: Readonly<Record<string, unknown>>): Record<string, unknown> {
  const own = cardFilterValues(filter);
  const lifted: Record<string, unknown> = {};
  for (const card of cards) {
    if (!card.filter) continue;
    for (const key of Object.keys(cardFilterValues(card.filter))) if (!(key in own) && committed[key] !== undefined) lifted[key] = undefined;
  }
  return { ...lifted, ...own };
}

/**
 * The tone a card is drawn in: a figure of 0 has nothing to act on, so it is never red or amber.
 *
 * @param card the card
 */
export function shownCardTone(card: Pick<StatusCard, "value" | "tone">): StatusTone | undefined {
  return card.value === 0 ? undefined : card.tone;
}

/**
 * The figures a list's rows are cut by, drawn above the page's tabs and the list's chips.
 *
 * <p>A card with a `filter` is a toggle over the list: a one-value card writes the same `<field>.in`
 * filter the chip row writes, so a pressed card and its chosen chip are one state and either can
 * lift it; a card over a range or a threshold writes the keys the filter bar writes, so the bar's
 * badges show it and can lift it.
 * The page draws the strip above its tab strip (frontend invariant #63), never between the chips
 * and the rows.
 */
export function StatusCardStrip({ cards, filters, loading = false, columns = 4, foldKey, storage }: StatusCardStripProps) {
  const { t } = useTranslation(PACKAGE_NAMESPACE + "/features");
  const store = storage ?? browserStorage();
  const [folded, setFolded] = useState(() => readFolded(store, foldKey));
  const regionId = useId();
  if (cards.length === 0) return null;
  const committed = filters?.committedValues ?? {};
  const pressedKeys = pressedCardKeys(cards, committed);
  const fold = (next: boolean) => {
    setFolded(next);
    writeFolded(store, foldKey, next);
  };
  return (
    <div {...slotAttributes(statusCardFoldStyle, { folded })}>
      <div {...slotAttributes(statusCardHeadStyle, {})}>
        {folded ? (
          <p {...slotAttributes(statusCardSummaryStyle, {})}>
            {foldedSummary(cards).map((one) => (
              <span key={one.key} {...slotAttributes(statusCardSummaryItemStyle, {})}>
                {one.label} <b>{one.figure}</b>
              </span>
            ))}
          </p>
        ) : null}
        <button
          type="button"
          aria-expanded={!folded}
          aria-controls={regionId}
          onClick={() => fold(!folded)}
          {...slotAttributes(statusCardToggleStyle, {})}
        >
          {folded ? <ChevronDownIcon aria-hidden /> : <ChevronUpIcon aria-hidden />}
          {folded ? t("statusCards.unfold") : t("statusCards.fold")}
        </button>
      </div>
      {folded ? null : (
    <Grid id={regionId} columns={columns} gap="md" fit {...partAttributes(statusCardStripStyle, {})}>
      {cards.map((card) => {
        const tone = shownCardTone(card);
        const body = (
          <StatCard
            title={card.label}
            value={typeof card.value === "number" ? <DigitRoll value={card.value} format={(n) => n.toLocaleString()} /> : card.value ?? ""}
            unit={card.value === undefined ? undefined : card.unit}
            description={card.basis}
            chart={card.chart}
            tone={tone}
            highlighted={tone === "danger" || tone === "warning"}
            // A figure not read yet stands as the card's own placeholder rather than as a blank.
            loading={loading || card.value === undefined}
          />
        );
        const { filter } = card;
        if (!filter || !filters) {
          return (
            <div key={card.key} {...slotAttributes(statusCardStyle, { pressed: false, pressable: false })}>
              {body}
            </div>
          );
        }
        const pressed = pressedKeys.has(card.key);
        return (
          <button
            key={card.key}
            type="button"
            aria-pressed={pressed}
            onClick={() => filters.commitValues(pressed ? pressedValues(filter, committed) : narrowedValues(filter, cards, committed))}
            {...slotAttributes(statusCardStyle, { pressed, pressable: true })}
          >
            {body}
          </button>
        );
      })}
    </Grid>
      )}
    </div>
  );
}
