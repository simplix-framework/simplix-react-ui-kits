import { CircleHelpIcon, InfoIcon, TriangleAlertIcon } from "lucide-react";
import type { ComponentType } from "react";
import type { StatusTone } from "@simplix-react/ui";

/**
 * What sort of thing a **dismissible** notice card is saying.
 *
 * <p><b>This is four of the product's six in-page message kinds.</b> The board draws six (P-23) —
 * `help` · `info` · `warn` · `error` · `example` · `legal`. It originally split them by whether the
 * reader may put the message away, and kept `error` on the never-closes side: an error stays on the
 * screen for as long as it is true.
 *
 * <p><b>`danger` closes now, and what changed is not the reasoning but what the header does.</b>
 * The rule was written when putting a message away meant losing it, and the argument was sound on
 * that footing — an operator who dismissed 「2명이 알림을 수신하지 못했습니다」 would have had
 * nothing left to tell them it was still true. What the header control now carries is exactly that:
 * a kind with a hidden card is tinted and pulses, so a dismissed error is a message moved rather
 * than a message lost, and the reader can see from any route that one is standing.
 *
 * <p><b>What stays off this list is `example` and `legal`</b>, and for a different reason than the
 * one `error` was on it for: neither is a message about the state of anything. A worked example and
 * a legal ground are part of what the screen says, always, and a control for putting them away
 * would be a control for hiding half a sentence.
 */
export type DismissibleNoticeKind = "help" | "warning" | "info" | "danger";

/** The order the header draws them in, loudest first. */
export const DISMISSIBLE_NOTICE_KINDS: readonly DismissibleNoticeKind[] = [
  "danger",
  "warning",
  "info",
  "help",
];

/** How one kind is drawn, in both places it appears. */
export interface DismissibleNoticeKindStyle {
  /** The glyph on the card and on the header control. */
  readonly icon: ComponentType<{ className?: string }>;
  /** The tint the card is painted with, and the colour of the glyph. */
  readonly tone: StatusTone;
  /** What the header control is called, in the `common` catalogue. */
  readonly labelKey: string;
  /**
   * Whether the header control pulses while a card of this kind is put away.
   *
   * <p><b>Only what asks to be acted on.</b> A tint is enough to say 「치워 둔 것이 있다」; movement
   * is a claim on the reader's attention, and a console where four controls pulse at once has told
   * them nothing about which one matters. So the two kinds that name something wrong pulse, and
   * the two that explain the screen sit still and coloured.
   */
  readonly pulses: boolean;
}

/**
 * The icon and the colour a kind is drawn with.
 *
 * <p>Icon <b>and</b> colour together, never one alone: colour on its own does not reach a reader
 * who cannot separate the two tints, and an icon on its own does not reach one scanning the page
 * without reading it.
 *
 * <p><b>Three of these rows are also written in the framework, and the two tables have to keep
 * agreeing.</b> `AlertBanner` derives a glyph from its tone (`TONE_GLYPH`) so that a caller cannot
 * draw a tinted banner with no shape, and `danger` · `warning` · `info` appear in both. A change
 * to one of those three here is a change owed there, or the same message is drawn with two
 * different glyphs depending on whether it is a card or a banner — which reads as two kinds of
 * thing rather than one thing in two places.
 *
 * <p><b>`help` is the row that does not cross over, and the reason is worth keeping.</b> It is a
 * kind rather than a tone: it borrows `neutral`, and `neutral` is the one tone the framework
 * deliberately leaves without a glyph. Giving `neutral` this row's `CircleHelpIcon` upstream would
 * make every neutral banner in every product claim to be a help card.
 */
export const DISMISSIBLE_NOTICE_KIND_STYLE: Readonly<
  Record<DismissibleNoticeKind, DismissibleNoticeKindStyle>
> = {
  help: { icon: CircleHelpIcon, tone: "neutral", labelKey: "notice.kind.help", pulses: false },
  // The same triangle as `warning`, and deliberately: a circle-in-a-circle beside `info`'s own
  // circle is two glyphs a reader tells apart only by colour, which is the thing this table's own
  // note says never to rely on. The triangle separates 「무언가 잘못됐다」 from 「설명이다」 by
  // shape, and red against amber separates the two inside that pair — the split a reader needs at
  // a glance is the first one.
  danger: { icon: TriangleAlertIcon, tone: "danger", labelKey: "notice.kind.danger", pulses: true },
  warning: { icon: TriangleAlertIcon, tone: "warning", labelKey: "notice.kind.warning", pulses: true },
  info: { icon: InfoIcon, tone: "info", labelKey: "notice.kind.info", pulses: false },
};
