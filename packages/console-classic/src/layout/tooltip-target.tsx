import type { ReactNode } from "react";

interface TooltipTargetProps {
  /** The control the tooltip explains — normally a disabled button. */
  readonly children: ReactNode;
}

/**
 * A wrapper that lets a tooltip fire over a control that cannot be hovered.
 *
 * <p><b>A disabled button receives no pointer events</b>, so a tooltip attached to it never opens
 * and the reader is left with a control they cannot press and no reason why — which is the one
 * case where the reason matters most. The wrapper receives the hover instead and carries the
 * default cursor so nothing invites a press.
 */
export function TooltipTarget({ children }: TooltipTargetProps) {
  return <span className="inline-flex cursor-default">{children}</span>;
}
