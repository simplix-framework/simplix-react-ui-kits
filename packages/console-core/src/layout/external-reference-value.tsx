import { useTranslation } from "@simplix-react/i18n/react";
import { Badge, Flex, InstantText, Text } from "@simplix-react/ui";

import { PeekTriggerButton } from "./detail-peek-dialog";

/** Props for {@link ExternalReferenceValue}. */
export interface ExternalReferenceValueProps {
  /** The value as it reads to a person — a certificate number, a licence, a result. */
  readonly value: string;
  /**
   * The body the value belongs to — 건설안전패스 · 자격기관.
   *
   * <p>Drawn as a badge beside the value, because 「이름 + 보기」 is the same shape an internal
   * reference takes (P-07) and the badge is the only thing that says this one is not ours to
   * change. Without it a reader edits somebody else's record in their head.
   */
  readonly authority: string;
  /**
   * When this system last read the value from that body.
   *
   * <p><b>Shown with the value, never omitted.</b> The outside value can change without this
   * system hearing about it, so a figure with no lookup time is read as current when it may be a
   * month old — and a safety decision made on a stale qualification is the failure this line
   * exists to prevent.
   */
  readonly fetchedAt: string | Date | number | null | undefined;
  /**
   * Opens the value's own dialog — what this system last received, when it asked, and where it
   * uses the value.
   *
   * <p><b>The control does not leave.</b> Pressing 「보기」 opens the same dialog an internal
   * reference opens (P-07); the way out to the outside body is the dialog's own 「페이지로 이동」,
   * which opens a new window. A control that left the screen directly would lose whatever the
   * reader was part-way through, and would give them no chance to see how old the value is first.
   *
   * <p>Absent where this system holds only a copy and there is nothing to show beside it.
   */
  readonly onPeek?: () => void;
  /**
   * Whether this reader may read the outside value at all.
   *
   * <p><b>False leaves the value and removes the button.</b> A control that leads to a refusal
   * teaches the reader to stop pressing the ones that work, so the affordance goes rather than the
   * refusal arriving after the press (`simplix:frontend` invariant #52).
   */
  readonly canRead?: boolean;
  /**
   * Whether this installation can reach the outside body at all.
   *
   * <p><b>A closed network is not a licence problem.</b> On an installation with no outward route
   * the button is not drawn and an environment badge says why; the stored copy and the last value
   * received stay readable, because they are this system's own records. The screen reads this from
   * the environment check (N-35) — a presentational component cannot know it.
   */
  readonly reachable?: boolean;
  /** The display zone the lookup time is rendered in — the workplace's, never the browser's. */
  readonly displayZone?: string;
}

/**
 * 참조 엔티티 외부 링크 (P-43) — a value this system holds a copy of and does not own.
 *
 * <p><b>The same 「이름 + 보기」 as an internal reference, plus what makes it different</b>: the
 * badge naming the body it belongs to, and the time this system last read it. Everything else —
 * the shape, the place, the icon — is P-07's, so a reader meets one control rather than two.
 *
 * <p><b>「보기」 opens the dialog, not the outside site.</b> The reader has to be able to see how
 * old the value is and what this system does with it before deciding to go and check; the way out
 * is the dialog's own 「페이지로 이동」, and it opens a new window because leaving this screen loses
 * whatever they were part-way through.
 *
 * <p><b>Two conditions remove the button and keep the value</b> — no permission to read the
 * outside value, and no route out of this installation. They are different facts with the same
 * shape on screen, so the second says which it is with an environment badge rather than leaving
 * the reader to think their permissions changed.
 */
export function ExternalReferenceValue({
  value,
  authority,
  fetchedAt,
  onPeek,
  canRead = true,
  reachable = true,
  displayZone,
}: ExternalReferenceValueProps) {
  const { t } = useTranslation("common");
  const opens = Boolean(onPeek) && canRead && reachable;

  return (
    <Flex align="center" gap="sm" wrap>
      <Text size="sm" className="min-w-0 truncate">
        {value}
      </Text>
      <Badge variant="outline">{authority}</Badge>
      {/* The value names the trigger, not the body it belongs to: three rows from the same register
          would otherwise give a screen reader 「건설안전패스 보기」 three times over. */}
      {opens && onPeek ? (
        <PeekTriggerButton label={t("externalReference.open")} target={value} onClick={onPeek} />
      ) : !reachable ? (
        <Badge variant="secondary">{t("externalReference.closedNetwork")}</Badge>
      ) : null}
      <Text size="caption" tone="muted" className="shrink-0">
        {t("externalReference.fetchedAt")}{" "}
        <InstantText
          value={fetchedAt}
          displayZone={displayZone}
          fallback={t("externalReference.neverFetched")}
        />
      </Text>
    </Flex>
  );
}
