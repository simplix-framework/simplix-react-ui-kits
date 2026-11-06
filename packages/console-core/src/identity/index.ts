// Side-effect: register identity UI translations
import "./locales";

export { cardholderStatusToTone, credentialStatusToTone, scopeGrantStatusToTone } from "./status-tones";
export { accountLockLiftsAt, isAccountLocked, type AccountLockSource } from "./account-lock";
export { AddressFieldset, type AddressFieldsetProps, type AddressFieldsetValues } from "./address-fieldset";
export { getUserAvatarUrl, type UserAvatarSize } from "./avatar-url";
export { publishAvatarDirectory, useAvatarDirectory } from "./avatar-directory";
export { UserAvatar, UserHeading, UserLabel } from "./user-avatar";
export { avatarInitials, avatarTone, AVATAR_TONE_COUNT, InitialsAvatar, type InitialsAvatarProps } from "./initials-avatar";
export { usePermissionGroupName } from "./permission-groups";
export {
  ConsoleProductProvider,
  useConsoleBrand,
  useConsoleSubject,
  type ConsoleProduct,
  type ConsoleProductProviderProps,
} from "./console-product";
export { AdminDestination, type AdminDestinationProps } from "./admin-destination";
export {
  ChangeHistoryTable,
  changeValueLabel,
  FieldEnumsProvider,
  type ChangeValueReaders,
  useChangeHistory,
  useRefreshChangeHistory,
  type ChangeHistoryScope,
} from "./change-history";
export { ChangeHistorySourceProvider, useChangeHistorySource } from "./change-history-source";
export type {
  ChangeHistoryAnswer,
  ChangeHistoryChange,
  ChangeHistoryEvent,
  ChangeHistoryReader,
  ChangeHistoryRequest,
} from "./change-history-source";
export { isLocalAddress, readableAddress } from "./ip-address";
export { ClientAddress, type ClientAddressProps } from "./client-address";
export { AccountStandingBadge, ACCOUNT_STANDING_TONES, useAccountStandingLabel } from "./account-standing";
export type { AccountStandingBadgeProps } from "./account-standing";
export { AuditEventList, type AuditEventListProps, type AuditEventRow } from "./audit-event-list";
