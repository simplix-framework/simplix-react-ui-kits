import type { ReactNode } from "react";
import { useTranslation } from "@simplix-react/i18n/react";
import { Button, Flex, Stack, StepIndicator, Text } from "@simplix-react/ui";
import { Check, X } from "lucide-react";
import { partAttributes, slotAttributes } from "@simplix-react/ui/design";


import { UserAvatar } from "../identity/user-avatar";
import { PACKAGE_NAMESPACE } from "./locales";
import {
  approvalActionsStyle,
  approvalAvatarStyle,
  approvalMarkerStyle,
  approvalRuleStyle,
  approvalStepStyle,
  approvalStepsStyle,
} from "./approval-flow.style";

/** Where one step of a chain stands. */
export type ApprovalStepState = "done" | "now" | "wait" | "reject";

/** One thing the reader can do on the step in hand. */
export interface ApprovalStepAction {
  readonly label: string;
  readonly onClick: () => void;
}

/** One step of a chain of signatures, escalations or hand-offs. */
export interface ApprovalStep {
  /** What the step is called — 「발송」, 「1차 승격」, 「부서장 결재」. */
  readonly key: string;
  /** The step's name as the reader sees it. */
  readonly label: string;
  /** Who the step belongs to. A step without a holder is a step nobody can be chased about. */
  readonly who: ReactNode;
  /** When it happened, or when it will — 「즉시」, 「4분」, 「10분 뒤」. */
  readonly at?: ReactNode;
  /** Where it stands. */
  readonly state: ApprovalStepState;
  /** The holder's photo; the person icon stands in when there is none. */
  readonly avatar?: string;
  /** What the step decided or is waiting on, in the reader's words: 「승인」, 「반려」, 「확인 칸 12개 남음」. */
  readonly result?: ReactNode;
  /** The reason or remark the step left: a rejection's reason, a delegate's 「代」 note. */
  readonly note?: ReactNode;
  /** What the reader can do on the step, shown only on the step in hand; the first is the primary one. */
  readonly actions?: readonly ApprovalStepAction[];
}

/** Props for {@link ApprovalFlow}. */
export interface ApprovalFlowProps {
  /** The chain, in order. */
  readonly steps: readonly ApprovalStep[];
  /** Along one line (the default) or down a rule, for a side column. */
  readonly orientation?: "horizontal" | "vertical";
}

/**
 * Where a record is in a chain, and who it is waiting on.
 *
 * <p><b>Three questions, always answered together</b>: which step it is at, <b>who</b> that step
 * belongs to, and what happens next. A progress bar answers only the first, and whoever has to
 * chase somebody is left to find out who by asking.
 *
 * <p><b>Here rather than in each screen.</b> A hundred and six frames on this board draw this
 * chain — approvals, escalations, reports climbing to an authority — and a copy per screen drifts
 * on exactly the parts a reader uses to read it: which state is tinted, whether the holder is on
 * the step or under it, and whether a rejected step still shows what came after.
 *
 * <p><b>Every step of the chain is drawn, including the ones not reached.</b> A chain cut off at
 * the current step says the record has arrived when it has not, and the steps ahead are what the
 * reader is deciding whether to wait for.
 *
 * @param props the steps in order
 * @returns the rail
 */
export function ApprovalFlow({ steps, orientation }: ApprovalFlowProps) {
  if (orientation === "vertical") return <ApprovalSteps steps={steps} />;
  const indicator = stepIndicatorOf(steps);
  return <StepIndicator steps={indicator.steps} currentStep={indicator.currentStep} rejectedStep={indicator.rejectedStep} orientation={orientation} />;
}

/**
 * The framework step indicator's reading of a chain: each step's name over its holder and time,
 * the step in hand as the current one (every step before it done), and a rejected step marked.
 * A chain with no step in hand and none waiting is done throughout.
 */
export function stepIndicatorOf(steps: readonly ApprovalStep[]): {
  readonly steps: { title: string; description?: string; detail?: ReactNode }[];
  readonly currentStep: number;
  readonly rejectedStep?: number;
} {
  const text = (node: ReactNode) => (typeof node === "string" || typeof node === "number" ? String(node) : "");
  const rejected = steps.findIndex((step) => step.state === "reject");
  const now = steps.findIndex((step) => step.state === "now");
  const waiting = steps.findIndex((step) => step.state === "wait");
  const current = rejected >= 0 ? rejected : now >= 0 ? now : waiting >= 0 ? waiting : steps.length;
  return {
    steps: steps.map((step) => {
      // The holder is drawn with their picture under the title; the second line keeps the time.
      const description = text(step.at);
      const detail = stepDetail(step);
      return { title: step.label, ...(description ? { description } : {}), ...(detail ? { detail } : {}) };
    }),
    currentStep: current,
    ...(rejected >= 0 ? { rejectedStep: rejected } : {}),
  };
}

/** A step's result, remark and actions under its holder; nothing when it has none. */
function stepDetail(step: ApprovalStep): ReactNode {
  return (
    <Stack gap="xs" data-approval-step={step.key} data-state={step.state}>
      {typeof step.who === "string" ? (
        <Flex gap="xs" align="center">
          {/* The holder's photo where one is given, their letters otherwise: the console's one avatar. */}
          <UserAvatar name={step.who} src={step.avatar} decorative className="size-6" {...partAttributes(approvalAvatarStyle, {})} />
          <Text size="caption">{step.who}</Text>
        </Flex>
      ) : (
        step.who
      )}
      {step.result != null ? (
        <Text size="caption" tone={step.state === "reject" ? "destructive" : step.state === "now" ? "primary" : "muted"}>
          {step.result}
        </Text>
      ) : null}
      {step.note != null ? (
        <Text size="caption" tone="muted">
          {step.note}
        </Text>
      ) : null}
      {step.state === "now" && step.actions?.length ? (
        <Flex gap="xs">
          {step.actions.map((action, at) => (
            <Button key={action.label} size="xs" variant={at === 0 ? "default" : "outline"} onClick={action.onClick}>
              {action.label}
            </Button>
          ))}
        </Flex>
      ) : null}
    </Stack>
  );
}

/** The step's state as a word beside its name, coloured only where it matters. */
const STATE_TONE = { done: "muted", now: "primary", wait: "muted", reject: "destructive" } as const;

/** Whether a step names a holder of its own, rather than repeating its own name or naming nobody. */
function holderOf(step: ApprovalStep): ReactNode {
  if (step.who == null || step.who === "") return null;
  if (typeof step.who === "string" && step.who.trim() === step.label.trim()) return null;
  return step.who;
}

/**
 * The chain down a side column as a stepper with no boxes: a marker on a rule per step, the step's
 * name and state on its first line, its holder and time on the second, about 40px a step.
 *
 * <p>A step with no holder of its own draws no holder line, rather than its name a second time. The
 * step in hand is set on a soft ground and carries the reader's actions. The column ends with room
 * for the window's status bar, so the last step is never under it.
 */
function ApprovalSteps({ steps }: { readonly steps: readonly ApprovalStep[] }) {
  const { t } = useTranslation(`${PACKAGE_NAMESPACE}/flow`);
  return (
    <ol className="flex flex-col" {...slotAttributes(approvalStepsStyle, {})}>
      {steps.map((step, index) => {
        const holder = holderOf(step);
        const last = index === steps.length - 1;
        return (
          <li
            key={step.key}
            data-approval-step={step.key}
            aria-current={step.state === "now" ? "step" : undefined}
            className="relative flex"
            {...slotAttributes(approvalStepStyle, { state: step.state })}
          >
            {last ? null : (
              // raw layout: the rule joining this marker to the next.
              <span aria-hidden className="absolute left-[19px] top-8 bottom-[-6px] w-px" {...slotAttributes(approvalRuleStyle, { done: step.state === "done" })} />
            )}
            {/* raw layout: the round step marker. */}
            <span className="relative z-[1] inline-flex size-6 shrink-0 items-center justify-center" {...slotAttributes(approvalMarkerStyle, { state: step.state })}>
              {step.state === "done" ? <Check className="size-3.5" /> : step.state === "reject" ? <X className="size-3.5" /> : index + 1}
            </span>
            <Stack gap="none" className="min-w-0 flex-1">
              <Flex gap="sm" align="baseline" justify="between">
                <Text size="sm" weight={step.state === "now" ? "semibold" : "medium"} tone={step.state === "wait" ? "muted" : "default"} className="min-w-0">
                  {step.label}
                </Text>
                <Text as="span" size="caption" tone={STATE_TONE[step.state]} className="shrink-0">
                  {t(`state.${step.state}`)}
                </Text>
              </Flex>
              {holder != null || step.at ? (
                <Text size="caption" tone="muted" className="min-w-0">
                  {[holder, step.at].filter((part) => part != null && part !== "").map((part, at) => (
                    <span key={at}>
                      {at > 0 ? " · " : null}
                      {part}
                    </span>
                  ))}
                </Text>
              ) : null}
              {step.result != null && !(step.state === "now" && step.result === undefined) ? (
                <Text size="caption" tone={step.state === "reject" ? "destructive" : step.state === "now" ? "primary" : "muted"}>
                  {step.result}
                </Text>
              ) : null}
              {step.note != null ? (
                <Text size="caption" tone="muted">
                  {step.note}
                </Text>
              ) : null}
              {step.state === "now" && step.actions?.length ? (
                <Flex gap="xs" {...partAttributes(approvalActionsStyle, {})}>
                  {step.actions.map((action, at) => (
                    <Button key={action.label} size="xs" variant={at === 0 ? "default" : "outline"} onClick={action.onClick}>
                      {action.label}
                    </Button>
                  ))}
                </Flex>
              ) : null}
            </Stack>
          </li>
        );
      })}
    </ol>
  );
}
