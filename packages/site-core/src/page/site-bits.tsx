import type { ReactNode } from "react";
import { slotAttributes } from "@simplix-react/ui/design";

import { siteBadgeStyle, siteCaptionStyle, siteChipDotStyle, siteChipStyle, siteLiveStyle, siteSpinnerStyle } from "./site-page.style";

/** How a {@link SiteChip} reads: plain, the accent, or a state that went well, needs care or failed. */
export type SiteChipTone = "neutral" | "accent" | "good" | "warn" | "bad";

/** Props for {@link SiteChip}. */
export interface SiteChipProps {
  readonly tone?: SiteChipTone;
  /** A still dot in the tone's colour before the words. */
  readonly dot?: boolean;
  readonly children: ReactNode;
}

/** A status in one to three words. The words carry the state; the colour only repeats it. */
export function SiteChip({ tone, dot = false, children }: SiteChipProps) {
  return (
    <span {...slotAttributes(siteChipStyle, { tone })}>
      {dot ? <span {...slotAttributes(siteChipDotStyle, {})} aria-hidden="true" /> : null}
      {children}
    </span>
  );
}

/** A small ring that turns while something runs; it says nothing itself, the words beside it do. */
export function SiteSpinner() {
  return <span {...slotAttributes(siteSpinnerStyle, {})} aria-hidden="true" />;
}

/** Props for {@link SiteCaption}. */
export interface SiteCaptionProps {
  readonly children: ReactNode;
}

/** A small muted line under a part. */
export function SiteCaption({ children }: SiteCaptionProps) {
  return <p {...slotAttributes(siteCaptionStyle, {})}>{children}</p>;
}

/** Props for {@link SiteLive}. */
export interface SiteLiveProps {
  /** What a screen reader says; a change of it is spoken. Empty says nothing. */
  readonly children?: ReactNode;
}

/** A status line only a screen reader reads; it stays mounted so each change of its words is spoken. */
export function SiteLive({ children }: SiteLiveProps) {
  return (
    <span {...slotAttributes(siteLiveStyle, {})} role="status">
      {children}
    </span>
  );
}

/** Props for {@link SiteBadge}. */
export interface SiteBadgeProps {
  readonly tone?: "neutral" | "warn";
  /** A glyph before the words, which the product draws. */
  readonly icon?: ReactNode;
  /** What the badge means in full, shown on hover. */
  readonly title?: string;
  readonly children: ReactNode;
}

/** A small badge in a tone with its glyph, such as a draft mark beside a document's title. */
export function SiteBadge({ tone, icon, title, children }: SiteBadgeProps) {
  return (
    <span {...slotAttributes(siteBadgeStyle, { tone })} title={title}>
      {icon}
      {children}
    </span>
  );
}
