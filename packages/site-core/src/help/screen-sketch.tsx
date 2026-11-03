import type { ReactNode } from "react";
import { slotAttributes } from "@simplix-react/ui/design";

import {
  siteScreenBodyStyle,
  siteScreenCloseStyle,
  siteScreenDiscStyle,
  siteScreenFillStyle,
  siteScreenFootStyle,
  siteScreenHeadStyle,
  siteScreenLineBarStyle,
  siteScreenLinesStyle,
  siteScreenLineStyle,
  siteScreenMetaStyle,
  siteScreenMeterHeadStyle,
  siteScreenMeterStyle,
  siteScreenNoticeStyle,
  siteScreenNoticeTextStyle,
  siteScreenPillsStyle,
  siteScreenPillStyle,
  siteScreenRowStyle,
  siteScreenStyle,
  siteScreenTextStyle,
  siteScreenTrackStyle,
  siteScreenWordsStyle,
} from "./screen.style";

/** Props for {@link ScreenSketch}. */
export interface ScreenSketchProps {
  /** The window's title. */
  readonly title: ReactNode;
  /** The close mark at the title bar's end, a glyph the product draws. */
  readonly closeMark?: ReactNode;
  /** The rows, notices, lines and meters the screen holds. */
  readonly children: ReactNode;
  /** The footer: words and an action pill. */
  readonly footer?: ReactNode;
}

/**
 * A small drawn window of the product, the picture a help article shows beside a step ({@link
 * ArticleFigure} holds it). It is a picture, so the whole window is hidden from assistive technology;
 * the figure's caption says what it shows.
 */
export function ScreenSketch({ title, closeMark, children, footer }: ScreenSketchProps) {
  return (
    <div {...slotAttributes(siteScreenStyle, {})} aria-hidden="true">
      <div {...slotAttributes(siteScreenHeadStyle, {})}>
        <SketchWords>{title}</SketchWords>
        {closeMark !== undefined ? <span {...slotAttributes(siteScreenCloseStyle, {})}>{closeMark}</span> : null}
      </div>
      <div {...slotAttributes(siteScreenBodyStyle, {})}>{children}</div>
      {footer !== undefined ? <div {...slotAttributes(siteScreenFootStyle, {})}>{footer}</div> : null}
    </div>
  );
}

/** The state of a sketched row: done, failed, or still waiting. */
export type SketchState = "ok" | "bad" | "wait";

/** Props for {@link SketchRow}. */
export interface SketchRowProps {
  readonly state: SketchState;
  readonly text: ReactNode;
  /** The figure at the row's end, or a pill. */
  readonly meta?: ReactNode;
  /** The disc's glyph (a tick, a warning), which the product draws; a waiting row has none. */
  readonly mark?: ReactNode;
  /** What opens under a row: the reason it failed, its pills. */
  readonly children?: ReactNode;
}

/** A row of a sketched list: its state disc, its words, its figure, and what opens under it. */
export function SketchRow({ state, text, meta, mark, children }: SketchRowProps) {
  return (
    <div {...slotAttributes(siteScreenRowStyle, { state })}>
      <div {...slotAttributes(siteScreenLineStyle, {})}>
        <span {...slotAttributes(siteScreenDiscStyle, { state })}>{state === "wait" ? null : mark}</span>
        <span {...slotAttributes(siteScreenTextStyle, {})}>{text}</span>
        {meta !== undefined ? <span {...slotAttributes(siteScreenMetaStyle, {})}>{meta}</span> : null}
      </div>
      {children}
    </div>
  );
}

/** Words inside a sketch, plain, muted or in the bad state's colour; `strong` sets them as a title. */
export function SketchWords({ tone = "plain", strong = false, children }: { readonly tone?: "plain" | "muted" | "bad"; readonly strong?: boolean; readonly children: ReactNode }) {
  return strong ? <b {...slotAttributes(siteScreenWordsStyle, { tone })}>{children}</b> : <span {...slotAttributes(siteScreenWordsStyle, { tone })}>{children}</span>;
}

/** Pills side by side. */
export function SketchPills({ children }: { readonly children: ReactNode }) {
  return <span {...slotAttributes(siteScreenPillsStyle, {})}>{children}</span>;
}

/** A button of the sketched screen as a pill: outlined, in the accent, or in the voice colour. */
export function SketchPill({ tone = "plain", children }: { readonly tone?: "plain" | "accent" | "voice"; readonly children: ReactNode }) {
  return <span {...slotAttributes(siteScreenPillStyle, { tone })}>{children}</span>;
}

/** A notice across the sketched screen: its title, its words and its action. */
export function SketchNotice({ title, text, action }: { readonly title: ReactNode; readonly text?: ReactNode; readonly action?: ReactNode }) {
  return (
    <div {...slotAttributes(siteScreenNoticeStyle, {})}>
      <span {...slotAttributes(siteScreenNoticeTextStyle, {})}>
        <SketchWords strong>{title}</SketchWords>
        {text !== undefined ? <SketchWords tone="muted">{text}</SketchWords> : null}
      </span>
      {action}
    </div>
  );
}

/** Lines standing for text the sketch does not spell out, in the lengths given. */
export function SketchLines({ lengths }: { readonly lengths: readonly ("long" | "middle" | "short")[] }) {
  return (
    <div {...slotAttributes(siteScreenLinesStyle, {})}>
      {lengths.map((length, index) => (
        <i key={`${length}-${String(index)}`} {...slotAttributes(siteScreenLineBarStyle, { length })} />
      ))}
    </div>
  );
}

/** Props for {@link SketchMeter}. */
export interface SketchMeterProps {
  readonly label: ReactNode;
  readonly value: ReactNode;
  /** How full the bar is, 0 to 1. */
  readonly share: number;
  /** The warning's colour, for a meter that is nearly empty. */
  readonly low?: boolean;
  /** A line under the bar (when it refills). */
  readonly note?: ReactNode;
}

/** A meter in the sketch: its label and value, the bar, and a line under it. */
export function SketchMeter({ label, value, share, low = false, note }: SketchMeterProps) {
  return (
    <div {...slotAttributes(siteScreenMeterStyle, {})}>
      <span {...slotAttributes(siteScreenMeterHeadStyle, {})}>
        <SketchWords>{label}</SketchWords>
        <SketchWords strong>{value}</SketchWords>
      </span>
      <span {...slotAttributes(siteScreenTrackStyle, {})}>
        <i {...slotAttributes(siteScreenFillStyle, { tone: low ? "warn" : "accent" })} style={{ width: `${String(Math.min(1, Math.max(0, share)) * 100)}%` }} />
      </span>
      {note !== undefined ? <SketchWords tone="muted">{note}</SketchWords> : null}
    </div>
  );
}
