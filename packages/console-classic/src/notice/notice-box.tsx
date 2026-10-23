import type { ReactNode } from "react";

import { Flex, Stack, cn } from "@simplix-react/ui";
import type { ComponentProps } from "react";

/** How loudly a box asks to be read. */
export type NoticeBoxTone = "quiet" | "accent" | "danger";

const TONE_CLASS: Record<NoticeBoxTone, string> = {
  quiet: "border-border bg-muted/40",
  accent: "border-primary/30 bg-primary/5",
  danger: "border-destructive/40 bg-muted/40",
};

/** Props for {@link NoticeBox}. */
export interface NoticeBoxProps {
  /** What the box holds. */
  children: ReactNode;
  /** How loudly it asks to be read. Defaults to `quiet`. */
  tone?: NoticeBoxTone;
  /** Space between the box's own children, as {@link Stack} counts it. */
  gap?: ComponentProps<typeof Stack>["gap"];
  /** Which way the children run. Defaults to `column`; `row` makes the box a bar. */
  direction?: "column" | "row";
  /** Extra classes — layout only; the surface is the component's. */
  className?: string;
}

/**
 * A quiet box that groups supporting content inside a panel.
 *
 * <p>The tinted surface every screen was drawing by hand. It is NOT the tone-carrying notice —
 * something the reader must act on, or a refusal the server gave, goes in the framework's
 * `AlertBanner`, which paints itself by status tone and carries an icon. This one holds what a
 * reader consults: a summary before a confirmation, a fingerprint, a payload, a hint block that
 * would be lost as loose text.
 *
 * <p>`danger` is for the same consulting content when what it holds is destructive — the
 * records a purge is about to take — not for an error message.
 *
 * <p>`direction="row"` lays the children across instead of down, for the cases where the box IS
 * a bar — a selection count with its actions pushed to the far end, a header of columns. Without
 * it those callers stack and their spacers do nothing, which reads as a broken layout rather
 * than as the wrong container.
 */
export function NoticeBox({ children, tone = "quiet", gap = "xs", direction = "column", className }: NoticeBoxProps) {
  const surface = cn("rounded-md border p-3", TONE_CLASS[tone], className);
  return direction === "row" ? (
    <Flex align="center" gap={gap} className={surface}>
      {children}
    </Flex>
  ) : (
    <Stack gap={gap} className={surface}>
      {children}
    </Stack>
  );
}
