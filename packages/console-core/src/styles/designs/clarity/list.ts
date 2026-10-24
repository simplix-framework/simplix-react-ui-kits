/** Clarity overrides for record lists and the avatars the kit draws in them. */
export const listSlots: Record<string, string> = {
    // A list on a page: the card on the surface radius and hairline.
    "console-record-list nested=false": "rounded-[var(--radius-surface)] border-[var(--border)]",
    // A person as letters on a ground tinted by their hue.
    "console-initials-avatar": "font-[650]",
};
