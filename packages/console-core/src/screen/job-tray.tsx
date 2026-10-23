import { InboxIcon, TriangleAlertIcon } from "lucide-react";
import type { ReactNode } from "react";
import { useTranslation } from "@simplix-react/i18n/react";
import {
  AlertBanner,
  Badge,
  Button,
  Card,
  EmptyState,
  Flex,
  Icon,
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  Stack,
  Text,
} from "@simplix-react/ui";

import { JOB_STATE_VARIANT, statusVariant } from "../badge";
import { ProgressBar } from "../layout";
import { ActionButton, type ActionOrUnbuilt } from "../notice";

/**
 * Where one long-running job stands. Four states, because they call for four different things
 * from the reader.
 *
 * <p>`queued` says how many are in front of it, `running` says how far along, `done` says where to
 * collect the result, and `failed` says what failed and how to try it again. Collapsing them into
 * 「진행 중」 and 「끝남」 loses the two the reader can act on.
 */
export type JobState = "queued" | "running" | "done" | "failed";

/** One job in the tray. */
export interface TrayJob {
  /** Stable key, and what a cancel or a retry is addressed to. */
  readonly key: string;
  /** What the job is doing, in the words of the screen that started it. */
  readonly title: string;
  readonly state: JobState;
  /**
   * When it started, its place in the queue, or when it finished — already formatted by the
   * caller against the site's own clock.
   */
  readonly when: ReactNode;
  /** How far along, 0–100. Only read while `running`. */
  readonly percent?: number;
  /**
   * What it managed before it stopped — 「128명 중 96명 반영」.
   *
   * <p>The half of a failure that decides what to do next: a job that changed nothing is retried,
   * a job that changed some of it is either finished off or reversed.
   */
  readonly partial?: string;
  /** Whether the reader has seen this job reach its current state. */
  readonly unread?: boolean;
  /** Stops it. Offered only while `queued` or `running`, and the tray enforces that. */
  readonly onCancel?: ActionOrUnbuilt;
  /** Collects the result. Offered on `done`. */
  readonly onCollect?: ActionOrUnbuilt;
  /** Opens what failed. Offered on `failed`. */
  readonly onShowFailures?: ActionOrUnbuilt;
  /** Runs the failed part again. Offered on `failed`. */
  readonly onRetry?: ActionOrUnbuilt;
}

interface JobTrayProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  /** Every job this operator started that has not been cleared, newest first. */
  readonly jobs: readonly TrayJob[];
  /** Marks everything in the tray as seen. */
  readonly onMarkAllRead?: () => void;
}

/**
 * 장기 실행 작업 진행 · 취소 (P-17) — work that outlives the click, and the tray it lives in.
 *
 * <p><b>A long job never occupies the screen.</b> Package building, bulk assignment, a wide
 * export, a render, an import: each hands back immediately and carries on in the tray, so the
 * operator can leave the screen and the work does not stop.
 *
 * <p><b>Leaving the screen must not lose the result.</b> A result that disappears with the page is
 * a result the operator asks for a second time, which is how one long job becomes three.
 *
 * <p><b>Cancel only while it can still be cancelled.</b> A cancel button on a job that has already
 * finished is a button that either lies or destroys the result, so the tray draws it from the
 * state rather than from whether the caller passed a handler.
 *
 * <p><b>Partial application is reported, not hidden.</b> A job that changed some of what it was
 * given says so on the row, because that is what decides between retrying and reversing
 * ({@link BulkOutcome}, P-30).
 */
export function JobTray({ open, onOpenChange, jobs, onMarkAllRead }: JobTrayProps) {
  const { t } = useTranslation("common");

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right">
        <SheetHeader>
          <Flex align="center" gap="sm">
            <SheetTitle>{t("jobs.trayTitle")}</SheetTitle>
            {onMarkAllRead && jobs.some((job) => job.unread) && (
              <Button variant="outline" size="xs" className="ml-auto" onClick={onMarkAllRead}>
                {t("jobs.markAllRead")}
              </Button>
            )}
          </Flex>
        </SheetHeader>

        <Stack gap="sm" flex overflow="auto">
          {jobs.length === 0 ? (
            <EmptyState
              size="sm"
              icon={<InboxIcon />}
              title={t("jobs.emptyTitle")}
              description={t("jobs.emptyBody")}
            />
          ) : (
            jobs.map((job) => <JobTrayRow key={job.key} job={job} />)
          )}
        </Stack>
      </SheetContent>
    </Sheet>
  );
}

/**
 * 장기 실행 작업 진행 · 취소 (P-17) — one job, drawn the same way inside the tray and inside a
 * screen's own list of its jobs.
 *
 * <p>Exported because the tray is not the only place a job appears: the screen that started them
 * lists its own, and a job that reads one way in the tray and another on that list is two jobs to
 * whoever is watching it.
 */
export function JobTrayRow({ job }: { readonly job: TrayJob }) {
  const { t } = useTranslation("common");
  const cancellable = job.state === "queued" || job.state === "running";

  return (
    <Card padding="sm" className={job.unread ? "border-primary" : undefined}>
      <Stack gap="xs">
        <Flex align="center" gap="sm" wrap>
          <Badge variant={statusVariant(JOB_STATE_VARIANT, job.state)}>{t(`jobs.state.${job.state}`)}</Badge>
          <Text size="caption" tone="muted">
            {job.when}
          </Text>
          {job.unread && (
            <Badge variant="outline" className="ml-auto">
              {t("jobs.unread")}
            </Badge>
          )}
        </Flex>

        <Text>{job.title}</Text>

        {job.state === "running" && job.percent !== undefined && (
          <ProgressBar percent={job.percent} label={job.title} />
        )}

        {job.partial && (
          <AlertBanner tone="warning" icon={TriangleAlertIcon} density="hint" title={t("jobs.partialTitle")} subtitle={job.partial} />
        )}

        <Flex gap="xs" wrap>
          {/* Drawn from the state rather than from what the caller passed: a cancel offered on a
              job that has already finished either does nothing or destroys the result, and both
              read to the operator as the product not knowing what it is doing. */}
          {cancellable && job.onCancel && (
            <ActionButton behaviour={job.onCancel} variant="outline" size="xs" label={t("jobs.cancel")} />
          )}
          {job.state === "done" && job.onCollect && (
            <ActionButton behaviour={job.onCollect} size="xs" label={t("jobs.collect")} />
          )}
          {job.state === "failed" && job.onShowFailures && (
            <ActionButton behaviour={job.onShowFailures} variant="outline" size="xs" label={t("jobs.showFailures")} />
          )}
          {job.state === "failed" && job.onRetry && (
            <ActionButton behaviour={job.onRetry} size="xs" label={t("jobs.retry")} />
          )}
        </Flex>
      </Stack>
    </Card>
  );
}
