import { useTranslation } from "@simplix-react/i18n/react";
import { Flex, Stack } from "@simplix-react/ui";

import { StatePanel } from "../layout/state-panel";
import { PACKAGE_NAMESPACE } from "./locales";
import { RecordNotices, RecordVerbButton, type RecordNotice } from "./record-blocks";
import { stageGateVerdict, type StageConditionState } from "./stage-gate-verdict";

/** One precondition of a {@link StageGate}'s command. */
export interface StageCondition {
  readonly key: string;
  readonly label: string;
  readonly state: StageConditionState;
  /** Why it stands where it does, in one sentence. */
  readonly detail?: string;
  /** The tab or screen that fills an unmet condition; offered on unmet conditions only. */
  readonly go?: { readonly label: string; readonly onClick: () => void };
}

/** Props for {@link StageGate}. */
export interface StageGateProps {
  /** The next command; disabled until every condition is met. */
  readonly command: { readonly label: string; readonly onRun: () => void };
  /** The preconditions, in the order the lifecycle declares them. */
  readonly conditions: readonly StageCondition[];
}

const CONDITION_TONE: Record<StageConditionState, RecordNotice["tone"]> = {
  met: "success",
  unmet: "info",
  // The same warning tone as an interpretation-held card, so a held rule reads the same everywhere.
  held: "warning",
};

/**
 * What still stands between a record and its next command, condition by condition, with the way
 * to fill each unmet one and the command itself.
 *
 * <p><b>Met, unmet and held are three facts.</b> An unmet condition is work somebody can do now,
 * so it carries the link to where it is done; a held one waits on an interpretation, so it is drawn
 * in the warning tone and offers no link. Both keep the command disabled (see
 * {@link stageGateVerdict}). Once everything is met the list folds away and only the command stays.
 */
export function StageGate({ command, conditions }: StageGateProps) {
  const { t } = useTranslation(`${PACKAGE_NAMESPACE}/features`);
  const verdict = stageGateVerdict(conditions);
  const reason =
    verdict.blockedBy === "unmet"
      ? t("stageGate.blockedUnmet", { count: verdict.unmet })
      : verdict.blockedBy === "held"
        ? t("stageGate.blockedHeld", { count: verdict.held })
        : undefined;
  const button = <RecordVerbButton verb={{ label: command.label, kind: "primary", onClick: command.onRun, disabled: reason }} />;

  if (verdict.enabled) return <Flex justify="end">{button}</Flex>;

  const notices: RecordNotice[] = conditions.map((condition) => ({
    key: condition.key,
    tone: CONDITION_TONE[condition.state],
    title: t("stageGate.item", { state: t(`stageGate.state.${condition.state}`), label: condition.label }),
    body: condition.detail,
    action: condition.state === "unmet" && condition.go ? condition.go : undefined,
  }));

  return (
    <Stack gap="sm">
      <StatePanel
        size="sm"
        title={t("stageGate.title", { command: command.label })}
        description={t("stageGate.summary", { met: verdict.met, unmet: verdict.unmet, held: verdict.held })}
        action={button}
      />
      <RecordNotices notices={notices} />
    </Stack>
  );
}
