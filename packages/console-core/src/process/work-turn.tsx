import { useTranslation } from "@simplix-react/i18n/react";
import { Button, Flex, Stack, Text } from "@simplix-react/ui";
import { partAttributes, slotAttributes } from "@simplix-react/ui/design";
import { LocateFixedIcon } from "lucide-react";

import { PACKAGE_NAMESPACE } from "./locales";
import { workTurnLabelStyle, workTurnStyle } from "./work-window.style";

/** Another way a piece of work can go from the step in hand: sent back, taken ahead, or ended. */
export interface WorkChoice {
  readonly key: string;
  readonly label: string;
  readonly onChoose: () => void;
  /** Why the reader cannot take this way now; the choice is drawn disabled with this reason. */
  readonly disabledReason?: string;
}

/** Whose turn a piece of work is at, and what that person does next. */
export interface WorkTurn {
  /** The reader's own turn, somebody else's, or none because the work is finished. */
  readonly state: "mine" | "waiting" | "finished";
  /** What is done next, in the reader's words: the act's name. */
  readonly label: string;
  /** Who holds the turn. */
  readonly holder?: string;
  /** What the act needs or is waiting for. */
  readonly hint?: string;
  /** The button that opens the screen the act is done on; drawn on the reader's own turn. */
  readonly action?: { readonly label: string; readonly onAct: () => void; readonly disabledReason?: string };
  /** Shows the step in hand: its screen, and its place among the steps. Drawn as a button while the work is not finished. */
  readonly onShow?: () => void;
  /** The other ways out of the step in hand. */
  readonly choices?: readonly WorkChoice[];
}

/**
 * The card that says whose turn it is. On the reader's own turn it carries the button that opens
 * the screen the act is done on; the act itself is never done here.
 */
export function WorkTurnCard({ turn }: { readonly turn: WorkTurn }) {
  const { t } = useTranslation(`${PACKAGE_NAMESPACE}/work`);
  const choices = turn.choices ?? [];
  const show = turn.state === "finished" ? undefined : turn.onShow;
  return (
    <section data-work-turn={turn.state} {...partAttributes(workTurnStyle, { state: turn.state })}>
      <Stack gap="sm">
        <Stack gap="none">
          <span {...slotAttributes(workTurnLabelStyle, { state: turn.state })}>{t(turn.state)}</span>
          <Text size="sm" weight="semibold">
            {turn.label}
          </Text>
          {turn.holder ? (
            <Text size="caption" tone="muted">
              {t("holder")} · {turn.holder}
            </Text>
          ) : null}
          {turn.hint ? (
            <Text size="caption" tone="muted">
              {turn.hint}
            </Text>
          ) : null}
        </Stack>
        {turn.action || show || choices.length > 0 ? (
          <Flex gap="sm" wrap align="center">
            {turn.action ? (
              <Button size="sm" onClick={turn.action.onAct} disabled={turn.action.disabledReason !== undefined} title={turn.action.disabledReason}>
                {turn.action.label}
              </Button>
            ) : null}
            {show ? (
              <Button size="sm" variant="outline" onClick={show} data-work-turn-show>
                <LocateFixedIcon aria-hidden className="size-4" />
                {t("current")}
              </Button>
            ) : null}
            {choices.map((choice) => (
              <Button key={choice.key} size="sm" variant="outline" onClick={choice.onChoose} disabled={choice.disabledReason !== undefined} title={choice.disabledReason}>
                {choice.label}
              </Button>
            ))}
          </Flex>
        ) : null}
      </Stack>
    </section>
  );
}
