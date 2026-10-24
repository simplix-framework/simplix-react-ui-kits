import type { ReactNode } from "react";
import { StepIndicator } from "@simplix-react/ui";

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
  const indicator = stepIndicatorOf(steps);
  return <StepIndicator steps={indicator.steps} currentStep={indicator.currentStep} rejectedStep={indicator.rejectedStep} />;
}

/**
 * The framework step indicator's reading of a chain: each step's name over its holder and time,
 * the step in hand as the current one (every step before it done), and a rejected step marked.
 * A chain with no step in hand and none waiting is done throughout.
 */
export function stepIndicatorOf(steps: readonly ApprovalStep[]): {
  readonly steps: { title: string; description?: string }[];
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
      const description = [text(step.who), text(step.at)].filter(Boolean).join(" · ");
      return description ? { title: step.label, description } : { title: step.label };
    }),
    currentStep: current,
    ...(rejected >= 0 ? { rejectedStep: rejected } : {}),
  };
}
