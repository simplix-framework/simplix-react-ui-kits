/**
 * The editing rules of a one-time code field, kept apart from its drawing so they can be tested
 * without a browser. A code is a string of at most `length` digits; box `i` shows its `i`th digit.
 */

/** What an edit does: the code that results and the box the focus moves to. */
export interface OtpEdit {
  readonly code: string;
  readonly focus: number;
}

/**
 * Writes typed or pasted text into the code from box `index` on. Non-digits are dropped, so a
 * pasted 「204 917」 or 「204-917」 fills six boxes; the focus lands after the last digit written.
 *
 * @param code - The code before the edit.
 * @param index - The box the text was entered in.
 * @param text - What was typed or pasted.
 * @param length - How many digits the code has.
 * @returns The new code and the box to focus, or null when the text holds no digit.
 */
export function otpInsert(code: string, index: number, text: string, length: number): OtpEdit | null {
  const digits = text.replace(/\D/g, "");
  if (!digits) return null;
  // A whole code pasted into any box replaces the code rather than spilling past its end.
  const start = digits.length >= length ? 0 : Math.min(index, code.length);
  const cells = Array.from({ length }, (_, i) => code[i] ?? "");
  const written = digits.slice(0, length - start);
  for (let i = 0; i < written.length; i++) cells[start + i] = written[i] ?? "";
  const next = cells.join("").slice(0, contiguous(cells));
  return { code: next, focus: Math.min(start + written.length, length - 1) };
}

/**
 * Backspace in box `index`: clears that box's digit, or, on an empty box, the one before it, and
 * moves back. Digits after the cleared one shift left so the code stays contiguous.
 *
 * @param code - The code before the edit.
 * @param index - The box Backspace was pressed in.
 * @returns The new code and the box to focus.
 */
export function otpBackspace(code: string, index: number): OtpEdit {
  const target = index < code.length ? index : index - 1;
  if (target < 0) return { code, focus: 0 };
  return { code: code.slice(0, target) + code.slice(target + 1), focus: Math.max(0, index < code.length ? index : target) };
}

/**
 * Where an arrow, Home or End key moves the focus from box `index`, or null for any other key.
 *
 * @param key - The key's `KeyboardEvent.key`.
 * @param index - The focused box.
 * @param length - How many digits the code has.
 */
export function otpMove(key: string, index: number, length: number): number | null {
  switch (key) {
    case "ArrowLeft":
      return Math.max(0, index - 1);
    case "ArrowRight":
      return Math.min(length - 1, index + 1);
    case "Home":
      return 0;
    case "End":
      return length - 1;
    default:
      return null;
  }
}

/** How many leading cells are filled; a code is the digits up to its first gap. */
function contiguous(cells: readonly string[]): number {
  const gap = cells.indexOf("");
  return gap === -1 ? cells.length : gap;
}
