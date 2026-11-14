import { useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { slotAttributes } from "@simplix-react/ui/design";

import { siteSliderTrackStyle, siteSliderFillStyle, siteSliderThumbStyle, siteSliderStyle } from "./slider.style";

/** The range a slider moves over and the steps it moves in. */
export interface SiteSliderRange {
  readonly min: number;
  readonly max: number;
  /** The smallest move; every value the slider takes is `min` plus a whole number of steps. */
  readonly step: number;
  /** The move of Page Up and Page Down. */
  readonly pageStep: number;
}

/** How many steps a page move takes when none is given: ten, as the reference's slider moves. */
export const SLIDER_PAGE_STEPS = 10;

/** The decimals a step is written with, so a snapped value carries no floating point residue. */
const decimals = (step: number) => {
  const text = String(step);
  const at = text.indexOf(".");
  return at < 0 ? 0 : text.length - at - 1;
};

/**
 * The value a slider takes for `value`: held inside the range, then moved to the nearest whole step
 * from `min`. A step that does not divide the range leaves the last value below `max` reachable only
 * by End, which snaps to `max` itself.
 */
export function sliderSnap(value: number, range: Pick<SiteSliderRange, "min" | "max" | "step">): number {
  const { min, max, step } = range;
  if (!Number.isFinite(value) || max <= min) return min;
  const held = Math.min(max, Math.max(min, value));
  if (held === max || step <= 0) return held;
  const snapped = min + Math.round((held - min) / step) * step;
  return Number(Math.min(max, snapped).toFixed(Math.max(decimals(step), decimals(min))));
}

/** The share of the track a value fills, from 0 to 1. */
export function sliderShare(value: number, min: number, max: number): number {
  if (max <= min) return 0;
  return Math.min(1, Math.max(0, (value - min) / (max - min)));
}

/**
 * The value a key moves the slider to: the arrows by a step (right and up raise it), Page Up and Page
 * Down by a page, Home and End to the ends; `null` for any other key or when the value would not move.
 */
export function sliderKeyTarget(key: string, value: number, range: SiteSliderRange): number | null {
  const by = (delta: number) => sliderSnap(value + delta, range);
  const next = (() => {
    switch (key) {
      case "ArrowRight":
      case "ArrowUp":
        return by(range.step);
      case "ArrowLeft":
      case "ArrowDown":
        return by(-range.step);
      case "PageUp":
        return by(range.pageStep);
      case "PageDown":
        return by(-range.pageStep);
      case "Home":
        return range.min;
      case "End":
        return range.max;
      default:
        return null;
    }
  })();
  return next === null || next === value ? null : next;
}

/** The value under a pointer at `x` over a track that starts at `left` and is `width` wide. */
export function sliderValueAt(x: number, left: number, width: number, range: Pick<SiteSliderRange, "min" | "max" | "step">): number {
  if (width <= 0) return range.min;
  return sliderSnap(range.min + ((x - left) / width) * (range.max - range.min), range);
}

/** The slider's accessible name: its own words, or the id of a visible label on the page. */
export type SiteSliderName = { readonly label: string; readonly labelledBy?: undefined } | { readonly labelledBy: string; readonly label?: undefined };

/** Props for {@link SiteSlider}. */
export type SiteSliderProps = SiteSliderName & {
  readonly min: number;
  readonly max: number;
  readonly step?: number;
  /** The move of Page Up and Page Down; ten steps when not given. */
  readonly pageStep?: number;
  /** The value, when the product holds it; without it the slider holds its own from `defaultValue`. */
  readonly value?: number;
  /** The first value of a slider that holds its own; `min` when not given. */
  readonly defaultValue?: number;
  /** Runs on every move, by key, press or drag, with the snapped value. */
  readonly onValueChange?: (value: number) => void;
  /** Runs once a drag or a key move ends, with the value it ended on. */
  readonly onValueCommit?: (value: number) => void;
  /** How a screen reader reads a value ("3 months"); the number alone when not given. */
  readonly valueText?: (value: number) => string;
  /** The slider cannot be moved now; it is dimmed and leaves the tab order. */
  readonly disabled?: boolean;
  /** The id of a line that says more about the value, read after it. */
  readonly describedBy?: string;
};

/**
 * One value on a track: the track sunken with a hairline, filled in the accent up to the value, and a
 * ringed thumb on the value. The thumb is the ARIA slider: Tab reaches it, the arrows move it by a
 * step, Page Up and Page Down by a page, Home and End to the ends. A press on the track moves the
 * value there and a drag follows the pointer. It holds its own value unless `value` is given.
 */
export function SiteSlider({ label, labelledBy, min, max, step = 1, pageStep, value, defaultValue, onValueChange, onValueCommit, valueText, disabled = false, describedBy }: SiteSliderProps) {
  const range: SiteSliderRange = { min, max, step, pageStep: pageStep ?? step * SLIDER_PAGE_STEPS };
  const [own, setOwn] = useState(() => sliderSnap(defaultValue ?? min, range));
  const [dragging, setDragging] = useState(false);
  const track = useRef<HTMLSpanElement>(null);
  const thumb = useRef<HTMLSpanElement>(null);
  const current = sliderSnap(value ?? own, range);
  const latest = useRef(current);
  latest.current = current;

  const move = (next: number) => {
    if (next === latest.current) return;
    latest.current = next;
    if (value === undefined) setOwn(next);
    onValueChange?.(next);
  };
  const valueAtPointer = (event: PointerEvent<HTMLElement>) => {
    const box = track.current?.getBoundingClientRect();
    return box === undefined ? latest.current : sliderValueAt(event.clientX, box.left, box.width, range);
  };
  const onPointerDown = (event: PointerEvent<HTMLSpanElement>) => {
    if (disabled || event.button !== 0) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    thumb.current?.focus();
    setDragging(true);
    move(valueAtPointer(event));
  };
  const onPointerMove = (event: PointerEvent<HTMLSpanElement>) => {
    if (!dragging) return;
    move(valueAtPointer(event));
  };
  const onPointerEnd = (event: PointerEvent<HTMLSpanElement>) => {
    if (!dragging) return;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    setDragging(false);
    onValueCommit?.(latest.current);
  };
  const onKeyDown = (event: KeyboardEvent<HTMLSpanElement>) => {
    if (disabled) return;
    const next = sliderKeyTarget(event.key, latest.current, range);
    if (next === null) return;
    event.preventDefault();
    move(next);
    onValueCommit?.(next);
  };

  const share = `${String(sliderShare(current, min, max) * 100)}%`;
  return (
    <span
      {...slotAttributes(siteSliderStyle, { disabled })}
      role="group"
      aria-label={label}
      aria-labelledby={labelledBy}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerEnd}
      onPointerCancel={onPointerEnd}
    >
      <span {...slotAttributes(siteSliderTrackStyle, {})} ref={track}>
        <span {...slotAttributes(siteSliderFillStyle, {})} style={{ width: share }} />
        <span
          {...slotAttributes(siteSliderThumbStyle, { dragging })}
          ref={thumb}
          role="slider"
          tabIndex={disabled ? -1 : 0}
          aria-label={label}
          aria-labelledby={labelledBy}
          aria-describedby={describedBy}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={current}
          aria-valuetext={valueText?.(current)}
          aria-orientation="horizontal"
          aria-disabled={disabled ? true : undefined}
          style={{ left: share }}
          onKeyDown={onKeyDown}
        />
      </span>
    </span>
  );
}
