import { useTranslation } from "@simplix-react/i18n/react";
import { Button, Popover, PopoverContent, PopoverTrigger } from "@simplix-react/ui";
import { slotAttributes } from "@simplix-react/ui/design";
import { Copy, Maximize2 } from "lucide-react";
import type { MouseEvent } from "react";

import { useCopyToClipboard } from "../clipboard/use-copy-to-clipboard";
import { MonoBlock } from "../notice/mono-block";

import { PACKAGE_NAMESPACE } from "./locales";
import { recordExcerptStyle, recordExcerptTextStyle } from "./record-excerpt.style";

/** The first line of a message, which is what a cell has room for. */
export function excerptLine(text: string): string {
  const first = text.split(/\r?\n/, 1)[0] ?? "";
  return first.trim();
}

/**
 * A machine message (an error, an error code, a stored reason) in one monospaced line, with a
 * control that copies it whole and one that shows it whole.
 *
 * <p>Neither press reaches the row beneath it, so reading an error in a list does not open the
 * record it belongs to.
 */
export function RecordExcerpt({ text }: { readonly text: string }) {
  const { t } = useTranslation(PACKAGE_NAMESPACE + "/features");
  const copy = useCopyToClipboard();
  const line = excerptLine(text);
  const stop = (event: MouseEvent) => event.stopPropagation();
  return (
    <span {...slotAttributes(recordExcerptStyle, {})}>
      <span title={text} {...slotAttributes(recordExcerptTextStyle, {})}>
        {line}
      </span>
      <Button type="button" variant="ghost" size="icon-xs" aria-label={t("recordValue.copy")} onClick={(event) => { stop(event); void copy(text); }}>
        <Copy />
      </Button>
      <Popover>
        <PopoverTrigger asChild>
          <Button type="button" variant="ghost" size="icon-xs" aria-label={t("recordValue.showWhole")} onClick={stop}>
            <Maximize2 />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-96" onClick={stop}>
          <MonoBlock className="w-full">{text}</MonoBlock>
        </PopoverContent>
      </Popover>
    </span>
  );
}
