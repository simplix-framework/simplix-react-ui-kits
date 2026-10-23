import { Flex, Stack, Text } from "@simplix-react/ui";
import { useTranslation } from "@simplix-react/i18n/react";
import { DarkModeToggle } from "./dark-mode-toggle";
import { LocalePicker } from "./locale-picker";
import { PACKAGE_NAMESPACE } from "./locales";

export interface ChromeControlRowsProps {
  /** Utility classes carrying the surface these rows sit on. */
  className?: string;
}

/**
 * The language and colour-scheme controls as named rows.
 *
 * <p>A top bar carries the two as bare icons, which a phone's width has no room for. A sheet or a
 * menu has room for the name instead — and the name is what makes an icon findable by somebody
 * looking for "language" rather than for a glyph they have to recognise first.
 *
 * <p>Same two controls as the bar's, so a narrow width moves them rather than dropping them.
 */
export function ChromeControlRows({ className }: ChromeControlRowsProps) {
  const { t } = useTranslation(PACKAGE_NAMESPACE + "/chrome");

  return (
    <Stack gap="none" className={className}>
      <Flex justify="between" align="center">
        <Text size="sm" tone="muted">
          {t("theme.language")}
        </Text>
        <LocalePicker />
      </Flex>
      <Flex justify="between" align="center">
        <Text size="sm" tone="muted">
          {t("theme.darkMode")}
        </Text>
        <DarkModeToggle />
      </Flex>
    </Stack>
  );
}
