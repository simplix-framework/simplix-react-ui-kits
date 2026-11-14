import { defineSlotStyle } from "@simplix-react/ui/design";

/**
 * A slider: the track and the thumb on one line as tall as the thumb's reach. The whole line takes a
 * press, so a press beside the thin track still moves the value; a disabled slider dims.
 */
export const siteSliderStyle = defineSlotStyle({
  slot: "site-slider",
  base: "flex h-(--site-slider-size) w-full min-w-0 flex-1 cursor-pointer touch-none items-center select-none",
  variants: {
    disabled: {
      true: "cursor-not-allowed opacity-(--site-dim)",
      false: "",
    },
  },
  defaultVariants: { disabled: false },
});

/** The slider's track, sunken with a hairline inside its edge. */
export const siteSliderTrackStyle = defineSlotStyle({
  slot: "site-slider-track",
  base: "relative block h-(--site-slider-track-size) w-full rounded-(--site-radius-full) bg-(--site-slider-track) shadow-[inset_0_0_0_1px_var(--site-slider-track-line)]",
  variants: {},
  defaultVariants: {},
});

/** The share of the track up to the value, in the accent; its width is the share. */
export const siteSliderFillStyle = defineSlotStyle({
  slot: "site-slider-fill",
  base: "block h-full rounded-(--site-radius-full) bg-(--site-slider-fill)",
  variants: {},
  defaultVariants: {},
});

/**
 * The thumb, centred on the value: a ringed disc that takes the soft accent under the pointer, the
 * focus ring from the keyboard, and grows while it is pressed or dragged.
 */
export const siteSliderThumbStyle = defineSlotStyle({
  slot: "site-slider-thumb",
  base: "absolute top-1/2 block size-(--site-slider-thumb-size) -translate-1/2 rounded-(--site-radius-full) border-(length:--site-slider-thumb-ring) border-solid border-(--site-slider-thumb-line) bg-(--site-slider-thumb) outline-none transition-transform duration-(--site-duration-fast) ease-(--site-ease) hover:bg-(--site-slider-thumb-hover) focus-visible:shadow-[var(--site-focus-ring)] active:scale-(--site-slider-press)",
  variants: {
    dragging: {
      true: "scale-(--site-slider-press)",
      false: "",
    },
  },
  defaultVariants: { dragging: false },
});
