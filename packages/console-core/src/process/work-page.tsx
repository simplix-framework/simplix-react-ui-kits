import { type ReactNode, useState } from "react";
import { useTranslation } from "@simplix-react/i18n/react";
import { ProcessLanes } from "@simplix-react/process";
import { Button, Dialog, DialogHeader, DialogTitle, EmptyState, Flex, Stack, StatusBadge, type StatusTone, Tabs, TabsContent, TabsTrigger } from "@simplix-react/ui";
import { ArrowLeftIcon, ChevronRightIcon, Maximize2Icon, XIcon } from "lucide-react";
import { partAttributes, slotAttributes } from "@simplix-react/ui/design";

import { BoundedDialogContent } from "../layout/bounded-dialog-content";
import { PageTabStrip } from "../layout/page-tab-strip";
import { useCrudPresentation } from "../page/crud-page";
import { DetailPresentationSwitch } from "../page/detail-presentation-switch";
import { PACKAGE_NAMESPACE } from "./locales";
import { workLocationPathStyle, workLocationStepStyle, workLocationStyle, workPageHeadStyle, workRailBarStyle, workRailBodyStyle, workRailStyle } from "./work-page.style";
import { WHOLE_VIEW_METRICS } from "./whole-view";
import { WorkEvents, WorkRows, type WorkEvent, type WorkRow } from "./work-rows";
import { WorkTurnCard, type WorkTurn } from "./work-turn";
import { workKindStyle, workTitleStyle } from "./work-window.style";
import type { WorkProcedure } from "./work-progress";

/** The screen a work page is showing: the step it belongs to and where the screen is in the menu. */
export interface WorkLocation {
  /** The step or act in view, in the reader's words. */
  readonly step: string;
  /** The menu path of the screen in view, outermost first. */
  readonly path: readonly string[];
  /** Goes to that screen in the menu, with the same record open. */
  readonly onGo?: () => void;
}

/** Props for {@link WorkPage}. */
export interface WorkPageProps {
  /** The kind of work, such as the name of its procedure. */
  readonly kind: string;
  /** The name of this piece of work. */
  readonly title: string;
  /** The step the work stands at. */
  readonly stage?: { readonly label: string; readonly tone?: StatusTone };
  /** Closes the page back to the list the reader came from. */
  readonly onClose: () => void;
  /** What that list is called on the way back; the list of work when left out. */
  readonly backLabel?: string;
  /** Whose turn it is and what is done next. */
  readonly turn: WorkTurn;
  /** The procedure and how far the work has come. Its `selected` is the step in view and its `onSelect` shows another. */
  readonly procedure: WorkProcedure;
  /** The screen in view; left out where the step in view has no record yet. */
  readonly location?: WorkLocation;
  /** Whether the step in view is the one in hand. */
  readonly atCurrent: boolean;
  /** Shows the step in hand again. */
  readonly onCurrent: () => void;
  /** What has been done, newest first. */
  readonly history: readonly WorkEvent[];
  /** The records and the work related to this one. */
  readonly related: readonly WorkRow[];
  /** Whether the whole view of the procedure is open when the page opens; the page keeps its own state after that. */
  readonly defaultWide?: boolean;
  /** The rail tab the page opens on. */
  readonly defaultRailTab?: "progress" | "history" | "related";
  /** What stands where the screen would, when the step in view has no record yet. */
  readonly empty?: { readonly title: string; readonly description?: string };
  /** The screen of the step in view. */
  readonly children?: ReactNode;
}

/**
 * One piece of work as a page: the screen of the step in hand in the middle, and beside it a rail
 * with whose turn it is and the steps of the procedure. Pressing a step shows that step's screen in
 * the same place, and one button brings the step in hand back. The whole view opens the
 * procedure as lanes in a dialog as large as the window; picking a step there closes it and shows
 * that step's screen. The bar over the screen says where that screen is in the menu and leads
 * there with the same record open.
 */
export function WorkPage({ kind, title, stage, onClose, backLabel, turn, procedure, location, atCurrent, onCurrent, history, related, defaultWide = false, defaultRailTab = "progress", empty, children }: WorkPageProps) {
  const { t } = useTranslation(`${PACKAGE_NAMESPACE}/work`);
  const [wide, setWide] = useState(defaultWide);
  // Beside a list, over it or in a dialog, the work closes as any record does there: by the mark at
  // the end of its head, next to the switch between presentations. As a page it has the way back.
  const crud = useCrudPresentation();
  const asPage = !crud || crud.presentation === "page";
  const counts = { history: history.length, related: related.length };
  return (
    <Stack gap="none" className="min-h-0 flex-1" data-work-page>
      <Flex align="center" {...partAttributes(workPageHeadStyle, {})}>
        {asPage ? (
          <Button size="sm" variant="ghost" onClick={onClose} className="shrink-0" data-work-back>
            <ArrowLeftIcon aria-hidden className="size-4" />
            {backLabel ?? t("back")}
          </Button>
        ) : null}
        <Stack gap="none" className="min-w-0 flex-1">
          <span {...slotAttributes(workKindStyle, {})}>{kind}</span>
          <span className="truncate" {...slotAttributes(workTitleStyle, {})}>
            {title}
          </span>
        </Stack>
        {stage ? <StatusBadge tone={stage.tone ?? "processing"} label={stage.label} appearance="filled" /> : null}
        {crud?.presentationSwitch ? <DetailPresentationSwitch {...crud.presentationSwitch} /> : null}
        {asPage ? null : (
          <Button size="sm" variant="ghost" onClick={onClose} aria-label={t("close")} className="shrink-0" data-work-close>
            <XIcon aria-hidden className="size-4" />
          </Button>
        )}
      </Flex>
      {/* raw layout: the screen in view with the rail over its end edge; unfolded, the rail spans the whole box. */}
      <div className="relative flex min-h-0 flex-1">
        <Stack gap="none" className="me-72 min-h-0 min-w-0 flex-1" data-work-screen>
          {location ? (
            <Flex align="center" justify="between" wrap {...partAttributes(workLocationStyle, {})}>
              <Stack gap="none" className="min-w-0">
                <span {...slotAttributes(workLocationStepStyle, {})}>{location.step}</span>
                <Flex gap="xs" align="center" wrap aria-label={t("location")} {...partAttributes(workLocationPathStyle, {})}>
                  {location.path.map((part, index) => (
                    <Flex key={`${index}:${part}`} gap="xs" align="center">
                      {index > 0 ? <ChevronRightIcon aria-hidden className="size-3" /> : null}
                      {part}
                    </Flex>
                  ))}
                </Flex>
              </Stack>
              <Flex gap="sm" align="center" className="ms-auto shrink-0">
                {atCurrent ? null : (
                  <Button size="sm" variant="outline" onClick={onCurrent} data-work-current>
                    {t("current")}
                  </Button>
                )}
                {location.onGo ? (
                  <Button size="sm" variant="outline" onClick={location.onGo} data-work-go>
                    {t("go")}
                  </Button>
                ) : null}
              </Flex>
            </Flex>
          ) : atCurrent ? null : (
            <Flex align="center" justify="end" {...partAttributes(workLocationStyle, {})}>
              <Button size="sm" variant="outline" onClick={onCurrent} data-work-current>
                {t("current")}
              </Button>
            </Flex>
          )}
          <Stack gap="none" className="min-h-0 flex-1 overflow-auto">
            {children ?? (empty ? <EmptyState size="sm" title={empty.title} description={empty.description} /> : null)}
          </Stack>
        </Stack>
        <Stack gap="none" role="complementary" data-work-rail className="absolute inset-y-0 end-0 w-72" {...partAttributes(workRailStyle, {})}>
          <Flex align="center" justify="between" {...partAttributes(workRailBarStyle, {})}>
            <span {...slotAttributes(workKindStyle, {})}>{t("rail.progress")}</span>
            <Button size="sm" variant="ghost" onClick={() => setWide(true)} data-work-wide>
              <Maximize2Icon aria-hidden className="size-4" />
              {t("wide")}
            </Button>
          </Flex>
          <Stack gap="md" className="min-h-0 flex-1 overflow-auto" {...partAttributes(workRailBodyStyle, {})}>
            <WorkTurnCard turn={turn} />
            <Tabs defaultValue={defaultRailTab}>
              <PageTabStrip fromStart>
                {(["progress", "history", "related"] as const).map((key) => (
                  <TabsTrigger key={key} value={key} data-work-tab={key}>
                    {t(`rail.${key}`)}
                    {key !== "progress" && counts[key] > 0 ? ` ${counts[key]}` : null}
                  </TabsTrigger>
                ))}
              </PageTabStrip>
              <TabsContent value="progress">
                <ProcessLanes {...procedure} layout="stack" scrollToActive={false} />
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
      </div>
      <Dialog open={wide} onOpenChange={setWide}>
        {/* As large as the window, so the lanes are drawn side by side without scrolling sideways wherever they fit. */}
        <BoundedDialogContent width="window" className="h-dvh" data-work-whole>
          <DialogHeader>
            <DialogTitle>
              {kind} · {title}
            </DialogTitle>
          </DialogHeader>
          {/* The lanes scroll inside their own box, so the row of lane names stays in sight. */}
          <Stack gap="none" className="min-h-0 flex-1 overflow-hidden">
            {/* Picking a step on the lanes closes the whole view and shows that step's screen. */}
            <ProcessLanes {...procedure} layout="lanes" metrics={WHOLE_VIEW_METRICS} scrollToActive={false} className="h-full" onSelect={(target) => { procedure.onSelect?.(target); setWide(false); }} />
          </Stack>
        </BoundedDialogContent>
      </Dialog>
    </Stack>
  );
}
