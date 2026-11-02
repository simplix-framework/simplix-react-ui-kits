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
export {
  createFederatedSearch,
  searchSource,
  summarizeSearch,
  useFederatedSearch,
  type FederatedSearchController,
  type FederatedSearchGroup,
  type FederatedSearchOptions,
  type FederatedSearchResult,
  type FederatedSearchSource,
  type FederatedSearchState,
  type FederatedSearchStatus,
  type FederatedSearchSummary,
} from "./federated-search";
export { RECENT_LIMIT, parseRecents, useConsoleRecents, withRecent, type ConsoleRecent, type ConsoleRecents } from "./palette-recents";
export { useConsoleSearch, type ConsoleSearch, type ConsoleSearchDestination, type ConsoleSearchOptions } from "./console-search";
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
export {
  ConsoleBandTopBar,
  ConsoleTopBarWindow,
  type ConsoleBandDestination,
  type ConsoleBandTopBarProps,
  type ConsoleTopBarWindowProps,
} from "./top-bar-window";
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
export {
  ConsoleServiceLinks,
  configuredServiceLinks,
  type ConfiguredServiceLink,
  type ConsoleServiceLink,
  type ConsoleServiceLinksLayout,
  type ConsoleServiceLinksProps,
} from "./service-links";
export { AuthLayout } from "./auth-layout";
export { AuthCard, type AuthCardNotice, type AuthCardProps } from "./auth-card";
export { ConsolePageHeader } from "./page-header";
export {
  ConsolePhoneBar,
  ConsolePhoneMenuSection,
  ConsolePhoneMenuSheet,
  ConsolePhoneSearchButton,
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
  type ConsolePhoneBarProps,
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
export { guarded, guardedBy } from "./guarded-route";
export { RouteErrorFallback } from "./route-error";
export { useSidebarCollapse, type SidebarCollapse } from "./sidebar-collapse";
export { createRememberMe, type RememberMe } from "@simplix-react/auth";
export { createSelfAccessPolicy, currentSelfAccessRefusal, useSelfAccessRefusal, type SelfAccessConfig, type SelfAccessRefusal } from "./self-access";
export { refusalScreenFor, useShellRefusalScreen, type ShellRefusalBlocks, type ShellRefusalPages } from "./shell-refusal";
export type { ConsoleContextValue, ConsoleSite } from "./console-context";
