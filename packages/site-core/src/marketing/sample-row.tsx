import { useId, type ReactNode } from "react";
import { slotAttributes } from "@simplix-react/ui/design";

import {
  siteDisplayHeadingStyle,
  siteSampleBodyStyle,
  siteSampleDiscStyle,
  siteSampleHeadStyle,
  siteSampleLineStyle,
  siteSampleListStyle,
  siteSampleMetaStyle,
  siteSampleNameStyle,
  siteSampleStyle,
  siteSampleTextStyle,
  siteSplitHeadStyle,
  siteSplitLedeStyle,
  siteSplitStyle,
} from "./marketing.style";

/** Props for {@link SampleRow}. */
export interface SampleRowProps {
  /** The sample's name ("Free"). */
  readonly name: ReactNode;
  /** Where it is made and what it costs, after the name. */
  readonly meta?: ReactNode;
  /** The words the sample reads, cut to one line at rest. */
  readonly text: ReactNode;
  readonly playing: boolean;
  /**
   * What stands in the text's place while the sample plays: the product's wave with its progress.
   * The kit plays nothing; the product's player owns the audio and hands the row its state.
   */
  readonly playingMedia?: ReactNode;
  /** The glyph in the disc, a play or a stop mark the product draws. */
  readonly icon?: ReactNode;
  /** The row's accessible name, which says what a press does ("Listen to the free voice"). */
  readonly label: string;
  readonly onToggle?: () => void;
  /** No sample can start now (a preview limit reached); a playing row can still stop. */
  readonly disabled?: boolean;
}

/**
 * One sample to hear, as a single toggle: the play disc, the name and where it is made, then its
 * text, or its wave while it plays.
 */
export function SampleRow({ name, meta, text, playing, playingMedia, icon, label, onToggle, disabled = false }: SampleRowProps) {
  return (
    <button
      {...slotAttributes(siteSampleStyle, { playing })}
      type="button"
      aria-pressed={playing}
      aria-label={label}
      disabled={disabled && !playing}
      onClick={onToggle}
    >
      <span {...slotAttributes(siteSampleDiscStyle, { playing })}>{icon}</span>
      <span {...slotAttributes(siteSampleBodyStyle, {})}>
        <span {...slotAttributes(siteSampleHeadStyle, {})}>
          <b {...slotAttributes(siteSampleNameStyle, {})}>{name}</b>
          {meta !== undefined ? <small {...slotAttributes(siteSampleMetaStyle, {})}>{meta}</small> : null}
        </span>
        <span {...slotAttributes(siteSampleLineStyle, {})}>
          {playing && playingMedia !== undefined ? playingMedia : <span {...slotAttributes(siteSampleTextStyle, {})}>{text}</span>}
        </span>
      </span>
    </button>
  );
}

/** Props for {@link SampleList}. */
export interface SampleListProps {
  readonly children: ReactNode;
}

/** Samples one under the other. */
export function SampleList({ children }: SampleListProps) {
  return <div {...slotAttributes(siteSampleListStyle, {})}>{children}</div>;
}

/** Props for {@link SplitSection}. */
export interface SplitSectionProps {
  readonly heading: ReactNode;
  readonly lede?: ReactNode;
  /** What stands beside the heading: samples, a picture. */
  readonly children: ReactNode;
}

/** A section whose display heading and lede stand beside its content; one under the other below the medium tier. */
export function SplitSection({ heading, lede, children }: SplitSectionProps) {
  const headingId = useId();
  return (
    <section {...slotAttributes(siteSplitStyle, {})} aria-labelledby={headingId}>
      <div {...slotAttributes(siteSplitHeadStyle, {})}>
        <h2 {...slotAttributes(siteDisplayHeadingStyle, {})} id={headingId}>
          {heading}
        </h2>
        {lede !== undefined ? <p {...slotAttributes(siteSplitLedeStyle, {})}>{lede}</p> : null}
      </div>
      {children}
    </section>
  );
}
