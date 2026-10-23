import { useTranslation } from "@simplix-react/i18n/react";
import { Badge, cn, Text } from "@simplix-react/ui";
import { sourceBadgeStyle, sourceDividerStyle } from "./source-badge.style";
import { partAttributes, slotAttributes } from "@simplix-react/ui/design";

/**
 * Which layer set a value, as the closed set of words a reader learns once (P-13 · 설계서 13.10절).
 *
 * <p><b>The set is closed on purpose, and the keys are `PolicyValueSource`'s.</b> Fourteen
 * different words had reached the badge on the board before it was closed — 「이 사업장」 beside
 * 「사업장 설정」, 「팩 기본」 beside 「산업 팩」 — so one layer read as several and the reader had to
 * learn the vocabulary again on every screen. A screen that states its own source rather than
 * reading one back from the server is exactly where a fifteenth word gets typed, which is why this
 * is a union rather than a string.
 */
export type ValueSource =
  /** 법정 기본 — what the statute sets, carried into the product by a pack. */
  | "STATUTORY_DEFAULT"
  /** 설치 기본 — what this installation's administrator set for every workplace. */
  | "INSTALLATION_DEFAULT"
  /** 산업 팩 — what an industry pack narrowed for the industries it covers. */
  | "INDUSTRY_PACK"
  /** 사업장 설정 — what one workplace set for itself. */
  | "SITE_SETTING"
  /** 법규 팩 — the pack itself, as the thing that supplied a value. */
  | "REGULATION_PACK"
  /** 문서 유형 정책 — a retention term a document-kind policy rather than a statute set. */
  | "DOCUMENT_KIND_POLICY"
  /** 고시 권고 — a notice's recommendation, the one kind of value that may be relaxed. */
  | "NOTICE_RECOMMENDATION";

/** Props for {@link SourceBadge}. */
export interface SourceBadgeProps {
  /** Which layer decided it. */
  readonly source: ValueSource;
  /** The article, section or pack version behind it — 「산업안전보건법 제29조 ③」, 「2026.07」. */
  readonly basis?: string;
  /** Extra classes for the pill, for a caller that has to place it in a flow of text. */
  readonly className?: string;
}

/**
 * 출처 배지 (P-13) — which layer a value came from, and what it rests on.
 *
 * <p><b>Both halves are on the screen, which is the whole point of drawing a badge rather than a
 * sentence.</b> A number alone never says which layer set it, and the article alone never says
 * whether a person may change it: 「설계서 17.7절」 standing as grey text tells a reader nothing
 * about whether their workplace chose that or a statute did. The pair says it in one glance —
 * 「사업장 설정 · 설계서 17.7절」 is a value this site set, 「법정 기본 · 개인정보 보호법 제34조」 is
 * one it may not.
 *
 * <p><b>It answers a different question from the AI mark.</b> This says what DECIDED the value; the
 * mark beside it says what MADE it. One value can carry both.
 *
 * <p><b>Where the value came back from a server that resolved it, use the resolving badge
 * instead.</b> This one is for a source the screen itself states as a fact — the statute a help
 * card rests on, the design section behind a fixed rule — which has no resolution to read and
 * therefore no precedence record to open. A value the server resolved has both, and drawing it
 * with this would quietly stop following the resolution.
 *
 * <p><b>An empty basis draws the kind alone rather than an empty second half.</b> Some sources have
 * nothing to cite, and a divider with nothing after it reads as a citation that failed to load.
 */
export function SourceBadge({ source, basis, className }: SourceBadgeProps) {
  const { t } = useTranslation("common");

  return (
    <Badge
      variant={source === "STATUTORY_DEFAULT" ? "outline" : "secondary"}
      className={cn("whitespace-normal", className)}
      {...partAttributes(sourceBadgeStyle, {})}
    >
      {t(`source.${source}`)}
      {basis ? (
        <>
          {/* A rule rather than a 가운뎃점: the two halves are different kinds of fact, and a
              separator that looks like the one joining words inside each half reads as a third
              item in a list. */}
          <span
            aria-hidden
            className="h-3 w-px shrink-0"
            {...slotAttributes(sourceDividerStyle, {})}
          />
          <Text as="span" size="caption" weight="normal">
            {basis}
          </Text>
        </>
      ) : undefined}
    </Badge>
  );
}
