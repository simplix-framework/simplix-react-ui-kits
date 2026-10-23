import type { ReactNode } from "react";

import { Text, cn } from "@simplix-react/ui";

/** Props for {@link Hint}. */
export interface HintProps {
  /** The sentence. */
  children: ReactNode;
  /** Extra classes — spacing only. */
  className?: string;
}

/**
 * The sentence under a heading that says what the thing below it is for.
 *
 * <p>One size and one tone for every such sentence in the console, so a section explains itself
 * the same way on the screen an operator learned it on and on the one they meet next. Written
 * by hand it drifted between `sm` and `caption` from screen to screen, which reads as emphasis
 * where none was meant.
 *
 * <p>For a form field's own note, pass the framework field's `description` prop instead — it
 * belongs to the field, is read out with it, and lines up under the control.
 */
export function Hint({ children, className }: HintProps) {
  return (
    <Text size="sm" tone="muted" className={cn(className)}>
      {children}
    </Text>
  );
}
