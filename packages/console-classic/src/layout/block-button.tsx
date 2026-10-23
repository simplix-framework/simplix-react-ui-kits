import { Button, cn, type ButtonProps } from "@simplix-react/ui";

/**
 * A button that fills the column it is in.
 *
 * <p><b>For a form whose actions are stacked rather than in a row</b> — a sign-in card, an
 * invitation, a wizard step on a narrow panel. There the button is the whole next step, and one
 * sized to its label leaves a ragged edge under a full-width field.
 *
 * <p><b>Where this belongs is a `block` variant of `Button` in `@simplix-react/ui`</b>, beside
 * `variant` and `size`. Until that variant exists this holds the one utility class so no page has
 * to; a row of buttons keeps the plain `Button`.
 */
export function BlockButton({ className, ...props }: ButtonProps) {
  // The caller's class is merged rather than overwritten. Spreading the props and then setting
  // `className` drops whatever was passed, silently: the prop is accepted, typed and ignored, and
  // the symptom is never 「the prop did nothing」 but whatever the class was for — a margin that
  // does not appear, a colour that does not take. `cn` also settles a Tailwind conflict in the
  // caller's favour, so a call that wants `w-auto` on one screen gets it.
  return <Button {...props} className={cn("w-full", className)} />;
}
