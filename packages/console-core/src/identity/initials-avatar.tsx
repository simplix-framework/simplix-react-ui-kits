import type { CSSProperties } from "react";
import { slotAttributes } from "@simplix-react/ui/design";

import { initialsAvatarStyle } from "./initials-avatar.style";

/** Props for {@link InitialsAvatar}. */
export interface InitialsAvatarProps {
  /** The person's name; its last two letters are drawn. */
  readonly name: string;
  /** What tells the person apart, from which the palette tone is taken, so it stays put across screens. */
  readonly seed: string;
  readonly size?: "sm" | "lg";
}

/** How many avatar tones the palette holds (`--avatar-1` to `--avatar-6`). */
export const AVATAR_TONE_COUNT = 6;

/** The palette tone, 1 to {@link AVATAR_TONE_COUNT}, a seed always maps to. */
export function avatarTone(seed: string): number {
  let sum = 0;
  for (const char of seed) sum += char.codePointAt(0) ?? 0;
  return (sum % AVATAR_TONE_COUNT) + 1;
}

/**
 * A person as letters on a tinted circle, for a row or a record head that has no photo to show.
 * It repeats the name beside it, so it is hidden from assistive technology.
 */
export function InitialsAvatar({ name, seed, size = "sm" }: InitialsAvatarProps) {
  const letters = [...name.trim()].slice(-2).join("");
  return (
    <span
      aria-hidden="true"
      className="shrink-0 place-items-center"
      style={
        {
          "--avatar-ground": `var(--avatar-${avatarTone(seed)})`,
          "--avatar-ink": `var(--avatar-${avatarTone(seed)}-ink)`,
        } as CSSProperties
      }
      {...slotAttributes(initialsAvatarStyle, { size })}
    >
      {letters}
    </span>
  );
}
