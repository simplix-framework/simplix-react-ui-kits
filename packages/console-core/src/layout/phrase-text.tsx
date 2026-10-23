import type { ReactNode } from "react";
import { cn, Text, type TextProps } from "@simplix-react/ui";

interface PhraseTextProps extends Omit<TextProps, "children"> {
  /** The phrase, which may be wider than the space it is given. */
  readonly children: ReactNode;
}

/**
 * A short phrase in a narrow column, broken between its words rather than inside one.
 *
 * <p><b>Korean has no default word boundary a line breaker can see</b>, so the browser breaks it
 * anywhere a character ends: a five-step rail 59px wide printed 「관리자 게/정」, 「조직·사업/장」 and
 * 「라이선/스」, each of which reads as a different word for the length of the first line. English in
 * the same column breaks at its spaces and never shows this, which is why a label that has been
 * read a hundred times in one language is broken in the other.
 *
 * <p><b>Not a global rule.</b> Set on the document it would reflow every screen in the console at
 * once, including the prose paragraphs that are better off breaking anywhere than leaving a ragged
 * edge. It belongs on the labels that sit in a column narrower than themselves — rail steps, tab
 * strips, tile captions, column headers.
 *
 * <p><b>Where this belongs is a `phrase` variant of `Text` in `@simplix-react/ui`</b>, beside
 * `size` and `tone`. Until that variant exists this holds the one utility class so no page has to.
 */
export function PhraseText({ children, className, ...textProps }: PhraseTextProps) {
  return (
  // The caller's class is merged rather than overwritten. Spreading the props and then setting
  // `className` drops whatever was passed, silently: the prop is accepted, typed and ignored, and
  // the symptom is never 「the prop did nothing」 but whatever the class was for — a cap that does
  // not cap, a width that does not fill. `cn` also settles a Tailwind conflict in the caller's
  // favour, which a plain join cannot.
    <Text as="span" {...textProps} className={cn("break-keep", className)}>
      {children}
    </Text>
  );
}
