import type { ReactNode } from "react";
import { cn, Text, type TextProps } from "@simplix-react/ui";

/**
 * How wide the value may grow before it truncates.
 *
 * <p>A scale rather than a measure, so two values capped in the same console are capped at the same
 * widths. Only where the row itself sets no bound: in a table cell or a detail row the cell is the
 * bound and a cap here would fight it.
 */
const MEASURE = {
  sm: "max-w-32",
  md: "max-w-40",
} as const;

interface EllipsisTextProps extends Omit<TextProps, "children" | "as"> {
  /** Merged with the two classes this holds, not replaced by them. */
  readonly className?: string;
  /**
   * How wide the value may grow, where nothing around it decides.
   *
   * <p><b>Truncating needs something to truncate at.</b> In a bar of controls every child is free
   * to take the width its content needs, so a long name pushes the controls beside it off the row
   * and never shortens — the truncation is set and there is no measure for it to bite against.
   */
  readonly maxWidth?: keyof typeof MEASURE;
  /** The value, which may be longer than the space it has. */
  readonly children: ReactNode;
}

/**
 * A value that ends in an ellipsis rather than pushing its row sideways.
 *
 * <p><b>Truncating alone does not truncate inside a flex row.</b> A flex child's minimum size is
 * its content, so a long name widens the row and the cell beside it is squeezed off instead — the
 * text never shortens and the table grows a horizontal scrollbar. The floor has to be released as
 * well, which is the pair this holds.
 *
 * <p>For a value of unbounded length in a cell that must not set the table's width: a name, a
 * label, a reason. A short value of known size does not need it.
 */
export function EllipsisText({ children, className, maxWidth, ...textProps }: EllipsisTextProps) {
  // The caller's class is merged rather than overwritten. Spreading the props and then setting
  // `className` drops whatever was passed, silently — a call that also caps the width
  // (`max-w-40`) then truncates at the full width and the cap does nothing, which looks like the
  // truncation not working rather than like a prop being eaten. `cn` rather than a join, because
  // it also settles a Tailwind conflict in the caller's favour: `whitespace-normal` passed by a
  // cell that wants to wrap has to beat `truncate`, and joined strings leave that to source order.
  return (
    <Text
      as="span"
      {...textProps}
      className={cn("min-w-0 truncate", maxWidth && MEASURE[maxWidth], className)}
    >
      {children}
    </Text>
  );
}
