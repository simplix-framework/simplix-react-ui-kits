/**
 * Clarity overrides for the kit's detail-page parts. Structure, spacing and motion are the classic
 * declarations' (the same in every design); these keys carry clarity's type, colour and radius.
 */
export const detailSlots: Record<string, string> = {
  // The record's head: the name at 18px, the avatar in a soft ring.
  "console-record-head":
    "[&_[data-slot=heading]]:text-[18px] [&_[data-slot=heading]]:leading-[1.3] [&_[data-slot=heading]]:font-(--fw-heavy) [&_[data-slot=heading]]:tracking-[-0.02em] [&>[data-slot=console-initials-avatar]]:shadow-[0_0_0_3px_var(--card),0_0_0_4px_var(--border)]",
  "console-record-head-subtitle": "text-(length:--fs-control) leading-(--lh-control)",
  // A sub-list in a detail tab, in one of its two forms (language.md, "Lists inside a detail").
  // full: the card on the surface radius and hairline.
  "console-record-sublist kind=full":
    "[&>[data-slot=console-record-list]]:rounded-[var(--radius-surface)] [&>[data-slot=console-record-list]]:border-[var(--border)]",
  // compact: an 11px head and group headings, hairline rules, a 12.5px empty sentence.
  "console-record-sublist kind=compact":
    "[&_[data-slot=table-head]]:text-(length:--fs-label) leading-(--lh-label) [&_[data-slot=table-head]]:border-[var(--border)] [&_[data-slot=table-row]]:border-[var(--border)] [&_[data-part=crud-list-group-cell]]:text-(length:--fs-label) leading-(--lh-label) [&_[data-part=crud-list-group-cell]]:text-[var(--muted-2)] [&_[data-slot=crud-list-empty-text]]:text-(length:--fs-control) leading-(--lh-control)",
  // The note that explains a detail or a form: a card on the second surface, the hairline and the
  // surface radius, its sentence at 12.5px.
  "console-record-note": "text-(length:--fs-control) leading-(--lh-control) text-secondary-foreground",
  "console-record-note framed=true": "rounded-[var(--radius-surface)] border-[var(--border)] bg-[var(--surface-2)]",
};
