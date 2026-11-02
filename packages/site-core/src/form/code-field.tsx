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
}

/**
 * A one-time code entered one digit per square cell. Typing, Backspace, the arrows, a paste and an
 * autofill are the framework `CodeInput`'s; the kit draws the row and the cells.
 */
export function CodeField({ value, onValueChange, onComplete, label, length, invalid = false, disabled, cellLabel }: CodeFieldProps) {
  return (
    <CodeInput
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
