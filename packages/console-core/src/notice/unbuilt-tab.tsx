import { ClockIcon } from "lucide-react";
import { useTranslation } from "@simplix-react/i18n/react";
import { Flex, Icon, TabsTrigger, Tooltip, TooltipContent, TooltipTrigger } from "@simplix-react/ui";

import { useGroupedFigure } from "@simplix-react/i18n/react";
import { NumericText, TooltipTarget } from "../layout";
import { unbuiltMarkStyle } from "./unbuilt.style";
import { slotAttributes } from "@simplix-react/ui/design";

interface UnbuiltTabProps {
  /** The tab's value, as `Tabs` addresses it. */
  readonly value: string;
  /** What the tab is called — the same word it will carry once its screen exists. */
  readonly label: string;
  /**
   * How many rows are behind it, or undefined when nobody counted.
   *
   * <p>A collection can be counted long before the screen that lists it is built, and the count is
   * the reason a reader would press the tab — so it is drawn even while the press has nowhere to
   * go. Absent is not zero here either.
   */
  readonly count?: number;
}

/**
 * A tab whose collection is counted here and listed on a screen a later chapter builds.
 *
 * <p><b>Inactive rather than absent.</b> A tab that appears when its chapter lands makes the record
 * look like a different record every week; a tab that is there, carries its figure and says what it
 * is waiting for tells the reader the collection exists and where it will open.
 *
 * <p>The disabled trigger swallows pointer events, so the tooltip hangs off the span around it —
 * without that wrapper the reason is unreachable, which is the whole failure this avoids.
 *
 * <p><b>The clock is drawn, not left to the tooltip.</b> A tooltip needs a pointer to be resting on
 * the tab, so a strip whose only marker is the tooltip says nothing at all to a reader scanning it
 * — and 「this pane is not built yet」 then looks exactly like 「the press did nothing」. It also
 * leaves no trace in a screenshot, so a capture of such a pane cannot be told from a pane that
 * draws nothing. {@link UnbuiltAction} marks the same meaning with the same glyph; one meaning gets
 * one marker.
 */
export function UnbuiltTab({ value, label, count }: UnbuiltTabProps) {
  const { t } = useTranslation("common");
  const grouped = useGroupedFigure();

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <TooltipTarget>
          <TabsTrigger value={value} disabled>
            <Flex gap="xs" align="center">
              {label}
              {count !== undefined && (
                <NumericText size="inherit" tone="muted">
                  {grouped(count)}
                </NumericText>
              )}
              <ClockIcon className="size-3.5" {...slotAttributes(unbuiltMarkStyle, {})} />
            </Flex>
          </TabsTrigger>
        </TooltipTarget>
      </TooltipTrigger>
      <TooltipContent>{t("shell.nav.notBuilt")}</TooltipContent>
    </Tooltip>
  );
}
