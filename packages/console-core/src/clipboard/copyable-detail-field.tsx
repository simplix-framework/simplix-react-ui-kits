import type { ComponentProps } from "react";
import { Button, DetailFieldWrapper, EmptyValue } from "@simplix-react/ui";
import { useTranslation } from "@simplix-react/i18n/react";
import { Copy } from "lucide-react";

import { useCopyToClipboard } from "./use-copy-to-clipboard";
import { PACKAGE_NAMESPACE } from "./locales";
import { copyableFieldStyle } from "./copyable-detail-field.style";
import { slotAttributes } from "@simplix-react/ui/design";

type WrapperProps = ComponentProps<typeof DetailFieldWrapper>;

/** A detail row whose value the reader is expected to carry somewhere else. */
export interface CopyableDetailFieldProps extends Omit<WrapperProps, "children"> {
  /** The value to show, and to put on the clipboard. */
  value: string | null | undefined;
  /** What stands in when there is no value. */
  fallback?: string;
}

/**
 * A read-only detail row with a copy control that works at the address this console is reached
 * at.
 *
 * @remarks
 * Stands in for `DetailFields.DetailTextField ... copyable` — ISSUE #22. That one reaches for
 * `navigator.clipboard.writeText` with nothing around it, and `navigator.clipboard` does not
 * exist outside a secure context: an on-premises console opened at `http://<lan-ip>` has none.
 * The exception is thrown inside the framework's own click handler and reaches nobody, so the
 * control answers a click by doing nothing at all.
 *
 * @remarks
 * Only the copy half is this repository's. The label, layout and size still come from the
 * framework's own {@link DetailFieldWrapper}, so a row swapped over to this component keeps the
 * geometry of every row beside it.
 *
 * @remarks
 * REVERT WHEN FIXED: when `@simplix-react/ui` copies through a route that works outside a secure
 * context — or takes an injected copy implementation — delete this component and put
 * `DetailFields.DetailTextField ... copyable` back at every call site. The check that it is
 * really fixed is the one that found it: open the console at a plain-HTTP LAN address, press a
 * copy control, and confirm both that the value lands on the clipboard and that a failure says
 * so.
 *
 * @param props the value, plus whatever {@link DetailFieldWrapper} takes
 */
export function CopyableDetailField({ value, fallback, ...wrapper }: CopyableDetailFieldProps) {
  const { t } = useTranslation(PACKAGE_NAMESPACE + "/features");
  const copy = useCopyToClipboard();

  const hasValue = value != null && value !== "";

  return (
    <DetailFieldWrapper {...wrapper}>
      <span className="inline-flex min-w-0 items-start" {...slotAttributes(copyableFieldStyle, {})}>
        <span className="min-w-0 break-words">
          {hasValue ? value : <EmptyValue>{fallback}</EmptyValue>}
        </span>
        {hasValue && (
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            // Named rather than left to an icon. The framework's own control labels itself in
            // English whatever the console is set to, which is its own small defect; a row read
            // by a screen reader in Korean should not suddenly speak English.
            aria-label={t("clipboard.copyAction")}
            onClick={() => void copy(value)}
          >
            <Copy />
          </Button>
        )}
      </span>
    </DetailFieldWrapper>
  );
}
