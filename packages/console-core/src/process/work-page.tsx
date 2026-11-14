import { type ReactNode, useState } from "react";
import { useTranslation } from "@simplix-react/i18n/react";
import { ProcessLanes } from "@simplix-react/process";
import { Button, EmptyState, Flex, Stack, StatusBadge, type StatusTone, Tabs, TabsContent, TabsTrigger } from "@simplix-react/ui";
import { ArrowLeftIcon, ChevronRightIcon, Maximize2Icon, Minimize2Icon } from "lucide-react";
import { partAttributes, slotAttributes } from "@simplix-react/ui/design";

import { PageTabStrip } from "../layout/page-tab-strip";
import { PACKAGE_NAMESPACE } from "./locales";
import { workLocationPathStyle, workLocationStepStyle, workLocationStyle, workPageHeadStyle, workRailBarStyle, workRailBodyStyle, workRailStyle } from "./work-page.style";
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
  /** Whether the rail opens unfolded over the screen; the page keeps its own state after that. */
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
 * the same place, and one button brings the step in hand back. Unfolded, the rail covers the
 * screen and draws the procedure as lanes; folded, it is the column of steps again. The bar over
 * the screen says where that screen is in the menu and leads there with the same record open.
 */
export function WorkPage({ kind, title, stage, onClose, backLabel, turn, procedure, location, atCurrent, onCurrent, history, related, defaultWide = false, defaultRailTab = "progress", empty, children }: WorkPageProps) {
  const { t } = useTranslation(`${PACKAGE_NAMESPACE}/work`);
  const [wide, setWide] = useState(defaultWide);
  const counts = { history: history.length, related: related.length };
  return (
    <Stack gap="none" className="min-h-0 flex-1" data-work-page>
      <Flex align="center" {...partAttributes(workPageHeadStyle, {})}>
        <Button size="sm" variant="ghost" onClick={onClose} className="shrink-0">
          <ArrowLeftIcon aria-hidden className="size-4" />
          {backLabel ?? t("back")}
        </Button>
        <Stack gap="none" className="min-w-0 flex-1">
          <span {...slotAttributes(workKindStyle, {})}>{kind}</span>
          <span className="truncate" {...slotAttributes(workTitleStyle, {})}>
            {title}
          </span>
        </Stack>
        {stage ? <StatusBadge tone={stage.tone ?? "processing"} label={stage.label} appearance="filled" /> : null}
      </Flex>
      {/* raw layout: the screen in view with the rail over its end edge; unfolded, the rail spans the whole box. */}
      <div className="relative flex min-h-0 flex-1">
        <Stack gap="none" className="me-72 min-h-0 min-w-0 flex-1" data-work-screen aria-hidden={wide || undefined}>
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
        <Stack
          gap="none"
          role="complementary"
          data-work-rail={wide ? "wide" : "folded"}
          className={wide ? "absolute inset-y-0 end-0 w-full" : "absolute inset-y-0 end-0 w-72"}
          {...partAttributes(workRailStyle, { wide })}
        >
          <Flex align="center" justify="between" {...partAttributes(workRailBarStyle, {})}>
            <span {...slotAttributes(workKindStyle, {})}>{t("rail.progress")}</span>
            <Button size="sm" variant="ghost" onClick={() => setWide(!wide)} aria-expanded={wide} data-work-wide>
              {wide ? <Minimize2Icon aria-hidden className="size-4" /> : <Maximize2Icon aria-hidden className="size-4" />}
              {wide ? t("narrow") : t("wide")}
            </Button>
          </Flex>
          <Stack gap="md" className="min-h-0 flex-1 overflow-auto" {...partAttributes(workRailBodyStyle, {})}>
            {wide ? (
              <ProcessLanes {...procedure} layout="lanes" scrollToActive={false} />
            ) : (
              <>
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
              </>
            )}
          </Stack>
        </Stack>
      </div>
    </Stack>
  );
}
