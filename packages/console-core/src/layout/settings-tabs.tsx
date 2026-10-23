import type { ReactNode } from "react";
import { Tabs } from "@simplix-react/ui";

interface SettingsTabsProps {
  /** Which tab is on. */
  readonly value: string;
  /** Called with the tab the reader pressed. */
  readonly onValueChange: (value: string) => void;
  /** The strip and the bodies. */
  readonly children: ReactNode;
}

/**
 * The tab set of a settings screen, laid out as a column and no more.
 *
 * <p><b>Deliberately not {@link PageTabs}.</b> A settings tab holds flowing content — a banner, a
 * form, a matrix, a table that is as long as it is — and the page's own scroll carries it. Given
 * the fill constraint instead, the tab box is squeezed to whatever height is left and a body a
 * thousand pixels tall draws straight through the paragraph under it: three of this console's
 * settings screens were painting an audit notice across a banner's title that way, and every
 * string in both was correct.
 */
export function SettingsTabs({ value, onValueChange, children }: SettingsTabsProps) {
  return (
    <Tabs value={value} onValueChange={onValueChange} className="flex flex-col">
      {children}
    </Tabs>
  );
}
