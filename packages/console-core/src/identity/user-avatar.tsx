import { useState } from "react";
import { EllipsisText } from "../layout/ellipsis-text";

import { Flex, Heading, cn } from "@simplix-react/ui";

import { getUserAvatarUrl, type UserAvatarSize } from "./avatar-url";
import { useAvatarDirectory } from "./avatar-directory";
import { userAvatarStyle } from "./user-avatar.style";
import { slotAttributes } from "@simplix-react/ui/design";

/** App-served person-icon placeholder for users without an uploaded profile photo. */
export const DEFAULT_USER_AVATAR_URL = "/images/avatars/default-avatar.svg";

/**
 * Avatar URLs that already failed to load this session. Remembering failures renders the
 * fallback immediately on remount instead of re-requesting and flashing a broken image.
 */
const failedAvatarUrls = new Set<string>();

/**
 * Whether this deployment serves uploaded avatars.
 *
 * The back office has no file-attachment surface, so the public avatar endpoint does not exist
 * and every id-derived URL would 404. Asking anyway costs a request per row and shows a broken
 * image before the fallback lands, so the id path is skipped and an explicit `src` still wins.
 */
const AVATAR_ENDPOINT_AVAILABLE = false;

interface UserAvatarProps {
  /** Accessible name of the user the avatar represents. */
  name: string;
  /**
   * Whether the name is already written beside this avatar.
   *
   * <p>Set wherever the picture sits next to the person's name — a row, a chip, an option in a
   * picker. Read out, the two say the name twice (「정감사 정감사」), and a reader who cannot see the
   * picture is told there are two of them.
   */
  decorative?: boolean;
  /** User account id; when given, the user's uploaded avatar is tried first. */
  userId?: string;
  /** Cache-busting token (e.g. the avatar attachment id), when known. */
  version?: string;
  /** Thumbnail preset requested from the avatar endpoint. */
  size?: UserAvatarSize;
  /** Explicit image URL; takes precedence over `userId`. */
  src?: string;
  className?: string;
}

/**
 * Round user avatar for user-account labels in lists, grids, and dialogs.
 * Prefers the user's uploaded avatar (via the public avatar endpoint) and
 * falls back to the app-wide person-icon placeholder when none exists. When
 * the avatar directory knows the user, its attachment id cache-busts the URL
 * and a known-absent avatar skips the request entirely.
 */
export function UserAvatar({
  name,
  decorative = false,
  userId,
  version,
  size = "sm",
  src,
  className,
}: UserAvatarProps) {
  const [, setFailCount] = useState(0);
  const knownVersion = useAvatarDirectory((state) => (userId ? state.entries[userId] : undefined));

  const effectiveVersion = version ?? (typeof knownVersion === "string" ? knownVersion : undefined);
  const knownNoAvatar = version === undefined && knownVersion === null;
  const preferred =
    src ??
    (AVATAR_ENDPOINT_AVAILABLE && userId && !knownNoAvatar
      ? getUserAvatarUrl(userId, { size, version: effectiveVersion })
      : undefined);
  const resolved = preferred && !failedAvatarUrls.has(preferred) ? preferred : DEFAULT_USER_AVATAR_URL;

  return (
    <img
      src={resolved}
      alt={decorative ? "" : name}
      onError={() => {
        if (resolved === DEFAULT_USER_AVATAR_URL) return;
        failedAvatarUrls.add(resolved);
        setFailCount((count) => count + 1);
      }}
      className={cn("size-6 shrink-0 object-cover", className)}
      {...slotAttributes(userAvatarStyle, {})}
    />
  );
}

interface UserLabelProps {
  /** Display name rendered next to the avatar. */
  name: string;
  /** User account id; when given, the user's uploaded avatar is shown. */
  userId?: string;
  className?: string;
  /** Avatar sizing/spacing override; defaults to a compact `size-5` circle. */
  avatarClassName?: string;
}

/**
 * The one inline user-account label: a compact avatar followed by the display
 * name. Use it wherever a user's name renders in a row, cell, or chip instead
 * of a bare text node.
 */
export function UserLabel({ name, userId, className, avatarClassName }: UserLabelProps) {
  return (
    <Flex align="center" gap="xs" className={cn("min-w-0", className)}>
      <UserAvatar name={name} decorative userId={userId} className={cn("size-5", avatarClassName)} />
      <EllipsisText>{name}</EllipsisText>
    </Flex>
  );
}

interface UserHeadingProps {
  /** Display name rendered as the heading text. */
  name: string;
  /** User account id; when given, the user's uploaded avatar is shown. */
  userId?: string;
  className?: string;
}

/**
 * Detail-panel header for a user-attributed record: the user's avatar next to
 * the standard muted level-4 heading. Use it as the `CrudDetail` `header` in
 * panels titled by a person's name.
 */
export function UserHeading({ name, userId, className }: UserHeadingProps) {
  return (
    <Flex align="center" gap="sm" className={cn("min-w-0", className)}>
      <UserAvatar name={name} userId={userId} />
      <Heading level={4} tone="muted" className="truncate">
        {name}
      </Heading>
    </Flex>
  );
}
