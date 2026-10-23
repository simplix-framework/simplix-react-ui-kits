import type { ReactNode } from "react";
import { Flex, Tabs, TabsContent, TabsTrigger } from "@simplix-react/ui";

import { useGroupedFigure } from "@simplix-react/i18n/react";
import { NumericText } from "./numeric-text";
import { countedTabCountStyle, pageTabPanelStyle, pageTabsStyle } from "./page-tabs.style";
import { partAttributes } from "@simplix-react/ui/design";

interface PageTabsProps {
  /** Which tab is on. */
  readonly value: string;
  /** Called with the tab the reader pressed. */
  readonly onValueChange: (value: string) => void;
  /** The strip and the panel. */
  readonly children: ReactNode;
}

/**
 * The tab set of a console list screen, taking whatever height the page has left.
 *
 * <p><b>A list screen's tab body takes the rest of the page.</b> Tiles, a banner and a help card
 * stack above the tabs inside a column, and the tab set has to take the remainder and hand it down
 * — without the column chain the body sizes to its content and the table's own scroll never
 * engages.
 *
 * <p><b>Not for a settings screen.</b> Where the tab body is flowing content — a banner, a table, a
 * matrix — this constraint squeezes the tab box to the leftover height and the content draws
 * straight through whatever is under it. Those screens let the page's own scroll hold everything.
 */
export function PageTabs({ value, onValueChange, children }: PageTabsProps) {
  return (
    <Tabs
      value={value}
      onValueChange={onValueChange}
      className="flex flex-col flex-1 min-h-0"
      {...partAttributes(pageTabsStyle, {})}
    >
      {children}
    </Tabs>
  );
}

interface PageTabPanelProps {
  /** The tab this panel belongs to. */
  readonly value: string;
  /** What the tab holds — normally one `ListDetail`. */
  readonly children: ReactNode;
}

/**
 * The body of one {@link PageTabs} tab, taking the height the strip left behind.
 *
 * <p><b>It accepts the height it is handed, and that is the whole contract.</b> {@link PageTabs}
 * shrinks to what the tiles, the banner and the help card above it left, precisely so the content
 * inside — a list column, a detail panel — engages its own scroll instead of running off the
 * page. A body that refuses to fit draws straight through whatever the page put under it, which
 * is the failure the tab set's own doc comment warns about.
 *
 * <p><b>Which is what any minimum height here prevents.</b> A floor of 26rem read as insurance
 * against a cramped table, and against a parent that shrinks to the leftover it is a floor the box
 * cannot honour: at a 900px fold the leftover is 424px, 354px and 322px on the three tabbed list
 * screens, so a 416px floor drew 56px, 168px and 200px outside its parent. The grant panel's
 * footer landed in the spacer that follows the column and those buttons took a press only in
 * their top eight pixels — nothing showed it, because the spacer is transparent.
 *
 * <p><b>`min-h-0` is the whole of it, and deleting the floor is not the same thing.</b> A flex
 * item's `min-height: auto` resolves to min-content, not to zero: with the floor simply removed
 * the minimum rose from 416px to over a thousand, the overflow grew rather than closed, and the
 * list column and detail body lost the scrolling that made a short box usable. Stated as zero,
 * the body accepts the height it is handed, its children scroll inside it, and the page needs no
 * scroll at all.
 *
 * <p><b>A short table is not a defect the floor could have prevented.</b> The list column and the
 * detail body scroll on their own; a few rows and a scrollbar is a small screen, while a control
 * a press cannot reach is a broken one. `pressableControlsTakeThePress` holds this.
 *
 * <p><b>Inset from the strip above and nothing below.</b> `padded` would add the same step at the
 * bottom, which is right for a panel inside a detail — its footer rule follows immediately — and
 * wrong here: the console layout already ends every page in a 40px spacer, so the step lands on
 * top of that one and only the tabbed screens get it. A reader moving from 조직 to 사용자 sees the
 * page floor rise 16px for no reason either screen can name.
 */
export function PageTabPanel({ value, children }: PageTabPanelProps) {
  return (
    <TabsContent value={value} className="flex min-h-0 flex-col" {...partAttributes(pageTabPanelStyle, {})}>
      {children}
    </TabsContent>
  );
}

interface CountedTabProps {
  /** The tab's value, as `Tabs` addresses it. */
  readonly value: string;
  /** What the tab is called. */
  readonly label: string;
  /**
   * How many rows are behind it, or `undefined` when nothing counted them.
   *
   * <p><b>Absent is not zero.</b> A tab whose read has not answered, or whose source this
   * installation does not have, draws no number at all — a `0` beside a tab tells the reader there
   * is nothing in there, which is a different claim from "nobody has counted".
   *
   * <p><b>And a counted zero IS drawn.</b> Pass the 0 the read answered with; the strip then says
   * 「실패 0」 rather than going quiet, which is what a reader checking whether anything failed came
   * to the strip for. So a strip with no numbers on it beside a list stating 「전체 0건」 is not a
   * strip that should have drawn zeroes — it is a screen where the count read did not answer while
   * the list read did, and the two reads disagreeing is the thing to look at.
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
export function CountedTab({ value, label, count }: CountedTabProps) {
  const grouped = useGroupedFigure();
  return (
    // `group` is here so the count below can follow the trigger's own state. Nothing else on the
    // trigger uses it, and it costs the strip nothing.
    <TabsTrigger value={value} className="group">
      <Flex gap="xs" align="center">
        {label}
        {/* Raised and small, the way a footnote mark is. The count belongs to the name beside it
            rather than standing as a second word of the label — set on the same line at the same
            size it reads as 「전체 228」, two things, and the eye stops on the number as often as on
            the name it qualifies. `self-start` lifts it against a trigger laid out `center`, and
            `leading-none` stops the smaller line box pulling it back down. */}
        {/* Grouped, because nothing else on this screen draws a bare figure. The count reaches
            this component as a number rather than through a catalogue string, so the interpolation
            format the catalogues carry cannot reach it — the 수신 이력 tab read 「3820」 directly
            above a pager whose own total read 「3,820」. */}
        {/* Muted while the tab is not chosen, and the trigger's OWN colour while it is.
            `muted` is a colour picked to sit quietly on the strip's ground, and the chosen tab of
            the page strip has a different ground — `full` and `default` paint it `bg-primary`, so
            the label switches to `text-primary-foreground` and the count does not: measured at
            2.8:1 against that navy where the label beside it reads 17.4:1, which made the figure
            the least readable thing on the strip and it is the figure several screens are read
            for. `text-inherit` rather than a colour of its own, because there are four strip
            variants and only two of them paint the chosen tab — under `underline` and `bookmark`
            the chosen trigger is `text-foreground` on the page's own ground, and a colour named
            here would be wrong on one of the two whichever one was named.

            The count stops being quieter than its label on the chosen tab, which is the trade:
            size and the raised baseline still separate them, and one tab out of five is chosen. */}
        {count !== undefined && (
          <NumericText
            size="caption"
            tone="muted"
            {...partAttributes(countedTabCountStyle, {})}
          >
            {grouped(count)}
          </NumericText>
        )}
      </Flex>
    </TabsTrigger>
  );
}
