import type { ReactNode } from "react";
import { TabsList } from "@simplix-react/ui";

interface PageTabStripProps {
  /** The `TabsTrigger`s this strip holds. */
  readonly children: ReactNode;
  /**
   * Whether the tabs may sit at the start of the strip rather than across it.
   *
   * <p><b>A centred flex row that overflows is clipped at BOTH ends, and neither end can be
   * scrolled to.</b> A strip one tab too wide — four counted tabs on a phone — loses the name of
   * the tab the reader is standing in, and no amount of scrolling brings it back. Laid out from
   * the start, the overflow goes where the scroll can reach it.
   *
   * <p>Passed by the screen rather than measured here, because what decides it is the window the
   * screen knows it is drawing for; a strip that fits is centred, which is what every desktop
   * screen wants and none of them has to say.
   */
  readonly fromStart?: boolean;
}

/**
 * The tab strip of a console list screen — full width, scrolling sideways, and never squeezed.
 *
 * <p><b>Three shapes the `full` variant does not carry on its own, in one place rather than thirty.</b>
 * A list screen stacks tiles, banners and chips above its tabs inside a `flex-1 min-h-0` column, and
 * a flex child with no `shrink-0` gives up its height first: the strip collapses to 6px and the
 * triggers are clipped to a sliver the reader cannot press. Five screens of this console were
 * standing at 6px. The width bound and the sideways scroll are the other two — a five-tab strip with
 * counts on it stops fitting the moment a detail panel opens beside it.
 *
 * <p><b>Where this belongs is a variant of `TabsList` in `@simplix-react/ui`</b>, not a component
 * here: every simplix-react console that stacks anything above its tabs meets the same collapse.
 * Until that variant exists this holds the three utility classes so no page has to.
 */
export function PageTabStrip({ children, fromStart }: PageTabStripProps) {
  return (
    <TabsList variant="full" scrollArrows className={fromStart ? "max-w-full shrink-0 justify-start" : "max-w-full shrink-0"}>
      {children}
    </TabsList>
  );
}
