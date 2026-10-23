import type { ReactNode } from "react";
import { CheckIcon, XIcon } from "lucide-react";
import { Flex, Stack, Text } from "@simplix-react/ui";
import { approvalRailStyle, approvalStepStyle } from "./approval-flow.style";
import { slotAttributes } from "@simplix-react/ui/design";

/** Where one step of a chain stands. */
export type ApprovalStepState = "done" | "now" | "wait" | "reject";

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
}

/** Props for {@link ApprovalFlow}. */
export interface ApprovalFlowProps {
  /** The chain, in order. */
  readonly steps: readonly ApprovalStep[];
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
export function ApprovalFlow({ steps }: ApprovalFlowProps) {
  return (
    // raw layout: a horizontal rail of steps; the framework ships no step-chain primitive
    <div className="flex flex-wrap" role="list" {...slotAttributes(approvalRailStyle, {})}>
      {steps.map((step) => (
        <div
          key={step.key}
          role="listitem"
          className="flex min-w-40 flex-1 items-start"
          {...slotAttributes(approvalStepStyle, { state: step.state })}
        >
          <Flex align="center" justify="center">
            {step.state === "done" && <CheckIcon className="size-4" aria-hidden />}
            {step.state === "reject" && <XIcon className="size-4" aria-hidden />}
          </Flex>
          <Stack gap="none" minSize>
            <Text size="sm">{step.label}</Text>
            <Text as="span" size="caption" tone="muted">
              {step.who}
            </Text>
            {step.at ? (
              <Text as="span" size="caption" tone="muted">
                {step.at}
              </Text>
            ) : null}
          </Stack>
        </div>
      ))}
    </div>
  );
}
