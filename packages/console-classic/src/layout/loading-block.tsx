import { Skeleton } from "@simplix-react/ui";

interface LoadingBlockProps {
  /** How tall the block is, in pixels — the height the content will take when it arrives. */
  readonly height: number;
}

/**
 * A placeholder the size of what is coming.
 *
 * <p><b>Sized to the content rather than left to collapse.</b> A skeleton with no height is a hair
 * line, so the page jumps when the read answers and the reader loses their place; sized, the
 * region is already the right shape and only its content changes.
 *
 * <p><b>Not for a list</b> — the framework's list table draws its own loading rows. This is for the
 * regions that have none: a chart, a matrix, a panel body, a tab.
 */
export function LoadingBlock({ height }: LoadingBlockProps) {
  return <Skeleton className="w-full" style={{ height }} />;
}
