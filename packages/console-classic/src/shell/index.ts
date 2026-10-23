// Side-effect: register the chrome's own translations
import "./locales";

export { ChromeControlRows, type ChromeControlRowsProps } from "./chrome-control-rows";
export { DarkModeToggle, type DarkModeToggleProps } from "./dark-mode-toggle";
export { LocalePicker, type LocalePickerProps } from "./locale-picker";
export { COLOR_THEMES, type ColorThemeConfig, useTheme } from "./use-theme";
export { ConsoleContextProvider, useConsole } from "./console-context";
export {
  ConsoleAreaSwitch,
  type ConsoleArea,
  type ConsoleAreaSwitchProps,
} from "./area-switch";
export { CountedIconButton, type CountedIconButtonProps } from "./counted-icon-button";
export { ConsoleWindow, type ConsoleWindowProps } from "./console-window";
export { ConsoleContentColumn, type ConsoleContentColumnProps } from "./content-column";
export { ConsolePreviewFrame, type ConsolePreviewFrameProps } from "./console-preview-frame";
export {
  ConsoleMenuBranch,
  ConsoleMenuBranchRow,
  ConsoleMenuColumn,
  ConsoleMenuFlyout,
  ConsoleMenuGlyph,
  ConsoleMenuInactiveRow,
  ConsoleMenuLinkRow,
  ConsoleMenuRail,
  type ConsoleMenuBranchProps,
  type ConsoleMenuBranchRowProps,
  type ConsoleMenuColumnProps,
  type ConsoleMenuFlyoutProps,
  type ConsoleMenuGlyphProps,
  type ConsoleMenuInactiveRowProps,
  type ConsoleMenuLinkRowProps,
  type ConsoleMenuRailProps,
} from "./menu-tree";
export { AuthLayout } from "./auth-layout";
export { ConsolePageHeader } from "./page-header";
export {
  ConsolePhoneShell,
  PhoneActionBar,
  PhoneButton,
  PhoneEmptyState,
  PhoneRowButton,
  PhoneScreenBody,
  PhoneScreenColumn,
  PhoneScrollArea,
  PhoneStripScroller,
  TOUCH_TARGET,
  useConsoleOnAPhone,
  type ConsolePhoneTab,
} from "./phone-shell";
export {
  PlainConsoleShell,
  createPlainConsoleRoot,
  type PlainConsoleShellProps,
} from "./plain-shell";
export { ShellReadyHome } from "./shell-ready-home";
export { ConsoleProviders, type ConsoleProvidersProps } from "./console-providers";
export { createConsoleQueryClient, isSessionExpiry } from "./query-client";
export { guarded } from "./guarded-route";
export { RouteErrorFallback } from "./route-error";
export { useSidebarCollapse, type SidebarCollapse } from "./sidebar-collapse";
export { createRememberMe, type RememberMe } from "@simplix-react/auth";
export { createSelfAccessPolicy, type SelfAccessConfig } from "./self-access";
export type { ConsoleContextValue, ConsoleSite } from "./console-context";
