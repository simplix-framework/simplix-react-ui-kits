import type { ReactNode } from "react";
import { ClockIcon } from "lucide-react";
import { useTranslation } from "@simplix-react/i18n/react";
import {
  Button,
  Icon,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  type ButtonProps,
  type IconName,
} from "@simplix-react/ui";
import { unbuiltActionStyle, unbuiltMarkStyle } from "./unbuilt.style";
import { partAttributes, slotAttributes } from "@simplix-react/ui/design";

/** How loud a control is, in the framework's own words. */
type ActionVariant = ButtonProps["variant"];

/** How large a control is, matched to the live buttons it stands beside. */
type ActionSize = "xs" | "sm" | "default";

interface UnbuiltActionProps {
  /** What the control is called — the same words it will carry once it works. */
  readonly label: string;
  /**
   * Why it is inactive, when the reason is not simply that the screen behind it does not exist.
   *
   * <p>Defaults to the shell's own 「이 화면은 아직 만들지 않았습니다」, so a button pointing at a
   * screen a later chapter builds needs nothing but its label.
   */
  readonly reason?: string;
  /** Matches the live buttons it stands beside. */
  readonly size?: ActionSize;
  /**
   * The emphasis the frame drew this control at.
   *
   * <p><b>Not built is not the same as not important.</b> A frame that draws its committing verb
   * as the primary button and its reversal as the destructive one is saying which of them the
   * reader's eye should land on, and flattening every unbuilt control to a ghost throws that away
   * — the screen then reads as though nothing on it mattered. The marker is the disabled state and
   * the clock, which survive any variant.
   */
  readonly variant?: ActionVariant;
  /**
   * The glyph the control carries, as the working button beside it carries one.
   *
   * <p>An action a reader scans a row for is found by its glyph before its words, and a row where
   * one action has one and the other does not reads as two different kinds of thing. The clock
   * that marks this as unbuilt keeps its own place at the end, so both are drawn: what the control
   * does, and that it does not do it yet.
   */
  readonly icon?: IconName;
  /** Layout the caller owns — an auto margin that pushes it to one end of a footer. */
  readonly className?: string;
}

/**
 * A control the board draws and this build cannot yet make work — present, inactive, and saying
 * why.
 *
 * <p><b>Inactive rather than absent.</b> A control that vanishes teaches the reader that the
 * product cannot do the thing; a control that is there and does not respond teaches that they
 * cannot do it *yet*. A destination a later chapter builds is a promise, and the promise is what
 * the reader is owed — so the button stays where the frame drew it and the tooltip carries the
 * reason.
 *
 * <p><b>Not the same thing as a permission the reader lacks.</b> A button leading to a call the
 * server would refuse is removed, because there is nothing being promised: they will not be able
 * to do it here whatever gets built. This is only for what is not built yet.
 *
 * <p>The disabled button swallows pointer events, so the tooltip hangs off the span around it
 * rather than off the button — without that wrapper the reason is unreachable, which is the whole
 * failure this is meant to avoid.
 *
 * <p><b>The wrapper passes the row's width through instead of absorbing it.</b> A footer's
 * domain-action tier divides its row evenly by giving each direct child `flex-1`, and the direct
 * child here is the span — so without `w-full` on the button inside it, the span stretches and the
 * button sits at its label's width in the middle of the space, which is exactly the tier the fill
 * exists to prevent. It reads as a narrower control standing beside full-width neighbours.
 */
export function UnbuiltAction({
  label,
  reason,
  size = "sm",
  variant = "outline",
  icon,
  className,
}: UnbuiltActionProps) {
  const { t } = useTranslation("common");

  return (
    <DisabledAction
      label={label}
      reason={reason ?? t("shell.nav.notBuilt")}
      size={size}
      variant={variant}
      icon={icon}
      className={className}
      mark={<ClockIcon className="size-3.5" {...slotAttributes(unbuiltMarkStyle, {})} />}
    />
  );
}

interface DisabledActionProps {
  /** What the control is called — the same words it carries when it can be pressed. */
  readonly label: string;
  /** Why it cannot be pressed right now. Required: that sentence is the whole point. */
  readonly reason: string;
  readonly size?: ActionSize;
  /** The emphasis the frame drew this control at, which the reason does not change. */
  readonly variant?: ActionVariant;
  /** The glyph the working control carries, so the row does not change shape when it wakes. */
  readonly icon?: IconName;
  /** A second glyph at the end, saying what KIND of inactive this is — the clock on an unbuilt one. */
  readonly mark?: ReactNode;
  /** Layout the caller owns — an auto margin that pushes it to one end of a footer. */
  readonly className?: string;
}

/**
 * A control that is present, inactive, and says why.
 *
 * <p><b>Inactive without a reason is a dead end.</b> The reader presses, nothing happens, and
 * they cannot tell whether the record is in the wrong state, whether they lack the permission, or
 * whether the product is broken — three states calling for three different next moves. The
 * framework's row actions already have `disabledReason` for exactly this; a header button, a
 * footer verb and a wizard's 다음 had nowhere to put one, so every screen that needed it wrapped
 * its own button in its own span and got the geometry subtly different each time.
 *
 * <p><b>Two states that look identical cannot demonstrate either.</b> On the Import wizard, an
 * account with no permission and an operator who has not chosen a file both meet a dead
 * 「다음 — 매핑」 — the first has nothing to do about it and the second has one thing.
 *
 * <p>The disabled button swallows pointer events, so the tooltip hangs off the span around it
 * rather than off the button; without that wrapper the reason is unreachable, which is the whole
 * failure this is meant to avoid. And the button takes the wrapper's width, because a footer's
 * verb tier hands each direct child `flex-1` and the direct child here is the span.
 */
export function DisabledAction({
  label,
  reason,
  size = "sm",
  variant = "outline",
  icon,
  mark,
  className,
}: DisabledActionProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className={className ? `inline-flex cursor-default ${className}` : "inline-flex cursor-default"}>
          <Button
            variant={variant}
            size={size}
            disabled
            aria-disabled="true"
            className="w-full"
            {...partAttributes(unbuiltActionStyle, {})}
          >
            {icon && <Icon name={icon} />}
            {label}
            {mark}
          </Button>
        </span>
      </TooltipTrigger>
      <TooltipContent>{reason}</TooltipContent>
    </Tooltip>
  );
}

/**
 * What a caller passes in place of a handler when this build has nothing behind the control.
 *
 * <p>A string rather than a boolean flag beside the handler: the two states are exclusive — a
 * control either does something or does not exist yet — and a separate flag lets a caller assert
 * both at once, which then has to be resolved by whichever branch a component happens to check
 * first.
 */
export const UNBUILT = "unbuilt";

/**
 * A control's behaviour, or the marker saying nothing is behind it in this build.
 *
 * <p>Widening an existing `() => void` prop to this breaks no caller, which is the point: a
 * component gains the ability to say 「아직 만들지 않았습니다」 without every screen already using
 * it having to say anything.
 */
export type ActionOrUnbuilt = (() => void) | typeof UNBUILT;

interface ActionButtonProps {
  /** What pressing it does, or {@link UNBUILT}. */
  readonly behaviour: ActionOrUnbuilt;
  readonly label: string;
  readonly variant?: ActionVariant;
  readonly size?: ActionSize;
  readonly className?: string;
}

/**
 * One control, drawn live or drawn as unbuilt, from the same call.
 *
 * <p><b>The place the control sits is the component's decision, not the caller's.</b> A component
 * that let a caller hand in a finished node for its footer would let each screen put the export
 * button somewhere different; handing in a behaviour keeps the arrangement with whoever drew it,
 * and lets the one control that is not built yet say so where it stands.
 */
export function ActionButton({ behaviour, label, variant, size = "default", className }: ActionButtonProps) {
  if (behaviour === UNBUILT) {
    return <UnbuiltAction label={label} size={size} variant={variant} className={className} />;
  }
  return (
    <Button variant={variant} size={size} className={className} onClick={behaviour}>
      {label}
    </Button>
  );
}
