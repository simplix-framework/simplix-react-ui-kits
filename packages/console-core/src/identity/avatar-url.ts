/** Thumbnail size presets served by the public avatar endpoint (px: xs=32, sm=64, md=128, lg=256, xl=512). */
export type UserAvatarSize = "xs" | "sm" | "md" | "lg" | "xl";

interface UserAvatarUrlOptions {
  /** Thumbnail preset; omit for the original image. */
  size?: UserAvatarSize;
  /** Cache-busting token; pass a value that changes when the avatar is replaced (e.g. the attachment id). */
  version?: string;
}

/**
 * URL of the public avatar serving endpoint for a user.
 *
 * The endpoint is unauthenticated and browser-cacheable, so `<img>` tags can
 * reference it directly; the `version` token forces a reload after re-upload.
 */
export function getUserAvatarUrl(userId: string, { size, version }: UserAvatarUrlOptions = {}): string {
  const name = size ? `${userId}-avatar-${size}.png` : `${userId}-avatar.png`;
  const query = version ? `?v=${encodeURIComponent(version)}` : "";
  return `/api/v1/public/user/${name}${query}`;
}
