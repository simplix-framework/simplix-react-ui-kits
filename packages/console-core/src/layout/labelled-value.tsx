import type { ReactNode } from "react";
import { Stack, Text } from "@simplix-react/ui";

/** Props for {@link LabelledValue}. */
export interface LabelledValueProps {
  /** What the value is called, in the caption above it. */
  readonly label: string;
  /**
   * What it says.
   *
   * <p>A node rather than a string, because half the callers hand it a badge, a link or a figure
   * that carries its own formatting. A plain string still works and renders as body text.
   */
  readonly children: ReactNode;
}

/**
 * A caption over a value, outside a form.
 *
 * <p><b>What a detail panel uses `DetailFieldWrapper` for, in the places that are not one.</b> A
 * summary card, a dialog, a confirmation step — none of them is a field in a record, and none of
 * them should invent its own two-line stack to say 「이것은 이 값이다」. Two screens had written
 * exactly this, one taking a string and one taking a node, which is the shape of drift the
 * screen-component gate exists to catch: nothing compares them, so the day one grows a tone the
 * other does not.
 *
 * @param props the caption and what sits under it
 * @returns the pair
 */
export function LabelledValue({ label, children }: LabelledValueProps) {
  return (
    <Stack gap="none">
      <Text size="caption" tone="muted">
        {label}
      </Text>
      {typeof children === "string" ? <Text>{children}</Text> : children}
    </Stack>
  );
}
