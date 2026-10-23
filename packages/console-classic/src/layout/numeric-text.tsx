import type { ReactNode } from "react";
import { cn, Text, type TextProps } from "@simplix-react/ui";

interface NumericTextProps extends Omit<TextProps, "children"> {
  /** The figure, already formatted and already carrying its unit. */
  readonly children: ReactNode;
}

/**
 * A figure, drawn in figures of equal width.
 *
 * <p><b>A column of counts is read by comparing digit positions</b>, and proportional numerals move
 * the hundreds place a few pixels per row — 「11명」 under 「9명」 sits left of where the eye expects
 * it, so a scan for the largest count lands on the wrong row. Every count on a list, a tab, a tile
 * or a panel goes through this, so no screen decides it again.
 *
 * <p><b>Where this belongs is a `numeric` variant of `Text` in `@simplix-react/ui`</b>, beside
 * `size` and `tone`: every console that draws a count wants it and none of them wants to know the
 * class name. Until that variant exists this holds the one utility class so no page has to.
 */
export function NumericText({ children, className, ...textProps }: NumericTextProps) {
  return (
  // The caller's class is merged rather than overwritten. Spreading the props and then setting
  // `className` drops whatever was passed, silently: the prop is accepted, typed and ignored, and
  // the symptom is never 「the prop did nothing」 but whatever the class was for — a cap that does
  // not cap, a width that does not fill. `cn` also settles a Tailwind conflict in the caller's
  // favour, which a plain join cannot.
    <Text as="span" {...textProps} className={cn("tabular-nums", className)}>
      {children}
    </Text>
  );
}
