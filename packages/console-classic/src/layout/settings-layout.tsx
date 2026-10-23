import type { ReactNode } from "react";
import { Card, Grid, Section, type IconName } from "@simplix-react/ui";

import { CountedTab } from "./page-tabs";
import { StatePanel } from "./state-panel";

interface SettingsSectionProps {
  /** What the group of settings is called. */
  readonly title: string;
  /** The one line under it saying what the group decides. */
  readonly description?: string;
  /** The fields, laid out two to a row; one wrapped in `WideField` takes the whole width. */
  readonly children: ReactNode;
}

/**
 * One titled group of settings on a settings page.
 *
 * <p>Two fields to a row, because these forms are read rather than filled in: an operator opens
 * them to check what an installation is set to and leaves without typing, and a single column of
 * twenty rows puts half of them below the fold for a page nobody scrolls.
 *
 * <p>The grid collapses to one column on a narrow container, so a field never shrinks past the
 * value it has to show.
 */
export function SettingsSection({ title, description, children }: SettingsSectionProps) {
  return (
    <Card padding="md">
      <Section title={title} description={description}>
        <Grid columns={2} gap="md">
          {children}
        </Grid>
      </Section>
    </Card>
  );
}

interface SettingsTabProps {
  /** The tab's value, as `Tabs` addresses it. */
  readonly value: string;
  /** What the tab is called. */
  readonly label: string;
  /**
   * How many rows are behind it, or `undefined` when nothing counted them.
   *
   * <p><b>Absent is not zero here either.</b> A tab whose read has not answered, or whose source
   * this installation does not have, draws no number at all — a `0` beside a tab tells the reader
   * there is nothing in there, which is a different claim from "nobody has counted".
   */
  readonly count?: number;
}

/**
 * A tab with the count of what is under it.
 *
 * <p>The count is on the tab rather than inside it because it is the reason to press the tab:
 * 「잠긴 계정 2」 is the thing an operator is looking for, and a count only visible after the press
 * makes them press every tab in turn.
 */
export function SettingsTab({ value, label, count }: SettingsTabProps) {
  return <CountedTab value={value} label={label} count={count} />;
}

interface UncountedPanelProps {
  /** What is not here, named as the board names it. */
  readonly title: string;
  /** Why it is not here — what would have to exist for it to be. */
  readonly description: string;
  /** The icon of the thing that is missing, not of the failure. */
  readonly icon?: IconName;
}

/**
 * What a panel draws when this installation has no source for what the panel is about.
 *
 * <p><b>Not an error and not an empty list.</b> An error says the read failed and invites a retry;
 * an empty list says somebody counted and found none. Neither is true of a panel whose entity or
 * endpoint this build does not have yet, and drawing either sends the reader to look for a fault
 * that is not there. This says the plain thing instead: nothing counts it here, and here is what
 * would.
 */
export function UncountedPanel({ title, description, icon = "circle-slash" }: UncountedPanelProps) {
  return <StatePanel size="sm" icon={icon} title={title} description={description} />;
}
