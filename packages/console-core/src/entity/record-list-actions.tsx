import { type ReactNode, useCallback } from "react";
import { type ActionType, type RowActionDef, addToast } from "@simplix-react/ui";
import {
  Check,
  CirclePause,
  CirclePlay,
  CircleX,
  FlaskConical,
  Power,
  PowerOff,
  RefreshCw,
  RotateCcw,
  ShieldOff,
  TimerReset,
  Upload,
  Wallet,
  WalletCards,
  X,
} from "lucide-react";
import { useTranslation } from "@simplix-react/i18n/react";

import { PACKAGE_NAMESPACE } from "./locales";
import type { RecordAction, RecordOutcome, RecordVerbType } from "./record-list-types";

const VERB_GLYPHS: Record<RecordVerbType, { readonly type: ActionType; readonly icon: ReactNode }> = {
  retry: { type: "view", icon: <RotateCcw /> },
  reset: { type: "view", icon: <TimerReset /> },
  test: { type: "view", icon: <FlaskConical /> },
  reprocess: { type: "view", icon: <RefreshCw /> },
  enable: { type: "view", icon: <Power /> },
  disable: { type: "view", icon: <PowerOff /> },
  suspend: { type: "view", icon: <CirclePause /> },
  reinstate: { type: "view", icon: <CirclePlay /> },
  // `cancel` stops work that has not run; `revoke` takes access back, which the pause glyph of
  // `suspend` does not say; `upload` sends a file the record then holds.
  cancel: { type: "view", icon: <CircleX /> },
  revoke: { type: "view", icon: <ShieldOff /> },
  upload: { type: "view", icon: <Upload /> },
  // `grant` gives the record's owner something it is owed (credits for a payment), drawn with the
  // wallet the credit screens open an account with.
  grant: { type: "view", icon: <Wallet /> },
  // `adjust` changes an account's balance by an amount the operator states: a wallet of its own
  // beside `grant`'s, since the pencil of `edit` would read as editing the account itself.
  adjust: { type: "view", icon: <WalletCards /> },
  // `approve` and `reject` are the two answers to a request that waits for a decision (a refund, a
  // grant): a check and a cross, so the pair reads as one choice beside `cancel`'s circled cross.
  approve: { type: "view", icon: <Check /> },
  reject: { type: "view", icon: <X /> },
};

/**
 * Reports what an action did in a toast, with 「실행 취소」 when it can be taken back.
 *
 * @param outcome what changed and how to restore it
 * @param undoLabel the undo button's wording
 */
export function announceOutcome(outcome: RecordOutcome, undoLabel: string): void {
  addToast({
    type: outcome.tone ?? "success",
    message: outcome.message,
    action: outcome.undo ? { label: undoLabel, run: outcome.undo } : undefined,
  });
}

/**
 * {@link announceOutcome} in the reader's language: what a screen calls once an action that asked
 * first (a dialog) has run.
 */
export function useAnnounceOutcome(): (outcome: RecordOutcome) => void {
  const { t } = useTranslation(PACKAGE_NAMESPACE + "/features");
  return useCallback((outcome: RecordOutcome) => announceOutcome(outcome, t("recordList.undo")), [t]);
}

/** What one row action takes in the action cell, the cell's own inset included once. */
export const ACTION_WIDTH = 36;

export const ACTION_CELL_INSET = 24;

/** Per character and per button inset of a labelled row action, for the action column's width. */
const LABEL_CHAR_WIDTH = 13;

const LABEL_BUTTON_INSET = 20;

const LABEL_GAP = 8;

/**
 * Whether the row actions must carry their labels. An icon stands for the action's type, so two
 * actions drawing the type's own icon for one type would show the same glyph for different verbs;
 * then every action is a labelled button instead, which the region contract refuses: give the
 * second verb its own icon. An action carrying its own icon is distinct by that icon and never forces labels.
 */
export function actionsNeedLabels(actions: readonly { readonly type: string | ((row: never) => string); readonly icon?: unknown }[]): boolean {
  // A type read from the row draws a kit verb's glyph, which is its own.
  const typeGlyphs = actions
    .filter((action) => (action.icon === undefined || action.icon === null) && typeof action.type === "string" && !(action.type in VERB_GLYPHS))
    .map((action) => action.type as string);
  return new Set(typeGlyphs).size < typeGlyphs.length;
}

/**
 * The framework type and glyph an action draws with: a kit verb maps to its own glyph. A type read
 * from the row maps to the glyph of the verb it answers for that row.
 */
export function actionGlyph<Row = never>(action: {
  readonly type: ActionType | RecordVerbType | ((row: Row) => RecordVerbType);
  readonly icon?: ReactNode;
}): { type: ActionType; icon?: ReactNode | ((row: Row) => ReactNode) } {
  const { type } = action;
  if (typeof type === "function") {
    return { type: "view", icon: (row: Row) => action.icon ?? VERB_GLYPHS[type(row)].icon };
  }
  if (type in VERB_GLYPHS) {
    const verb = VERB_GLYPHS[type as RecordVerbType];
    return { type: verb.type, icon: action.icon ?? verb.icon };
  }
  return { type: type as ActionType, icon: action.icon };
}

/** The type an action has on this row: its own, or the one it reads from the row. */
export function actionTypeFor<Row>(action: Pick<RecordAction<Row>, "type">, row: Row): ActionType | RecordVerbType {
  return typeof action.type === "function" ? action.type(row) : action.type;
}

/** The label an action carries on this row: its own, or the one it reads from the row. */
export function actionLabelFor<Row>(action: Pick<RecordAction<Row>, "label">, row: Row): string {
  return typeof action.label === "function" ? action.label(row) : action.label;
}

/**
 * A {@link RecordAction} as the framework's row action, shared by every kit part that draws one so
 * the list, the tree and the row dialog read a row-dependent label and type the same way.
 */
export function toRowAction<Row>(action: RecordAction<Row>): RowActionDef<Row> {
  return {
    ...actionGlyph(action),
    label: action.label,
    onClick: (row: Row) => action.onClick?.(row),
    disabled: action.disabled ? (row: Row) => Boolean(action.disabled?.(row)) : undefined,
    disabledReason: action.disabled ? (row: Row) => action.disabled?.(row) || undefined : undefined,
  };
}

/** The action column's width when every action is a labelled button. */
export function labelledActionWidth(labels: readonly string[]): number {
  const buttons = labels.reduce((sum, label) => sum + label.length * LABEL_CHAR_WIDTH + LABEL_BUTTON_INSET, 0);
  return buttons + Math.max(labels.length - 1, 0) * LABEL_GAP + ACTION_CELL_INSET;
}
