import type { ReactNode } from "react";
import { cn, Text, type TextProps } from "@simplix-react/ui";

interface StrongTextProps extends Omit<TextProps, "children"> {
  /** The words that carry the row, the card or the group they sit in. */
  readonly children: ReactNode;
}

/**
 * The one line a block is identified by, set a step heavier than the lines around it.
 *
 * <p><b>Not a heading.</b> A card's or a section's title is a `Heading`, which brings the tag with
 * it; this is for the places that have no heading to be — the first cell of a roster row, the
 * caption-sized title over a palette group — where the emphasis is what tells the reader which of
 * the values in front of them names the rest.
 *
 * <p><b>Where this belongs is a `weight` variant of `Text` in `@simplix-react/ui`</b>, beside
 * `size` and `tone` — the same gap {@link NumericText} holds the other half of. Until that variant
 * exists this holds the one utility class so no screen has to.
 */
export function StrongText({ children, className, ...textProps }: StrongTextProps) {
  return (
  // The caller's class is merged rather than overwritten. Spreading the props and then setting
  // `className` drops whatever was passed, silently: the prop is accepted, typed and ignored, and
  // the symptom is never 「the prop did nothing」 but whatever the class was for — a cap that does
  // not cap, a width that does not fill. `cn` also settles a Tailwind conflict in the caller's
  // favour, which a plain join cannot.
    <Text as="span" {...textProps} className={cn("font-medium", className)}>
      {children}
    </Text>
  );
}
