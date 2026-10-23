import { resolveBootEnum } from "@simplix-react-ext/simplix-boot-utils";

/**
 * The label the server sent beside a boot enum, falling back to the constant itself.
 *
 * <p><b>Why not `resolveBootEnum` alone.</b> That reads the `value` — `OPERATING`, `SUBJECT` — which
 * is what a request carries and never what a screen shows. The server already sends the translated
 * word beside it, so a screen that reaches for the value prints an English constant at a Korean
 * reader, and one that translates the value again keeps a second catalogue in step by hand.
 *
 * @param value one `{ type, value, label }` a DTO carries
 * @returns the label, or the constant when the server sent none
 */
export function bootEnumLabel(value: unknown): string {
  if (value && typeof value === "object" && "label" in value) {
    const label = (value as { label?: unknown }).label;
    if (typeof label === "string" && label.length > 0) return label;
  }
  return resolveBootEnum(value);
}
