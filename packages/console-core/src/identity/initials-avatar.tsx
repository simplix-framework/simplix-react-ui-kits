import type { CSSProperties } from "react";
import { slotAttributes } from "@simplix-react/ui/design";

import { initialsAvatarStyle } from "./initials-avatar.style";

/** Props for {@link InitialsAvatar}. */
export interface InitialsAvatarProps {
  /** The person's name, from which {@link avatarInitials} takes the letters drawn. */
  readonly name: string;
  /** What tells the person apart, from which the palette tone is taken, so it stays put across screens. */
  readonly seed: string;
  readonly size?: "sm" | "lg";
  /** Draws the circle in the muted ground and ink, for a person whose account no longer exists or cannot be read. */
  readonly muted?: boolean;
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
 * The two letters an avatar shows for a name: a Korean name of three syllables or more draws its
 * given name (the syllables after the family name), a name of several words the first letter of the
 * first two, any other name its first two letters. This is the console's one rule for a person's
 * letters: every avatar, the account menu's included, draws through {@link InitialsAvatar}.
 */
export function avatarInitials(name: string): string {
  const trimmed = name.trim();
  if (/^[가-힣]{3,}$/.test(trimmed)) return trimmed.slice(1, 3);
  const words = trimmed.split(/\s+/).filter(Boolean);
  if (words.length > 1) return ([...words[0]!][0]! + [...words[1]!][0]!).toUpperCase();
  return [...trimmed].slice(0, 2).join("").toUpperCase();
}

/**
 * A person as letters on a tinted circle, for a row, a record head or the account menu, wherever no
 * photo is shown. The tone is taken from the seed (the person's id), so a person has one colour on
 * every screen. It repeats the name beside it, so it is hidden from assistive technology.
 */
export function InitialsAvatar({ name, seed, size = "sm", muted = false }: InitialsAvatarProps) {
  const letters = avatarInitials(name);
  return (
    <span
      aria-hidden="true"
      className="shrink-0 place-items-center"
      style={
        {
          "--avatar-ground": muted ? "var(--muted)" : `var(--avatar-${avatarTone(seed)})`,
          "--avatar-ink": muted ? "var(--muted-foreground)" : `var(--avatar-${avatarTone(seed)}-ink)`,
        } as CSSProperties
      }
      {...slotAttributes(initialsAvatarStyle, { size })}
    >
      {letters}
    </span>
  );
}
