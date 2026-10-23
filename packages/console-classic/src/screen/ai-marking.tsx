import type { ReactNode } from "react";
import { useTranslation } from "@simplix-react/i18n/react";
import {
  Badge,
  Card,
  Flex,
  Stack,
  Text,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@simplix-react/ui";

import { NoticeCard } from "../notice";

/**
 * The five words this product marks a machine-made value with. The set is closed.
 *
 * <p><b>A sixth word is one more thing a reader has to learn.</b> The whole value of the mark is
 * that it is read at a glance without being looked up, and that survives five words and not eight;
 * the board holds the same set on its own side.
 */
export type AiWord = "estimate" | "classification" | "translation" | "draft" | "photoReading";

/**
 * How much this installation needs to run the feature behind the mark.
 *
 * <p><b>A different axis from the word.</b> Reading a paper certificate is arithmetic that finishes
 * on the CPU and detecting protective equipment needs a GPU, and both are 「사진 판독」 — so the tier
 * says whether the feature is available here, and the word says what it produced.
 */
export type AiTier = 1 | 2 | 3;

/**
 * What a mark is, and what it was made from.
 *
 * <p><b>An estimate without a basis is not shown at all</b>, so the type is split on the word
 * rather than the rule being written down beside an optional prop. A figure a person is going to
 * sign against needs to say what produced it; an output that cannot say is one that does not go on
 * the screen — and 「is not shown at all」 is a claim about what exists, which is a thing a type can
 * hold and a sentence in a doc cannot.
 *
 * <p><b>The other four words are marks on a value that says what produced it elsewhere</b> — a
 * translation beside its original, a draft in the box a person is about to rewrite — so the basis
 * is theirs to add rather than to owe.
 */
export type AiBadgeProps =
  | {
      readonly word: "estimate";
      /** What it was made from — how many samples, which method, what interval. */
      readonly basis: string;
    }
  | {
      readonly word: Exclude<AiWord, "estimate">;
      /** What it was made from, where there is something worth saying. */
      readonly basis?: string;
    };

/**
 * AI · 계산 표시 (P-40) — the mark on a value a machine produced.
 *
 * <p><b>It answers a different question from the source badge.</b> The source badge (P-13) says
 * which layer decided a value — a statute, an installation setting, an industry pack. This says
 * what MADE it. One value can legitimately carry both.
 *
 * <p><b>It disappears when a person has checked the value, and does not become 「검수함」.</b> The
 * mark means 「아직 사람을 거치지 않았다」; a mark on every value is a mark on none. What made the
 * value and who let it stand are still in the record's own history — leaving the screen is not
 * leaving the record.
 *
 * <p><b>No model decides anything about a person.</b> Barring entry, dropping somebody from an
 * assignment and judging a contract are done by rules made of conditions a person can check.
 * 개인정보 보호법 제37조의2 gives a subject the right to refuse a fully automated decision and to be
 * told how it was made, which a model's output cannot supply.
 */
export function AiBadge({ word, basis }: AiBadgeProps) {
  const { t } = useTranslation("common");
  const badge = (
    <Badge variant="secondary">
      <span aria-hidden className="mr-1">
        ◈
      </span>
      {t(`ai.word.${word}`)}
    </Badge>
  );
  if (!basis) return badge;
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="inline-flex cursor-default">{badge}</span>
      </TooltipTrigger>
      <TooltipContent>{basis}</TooltipContent>
    </Tooltip>
  );
}

interface AiEstimateProps {
  /** The figure itself, already formatted. */
  readonly value: ReactNode;
  /**
   * The interval around it, already formatted — 「95% 구간 2~5회차」.
   *
   * <p><b>An estimate drawn as one number is read as a measurement.</b> The range is what says the
   * next reading could land elsewhere, and a plan built on the point value alone is a plan nobody
   * was told the confidence of.
   */
  readonly range: string;
  /**
   * How it was arrived at, shown on the badge.
   *
   * <p>Required for the same reason {@link AiBadgeProps} requires it of an estimate: this draws
   * one, so an estimate with nothing behind it cannot be constructed here either.
   */
  readonly basis: string;
}

/** AI · 계산 표시 (P-40) — an estimated figure, drawn with the interval it sits in. */
export function AiEstimate({ value, range, basis }: AiEstimateProps) {
  return (
    <Flex align="center" gap="xs" wrap>
      <Text>{value}</Text>
      <Text size="caption" tone="muted">
        {range}
      </Text>
      <AiBadge word="estimate" basis={basis} />
    </Flex>
  );
}

interface AiFeatureCardProps {
  /** What the screen's machine-made values are, as one line. */
  readonly title: string;
  /** Which of them this screen produces, and what happens when the feature is off. */
  readonly summary: string;
  readonly tier: AiTier;
  /** Where 「무엇이 만든 값인가」 goes. */
  readonly explanation?: ReactNode;
}

/**
 * AI · 계산 표시 (P-40) — the screen-level card saying what on this screen a machine made.
 *
 * <p><b>Per screen, where the badge is per value.</b> The card exists to say what to do when the
 * feature is not available, which is a fact about the screen rather than about one figure on it.
 *
 * <p><b>Only tiers 2 and 3 draw it.</b> Tier 1 is arithmetic that runs on every installation, so a
 * card explaining the fallback would be explaining a state that cannot occur — and a card on every
 * screen stops being read.
 *
 * <p>Renders nothing at tier 1 rather than asking every caller to remember the rule.
 */
export function AiFeatureCard({ title, summary, tier, explanation }: AiFeatureCardProps) {
  const { t } = useTranslation("common");
  if (tier === 1) return null;

  return (
    <Card padding="sm">
      <Stack gap="xs">
        <Flex align="center" gap="sm" wrap>
          <span aria-hidden>◈</span>
          <Text weight="medium">{title}</Text>
          <Badge variant="outline">{t("ai.tier", { tier })}</Badge>
          {explanation && <span className="ml-auto">{explanation}</span>}
        </Flex>
        <Text size="caption" tone="muted">
          {summary}
        </Text>
        <Text size="caption" tone="muted">
          {t(`ai.offline.tier${tier}`)}
        </Text>
      </Stack>
    </Card>
  );
}

interface AiDecisionBoundaryNoticeProps {
  /**
   * The constant this card is known by on the screen that draws it.
   *
   * <p>Taken from the caller rather than fixed here, because the card belongs to the screen it
   * stands on: one operator who has read it on the health screen has not thereby read it on the
   * contractor screen, and the header control that brings it back lists this screen's cards.
   * Namespaced by that screen — `health.list.decisionBoundary`.
   */
  readonly noticeKey: string;
}

/**
 * AI · 계산 표시 (P-40) — the standing statement that no model closes a door.
 *
 * <p>Drawn on any screen that shows a machine-made value beside a decision about a person, so the
 * reader knows the decision was not the model's.
 *
 * <p><b>A card, because the sentence is true of every row and every day.</b> A component whose
 * whole body is an unconditional banner is exactly the shape frontend invariant #73 says to look
 * for: it reads as a deliberate primitive, and every screen that adopts it plants a sentence its
 * reader can never put away. Through `NoticeCard` the same import puts it on the header's 경고
 * control instead, so it costs one press after the first reading rather than the same band of the
 * page for ever.
 */
export function AiDecisionBoundaryNotice({ noticeKey }: AiDecisionBoundaryNoticeProps) {
  const { t } = useTranslation("common");
  return (
    <NoticeCard
      noticeKey={noticeKey}
      kind="warning"
      title={t("ai.boundaryTitle")}
      hint={t("ai.boundaryBody")}
    />
  );
}
