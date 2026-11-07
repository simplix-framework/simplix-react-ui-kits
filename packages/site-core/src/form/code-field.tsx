import { useEffect, useId } from "react";
import { CodeInput } from "@simplix-react/ui";
import { partAttributes } from "@simplix-react/ui/design";

import { siteCodeCellStyle, siteCodeStyle } from "./form.style";

/** Props for {@link CodeField}. */
export interface CodeFieldProps {
  /** The digits typed so far, from the first cell. */
  readonly value: string;
  readonly onValueChange: (value: string) => void;
  /** Called once with the code when the last cell is filled. */
  readonly onComplete?: (code: string) => void;
  /** The code's name, read for the group of cells. */
  readonly label: string;
  /** How many digits the code has; six by default. */
  readonly length?: number;
  /** The code was refused: every cell draws the heavier bad border. */
  readonly invalid?: boolean;
  readonly disabled?: boolean;
  /** One cell's accessible name in the product's words; the framework's catalogue otherwise. */
  readonly cellLabel?: (position: number, length: number) => string;
  /** The id of the line that says why the code was refused, read with the group while it is refused. */
  readonly describedBy?: string;
  /** The first cell takes the focus when the field mounts, for a page whose one task is the code. */
  readonly autoFocus?: boolean;
}

/** Moves the focus into the first cell of a drawn code row; a row with no cell is left alone. */
export function focusFirstCell(group: Pick<ParentNode, "querySelector"> | null): void {
  group?.querySelector<HTMLInputElement>("input")?.focus();
}

/**
 * A one-time code entered one digit per square cell. Typing, Backspace, the arrows, a paste and an
 * autofill are the framework `CodeInput`'s; the kit draws the row and the cells.
 */
export function CodeField({ value, onValueChange, onComplete, label, length, invalid = false, disabled, cellLabel, describedBy, autoFocus = false }: CodeFieldProps) {
  // The framework input takes no ref; the group is found again by its own id.
  const groupId = useId();
  // On mount, as a native autofocus does; a render with the same flag never pulls the focus back.
  useEffect(() => {
    if (autoFocus) focusFirstCell(document.getElementById(groupId));
  }, [autoFocus, groupId]);
  return (
    <CodeInput
      id={groupId}
      aria-describedby={describedBy}
      {...partAttributes(siteCodeStyle, {})}
      value={value}
      onValueChange={onValueChange}
      onComplete={onComplete}
      label={label}
      length={length}
      invalid={invalid}
      disabled={disabled}
      cellLabel={cellLabel}
      cellAttributes={partAttributes(siteCodeCellStyle, { invalid })}
    />
  );
}
