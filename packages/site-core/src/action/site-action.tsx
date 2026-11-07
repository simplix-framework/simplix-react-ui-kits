import { useId, useRef, type MouseEvent, type ReactNode } from "react";
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
  /**
   * The element's `id`, where something finds the control by it: a server page's script (a passkey
   * button), or a page returning the focus to an action that a closed question had replaced.
   */
  readonly elementId?: string;
  /**
   * The action waits for the answer to its last press: it is drawn disabled, with this sentence saying
   * what is happening (「Sending the request」) as its reason, whatever `disabled` says. A product
   * passes the run's state here (`pending: create.pending ? t("sending") : undefined`) instead of
   * writing the action twice, once to press and once refused; the sentence says what the wait is for,
   * never the action's own label again.
   */
  readonly pending?: SiteReason;
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
  /** What a submit sends as its own field when it is the one pressed, where a form has two submits. */
  readonly field?: { readonly name: string; readonly value: string };
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
 *
 * <p>A button that turns disabled while it holds the focus (pressed, and now waiting for its answer)
 * keeps the focus: it is refused through `aria-disabled` and drawn disabled until the focus leaves,
 * because a natively disabled button drops the focus to the document and the reader loses their place.
 */
export function SiteAction({ id, label, href, onSelect, tone, disabled: refused = false, reason: refusedFor, pending, icon, pressed, name, describedBy, size, block, submit = false, narrow, elementId, field }: SiteActionProps) {
  const marks = slotAttributes(siteActionStyle, { tone, size, block, pad: actionPad(tone, size), narrow });
  // A pending action is refused for as long as it waits, and its wait is the reason it says. It is
  // marked busy, which the design draws in the action's own tone rather than the disabled grey.
  const waiting = pending !== undefined;
  const disabled = refused || waiting;
  const reason = waiting ? pending : refusedFor;
  const refusal = useRefusal(disabled, reason, waiting ? undefined : describedBy);
  const button = useRef<HTMLButtonElement>(null);
  const holding = disabled && button.current !== null && button.current.ownerDocument.activeElement === button.current;
  const content = (
    <>
      {icon}
      {label}
    </>
  );
  if (href !== undefined && !disabled && !submit && pressed === undefined) {
    return (
      <SiteLink {...marks} id={elementId} data-action={id} href={href} onClick={onSelect} aria-label={name} aria-describedby={describedBy}>
        {content}
      </SiteLink>
    );
  }
  return (
    <>
      <button
        ref={button}
        {...marks}
        id={elementId}
        data-action={id}
        type={submit ? "submit" : "button"}
        name={submit ? field?.name : undefined}
        value={submit ? field?.value : undefined}
        disabled={disabled && !holding}
        aria-disabled={holding ? true : undefined}
        aria-busy={waiting || undefined}
        aria-pressed={pressed}
        aria-label={name}
        aria-describedby={refusal.describedBy}
        onClick={holding ? (event) => event.preventDefault() : onSelect}
      >
        {content}
      </button>
      {refusal.hidden}
    </>
  );
}
