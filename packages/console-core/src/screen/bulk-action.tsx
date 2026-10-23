import { CircleCheckIcon, TriangleAlertIcon } from "lucide-react";
import type { ReactNode } from "react";
import { useTranslation } from "@simplix-react/i18n/react";
import {
  AlertBanner,
  Badge,
  Button,
  Dialog,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Flex,
  Stack,
  Stepline,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Text,
} from "@simplix-react/ui";

import { BoundedDialogContent, SettingsTiles, SizedHead, TableCard } from "../layout";
import { ActionButton, type ActionOrUnbuilt } from "../notice";
import { PushStart } from "../layout/push-edge";

/**
 * The three stages, in the only order they occur.
 *
 * <p><b>The order is the component's, not the caller's.</b> A bulk action that lets a screen hand
 * in its own stage list is a bulk action whose middle stage can be left out, and the middle stage
 * is the entire safety of the pattern — the count of what will happen, before it happens.
 */
export type BulkStageKey = "select" | "preview" | "run";

const STAGE_ORDER: readonly BulkStageKey[] = ["select", "preview", "run"];

interface BulkStagesProps {
  /** Which stage the operator is standing in. */
  readonly current: BulkStageKey;
  /**
   * What each stage says under its own name — how many are selected, what the preview is of,
   * where the run went. A stage with nothing to add omits its entry.
   */
  readonly trail?: Partial<Record<BulkStageKey, ReactNode>>;
}

/**
 * 일괄 처리 (P-30) — the rail of three stages a bulk action moves along.
 *
 * <p><b>Three stages and the order never changes</b> — choose the targets, count what will happen,
 * then run it. A bulk action that skips the middle is one only an undo can clean up after.
 */
export function BulkStages({ current, trail }: BulkStagesProps) {
  const { t } = useTranslation("common");

  return (
    <Stepline
      current={current}
      items={STAGE_ORDER.map((key) => ({
        key,
        // The label slot takes a node, so the stage's own detail rides with the stage rather than
        // sitting in a second row underneath where it stops being attached to anything.
        label: (
          <Stack gap="none">
            <Text>{t(`bulk.stage.${key}`)}</Text>
            {trail?.[key] !== undefined && (
              <Text size="caption" tone="muted">
                {trail[key]}
              </Text>
            )}
          </Stack>
        ),
      }))}
    />
  );
}

/** What the preview counted. Absent is not zero — a count nobody took is `undefined`. */
export interface BulkPreviewCounts {
  /** How many the action will reach. */
  readonly ready: number;
  /** How many it refuses, and therefore how many stay behind for somebody to fix. */
  readonly blocked: number;
  /**
   * How many are already in the state the action would put them in.
   *
   * <p>Drawn even at zero: 「이미 배정 0명」 is the sentence that tells the operator this run is not
   * a repeat of one somebody else already made.
   */
  readonly unchanged: number;
}

/** One reason the action refuses, and how many it refuses for that reason. */
export interface BulkBlockReason {
  /** Stable key within the breakdown. */
  readonly key: string;
  /** Why these are blocked, in the words the operator has to act on. */
  readonly reason: string;
  /** How many this reason accounts for. */
  readonly count: number;
}

/**
 * What this particular bulk action calls the things it counts.
 *
 * <p><b>A bulk action over people does not count 건.</b> Korean picks its counter word from what
 * is being counted, so an assignment counts 명 and an import counts 건 — and the generic wording
 * the catalogue holds is right for neither once the screen names its subject. Everything here is
 * optional and falls back to that generic wording; `countKey` is a catalogue key because a count
 * has to be interpolated in every language, while the rest are already in the reader's language
 * because the screen that owns the action is what knows them.
 */
export interface BulkWords {
  /** The sentence above the counts — 「실행하기 전에 배정 대상과 제외 대상을 확인합니다. …」. */
  readonly lead?: string;
  /** What the reached set is called — 「배정된 사람」. */
  readonly ready?: string;
  /** Why they are in it — 「필수 요건 충족」. */
  readonly readyBasis?: string;
  /** What the refused set is called — 「차단된 사람」. */
  readonly blocked?: string;
  /** Why they are in it — 「교육·자격 미충족」. */
  readonly blockedBasis?: string;
  /** What the already-there set is called — 「이미 배정」. */
  readonly unchanged?: string;
  /** Why they are in it — 「중복 없음」. */
  readonly unchangedBasis?: string;
  /** The counted string this action's subject takes — `common:bulk.countPeople` for 「{{count}}명」. */
  readonly countKey?: string;
  /** What the breakdown's first column is called — 「차단 사유」. */
  readonly columnReason?: string;
  /** What its second column counts — 「인원」 where the action reaches people. */
  readonly columnCount?: string;
}

interface BulkPreviewDialogProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  /** What is about to happen, as one sentence — 「근로자 128명을 남부현장에 배정합니다」. */
  readonly title: string;
  readonly counts: BulkPreviewCounts;
  /** Why the blocked are blocked, one row per reason. Empty when nothing is blocked. */
  readonly reasons: readonly BulkBlockReason[];
  /**
   * Hands the blocked list over as a file.
   *
   * <p>Omitting it removes the button, which is the honest shape for an action whose blocked set
   * is not a list anybody can work from — but for most of them it is, and the fixing happens
   * outside this screen.
   */
  readonly onExportBlocked?: ActionOrUnbuilt;
  readonly onCancel: () => void;
  readonly onConfirm: () => void;
  /** What this particular action asks beyond the counts — a target, an effective date, a reason. */
  readonly children?: ReactNode;
  /** The committing verb, where 「{{count}} 실행」 is not what this action is called. */
  readonly confirmLabel?: string;
  /** What this action calls what it counts. */
  readonly words?: BulkWords;
}

/**
 * 일괄 처리 (P-30) — the preview stage, drawn as the dialog that stands between choosing and doing.
 *
 * <p><b>The preview does not count successes only.</b> How many will be refused and why, broken
 * down by reason, is the half an operator acts on — and the half a progress bar over a running job
 * can no longer show.
 *
 * <p><b>Partial application is the correct outcome.</b> The confirm button commits the ready set
 * and leaves the blocked set alone; an all-or-nothing bulk action is one nobody dares press, so
 * the count on the button is the ready count rather than the selection.
 *
 * <p><b>What happens after the press belongs to the job tray.</b> A bulk run outlives the dialog
 * ({@link JobTray}, P-17) — the dialog closes, the work does not stop, and the outcome comes back
 * through {@link BulkOutcome}.
 */
export function BulkPreviewDialog({
  open,
  onOpenChange,
  title,
  counts,
  reasons,
  onExportBlocked,
  onCancel,
  onConfirm,
  children,
  confirmLabel,
  words,
}: BulkPreviewDialogProps) {
  const { t } = useTranslation("common");
  const countKey = words?.countKey ?? "bulk.countValue";
  const counted = (count: number) => t(countKey, { count });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* `xl` rather than `lg`: the three tiles are the preview, and at `lg` the third wraps onto a
          row of its own — 「이미 배정 0건」 then reads as an afterthought rather than as the third of
          three counts the operator is being asked to weigh together. */}
      <BoundedDialogContent width="xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <Stack gap="md">
          <Text size="caption" tone="muted">
            {words?.lead ?? t("bulk.previewLead")}
          </Text>

          {children}

          <SettingsTiles
            tiles={[
              {
                key: "ready",
                label: words?.ready ?? t("bulk.ready"),
                value: counted(counts.ready),
                basis: words?.readyBasis ?? t("bulk.readyBasis"),
                counted: true,
                listUnbuilt: true,
              },
              {
                key: "blocked",
                label: words?.blocked ?? t("bulk.blocked"),
                value: counted(counts.blocked),
                basis: words?.blockedBasis ?? t("bulk.blockedBasis"),
                // Tinted only where something is actually blocked: a row where every figure is
                // coloured has no warning in it.
                tone: counts.blocked > 0 ? "warning" : undefined,
                counted: true,
                listUnbuilt: true,
              },
              {
                key: "unchanged",
                label: words?.unchanged ?? t("bulk.unchanged"),
                value: counted(counts.unchanged),
                basis: words?.unchangedBasis ?? t("bulk.unchangedBasis"),
                counted: true,
                listUnbuilt: true,
              },
            ]}
            columns={3}
          />

          {reasons.length > 0 && (
            <TableCard>
              {/* Bounded: one row per reason, and the reasons are a closed set the server names. */}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{words?.columnReason ?? t("bulk.columnReason")}</TableHead>
                    <SizedHead width={96}>{words?.columnCount ?? t("bulk.columnCount")}</SizedHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reasons.map((reason) => (
                    <TableRow key={reason.key}>
                      <TableCell>{reason.reason}</TableCell>
                      <TableCell>{counted(reason.count)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableCard>
          )}
        </Stack>

        <DialogFooter>
          {onExportBlocked && counts.blocked > 0 && (
            <PushStart>
              <ActionButton
                behaviour={onExportBlocked}
                variant="outline"
                label={t("bulk.exportBlocked", { count: counted(counts.blocked) })}
              />
            </PushStart>
          )}
          <Button variant="outline" onClick={onCancel}>
            {t("bulk.cancel")}
          </Button>
          <Button onClick={onConfirm} disabled={counts.ready === 0}>
            {confirmLabel ?? t("bulk.confirm", { count: counted(counts.ready) })}
          </Button>
        </DialogFooter>
      </BoundedDialogContent>
    </Dialog>
  );
}

/** How a row of the selection will be treated once the run starts. */
export type BulkRowState = "ready" | "blocked" | "unchanged";

interface BulkRowBadgeProps {
  readonly state: BulkRowState;
  /**
   * What this action calls that state — 「배정 예정」 where 「반영 예정」 is not its word.
   *
   * <p>The badge and the button under it have to agree: a preview whose confirm reads 「96명 배정」
   * over rows that say 「반영 예정」 is two verbs for one act.
   */
  readonly label?: string;
}

/**
 * 일괄 처리 (P-30) — what one row of the selection will get.
 *
 * <p>Drawn in the selection list beside the reason, so the operator reads down the rows and sees
 * which of them the preview's blocked count is made of.
 */
export function BulkRowBadge({ state, label }: BulkRowBadgeProps) {
  const { t } = useTranslation("common");
  return (
    <Badge variant={state === "blocked" ? "default" : "outline"}>
      {label ?? t(`bulk.row.${state}`)}
    </Badge>
  );
}

interface BulkOutcomeProps {
  /** How many the run reached. */
  readonly applied: number;
  /** How many it left behind. */
  readonly blocked: number;
  /** Opens the blocked set so it can be fixed and run again. */
  readonly onShowBlocked?: ActionOrUnbuilt;
  /** Retries the blocked set alone, leaving the applied set as it is. */
  readonly onRetryBlocked?: ActionOrUnbuilt;
  /**
   * Reverses the whole run.
   *
   * <p>Omitted where the run cannot be reversed at all — and where that is so, saying it here in
   * `note` is what stops an operator looking for the button.
   */
  readonly onRevert?: ActionOrUnbuilt;
  /** Anything the run has to say beyond its two counts. */
  readonly note?: string;
  /** What the run is called, where 「{{applied}} 반영 완료」 is not this action's word for it. */
  readonly title?: string;
  /** What this action calls what it counts. */
  readonly words?: BulkWords;
}

/**
 * 일괄 처리 (P-30) — what the run did, with the blocked set still reachable.
 *
 * <p><b>96 applied and 32 blocked is the right answer, not a half-failure.</b> The banner therefore
 * leads with both counts and offers the two next moves separately: fix and re-run the blocked set,
 * or reverse the run.
 *
 * <p><b>Reverting reaches what was applied.</b> A bulk action records what it changed so the
 * reversal can be partial; an undo that can only be all-or-nothing is one nobody presses, which is
 * the same as not having one.
 */
export function BulkOutcome({
  applied,
  blocked,
  onShowBlocked,
  onRetryBlocked,
  onRevert,
  note,
  title,
  words,
}: BulkOutcomeProps) {
  const { t } = useTranslation("common");
  const counted = (count: number) => t(words?.countKey ?? "bulk.countValue", { count });

  return (
    <Stack gap="sm">
      <AlertBanner
        tone={blocked > 0 ? "warning" : "success"}
        icon={blocked > 0 ? TriangleAlertIcon : CircleCheckIcon}
        title={title ?? t("bulk.outcomeTitle", { applied: counted(applied), blocked: counted(blocked) })}
        subtitle={note ?? t("bulk.outcomeBody")}
      />
      <Flex gap="sm" wrap>
        {onShowBlocked && blocked > 0 && (
          <ActionButton
            behaviour={onShowBlocked}
            variant="outline"
            label={t("bulk.showBlocked", { count: counted(blocked) })}
          />
        )}
        {onRetryBlocked && blocked > 0 && (
          <ActionButton
            behaviour={onRetryBlocked}
            variant="secondary"
            label={t("bulk.retryBlocked", { count: counted(blocked) })}
          />
        )}
        {onRevert && <ActionButton behaviour={onRevert} variant="destructive" label={t("bulk.revertAll")} />}
      </Flex>
    </Stack>
  );
}
