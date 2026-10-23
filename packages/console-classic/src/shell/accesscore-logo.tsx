/** AccessCORE brand blue, as it is printed and as it reads on a light surface. */
const BRAND_BLUE = "#017fff";

/**
 * The same blue lifted for a dark surface.
 *
 * <p>The print blue is mixed for white behind it. On the sidebar's near-black it loses most of
 * its contrast while the rest of the mark — which inherits the surface foreground — stays
 * bright, so the wordmark reads as half a logo. Lifting the lightness keeps the hue recognisably
 * the brand's while bringing it back above the surface.
 */
const BRAND_BLUE_ON_DARK = "#4da6ff";

/**
 * How tall the brand stands in each place it appears.
 *
 * <p>Named by the place rather than by a number, because the number that reads correctly depends
 * on what surrounds it: alone on an empty page the mark is the page's subject and a bar-sized one
 * reads as a caption, while in a bar it shares the line with controls and a page-sized one shoves
 * them apart. Callers that pick their own height drift apart screen by screen, which is what this
 * replaces.
 */
export const LOGO_HEIGHTS = {
  /** Alone on an otherwise empty page — sign-in, the installer, an error page. */
  hero: "h-10",
  /** Sharing a line with controls or a title — a top bar, the navigation column's brand block. */
  bar: "h-7",
} as const;

/** Where the brand is standing, which fixes how tall it is. */
export type LogoPlacement = keyof typeof LOGO_HEIGHTS;

export interface AccessCORELogoProps {
  /**
   * Where the logo stands, which fixes its height.
   *
   * @default "bar"
   */
  placement?: LogoPlacement;
  /** Further utility classes. Applied after the placement height, so an explicit height wins. */
  className?: string;
  /**
   * Which surface the logo is painted on, which decides the wordmark's blue.
   *
   * <p>Asked for rather than detected: `currentColor` tells the mark what the foreground is but
   * says nothing about what is behind it, and the wordmark's colour is fixed rather than
   * inherited.
   *
   * @default "light"
   */
  surface?: "light" | "dark";
}

/**
 * The AccessCORE full logo.
 *
 * <p>Inlined rather than loaded through `<img>` so the mark inherits `currentColor`:
 * this back office paints it on the sidebar surface, whose foreground token flips
 * between the colour themes and between light and dark. A raster or externally
 * referenced SVG would keep the print navy and sink into the dark surface.
 *
 * <p>Fixed on purpose — this is AccessCORE's own internal tool, so it carries
 * AccessCORE's identity and never the deployment branding a customer replaces.
 */
export function AccessCORELogo({ placement = "bar", className, surface = "light" }: AccessCORELogoProps) {
  const wordmark = surface === "dark" ? BRAND_BLUE_ON_DARK : BRAND_BLUE;
  return (
    <svg
      viewBox="0 0 85 30"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="AccessCORE"
      className={`${LOGO_HEIGHTS[placement]} w-auto ${className ?? ""}`}
    >
      <polygon fill="currentColor" points="78.49 19.98 81.34 19.98 81.36 19.98 81.36 18.6 81.32 18.6 77.02 18.6 77 18.6 77 18.63 77 19.98 77 20.94 77 22.52 77 25.18 81.35 25.18 81.35 23.79 78.46 23.79 78.46 22.52 81.09 22.52 81.09 21.26 81.09 21.23 78.46 21.23 78.46 19.98 78.49 19.98" />
      <path fill="currentColor" d="M28.36,19.6c-.49-.57-1.27-1.04-2.46-1.04-1.84,0-3.39,1.39-3.39,3.44s1.52,3.41,3.41,3.41c1.29,0,2.11-.55,2.59-1.19l.02-.03-1.07-1.06c-.24.4-.71.81-1.54.81-.98,0-1.89-.71-1.89-1.95,0-1.38.99-2.01,1.87-2.01.74,0,1.17.31,1.42.65l1.05-1.05Z" />
      <path fill="currentColor" d="M58.9,18.6v1.27h2.33c.6,0,.93.31.93.8,0,.46-.32.8-.93.8h-.86v-1.6l-1.44,1.44-.03.03v3.84h1.47v-2.45h.52l.12.25v.02s1.06,2.18,1.06,2.18h1.61l-1.34-2.66c.81-.29,1.3-.96,1.3-1.86,0-1.17-.83-2.06-2.13-2.06h-2.61Z" />
      <path fill="currentColor" d="M43.4,18.56c-1.43,0-2.69.8-3.19,2.13l1.2,1.2c.05-1.06.92-1.91,1.99-1.91.17,0,.34.02.5.07.01,0,.02,0,.03,0,.04.01.09.03.13.04.02,0,.04.01.06.02.04.01.07.03.11.04.02,0,.04.02.06.03.04.02.08.04.11.06,0,0,.02,0,.02.01.58.35.98.98.98,1.71,0,.66-.32,1.24-.82,1.61-.01.01-.03.02-.04.03-.02.01-.04.03-.06.04-.04.03-.08.05-.12.07,0,0-.02,0-.03.01-.05.02-.09.05-.14.07-.01,0-.03.01-.05.02-.04.02-.08.03-.11.04-.03,0-.06.02-.09.03-.02,0-.05.01-.07.02-.04.01-.09.02-.13.03,0,0,0,0,0,0-.11.02-.22.03-.34.03-.17,0-.34-.02-.5-.07,0,0,0,0-.01,0-.05-.01-.09-.03-.14-.04-.02,0-.04-.01-.06-.02-.03-.01-.07-.03-.1-.04-.03-.01-.06-.03-.09-.04-.03-.01-.05-.03-.07-.04-.03-.01-.05-.03-.07-.05-.03-.02-.07-.04-.1-.06,0,0,0,0,0,0-.51-.36-.84-.95-.84-1.62h-1.43v.03c0,2.07,1.57,3.4,3.42,3.4s3.41-1.34,3.41-3.42-1.57-3.43-3.41-3.43Z" />
      <path fill="currentColor" d="M5.53,16.26c0-.09,0-.19,0-.28V6.33c1.64-.39,3.67-.61,5.76-.61s4.12.22,5.76.61v.03l3.08-2.65-.84-.28c-2.14-.72-4.98-1.11-8-1.11s-5.86.39-8,1.11l-1.16.39v12.17c0,.97.14,1.93.41,2.87l3-2.58Z" />
      <path fill="currentColor" d="M16.53,18.59c-.85,2.16-2.72,4.1-5.25,5.36-1.77-.88-3.22-2.1-4.22-3.49l-2.59,2.23s.01.02.02.03c1.5,1.98,3.62,3.59,6.12,4.67l.67.29.67-.29c2.5-1.08,4.62-2.7,6.12-4.67.97-1.28,1.66-2.68,2.04-4.12h-3.58Z" />
      <path fill={wordmark} d="M17.79,16.5c-1.2,0-1.66-.49-1.66-1.42,0-.17.01-.36.05-.57l.19-1.17c.2-1.29.81-1.99,2.26-1.99h6.27l.08-.49v-.09c0-.21-.11-.32-.34-.32h-7.6l.44-2.74h8.2c1.47,0,2.17.67,2.17,2.03,0,.26-.02.53-.07.83l-.97,5.93h-9.03ZM24.63,13.03h-5.24c-.14,0-.23.08-.25.23l-.08.49s-.01.04-.01.07c0,.12.07.17.19.17h5.25l.15-.96Z" />
      <path fill={wordmark} d="M29.85,16.5c-1.48,0-2.17-.66-2.17-2.01,0-.26.02-.54.07-.84l.5-3.08c.31-1.91,1.27-2.86,3.02-2.86h7.65l-.44,2.74h-7.05c-.29,0-.41.14-.45.42l-.41,2.47s-.01.08-.01.12c0,.18.11.29.35.29h7.05l-.45,2.77h-7.65Z" />
      <path fill={wordmark} d="M40.48,16.5c-1.48,0-2.17-.66-2.17-2.01,0-.26.02-.54.07-.84l.5-3.08c.31-1.91,1.27-2.86,3.02-2.86h7.65l-.44,2.74h-7.05c-.29,0-.41.14-.45.42l-.41,2.47s-.01.08-.01.12c0,.18.11.29.35.29h7.05l-.45,2.77h-7.65Z" />
      <path fill={wordmark} d="M51.11,16.5c-1.48,0-2.17-.66-2.17-2.01,0-.26.02-.54.07-.84l.63-3.95c.2-1.29.85-1.99,2.28-1.99h7.07c1.2,0,1.67.49,1.67,1.4,0,.18-.01.38-.05.58l-.18,1.17c-.2,1.29-.86,1.99-2.27,1.99h-6.26l-.08.48s-.01.08-.01.12c0,.18.11.29.35.29h7.6l-.45,2.77h-8.2ZM57.76,10.42v-.07c0-.1-.06-.17-.17-.17h-5.04c-.13,0-.21.08-.24.23l-.13.75h5.25c.13,0,.23-.09.24-.23l.1-.52Z" />
      <path fill={wordmark} d="M60.03,16.5l.41-2.51h7.65c.13,0,.23-.08.25-.23l.1-.61c0-.1-.06-.17-.16-.18h-5.74c-1.19,0-1.66-.51-1.66-1.43,0-.17.01-.36.05-.57l.2-1.27c.2-1.29.85-1.99,2.26-1.99h8.47l-.39,2.48h-7.44c-.14,0-.23.08-.25.23l-.1.54s-.01.04-.01.07c0,.1.07.16.19.16h5.7c1.21,0,1.67.51,1.67,1.43,0,.17-.01.36-.05.57l-.22,1.32c-.21,1.29-.85,1.99-2.27,1.99h-8.66Z" />
      <path fill={wordmark} d="M71.05,16.5l.41-2.51h7.65c.13,0,.23-.08.25-.23l.1-.61c0-.1-.06-.17-.16-.18h-5.74c-1.19,0-1.66-.51-1.66-1.43,0-.17.01-.36.05-.57l.2-1.27c.2-1.29.85-1.99,2.26-1.99h8.47l-.39,2.48h-7.44c-.14,0-.23.08-.25.23l-.1.54s-.01.04-.01.07c0,.1.07.16.19.16h5.7c1.21,0,1.67.51,1.67,1.43,0,.17-.01.36-.05.57l-.22,1.32c-.21,1.29-.85,1.99-2.27,1.99h-8.66Z" />
      <path fill="currentColor" d="M17.47,6.54h3.57v-2.59l-1.22-.4c-2.24-.74-5.22-1.14-8.38-1.14s-6.14.4-8.38,1.14l-.88.29,3.23,2.73v-.03c1.72-.4,3.84-.62,6.04-.62s4.32.22,6.04.62h0Z" />
    </svg>
  );
}
