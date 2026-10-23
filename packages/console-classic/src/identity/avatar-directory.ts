import { create } from "zustand";

interface AvatarDirectoryState {
  /** userId → active avatar attachment id, or `null` when the user is known to have none. */
  entries: Record<string, string | null>;
  publish: (entries: Record<string, string | null>) => void;
}

/**
 * Session-wide directory of known avatar versions, fed by the batch user list
 * (`avatarAttachmentId` on the user-account ListDTO). `UserAvatar` consults it
 * to cache-bust known avatars and to skip the avatar request entirely for
 * users known to have none.
 */
export const useAvatarDirectory = create<AvatarDirectoryState>((set) => ({
  entries: {},
  publish: (entries) => set((state) => ({ entries: { ...state.entries, ...entries } })),
}));

/**
 * Records each row's avatar attachment id (or its absence) in the directory.
 * Call from hooks that page through user-account rows.
 */
export function publishAvatarDirectory(
  rows: Array<{ userId?: string; avatarAttachmentId?: string | null }>,
): void {
  const entries: Record<string, string | null> = {};
  for (const row of rows) {
    if (row.userId) entries[row.userId] = row.avatarAttachmentId ?? null;
  }
  if (Object.keys(entries).length > 0) {
    useAvatarDirectory.getState().publish(entries);
  }
}
