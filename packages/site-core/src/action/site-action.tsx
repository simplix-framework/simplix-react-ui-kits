import { useId, type MouseEvent, type ReactNode } from "react";
import { slotAttributes } from "@simplix-react/ui/design";

import { SiteLink } from "../link/site-link";
import { actionPad, siteActionReasonStyle, siteActionStyle } from "./site-action.style";

/**
 * How strongly an action asks to be pressed: one `primary` per region; `subtle` is a quiet action in
 * the muted ink, and `danger` an action that removes something.
 */
export type SiteActionTone = "primary" | "secondary" | "quiet" | "subtle" | "danger";

/** Words that say why an action cannot run now: never empty, never a flag. */
export type SiteReason = Exclude<ReactNode, null | undefined | boolean>;

/**
 * Whether an action can run now. A disabled action always carries the reason it cannot run, so a
 * refusal cannot be written without one: a disabled flag computed at the call site (`disabled: !paid`)
 * compiles only with a `reason` beside it.
 */
export type SiteActionState =
  | {
      /** The action can run. */
      readonly disabled?: false;
      /** Read only while the action is disabled; an action that may be disabled can carry it always. */
      readonly reason?: SiteReason;
    }
  | {
      /** The action cannot run now; it is drawn as a disabled button, never as a link. */
      readonly disabled: boolean;
      /**
       * Why it cannot run now. Where the page draws a line that says so, the part describes the action
       * by that line (`describedBy`); otherwise the action draws the reason for a screen reader only
       * and is described by it.
       */
      readonly reason: SiteReason;
    };

/** What a site action does and says, whatever its state. */
export interface SiteActionBase {
  /** A stable name among the actions of one region. */
  readonly id: string;
  readonly label: ReactNode;
  /** The address it opens; drawn as a link. Without it the action is a button. */
  readonly href?: string;
  /** Runs on a press; on a link it runs before the link's own navigation. */
  readonly onSelect?: (event: MouseEvent<HTMLElement>) => void;
  readonly tone?: SiteActionTone;
  /** A glyph before the label. */
  readonly icon?: ReactNode;
  /** A toggle's state: the action is drawn as a button that says whether it is on. */
  readonly pressed?: boolean;
  /** The accessible name, where the label alone repeats elsewhere on the page. */
  readonly name?: string;
  /**
   * The id of the line on the page that says more about the action, read after its name: a disabled
   * action is described by the line saying why it cannot run now. A part that draws such a line beside
   * its actions passes it here itself; without one, a disabled action is described by its `reason`.
   */
  readonly describedBy?: string;
}

/** What a site action does and says. A product builds these; a part draws them. */
export type SiteActionSpec = SiteActionBase & SiteActionState;

/** Props for {@link SiteAction}. */
export type SiteActionProps = SiteActionSpec & {
  readonly size?: "md" | "sm" | "lg";
  /** Stretches the action over its column. */
  readonly block?: boolean;
  /** Submits the form it stands in; drawn as a button even with an address. */
  readonly submit?: boolean;
  /** Below the page's narrow tier: drawn (`shown`), or left out because its place there is elsewhere (`hidden`). */
  readonly narrow?: "shown" | "hidden";
};

/** How a control that may be refused is described, and the reason it draws when nothing else says why. */
export interface SiteRefusal {
  /** The id the control is described by: the given line's, the hidden reason's, or none. */
  readonly describedBy?: string;
  /** The reason drawn for a screen reader only, beside the control; `null` when not needed. */
  readonly hidden: ReactNode;
}

/**
 * The description of a control that may be disabled: the line the page draws (`describedBy`) when
 * there is one; otherwise, while the control is disabled, its `reason` drawn for a screen reader only.
 */
export function useRefusal(disabled: boolean, reason: SiteReason | undefined, describedBy: string | undefined): SiteRefusal {
  const id = useId();
  const hide = disabled && describedBy === undefined && reason !== undefined;
  return {
    describedBy: describedBy ?? (hide ? id : undefined),
    hidden: hide ? (
      <span {...slotAttributes(siteActionReasonStyle, {})} id={id}>
        {reason}
      </span>
    ) : null,
  };
}

/**
 * A site action, drawn as a link when it opens an address and as a button otherwise. A disabled
 * action is always a disabled button: a link cannot be disabled, and one that only looks disabled
 * still navigates.
 */
export function SiteAction({ id, label, href, onSelect, tone, disabled = false, reason, icon, pressed, name, describedBy, size, block, submit = false, narrow }: SiteActionProps) {
  const marks = slotAttributes(siteActionStyle, { tone, size, block, pad: actionPad(tone, size), narrow });
  const refusal = useRefusal(disabled, reason, describedBy);
  const content = (
    <>
      {icon}
      {label}
    </>
  );
  if (href !== undefined && !disabled && !submit && pressed === undefined) {
    return (
      <SiteLink {...marks} data-action={id} href={href} onClick={onSelect} aria-label={name} aria-describedby={describedBy}>
        {content}
      </SiteLink>
    );
  }
  return (
    <>
      <button {...marks} data-action={id} type={submit ? "submit" : "button"} disabled={disabled} aria-pressed={pressed} aria-label={name} aria-describedby={refusal.describedBy} onClick={onSelect}>
        {content}
      </button>
      {refusal.hidden}
    </>
  );
}
