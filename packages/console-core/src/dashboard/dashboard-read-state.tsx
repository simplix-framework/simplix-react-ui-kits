import type { ReactNode } from "react";
import { AlertBanner } from "@simplix-react/ui";

import { DashboardEmpty, DashboardSkeleton } from "./dashboard-figure";

/** Where a dashboard block's read stands, in the order it is decided. */
export type DashboardReadStage = "failed" | "loading" | "empty" | "ready";

/** Props for {@link DashboardReadState}. */
export interface DashboardReadStateProps {
  /** Whether a read the block needs is still on the way. */
  readonly loading?: boolean;
  /** The sentence the block says when a read it needs failed; absent or false, none failed. */
  readonly failed?: string | false;
  /** The sentence the block says when the reads answered with nothing to draw; absent or false, there is something. */
  readonly empty?: string | false;
  /** How many stand-in rows the skeleton draws while the reads are on the way. */
  readonly rows?: number;
  readonly children: ReactNode;
}

/**
 * Where a block stands: a failure first, since a block that failed one read and waits on another
 * still owes the reader why it will not fill; then the wait; then the empty sentence; then the block.
 *
 * @param state the reads' state as {@link DashboardReadState} takes it
 */
export function dashboardReadStage({ loading, failed, empty }: Pick<DashboardReadStateProps, "loading" | "failed" | "empty">): DashboardReadStage {
  if (failed) return "failed";
  if (loading) return "loading";
  if (empty) return "empty";
  return "ready";
}

/**
 * A dashboard block's body in every state its reads can reach: the skeleton while they are on the
 * way, the block's own failure sentence where one failed (a banner inside the card, so the rest of
 * the dashboard stands), the empty sentence where they answered with nothing, and the block itself.
 * A card never draws blank.
 */
export function DashboardReadState({ loading, failed, empty, rows = 3, children }: DashboardReadStateProps) {
  switch (dashboardReadStage({ loading, failed, empty })) {
    case "failed":
      return <AlertBanner tone="danger" title={failed as string} bordered />;
    case "loading":
      return <DashboardSkeleton rows={rows} />;
    case "empty":
      return <DashboardEmpty>{empty}</DashboardEmpty>;
    default:
      return <>{children}</>;
  }
}
