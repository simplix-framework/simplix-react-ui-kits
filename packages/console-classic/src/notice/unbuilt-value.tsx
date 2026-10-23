import { ClockIcon } from "lucide-react";
import { useTranslation } from "@simplix-react/i18n/react";
import {
  Flex,
  Icon,
  Text,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@simplix-react/ui";

interface UnbuiltValueProps {
  /** What the cell says in place of the value — 「판정 전」, 「아직 없음」. */
  readonly label: string;
  /** Why nothing answered, for the tooltip. Defaults to the shell's own sentence. */
  readonly reason?: string;
}

/**
 * A value nobody has worked out yet, as one cell.
 *
 * <p><b>The third member of the family, and it exists so the meaning has one glyph.</b>
 * {@link UnbuiltAction} marks a control that leads nowhere yet and `UnbuiltTab` marks a pane with
 * nothing behind it; this marks the same thing in the place a value would stand. Written inline by
 * each screen instead, the clock ends up a different size on each one and a reader who has learned
 * to recognise it in a header has to learn it again in a table.
 *
 * <p><b>Not an empty cell and not a zero.</b> A blank reads as 「this one is fine」 or as a screen
 * that failed to load, and a `0` claims somebody counted and found none. The claim being made here
 * is that nobody has been asked.
 *
 * <p><b>Not the same thing as a value the reader may not see.</b> A field their grant does not
 * reach is off the projection entirely rather than marked; this is only for what is not built yet.
 */
export function UnbuiltValue({ label, reason }: UnbuiltValueProps) {
  const { t } = useTranslation("common");

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Flex gap="xs" align="center">
          <ClockIcon className="size-3.5 opacity-50" />
          <Text size="caption" tone="muted">
            {label}
          </Text>
        </Flex>
      </TooltipTrigger>
      <TooltipContent>{reason ?? t("shell.nav.notBuilt")}</TooltipContent>
    </Tooltip>
  );
}
