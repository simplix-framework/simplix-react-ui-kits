import type { ReactNode } from "react";
import { useCan } from "@simplix-react/access/react";
import { Button, MenuLink } from "@simplix-react/ui";
import { ShieldCogCornerIcon } from "lucide-react";

import { useConsoleSubject } from "./console-product";

/** Props for {@link AdminDestination}. */
export interface AdminDestinationProps {
  /** Which screen it opens, by the key its permission is registered under. */
  readonly subject: string;
  /** The address, already resolved. */
  readonly to: string;
  /** What the control says. */
  readonly children: ReactNode;
  /**
   * How it is drawn.
   *
   * <p>`"button"` for a control in a footer or an action row, `"link"` for a word at the end of a
   * value. Both carry the same mark.
   */
  readonly appearance?: "button" | "link";
  /** The button variant, where the surface it sits on asks for one. */
  readonly variant?: "outline" | "secondary";
}

/**
 * A way into administration from a screen that is not administration.
 *
 * <p><b>Two things go wrong when this is written by hand, and they go wrong together.</b>
 *
 * <p><b>It is drawn for a reader who cannot use it.</b> Every screen behind one of these lives in
 * 시스템·공통, which two of the seven roles reach — so a 경영책임자 pressing 「규칙 보기」 leaves the
 * screen they were working on for one their console has no menu entry for and whose data the
 * server may refuse. The affordance is the promise; the refusal at the other end is not an answer
 * to it. Nine such controls were drawn ungated, on screens whose files called `useCan` nowhere.
 *
 * <p><b>And where it IS drawn, it says nothing about where it goes.</b> 「규칙 보기」 beside a
 * notification reads as a pane on the same screen, not as a trip into the installation's settings
 * — and a reader who did not mean to leave has lost the record they were reading. The mark is what
 * separates a control that stays from one that leaves for administration, and it is the same mark
 * everywhere so it can be learnt once.
 *
 * <p><b>The mark is `shield-cog-corner` — the two halves of what it says.</b> The shield is 「this is
 * behind a permission」 and the cog is 「what it opens is a setting」, and neither alone is the
 * sentence: a plain shield reads as a warning and a plain cog as a control on this screen.
 *
 * <p><b>`view` rather than the verb the destination's own actions need.</b> What this offers is a
 * trip to a screen, and what a screen costs to open is the right to see it; whether the reader may
 * then change anything is that screen's own gate to apply.
 */
export function AdminDestination({
  subject,
  to,
  children,
  appearance = "button",
  variant = "outline",
}: AdminDestinationProps) {
  const may = useCan("view", useConsoleSubject(subject));
  if (!may) return null;

  if (appearance === "link") {
    return (
      <MenuLink href={to} className="inline-flex items-center gap-1 underline-offset-2 hover:underline">
        {children}
        <ShieldCogCornerIcon aria-hidden size={14} className="shrink-0 opacity-70" />
      </MenuLink>
    );
  }

  return (
    <Button asChild variant={variant} size="sm">
      <MenuLink href={to}>
        <ShieldCogCornerIcon aria-hidden size={14} className="shrink-0 opacity-70" />
        {children}
      </MenuLink>
    </Button>
  );
}
