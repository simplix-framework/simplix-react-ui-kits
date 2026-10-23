import { LOGO_HEIGHTS, type LogoPlacement } from "./accesscore-logo";

export interface AccessCOREMarkProps {
  /**
   * Where the mark stands, which fixes its height — the same scale the full logo uses, so a
   * column that swaps one for the other at a breakpoint does not change size as it swaps.
   *
   * @default "bar"
   */
  placement?: LogoPlacement;
  /** Further utility classes. Applied after the placement height, so an explicit height wins. */
  className?: string;
}

/**
 * The AccessCORE mark on its own, without the wordmark.
 *
 * <p>For the places the full logo does not fit — a collapsed navigation rail, a favicon-sized
 * slot. Cropping the full logo with `overflow-hidden` would leave the wordmark's first letters
 * bleeding into the edge, which reads as a broken image rather than a mark.
 *
 * <p>Shares the full logo's `currentColor` fill for the same reason: this back office paints it
 * on the sidebar surface, whose foreground token flips between colour themes and between light
 * and dark.
 */
export function AccessCOREMark({ placement = "bar", className }: AccessCOREMarkProps) {
  return (
    <svg
      viewBox="2 2 19 26"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="AccessCORE"
      className={`${LOGO_HEIGHTS[placement]} w-auto ${className ?? ""}`}
    >
      <path fill="currentColor" d="M5.53,16.26c0-.09,0-.19,0-.28V6.33c1.64-.39,3.67-.61,5.76-.61s4.12.22,5.76.61v.03l3.08-2.65-.84-.28c-2.14-.72-4.98-1.11-8-1.11s-5.86.39-8,1.11l-1.16.39v12.17c0,.97.14,1.93.41,2.87l3-2.58Z" />
      <path fill="currentColor" d="M16.53,18.59c-.85,2.16-2.72,4.1-5.25,5.36-1.77-.88-3.22-2.1-4.22-3.49l-2.59,2.23s.01.02.02.03c1.5,1.98,3.62,3.59,6.12,4.67l.67.29.67-.29c2.5-1.08,4.62-2.7,6.12-4.67.97-1.28,1.66-2.68,2.04-4.12h-3.58Z" />
    </svg>
  );
}
