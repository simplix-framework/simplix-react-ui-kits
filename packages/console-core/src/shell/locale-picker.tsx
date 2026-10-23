import { Languages } from "lucide-react";
import {
  Button,
  cn,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@simplix-react/ui";
import { useLocalePicker, useTranslation } from "@simplix-react/i18n/react";
import { PACKAGE_NAMESPACE } from "./locales";

export interface LocalePickerProps {
  /**
   * Utility classes carrying the surface this picker sits on. The login screen sits on the
   * page background and needs none; the sidebar passes its own hover tokens, because the
   * ghost button's default hover paints the page's accent onto the sidebar surface.
   */
  className?: string;
}

/**
 * Switches the interface language.
 *
 * <p>The choice is kept in the browser only. The license server holds no operator
 * profile to persist it against, so there is nowhere else to put it.
 */
export function LocalePicker({ className }: LocalePickerProps) {
  const { locale, locales, setLocale } = useLocalePicker();
  const { t } = useTranslation(PACKAGE_NAMESPACE + "/chrome");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn("h-8 w-8", className)}
          aria-label={t("theme.language")}
        >
          <Languages className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>{t("theme.language")}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup value={locale} onValueChange={setLocale}>
          {locales.map((item) => (
            <DropdownMenuRadioItem key={item.value} value={item.value}>
              {item.displayName}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
