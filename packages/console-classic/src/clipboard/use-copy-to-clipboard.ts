import { useCallback } from "react";
import { addToast } from "@simplix-react/ui";
import { useTranslation } from "@simplix-react/i18n/react";

import { copyText } from "./copy-text";
import { PACKAGE_NAMESPACE } from "./locales";

/** What a screen may say instead of the shared wording. */
export interface CopyMessages {
  /** Replaces "Copied" — use it where naming the thing copied helps. */
  copied?: string;
}

/**
 * One copy control's behaviour, shared by every screen that has one.
 *
 * @remarks
 * Every copy button in this product answers the same three ways, because they fail for the same
 * reason and the reader needs the same way out of it: a console opened at a plain-HTTP LAN
 * address has no clipboard API, and the value the operator came for is on the screen in front of
 * them either way. The message names that, rather than repeating a browser exception.
 *
 * @remarks
 * The value is repeated into the failure toast so it can be selected there — on a page where the
 * value is masked or revealed behind a control, the toast is the only place it stays put long
 * enough to drag a cursor across.
 *
 * @example
 * ```tsx
 * const copy = useCopyToClipboard();
 * <Button onClick={() => void copy(fingerprint)}>Copy</Button>
 * ```
 *
 * @returns a function that copies a value and reports the outcome to the reader
 */
export function useCopyToClipboard(): (value: string, messages?: CopyMessages) => Promise<boolean> {
  const { t } = useTranslation(PACKAGE_NAMESPACE + "/features");

  return useCallback(
    async (value: string, messages?: CopyMessages) => {
      const outcome = await copyText(value);
      if (outcome === "copied") {
        addToast({ type: "success", message: messages?.copied ?? t("clipboard.copied") });
        return true;
      }
      addToast({
        type: "error",
        message: `${outcome === "unsupported" ? t("clipboard.unsupported") : t("clipboard.failed")} ${t("clipboard.value", { value })}`,
      });
      return false;
    },
    [t],
  );
}
