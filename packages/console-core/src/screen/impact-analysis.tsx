import { CircleCheckIcon, TriangleAlertIcon } from "lucide-react";
import type { ReactNode } from "react";
import { useTranslation } from "@simplix-react/i18n/react";
import {
  AlertBanner,
  Badge,
  EmptyState,
  Flex,
  Icon,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Text,
} from "@simplix-react/ui";

import { IMPACT_KIND_VARIANT, statusVariant } from "../badge";
import { SettingsTiles, SizedHead, TableCard } from "../layout";

/** Which of the three kinds a row of the impact table belongs to. */
export type ImpactKind = "automatic" | "rejudge" | "retained";

/** One thing that leans on the record about to change. */
export interface ImpactRow {
  /** Stable key within its group. */
  readonly key: string;
  /** What is affected, named the way its own screen names it. */
  readonly target: ReactNode;
  /** What happens to it. */
  readonly change: string;
}

/** One of the three groups, with what it counts. */
export interface ImpactGroup {
  readonly kind: ImpactKind;
  /**
   * How many are affected, or undefined when nothing in this build counts them.
   *
   * <p><b>Absent is not zero.</b> A change that reports 「0건 재평가 필요」 because nobody counted
   * is the one reading this screen exists to prevent.
   */
  readonly count: number | undefined;
  /** The rows themselves — a count with no list leaves the finding-them to a person. */
  readonly rows: readonly ImpactRow[];
  /** Why the count is absent, when it is. */
  readonly uncountedReason?: string;
}

interface ImpactAnalysisProps {
  /** What is about to change, as one line. */
  readonly subject: string;
  /** The three groups, in the order the pattern draws them. */
  readonly groups: readonly ImpactGroup[];
  /** The warning above the table, when something needs a person's judgement. */
  readonly warning?: { readonly title: string; readonly body: string };
  /** 적용 · 취소, and whatever else this particular change offers. */
  readonly actions?: ReactNode;
}

/**
 * 영향 분석 (P-33) — what leans on a record, before the record changes.
 *
 * <p><b>Used where a confirm dialog is too small.</b> A dialog can say 「12건이 영향받습니다」 and
 * no more; this is for the change whose affected rows have to be opened and judged one at a time.
 *
 * <p><b>Three kinds, never one number.</b> What follows automatically, what a person has to judge
 * again, and what stays exactly as it was submitted are three different obligations, and a single
 * total hides the only one that needs doing.
 *
 * <p><b>What was submitted is not rewritten.</b> A record signed under the old shape keeps the old
 * shape, because evidence that changes after it is signed is not evidence.
 */
export function ImpactAnalysis({ subject, groups, warning, actions }: ImpactAnalysisProps) {
  const { t } = useTranslation("common");

  return (
    <Stack gap="md">
      <Text>{subject}</Text>

      <SettingsTiles
        tiles={groups.map((group) => ({
          key: group.kind,
          label: t(`impact.${group.kind}`),
          // Absent rather than nought: a group nobody counted says so with an em-dash and its own
          // reason, where a 0 would claim the amendment touches nothing of that kind.
          value:
            group.count === undefined ? undefined : t("impact.countValue", { count: group.count }),
          basis: group.uncountedReason ?? t(`impact.${group.kind}Basis`),
          tone: group.kind === "rejudge" && (group.count ?? 0) > 0 ? "warning" : undefined,
          counted: true,
          listUnbuilt: true,
        }))}
        columns={3}
      />

      {warning && <AlertBanner tone="warning" icon={TriangleAlertIcon} title={warning.title} subtitle={warning.body} />}

      {groups.every((group) => group.rows.length === 0) ? (
        <EmptyState
          size="sm"
          icon={<CircleCheckIcon />}
          title={t("impact.emptyTitle")}
          description={t("impact.emptyBody")}
        />
      ) : (
        <TableCard>
          {/* Bounded: what one move carries with it, which the subtree being moved fixes. */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("impact.columnTarget")}</TableHead>
                <TableHead>{t("impact.columnChange")}</TableHead>
                <SizedHead width={112}>{t("impact.columnKind")}</SizedHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {groups.flatMap((group) =>
                group.rows.map((row) => (
                  <TableRow key={`${group.kind}-${row.key}`}>
                    <TableCell>{row.target}</TableCell>
                    <TableCell>{row.change}</TableCell>
                    <TableCell>
                      <Badge variant={statusVariant(IMPACT_KIND_VARIANT, group.kind)}>{t(`impact.${group.kind}`)}</Badge>
                    </TableCell>
                  </TableRow>
                )),
              )}
            </TableBody>
          </Table>
        </TableCard>
      )}

      <Text size="caption" tone="muted">
        {t("impact.retentionNote")}
      </Text>

      {actions && <Flex gap="sm">{actions}</Flex>}
    </Stack>
  );
}
