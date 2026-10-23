import type { ReactNode } from "react";
import { inertLabelStyle } from "./inert-label.style";
import { slotAttributes } from "@simplix-react/ui/design";

/**
 * The body of a `Button` that is standing inert rather than carrying a `Link`.
 *
 * <p><b>Why a component and not a bare `span`.</b> A button drawn with `asChild` hands its own
 * layout to the single child it wraps, so the child is what lays the glyph and the words out in a
 * row. Swap the `Link` for a plain `span` when the reader may not go there and that layout goes
 * with it: the span is a block, the glyph and the label stack, and the control grows to two lines
 * while every live button beside it stays on one — the header's baseline visibly breaks. The same
 * pair of branches is written at six call sites, so the row lives here once.
 *
 * <p>Used only in the inert branch. The live branch is the `Link` itself, which the framework's
 * button already styles.
 */
export function InertLabel({ children }: { readonly children: ReactNode }) {
  return <span className="inline-flex items-center whitespace-nowrap" {...slotAttributes(inertLabelStyle, {})}>
      {children}
    </span>;
}
