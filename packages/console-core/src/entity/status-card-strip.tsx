import type { ReactNode } from "react";
import { Grid, SearchOperator, StatCard, type CrudListFilters, type StatusTone } from "@simplix-react/ui";
import { partAttributes, slotAttributes } from "@simplix-react/ui/design";
import { DigitRoll } from "@simplix-react/ui/interaction";

import { statusCardStripStyle, statusCardStyle } from "./status-card-strip.style";

/** The list narrowing a {@link StatusCard} stands for: one value of one field. */
export interface StatusCardFilter {
  readonly field: string;
  readonly value: string;
}

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
  readonly filters?: Pick<CrudListFilters, "committedValues" | "commitValue">;
  readonly loading?: boolean;
  readonly columns?: 1 | 2 | 3 | 4;
}

/** The filter key a card's narrowing is written under: the chip row's, so both read one state. */
export function cardFilterKey(filter: StatusCardFilter): string {
  return `${filter.field}.${SearchOperator.IN}`;
}

/**
 * Whether the list stands narrowed to exactly the card's rows.
 *
 * @param filter the card's narrowing
 * @param committed the list's committed filter values
 */
export function isCardPressed(filter: StatusCardFilter, committed: Readonly<Record<string, unknown>>): boolean {
  const chosen = committed[cardFilterKey(filter)];
  if (Array.isArray(chosen)) return chosen.length === 1 && String(chosen[0]) === filter.value;
  return chosen === filter.value;
}

/**
 * The value a press writes: the card's rows, or nothing when the list already stands on them.
 *
 * @param filter the card's narrowing
 * @param committed the list's committed filter values
 */
export function pressedValue(filter: StatusCardFilter, committed: Readonly<Record<string, unknown>>): string[] | undefined {
  return isCardPressed(filter, committed) ? undefined : [filter.value];
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
 * <p>A card with a `filter` is a toggle over the list: it writes the same `<field>.in` filter the
 * chip row writes, so a pressed card and its chosen chip are one state and either can lift it.
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
            onClick={() => filters.commitValue(cardFilterKey(filter), pressedValue(filter, committed))}
            {...slotAttributes(statusCardStyle, { pressed, pressable: true })}
          >
            {body}
          </button>
        );
      })}
    </Grid>
  );
}
