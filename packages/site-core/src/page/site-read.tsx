import type { ReactNode } from "react";

import { SiteCaption } from "./site-bits";

/** The part of a read a region draws from: its answer, once there is one, and whether it failed. */
export interface SiteReadState<T> {
  readonly data: T | undefined;
  readonly isError: boolean;
}

/** Props for {@link SiteRead}. */
export interface SiteReadProps<T> {
  /** The read the region draws, a query result or several folded into one. */
  readonly read: SiteReadState<T>;
  /** What the region says when the read failed, drawn as a caption in its place. */
  readonly failed: ReactNode;
  /** Whether the answer holds nothing to draw; with `empty`, the region says so instead. */
  readonly isEmpty?: (data: T) => boolean;
  /** What the region says when the answer holds nothing, drawn as a caption. */
  readonly empty?: ReactNode;
  /** The region drawn from the answer. */
  readonly children: (data: T) => ReactNode;
}

/**
 * One region drawn from a read, in the order every site region answers it: the failure first, then
 * nothing at all while the first answer is on its way (no empty table or zero series flashes before
 * the figures arrive), then the empty sentence, then the region itself. A read that keeps its last
 * answer while it asks again (`placeholderData`) goes on drawing it.
 */
export function SiteRead<T>({ read, failed, isEmpty, empty, children }: SiteReadProps<T>) {
  if (read.isError) return <SiteCaption>{failed}</SiteCaption>;
  if (read.data === undefined) return null;
  if (empty !== undefined && isEmpty?.(read.data) === true) return <SiteCaption>{empty}</SiteCaption>;
  return <>{children(read.data)}</>;
}
