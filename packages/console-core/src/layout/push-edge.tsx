import type { ReactNode } from "react";
import { slotAttributes } from "@simplix-react/ui/design";

import { pushEndStyle, pushStartStyle } from "./push-edge.style";

/** Props for {@link PushEnd} and {@link PushStart}. */
export interface PushEdgeProps {
  /** The control or text to place. */
  readonly children: ReactNode;
  /** Structure the caller owns, such as `min-w-0`. */
  readonly className?: string;
}

/**
 * Pushes its content to the far end of a row.
 *
 * <p>The wrapper is a flex box so a button inside it stays a flex item rather than becoming a
 * line of text with a strut under it, and the margin sits on the wrapper because the framework's
 * buttons, badges and rows take no margin of their own.
 *
 * @param props the content
 * @returns the wrapper
 */
export function PushEnd({ children, className }: PushEdgeProps) {
  return (
    <div className={className ? `flex ${className}` : "flex"} {...slotAttributes(pushEndStyle, {})}>
      {children}
    </div>
  );
}

/**
 * Keeps its content at the near end of a row while the rest of the row goes to the far end, as a
 * footer does with the one action that is not a way out.
 *
 * @param props the content
 * @returns the wrapper
 */
export function PushStart({ children, className }: PushEdgeProps) {
  return (
    <div className={className ? `flex ${className}` : "flex"} {...slotAttributes(pushStartStyle, {})}>
      {children}
    </div>
  );
}
