import { useTranslation } from "@simplix-react/i18n/react";
import { Text, usePageHeader } from "@simplix-react/ui";

/**
 * Where a signed-in operator lands in an app whose own screens are not built yet.
 *
 * <p>The screens are placed by the chapters that draw them, so this carries the shell and says so
 * rather than standing in for a dashboard nobody has designed. A placeholder that looked like a
 * dashboard would be read as one, and the first screen built would then have to argue with it.
 */
export function ShellReadyHome() {
  const { t } = useTranslation("common");
  // The app's purpose is the page's lede, drawn under the title the way every list draws its own;
  // a card holding it reads as a standing message the reader cannot put away (invariant #73).
  usePageHeader({ title: t("app.title"), description: t("home.ready") });

  return (
    <Text size="sm" tone="muted">
      {t("home.screensPending")}
    </Text>
  );
}
