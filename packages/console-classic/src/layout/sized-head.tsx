import type { ReactNode } from "react";
import { TableHead } from "@simplix-react/ui";

interface SizedHeadProps {
  /** The column's width in pixels, for a value of known size — a code, a date, a status. */
  readonly width: number;
  /** The header's label, absent for a column of actions that names nothing. */
  readonly children?: ReactNode;
}

/**
 * A table header cell of a known width.
 *
 * <p><b>Only for a value whose length is bounded</b> — a status, a date, an address, a count. A
 * free-text column takes `FREE_TEXT_MIN_WIDTH` as a floor instead, so the table spends whatever
 * room it has left on the column that can use it.
 *
 * <p><b>Where this belongs is a `width` prop on `TableHead` in `@simplix-react/ui`</b>, beside the
 * one `CrudList.Column` already takes. Its props are the raw `<th>` attributes today, which React
 * drops the deprecated `width` from, so a plain table has no way to size a column except a utility
 * class on every screen that draws one. Until that prop exists this holds the style so no page has
 * to.
 */
export function SizedHead({ width, children }: SizedHeadProps) {
  return <TableHead style={{ width }}>{children}</TableHead>;
}
