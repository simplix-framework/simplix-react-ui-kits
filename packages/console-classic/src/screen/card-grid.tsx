import type { ReactNode } from "react";
import { useTranslation } from "@simplix-react/i18n/react";
import { Card, EmptyState, Flex, Grid, Heading, Stack, Text } from "@simplix-react/ui";

/** One card. Three or four things at most — anything more and this is a table stood on end. */
export interface GridCard {
  readonly key: string;
  /** What it is called. */
  readonly title: string;
  /** The one line under the name that identifies it. */
  readonly subtitle?: string;
  /** The state the reader is scanning for, as a badge. */
  readonly mark?: ReactNode;
  /**
   * The picture the reader scans by — a face, a machine, a terminal's own shot.
   *
   * <p>The reason this view exists at all: a grid with no picture and no shape in it is a list
   * with fewer rows on screen. Absent where the record genuinely has no image, which is the case
   * that should make somebody ask whether the grid is worth it here.
   */
  readonly thumb?: ReactNode;
  /** What pressing the card does — the same thing pressing the row does. */
  readonly onOpen?: () => void;
}

interface CardGridProps {
  /** What the rows are ordered by, spelled out because a grid has no column headers to carry it. */
  readonly sortedBy: string;
  readonly cards: readonly GridCard[];
  /** Drawn when the narrowing left nothing. */
  readonly empty?: { readonly title: string; readonly description?: string };
}

/**
 * 카드 격자 (P-39) — the same records as the list, laid out as cards.
 *
 * <p><b>Another view of one screen, not another screen.</b> The filters and the sort the reader
 * arrived with carry over; switching view changes the shape and nothing else, and the actions
 * offered stay the same ones in the same order.
 *
 * <p><b>Worth it for one reason only: when people scan by a picture or a shape.</b> A face, a
 * machine's photograph, a terminal's connection light. For anything else the list fits more on
 * screen and lines the values up for comparison.
 *
 * <p><b>A card carries less than a row.</b> Every column moved onto the card turns it into a table
 * printed vertically — three or four values are what a scan reads.
 *
 * <p><b>The order is written on the bar.</b> A list says what it is sorted by in its column headers
 * and a grid has none, so a grid that does not say it is a grid nobody trusts the order of.
 */
export function CardGrid({ sortedBy, cards, empty }: CardGridProps) {
  const { t } = useTranslation("common");

  if (cards.length === 0 && empty) {
    return <EmptyState title={empty.title} description={empty.description} />;
  }

  return (
    <Stack gap="sm">
      <Text size="caption" tone="muted">
        {t("cardGrid.sortedBy", { field: sortedBy })}
      </Text>
      <Grid columns={4} gap="md">
        {cards.map((card) => (
          <Card
            key={card.key}
            padding="sm"
            interactive={Boolean(card.onOpen)}
            onClick={card.onOpen}
          >
            <Flex gap="sm" align="start">
              {card.thumb}
              <Stack gap="xs" flex minSize>
                <Flex gap="sm" align="start" justify="between">
                  <Heading level={6}>{card.title}</Heading>
                  {card.mark}
                </Flex>
                {card.subtitle && (
                  <Text size="caption" tone="muted">
                    {card.subtitle}
                  </Text>
                )}
              </Stack>
            </Flex>
          </Card>
        ))}
      </Grid>
    </Stack>
  );
}
