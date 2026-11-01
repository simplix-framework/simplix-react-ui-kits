import { slotAttributes } from "@simplix-react/ui/design";

import { recordExcerptStyle, recordExcerptTextStyle } from "./record-excerpt.style";

/** The first line of a message, which is what a cell has room for. */
export function excerptLine(text: string): string {
  const first = text.split(/\r?\n/, 1)[0] ?? "";
  return first.trim();
}

/**
 * A machine message (an error, an error code, a stored reason) in one monospaced line, its whole
 * text on hover.
 *
 * <p>It draws no control: a value part shows a value, a row's verbs live in its action strip, and
 * copying or reading the whole message is the detail's, where values carry their own copy.
 */
export function RecordExcerpt({ text }: { readonly text: string }) {
  return (
    <span {...slotAttributes(recordExcerptStyle, {})}>
      <span title={text} {...slotAttributes(recordExcerptTextStyle, {})}>
        {excerptLine(text)}
      </span>
    </span>
  );
}
