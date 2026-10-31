import type { ReactNode } from "react";
import { Button, Flex } from "@simplix-react/ui";
import { partAttributes } from "@simplix-react/ui/design";

import { ConsoleWindow } from "./console-window";
import { ConsoleContentColumn } from "./content-column";
import { consoleBandTopBarStyle } from "./top-bar-window.style";

/** A destination the band carries ahead of its controls, since the window has no menu column. */
export interface ConsoleBandDestination {
  readonly key: string;
  readonly label: ReactNode;
  /** The mark ahead of the label. */
  readonly icon?: ReactNode;
  /** Whether the reader is standing on it. */
  readonly current?: boolean;
  readonly onSelect?: () => void;
}

/** Props for {@link ConsoleBandTopBar}. */
export interface ConsoleBandTopBarProps {
  /** The product mark at the start of the band. */
  readonly mark: ReactNode;
  /** The app's own destinations, drawn first among the controls. */
  readonly destinations?: readonly ConsoleBandDestination[];
  /** The controls after the destinations: language, theme, the account and signing out. */
  readonly children?: ReactNode;
}

/**
 * The top bar of a window with no menu column: the mark at the start, then the app's destinations
 * and its controls at the end.
 *
 * <p>The console's own top bar carries areas, a region, the bell and the search, which a window
 * for the people a product serves has none of; this band is that window's bar, so an app and its
 * design reference draw one shape.
 */
export function ConsoleBandTopBar({ mark, destinations = [], children }: ConsoleBandTopBarProps) {
  return (
    <Flex align="center" justify="between" gap="md" {...partAttributes(consoleBandTopBarStyle, {})}>
      {mark}
      <Flex align="center" gap="sm">
        {destinations.map((destination) => (
          <Button
            key={destination.key}
            variant={destination.current ? "secondary" : "ghost"}
            size="sm"
            aria-current={destination.current ? "page" : undefined}
            onClick={destination.onSelect}
          >
            {destination.icon}
            {destination.label}
          </Button>
        ))}
        {children}
      </Flex>
    </Flex>
  );
}

/** Props for {@link ConsoleTopBarWindow}. */
export interface ConsoleTopBarWindowProps {
  /** The band across the top, usually a {@link ConsoleBandTopBar}. */
  readonly topBar: ReactNode;
  /** The routed screen. */
  readonly children: ReactNode;
}

/**
 * The window of an app with a top bar and nothing else: no menu column and no status strip, the
 * screen in the content column under the bar.
 */
export function ConsoleTopBarWindow({ topBar, children }: ConsoleTopBarWindowProps) {
  return (
    <ConsoleWindow>
      {topBar}
      <Flex gap="none" flex overflow="hidden">
        <ConsoleContentColumn>{children}</ConsoleContentColumn>
      </Flex>
    </ConsoleWindow>
  );
}
