import type { ReactNode } from "react";

import { cn } from "@simplix-react/ui";
import { slotAttributes } from "@simplix-react/ui/design";

import { monoBlockStyle } from "./mono-block.style";
import { NoticeBox } from "./notice-box";

/** Props for {@link MonoBlock}. */
export interface MonoBlockProps {
  /** The value, exactly as the server wrote it. */
  children: ReactNode;
  /** How tall it may grow before it scrolls. Defaults to `md`. */
  height?: "sm" | "md" | "lg";
  /** Extra classes — layout only. */
  className?: string;
}

const HEIGHT_CLASS = {
  sm: "max-h-40",
  md: "max-h-60",
  lg: "max-h-64",
} as const;

/**
 * A machine value shown verbatim, for reading and copying.
 *
 * <p>A fingerprint, a request payload, a signed answer. Fixed-width so a character can be
 * compared against another screen, selectable in one gesture because that is what the reader
 * does with it, and scrolling rather than growing so a long payload does not push the buttons
 * under it off the panel.
 */
export function MonoBlock({ children, height = "md", className }: MonoBlockProps) {
  return (
    <NoticeBox
      className={cn(
        "overflow-auto whitespace-pre-wrap break-all select-all",
        HEIGHT_CLASS[height],
        className,
      )}
    >
      <div {...slotAttributes(monoBlockStyle, {})}>{children}</div>
    </NoticeBox>
  );
}
