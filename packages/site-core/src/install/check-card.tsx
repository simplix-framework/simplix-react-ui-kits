import type { ReactNode } from "react";
import { slotAttributes } from "@simplix-react/ui/design";

import { SiteAction, type SiteActionSpec } from "../action/site-action";
import { SiteChip, SiteLive, SiteSpinner } from "../page/site-bits";
import { siteCheckStyle, siteCheckTitleStyle, siteCheckVerdictStyle } from "./install.style";

/** One thing the check read, and whether it meets what is needed. */
export interface SiteCheckFinding {
  readonly key: string;
  readonly label: ReactNode;
  readonly ok: boolean;
}

/** Where a {@link CheckCard} stands: not run yet, running, or done with what it read. */
export type SiteCheckState =
  | { readonly kind: "idle"; readonly ask: ReactNode; readonly action: SiteActionSpec }
  | { readonly kind: "running"; readonly label: ReactNode }
  | {
      readonly kind: "done";
      readonly title: ReactNode;
      readonly findings: readonly SiteCheckFinding[];
      /** What the findings come to; drawn bad when any finding fails. */
      readonly verdict: ReactNode;
    };

/** Props for {@link CheckCard}. */
export interface CheckCardProps {
  readonly state: SiteCheckState;
  /**
   * What a screen reader hears as the check moves on ("Checking this computer", "Ready to
   * install"); the words on the card say the same to the eye.
   */
  readonly status?: ReactNode;
}

/** Whether every finding of a done check meets what is needed. */
export const checkPassed = (findings: readonly SiteCheckFinding[]) => findings.every((finding) => finding.ok);

/**
 * A check of the reader's computer in one row: the question and its action before it runs, a
 * spinner while it runs, then a chip per finding (passed in the good tone, blocked in the bad one)
 * and what they come to.
 */
export function CheckCard({ state, status }: CheckCardProps) {
  return (
    <section {...slotAttributes(siteCheckStyle, {})}>
      <SiteLive>{status}</SiteLive>
      {state.kind === "idle" ? (
        <>
          <b {...slotAttributes(siteCheckTitleStyle, { grow: true })}>{state.ask}</b>
          <SiteAction {...state.action} size="sm" />
        </>
      ) : state.kind === "running" ? (
        <>
          <SiteSpinner />
          <b {...slotAttributes(siteCheckTitleStyle, {})}>{state.label}</b>
        </>
      ) : (
        <>
          <b {...slotAttributes(siteCheckTitleStyle, {})}>{state.title}</b>
          {state.findings.map((finding) => (
            <SiteChip key={finding.key} tone={finding.ok ? "good" : "bad"} dot>
              {finding.label}
            </SiteChip>
          ))}
          <span {...slotAttributes(siteCheckVerdictStyle, { tone: checkPassed(state.findings) ? "good" : "bad" })}>{state.verdict}</span>
        </>
      )}
    </section>
  );
}
