import type { ReactNode } from "react";
import { slotAttributes } from "@simplix-react/ui/design";

import { siteCardTextStyle, siteProgressFillStyle, siteProgressStyle, siteVideoRowStyle, siteVideoStyle, siteVideoTextStyle, siteVideoTitleStyle, siteVideoToggleStyle } from "./install.style";

/** Props for {@link SiteProgress}. */
export interface SiteProgressProps {
  /** 0 to 1. */
  readonly share: number;
}

/** A thin track filled to a share; it says nothing to a screen reader, the words beside it do. */
export function SiteProgress({ share }: SiteProgressProps) {
  return (
    <span {...slotAttributes(siteProgressStyle, {})} aria-hidden="true">
      <i {...slotAttributes(siteProgressFillStyle, {})} style={{ width: `${String(Math.min(1, Math.max(0, share)) * 100)}%` }} />
    </span>
  );
}

/** Props for {@link VideoCard}. */
export interface VideoCardProps {
  /** The video's title and length; the card is named by it. */
  readonly title: string;
  readonly caption?: ReactNode;
  /** 0 to 1 of the video played; `null` while it is not playing. */
  readonly played: number | null;
  /** The toggle's accessible name ("Play the install video"). */
  readonly toggleLabel: string;
  readonly onToggle?: () => void;
  /** The glyph on the toggle, a play or a pause mark the product draws. */
  readonly icon?: ReactNode;
}

/** A video to watch: the play toggle, its title and what it shows, and how much has played. The product plays it. */
export function VideoCard({ title, caption, played, toggleLabel, onToggle, icon }: VideoCardProps) {
  return (
    <section {...slotAttributes(siteVideoStyle, {})} aria-label={title}>
      <div {...slotAttributes(siteVideoRowStyle, {})}>
        <button {...slotAttributes(siteVideoToggleStyle, {})} type="button" aria-label={toggleLabel} aria-pressed={played !== null} onClick={onToggle}>
          {icon}
        </button>
        <div {...slotAttributes(siteVideoTextStyle, {})}>
          <b {...slotAttributes(siteVideoTitleStyle, {})}>{title}</b>
          {caption !== undefined ? <span {...slotAttributes(siteCardTextStyle, {})}>{caption}</span> : null}
        </div>
      </div>
      <SiteProgress share={played ?? 0} />
    </section>
  );
}
