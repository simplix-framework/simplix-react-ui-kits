import type { ReactNode } from "react";

/** One destination in the preview's menu. */
export interface ConsolePreviewMenuEntry {
  readonly key: string;
  readonly label: ReactNode;
  readonly icon?: ReactNode;
  /** Where the row goes. Absent, the row is drawn inactive, as the console draws an unbuilt screen. */
  readonly href?: string;
  /** Why an inactive row cannot be opened, announced and shown on hover, as the console shows it. */
  readonly inactiveReason?: string;
  /** The mark at the end of an inactive row, saying which kind of unavailable it is. */
  readonly inactiveMark?: ReactNode;
  readonly children?: readonly ConsolePreviewMenuEntry[];
}

/** One cluster of the menu: a branch row and the destinations under it. */
export interface ConsolePreviewMenuGroup {
  readonly key: string;
  readonly label: ReactNode;
  readonly icon?: ReactNode;
  readonly entries: readonly ConsolePreviewMenuEntry[];
}

/** The menu column of one area. */
export interface ConsolePreviewMenu {
  /** The area's name, over the column. */
  readonly title: ReactNode;
  readonly groups: readonly ConsolePreviewMenuGroup[];
}

/** The words the chrome prints, in the product's own catalogue. */
export interface ConsolePreviewChromeLabels {
  readonly search: string;
  readonly site: string;
  readonly noSite: string;
  readonly notifications: string;
  /** What the bell's list says when nothing is waiting. */
  readonly noNotifications: string;
  readonly account: string;
  readonly signOut: string;
  readonly menu: string;
  readonly rail: string;
  readonly expand: string;
  readonly collapse: string;
  readonly status: string;
  readonly quiet: string;
  /** The workplace clock, with the zone already filled in by {@link ConsolePreviewChrome.siteClock}. */
  readonly siteClock: (zone: string) => string;
}

/** One reading on the right of the status strip. */
export interface ConsolePreviewStatusSegment {
  readonly label: string;
  /** `warn` when the reading is something somebody has to act on. */
  readonly tone?: "plain" | "warn";
}

/** What the status strip reports beyond the workplace's zone. */
export interface ConsolePreviewStatus {
  /** What is happening now. Absent, the strip says nothing is waiting. */
  readonly ticker?: { readonly text: string; readonly live?: boolean };
  /** The shift the workplace is on, read after its zone in the same reading. */
  readonly shift?: string;
  /** Readings after the zone, in order. */
  readonly segments?: readonly ConsolePreviewStatusSegment[];
  /**
   * The workplace's wall clock when the preview opens, as `HH:MM:SS`, so a still of the page reads
   * the story's own time. It ticks from there. Absent, the strip draws no clock.
   */
  readonly clockStart?: string;
}
