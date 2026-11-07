import { TriangleAlertIcon } from "lucide-react";
import { useTranslation } from "@simplix-react/i18n/react";
import { AlertBanner, Button } from "@simplix-react/ui";

import { PACKAGE_NAMESPACE } from "./locales";
import { useSelfAccessRefusal, type SelfAccessRefusal } from "./self-access";

/**
 * Whether a refusal of the operator's own permissions read is told on the page: any refusal but a
 * sign-in one, which the sign-in flow already answers.
 *
 * @param refusal how the server last refused the read, or null while it answers
 */
export function selfAccessRefusalIsTold(refusal: SelfAccessRefusal | null): boolean {
  return refusal !== null && refusal.status !== 401;
}

/**
 * The warning under the page header while the operator's own permissions read is refused or fails.
 *
 * <p>Every control and card the console gates on a permission is drawn only for a reader who holds
 * it, so with the read failing a screen is drawn empty, which reads as an account that has nothing.
 * The notice says the read failed and offers the reload that makes it again. A refusal the app
 * names a page for replaces the shell and never reaches this.
 */
export function SelfAccessNotice() {
  const { t } = useTranslation(`${PACKAGE_NAMESPACE}/chrome`);
  const refusal = useSelfAccessRefusal();
  if (!selfAccessRefusalIsTold(refusal)) return null;
  return (
    <AlertBanner
      tone="warning"
      icon={TriangleAlertIcon}
      title={t("selfAccess.title")}
      subtitle={t("selfAccess.hint")}
      bordered
      trailing={
        <Button size="sm" variant="outline" onClick={() => window.location.reload()}>
          {t("selfAccess.reload")}
        </Button>
      }
    />
  );
}
