import { CircleCheckIcon, InfoIcon } from "lucide-react";
import type { ReactNode } from "react";
import { useTranslation } from "@simplix-react/i18n/react";
import {
  AlertBanner,
  Badge,
  Button,
  EmptyState,
  Flex,
  Heading,
  Icon,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Text,
} from "@simplix-react/ui";

import { SizedHead, TableCard } from "../layout";
import { ActionButton, type ActionOrUnbuilt } from "../notice";
import { AiBadge } from "./ai-marking";
import { agentDockGlyphStyle, agentDockSuffixStyle } from "./agent-dock.style";
import { slotAttributes } from "@simplix-react/ui/design";
import { PushEnd } from "../layout/push-edge";

/**
 * Which of the three groups a task falls in.
 *
 * <p><b>All three are arithmetic.</b> `blocking` counts what waits on this task, `due` expands a
 * statutory cycle from its start date, and `blocked` is a precondition that is not met — none of
 * them needs a model, which is why the dock works on an installation with every model switched off.
 */
export type DockGroup = "blocking" | "due" | "blocked";

/** One thing the reader could do next. */
export interface DockTask {
  /** Stable key, and what opening the task is addressed to. */
  readonly key: string;
  /** What has to be done, in the words of the screen that owns it. */
  readonly label: string;
  /**
   * Why it is on the list — what is waiting, when it falls due, what is missing.
   *
   * <p>Already masked by the caller where the reader may not see it: a task held up by another
   * organization reads as 「원청 확인 대기」 with no name, because who is holding it up is that
   * organization's business.
   */
  readonly why: string;
  readonly group: DockGroup;
  /** How many other pieces of work this one is holding up. */
  readonly blockingCount?: number;
  /** Opens the screen the task is done on. */
  readonly onOpen?: ActionOrUnbuilt;
}

interface AgentDockProps {
  readonly tasks: readonly DockTask[];
  /**
   * The one paragraph a model writes, when this installation has one.
   *
   * <p>Absent on an air-gapped installation, and its absence changes nothing else on the dock —
   * that is the condition on which this feature can be tier 3 at all.
   */
  readonly summary?: string;
  /** Opens the full work list. */
  readonly onSeeAll?: ActionOrUnbuilt;
  /**
   * What the badge counts, where that is not simply what the pane lists.
   *
   * <p>The pane holds what is reachable now and hands the rest to the work list, so a reader with
   * nine things to do can be looking at three rows — and the badge has to say nine, because it is
   * answering 「얼마나 밀렸나」 rather than 「이 표에 몇 줄인가」.
   */
  readonly counts?: { readonly todo: number; readonly blocking: number };
}

/**
 * AI 에이전트 · 모든 화면에서 사용 (P-41) — the one place on every console screen that answers
 * 「이 다음에 뭘 하지」.
 *
 * <p><b>It is docked rather than put on a dashboard.</b> The question is asked from wherever
 * somebody got stuck, and walking back to a dashboard to ask it is the reason nobody asks.
 *
 * <p><b>The count is work to do, not notifications.</b> A notification centre counts what has
 * happened; this counts what has not been done. Adding them together lets a read notice hide a
 * task.
 *
 * <p><b>Holding somebody else up is a different state from being behind.</b> One task of mine
 * standing four of theirs still is not 「밀린 일이 많다」, so the dock changes weight rather than
 * changing its number.
 *
 * <p><b>The order is arithmetic; only the summary is written.</b> Precedence and statutory cycles
 * decide the list and its order, so an installation with no model reaches the same three groups in
 * the same order and loses one paragraph.
 *
 * <p><b>The dock opens things; it does not do them.</b> Nothing irreversible — an approval, an
 * issue, a stop order — is fired from here. It hands the reader to the screen that owns the act.
 *
 * <p><b>Not on the worker app.</b> A phone home screen already shows the one thing to do today,
 * and the same answer in two places is two places to keep in step.
 */
export function AgentDock({ tasks, summary, onSeeAll, counts }: AgentDockProps) {
  const { t } = useTranslation("common");
  const todo = counts?.todo ?? tasks.length;
  const blocking = counts?.blocking ?? tasks.filter((task) => task.group === "blocking").length;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant={blocking > 0 ? "secondary" : "outline"} size="sm">
          <span aria-hidden {...slotAttributes(agentDockGlyphStyle, {})}>
            ◈
          </span>
          {/* The count stays on screen at zero. 「할 일이 없다」 is an answer, and a dock that
              disappears when it is empty leaves the reader unable to tell it from one that broke. */}
          {t("agentDock.todo", { count: todo })}
          {blocking > 0 && <span {...slotAttributes(agentDockSuffixStyle, {})}>{t("agentDock.blockingSuffix", { count: blocking })}</span>}
        </Button>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-[36rem]">
        <Stack gap="sm">
          <Flex align="center" gap="sm">
            <Heading level={6}>{t("agentDock.title")}</Heading>
            {onSeeAll && (
              <PushEnd>
                <ActionButton
                  behaviour={onSeeAll}
                  variant="outline"
                  size="xs"
                  label={t("agentDock.seeAll")}
                />
              </PushEnd>
            )}
          </Flex>

          {summary && (
            <AlertBanner
              tone="info"
              icon={InfoIcon}
              density="hint"
              trailing={<AiBadge word="draft" basis={t("agentDock.summaryBasis")} />}
              subtitle={summary}
            />
          )}

          {tasks.length === 0 ? (
            <EmptyState
              size="sm"
              icon={<CircleCheckIcon />}
              title={t("agentDock.emptyTitle")}
              description={t("agentDock.emptyBody")}
            />
          ) : (
            <TableCard>
              {/* Bounded: the dock shows what is reachable now and hands the rest to the work list. */}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("agentDock.columnTask")}</TableHead>
                    <SizedHead width={96}>{t("agentDock.columnBlocking")}</SizedHead>
                    <SizedHead width={72} />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tasks.map((task) => (
                    <TableRow key={task.key}>
                      <TableCell>
                        <Stack gap="none">
                          <Text>{task.label}</Text>
                          <Text size="caption" tone="muted">
                            {task.why}
                          </Text>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        {task.blockingCount !== undefined && task.blockingCount > 0 ? (
                          <Badge>{t("agentDock.blockingCount", { count: task.blockingCount })}</Badge>
                        ) : (
                          <Badge variant="outline">{t(`agentDock.group.${task.group}`)}</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {task.onOpen && (
                          <ActionButton
                            behaviour={task.onOpen}
                            variant="outline"
                            size="xs"
                            label={t("agentDock.open")}
                          />
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableCard>
          )}
        </Stack>
      </PopoverContent>
    </Popover>
  );
}

/** What each of the three groups is decided by, for the screen that explains the dock. */
export const DOCK_GROUPS: readonly DockGroup[] = ["blocking", "due", "blocked"];
