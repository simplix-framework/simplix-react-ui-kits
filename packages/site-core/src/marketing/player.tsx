import type { ReactNode } from "react";
import { slotAttributes } from "@simplix-react/ui/design";

import {
  siteBarsBarStyle,
  siteBarsStyle,
  sitePlayerCaptionStyle,
  sitePlayerRowStyle,
  sitePlayerStyle,
  sitePlayToggleStyle,
  siteReadAlongStyle,
  siteReadWordStyle,
  siteWaveBarStyle,
  siteWaveStyle,
} from "./marketing.style";

/** Props for {@link PlayerCard}. */
export interface PlayerCardProps {
  /** What the reader chooses before playing (a voice), such as a `SegmentedSwitch`. */
  readonly choice?: ReactNode;
  /** The sentence read along, a {@link ReadAlong}. */
  readonly text?: ReactNode;
  /** The voice drawn, a {@link SiteWave}. */
  readonly wave?: ReactNode;
  /** Whether the sample is playing now; the toggle says stop while it does. */
  readonly playing: boolean;
  /** The toggle's accessible name, which follows `playing` ("Listen", "Stop"). */
  readonly toggleLabel: string;
  readonly onToggle?: () => void;
  /** The glyph on the toggle, a play or a stop mark the product draws. */
  readonly toggleIcon?: ReactNode;
  /** What is playing, beside the toggle. */
  readonly caption?: ReactNode;
}

/**
 * A raised card that plays a sample: the choice, the sentence lit word by word, the wave and the
 * play row. The kit plays nothing: the product's player owns the audio and hands the card where it
 * is (`playing`, the word reached, the share played).
 */
export function PlayerCard({ choice, text, wave, playing, toggleLabel, onToggle, toggleIcon, caption }: PlayerCardProps) {
  return (
    <div {...slotAttributes(sitePlayerStyle, {})}>
      {choice}
      {text}
      {wave}
      <div {...slotAttributes(sitePlayerRowStyle, {})}>
        <PlayToggle playing={playing} label={toggleLabel} onToggle={onToggle} icon={toggleIcon} />
        {caption !== undefined ? <span {...slotAttributes(sitePlayerCaptionStyle, {})}>{caption}</span> : null}
      </div>
    </div>
  );
}

/** Props for {@link PlayToggle}. */
export interface PlayToggleProps {
  readonly playing: boolean;
  /** The accessible name, which follows `playing`. */
  readonly label: string;
  readonly onToggle?: () => void;
  readonly icon?: ReactNode;
}

/** A round play and stop toggle; pressed while the sample plays. */
export function PlayToggle({ playing, label, onToggle, icon }: PlayToggleProps) {
  return (
    <button {...slotAttributes(sitePlayToggleStyle, {})} type="button" aria-label={label} aria-pressed={playing} onClick={onToggle}>
      {icon}
    </button>
  );
}

/** Props for {@link ReadAlong}. */
export interface ReadAlongProps {
  /** The sentence; its words are split on spaces. */
  readonly text: string;
  /**
   * The word the voice has reached, from 0; `null` while nothing plays, when every word is drawn at
   * rest. Words before it are read, the ones after it wait.
   */
  readonly at: number | null;
}

/** Which state a word of a {@link ReadAlong} is drawn in, given the word the voice reached. */
export function readWordState(index: number, at: number | null): "rest" | "read" | "spoken" | "upcoming" {
  if (at === null) return "rest";
  if (index === at) return "spoken";
  return index < at ? "read" : "upcoming";
}

/** The word a voice has reached in a sentence of `count` words, from the share played (0 to 1). */
export function readWordAt(share: number | null, count: number): number | null {
  if (share === null || count === 0) return null;
  return Math.min(count - 1, Math.max(0, Math.floor(share * count)));
}

/** The sentence a player reads, each word lit as the voice reaches it. Screen readers skip the lighting. */
export function ReadAlong({ text, at }: ReadAlongProps) {
  const words = text.split(" ");
  return (
    <p {...slotAttributes(siteReadAlongStyle, {})} aria-live="off">
      {words.map((word, index) => (
        // Words repeat, so a word's place in the sentence is its identity.
        <span key={`w-${String(index)}`} {...slotAttributes(siteReadWordStyle, { state: readWordState(index, at) })}>
          {`${word} `}
        </span>
      ))}
    </p>
  );
}

/** Props for {@link SiteWave}. */
export interface SiteWaveProps {
  /** One level per bar, 0 to 1, from the product (measured, or a stand-in shape). */
  readonly levels: readonly number[];
  /** 0 to 1, the share played; bars before it are drawn in the accent. */
  readonly progress?: number;
  /** The drawing's height in pixels. */
  readonly height: number;
  /** What the wave says to a screen reader ("Voice waveform, 45% played"). */
  readonly label: string;
}

/** The distance between two bars of a wave, and a bar's width, in the drawing's units. */
const WAVE_STEP = 4;
const WAVE_BAR = 2.4;

/** A voice drawn as bars on the time axis, the share played in the accent. It takes its column's width. */
export function SiteWave({ levels, progress = 0, height, label }: SiteWaveProps) {
  const width = levels.length * WAVE_STEP;
  const mid = height / 2;
  return (
    <svg {...slotAttributes(siteWaveStyle, {})} role="img" aria-label={label} width={width} height={height} viewBox={`0 0 ${String(width)} ${String(height)}`}>
      {levels.map((level, index) => {
        const bar = Math.max(2, Math.min(1, Math.max(0, level)) * (height - 4));
        return (
          // Bars are places on the time axis; the index is their identity.
          <rect
            key={index}
            {...slotAttributes(siteWaveBarStyle, { played: index / levels.length < progress })}
            x={index * WAVE_STEP}
            y={mid - bar / 2}
            width={WAVE_BAR}
            height={bar}
            rx={1.2}
          />
        );
      })}
    </svg>
  );
}

/** One bar of a {@link SiteBars} picture. */
export interface SiteBarsBar {
  readonly key: string;
  /** The bar's height in pixels; a `strong` bar keeps its own. */
  readonly height?: number;
  /** The bar's share of the row's width, against the others'. */
  readonly grow?: number;
}

/** Props for {@link SiteBars}. */
export interface SiteBarsProps {
  readonly bars: readonly SiteBarsBar[];
  /** `soft` bars stand for lines of text, `strong` ones for lengths. */
  readonly tone?: "soft" | "strong";
}

/** A small picture drawn as bars standing on a line: lines of notes, the lengths of slides. */
export function SiteBars({ bars, tone = "soft" }: SiteBarsProps) {
  return (
    <span {...slotAttributes(siteBarsStyle, {})} aria-hidden="true">
      {bars.map((bar) => (
        <i
          key={bar.key}
          {...slotAttributes(siteBarsBarStyle, { tone })}
          style={{ ...(bar.height === undefined ? {} : { height: `${String(bar.height)}px` }), ...(bar.grow === undefined ? {} : { flexGrow: bar.grow }) }}
        />
      ))}
    </span>
  );
}
