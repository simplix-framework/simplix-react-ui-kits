import { Moon, Sun } from "lucide-react";
import { Button, cn } from "@simplix-react/ui";
import { useTranslation } from "@simplix-react/i18n/react";
import { useTheme } from "./use-theme";
import { PACKAGE_NAMESPACE } from "./locales";

export interface DarkModeToggleProps {
  /**
   * Utility classes carrying the surface this toggle sits on. The login screen sits on the
   * page background and needs none; the sidebar passes its own hover tokens, because the
   * ghost button's default hover paints the page's accent onto the sidebar surface.
   */
  className?: string;
}

const ENTER = "size-4 animate-in spin-in-90 zoom-in-75 fade-in-0";

/**
 * The light/dark glyph: the sun while dark (the way out), the moon while light. Keyed by the scheme,
 * so the incoming glyph turns in rather than swapping on one frame.
 */
export function ThemeGlyph({ dark }: { readonly dark: boolean }) {
  return dark ? <Sun key="sun" className={ENTER} /> : <Moon key="moon" className={ENTER} />;
}

/** Switches between the light and dark colour scheme. */
export function DarkModeToggle({ className }: DarkModeToggleProps) {
  const { isDark, toggleDarkMode } = useTheme();
  const { t } = useTranslation(PACKAGE_NAMESPACE + "/chrome");

  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn("h-8 w-8", className)}
      aria-label={t("theme.darkMode")}
      onClick={toggleDarkMode}
    >
      <ThemeGlyph dark={isDark} />
    </Button>
  );
}
