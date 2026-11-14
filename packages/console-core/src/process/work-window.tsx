import type { ReactNode } from "react";
import { useTranslation } from "@simplix-react/i18n/react";
import { ProcessLanes, type ProcessLanesProps } from "@simplix-react/process";
import { Button, Flex, Stack, StatusBadge, type StatusTone, Tabs, TabsContent, TabsTrigger } from "@simplix-react/ui";
import { partAttributes, slotAttributes } from "@simplix-react/ui/design";

import { PageTabStrip } from "../layout/page-tab-strip";
import { PACKAGE_NAMESPACE } from "./locales";
import { WorkEvents, WorkRows, type WorkEvent, type WorkRow } from "./work-rows";
import { WorkTurnCard, type WorkTurn } from "./work-turn";
import { workBodyStyle, workFactStyle, workHeadStyle, workKindStyle, workTabCountStyle, workTitleStyle } from "./work-window.style";

/** The tabs of a piece of work. */
export type WorkTab = "progress" | "map" | "outputs" | "history" | "related";

/** The procedure a piece of work follows and how far it has come, as {@link ProcessLanes} reads them. */
export type WorkProcedure = Pick<ProcessLanesProps, "definition" | "facts" | "run" | "highlightLanes" | "selected" | "onSelect" | "renderDetail">;

/** Props for {@link WorkWindow}. */
export interface WorkWindowProps {
  /** The kind of work, such as the name of its procedure. */
  readonly kind: string;
  /** The name of this piece of work. */
  readonly title: string;
  /** The step the work stands at. */
  readonly stage?: { readonly label: string; readonly tone?: StatusTone };
  /** Whose turn it is and what is done next. */
  readonly turn: WorkTurn;
  readonly procedure: WorkProcedure;
  /** The records the work has made. */
  readonly outputs: readonly WorkRow[];
  /** What has been done, newest first. */
  readonly history: readonly WorkEvent[];
  /** The work that follows from this one or that this one follows from. */
  readonly related: readonly WorkRow[];
  /** The tab that is open; the window keeps its own when this is left out. */
  readonly tab?: WorkTab;
  readonly onTabChange?: (tab: WorkTab) => void;
  /** Goes to the list of the records of this work. */
  readonly onOpenRecords?: () => void;
  /** Anything the screen sets above the tabs, such as a notice. */
  readonly lead?: ReactNode;
}

const TABS: readonly WorkTab[] = ["progress", "map", "outputs", "history", "related"];

/**
 * One piece of work across the records it makes: whose turn it is, the procedure it follows
 * drawn step by step and as lanes, the records made so far, what was done, and the work related
 * to it. An act is done on the screen of its own record; this window leads there.
 *
 * <p>The procedure never scrolls itself to the step in hand here: the window opens on whose turn
 * it is, and the reader scrolls on from there.
 */
export function WorkWindow({ kind, title, stage, turn, procedure, outputs, history, related, tab, onTabChange, onOpenRecords, lead }: WorkWindowProps) {
  const { t } = useTranslation(`${PACKAGE_NAMESPACE}/work`);
  const counts: Partial<Record<WorkTab, number>> = { outputs: outputs.length, history: history.length, related: related.length };
  return (
    <Stack gap="none" className="min-h-0 flex-1" data-work-window>
      <header {...partAttributes(workHeadStyle, {})}>
        <Flex gap="md" align="start" justify="between">
          <Stack gap="xs" className="min-w-0">
            <span {...slotAttributes(workKindStyle, {})}>{kind}</span>
            <span className="truncate" {...slotAttributes(workTitleStyle, {})}>
              {title}
            </span>
            {stage ? (
              <Flex gap="xs" align="center">
                <span {...slotAttributes(workFactStyle, {})}>{t("stage")}</span>
                <StatusBadge tone={stage.tone ?? "processing"} label={stage.label} appearance="filled" />
              </Flex>
            ) : null}
          </Stack>
          {onOpenRecords ? (
            <Button size="sm" variant="ghost" onClick={onOpenRecords} className="shrink-0">
              {t("records")}
            </Button>
          ) : null}
        </Flex>
      </header>
      <Stack gap="md" className="min-h-0 flex-1 overflow-auto" {...partAttributes(workBodyStyle, {})}>
        {lead}
        <WorkTurnCard turn={turn} />
        <Tabs value={tab} defaultValue={tab === undefined ? "progress" : undefined} onValueChange={(next) => onTabChange?.(next as WorkTab)}>
          <PageTabStrip fromStart>
            {TABS.map((key) => (
              <TabsTrigger key={key} value={key} data-work-tab={key}>
                {t(`tabs.${key}`)}
                {counts[key] !== undefined && counts[key] > 0 ? <span {...slotAttributes(workTabCountStyle, {})}>{counts[key]}</span> : null}
              </TabsTrigger>
            ))}
          </PageTabStrip>
          <TabsContent value="progress">
            <ProcessLanes {...procedure} layout="stack" scrollToActive={false} />
          </TabsContent>
          <TabsContent value="map">
            <ProcessLanes {...procedure} layout="lanes" scrollToActive={false} />
          </TabsContent>
          <TabsContent value="outputs">
            <WorkRows rows={outputs} emptyLabel={t("empty.outputs")} />
          </TabsContent>
          <TabsContent value="history">
            <WorkEvents events={history} emptyLabel={t("empty.history")} />
          </TabsContent>
          <TabsContent value="related">
            <WorkRows rows={related} emptyLabel={t("empty.related")} />
          </TabsContent>
        </Tabs>
      </Stack>
    </Stack>
  );
}

/** Props for {@link WorkProgress}. */
export interface WorkProgressProps {
  readonly turn: WorkTurn;
  readonly procedure: WorkProcedure;
  /** Opens the whole piece of work this record belongs to. */
  readonly onOpenWork?: () => void;
  /** The label of the button that opens the work. */
  readonly openWorkLabel?: string;
}

/**
 * Where a record stands in the work it belongs to, for the record's own detail: whose turn it is
 * and the steps of the procedure in one column, with the way to the whole work.
 */
export function WorkProgress({ turn, procedure, onOpenWork, openWorkLabel }: WorkProgressProps) {
  return (
    <Stack gap="md" data-work-progress>
      <WorkTurnCard turn={turn} />
      {onOpenWork && openWorkLabel ? (
        <Flex justify="end">
          <Button size="sm" variant="outline" onClick={onOpenWork}>
            {openWorkLabel}
          </Button>
        </Flex>
      ) : null}
      <ProcessLanes {...procedure} layout="stack" scrollToActive={false} />
    </Stack>
  );
}
