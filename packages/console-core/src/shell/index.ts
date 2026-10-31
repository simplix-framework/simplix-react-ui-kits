// Side-effect: register the chrome's own translations
import "./locales";

export { ChromeControlRows, type ChromeControlRowsProps } from "./chrome-control-rows";
export { DarkModeToggle, ThemeGlyph, type DarkModeToggleProps } from "./dark-mode-toggle";
export { ChromeToolButton, type ChromeToolButtonProps } from "./chrome-tool-button";
export { LocalePicker, type LocalePickerProps } from "./locale-picker";
export { COLOR_THEMES, type ColorThemeConfig, useTheme } from "./use-theme";
export { DisplaySettings } from "./display-settings";
export {
  applyFill,
  resolveFill,
  useAppliedFill,
  useDisplayPreferences,
  type CardFill,
  type Density,
  type DisplayPreferences,
} from "./display-preferences";
export { CONSOLE_CLARITY_DESIGN, CONSOLE_DESIGNS, ConsoleDesignContext, useConsoleDesign } from "./console-design";
export { ConsoleContextProvider, useConsole } from "./console-context";
export {
  ConsoleAreaSwitch,
  type ConsoleArea,
  type ConsoleAreaSwitchProps,
} from "./area-switch";
export {
  ConsoleBarSearch,
  ConsoleCommandPalette,
  ConsoleKeyCap,
  ConsoleShortcutList,
  type ConsoleBarSearchProps,
  type ConsoleCommand,
  type ConsoleCommandGroup,
  type ConsoleCommandPaletteProps,
  type ConsoleKeyCapProps,
  type ConsoleShortcut,
  type ConsoleShortcutListProps,
} from "./command-palette";
export { useConsoleHotkeys, CHORD_WINDOW_MS, type ConsoleHotkeyActions } from "./console-hotkeys";
export { CountedIconButton, type CountedIconButtonProps } from "./counted-icon-button";
export { ConsoleWindow, type ConsoleWindowProps } from "./console-window";
export {
  ConsoleStatusStrip,
  ConsoleTopBar,
  type ConsoleStatusSegment,
  type ConsoleStatusStripProps,
  type ConsoleTopBarAccount,
  type ConsoleTopBarNotifications,
  type ConsoleTopBarProps,
  type ConsoleTopBarRegion,
} from "./console-top-bar";
export { ConsoleContentColumn, type ConsoleContentColumnProps } from "./content-column";
export { ConsolePreviewFrame, type ConsolePreviewFrameProps } from "./console-preview-frame";
export type {
  ConsolePreviewChrome,
  ConsolePreviewChromeLabels,
  ConsolePreviewMenu,
  ConsolePreviewMenuEntry,
  ConsolePreviewMenuGroup,
  ConsolePreviewStatus,
  ConsolePreviewStatusSegment,
} from "./preview-chrome";
export {
  ConsoleMenuBranch,
  ConsoleMenuBranchRow,
  ConsoleMenuColumn,
  ConsoleMenuFlyout,
  ConsoleMenuGlyph,
  ConsoleMenuInactiveRow,
  ConsoleMenuLinkRow,
  ConsoleMenuRail,
  ConsoleMenuRailButton,
  ConsoleMenuFold,
  ConsoleMenuSlot,
  type ConsoleMenuRailButtonProps,
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
  ConsolePhoneMenuSection,
  ConsolePhoneMenuSheet,
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
  type ConsolePhoneMenuSheetProps,
  type ConsolePhoneShellProps,
  type ConsolePhoneTab,
} from "./phone-shell";
export {
  PlainConsoleShell,
  createPlainConsoleRoot,
  type PlainConsoleShellProps,
} from "./plain-shell";
export { ShellReadyHome } from "./shell-ready-home";
export { ConsoleProviders, type ConsoleProvidersProps, type UIDefaults } from "./console-providers";
export { createConsoleQueryClient, isSessionExpiry } from "./query-client";
export { guarded } from "./guarded-route";
export { RouteErrorFallback } from "./route-error";
export { useSidebarCollapse, type SidebarCollapse } from "./sidebar-collapse";
export { createRememberMe, type RememberMe } from "@simplix-react/auth";
export { createSelfAccessPolicy, type SelfAccessConfig } from "./self-access";
export type { ConsoleContextValue, ConsoleSite } from "./console-context";
