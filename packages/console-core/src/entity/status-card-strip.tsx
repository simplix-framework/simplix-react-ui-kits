import type { ReactNode } from "react";
import { Grid, SearchOperator, StatCard, type CrudListFilters, type StatusTone } from "@simplix-react/ui";
import { partAttributes, slotAttributes } from "@simplix-react/ui/design";
import { DigitRoll } from "@simplix-react/ui/interaction";

import { statusCardStripStyle, statusCardStyle } from "./status-card-strip.style";

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
export function StatusCardStrip({ cards, filters, loading = false, columns = 4 }: StatusCardStripProps) {
  if (cards.length === 0) return null;
  const committed = filters?.committedValues ?? {};
  return (
    <Grid columns={columns} gap="md" fit {...partAttributes(statusCardStripStyle, {})}>
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
        const pressed = isCardPressed(filter, committed);
        return (
          <button
            key={card.key}
            type="button"
            aria-pressed={pressed}
            onClick={() => filters.commitValues(pressedValues(filter, committed))}
            {...slotAttributes(statusCardStyle, { pressed, pressable: true })}
          >
            {body}
          </button>
        );
      })}
    </Grid>
  );
}
