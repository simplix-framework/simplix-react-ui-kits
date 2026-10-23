import type { ReactNode } from "react";
import { Badge, Button } from "@simplix-react/ui";

/** Props for {@link CountedIconButton}. */
export interface CountedIconButtonProps {
  /** How many are waiting. At zero the count is not drawn at all. */
  readonly count: number;
  /** What the control is called, for a reader who is not looking at the glyph. */
  readonly label: string;
  /** What pressing it does. */
  readonly onClick: () => void;
  /** The glyph. */
  readonly children: ReactNode;
}

/**
 * A glyph button with a count pinned to its corner.
 *
 * <p><b>It is one component because the pair cannot be split.</b> A pinned count needs a positioned
 * ancestor and an offset measured against it, and neither `Button` nor `Badge` names either — so
 * written at the call site the two halves sit on different elements with nothing saying they belong
 * together. Either half can then be edited alone: drop the positioning and the count leaves for the
 * corner of the window, change the button's size and the offset is measured against a box it was
 * not chosen for, and neither shows up in a build.
 *
 * <p><b>The chrome's own shape is not a prop.</b> The button is quiet and glyph-sized and the count
 * is destructive-red, because a count pinned to a mark in the chrome means 「this is waiting for
 * you」; a caller that wanted another shape would be asking for a different control.
 */
export function CountedIconButton({ count, label, onClick, children }: CountedIconButtonProps) {
  return (
    <Button
      variant="ghost"
      size="icon-sm"
      onClick={onClick}
      aria-label={label}
      className="relative"
    >
      {children}
      {count > 0 && (
        <Badge
          variant="destructive"
          size="sm"
          rounded="full"
          className="absolute -right-0.5 -top-0.5"
        >
          {count}
        </Badge>
      )}
    </Button>
  );
}
