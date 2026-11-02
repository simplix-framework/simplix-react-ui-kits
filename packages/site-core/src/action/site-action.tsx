import type { MouseEvent, ReactNode } from "react";
import { slotAttributes } from "@simplix-react/ui/design";

import { SiteLink } from "../link/site-link";
import { actionPad, siteActionStyle } from "./site-action.style";

/**
 * How strongly an action asks to be pressed: one `primary` per region; `subtle` is a quiet action in
 * the muted ink, and `danger` an action that removes something.
 */
export type SiteActionTone = "primary" | "secondary" | "quiet" | "subtle" | "danger";

/** What a site action does and says. A product builds these; a part draws them. */
export interface SiteActionSpec {
  /** A stable name among the actions of one region. */
  readonly id: string;
  readonly label: ReactNode;
  /** The address it opens; drawn as a link. Without it the action is a button. */
  readonly href?: string;
  /** Runs on a press; on a link it runs before the link's own navigation. */
  readonly onSelect?: (event: MouseEvent<HTMLElement>) => void;
  readonly tone?: SiteActionTone;
  /** The action cannot run now; it is drawn as a disabled button, never as a link. */
  readonly disabled?: boolean;
  /** A glyph before the label. */
  readonly icon?: ReactNode;
  /** A toggle's state: the action is drawn as a button that says whether it is on. */
  readonly pressed?: boolean;
  /** The accessible name, where the label alone repeats elsewhere on the page. */
  readonly name?: string;
}

/** Props for {@link SiteAction}. */
export interface SiteActionProps extends SiteActionSpec {
  readonly size?: "md" | "sm" | "lg";
  /** Stretches the action over its column. */
  readonly block?: boolean;
  /** Submits the form it stands in; drawn as a button even with an address. */
  readonly submit?: boolean;
}

/**
 * A site action, drawn as a link when it opens an address and as a button otherwise. A disabled
 * action is always a disabled button: a link cannot be disabled, and one that only looks disabled
 * still navigates.
 */
export function SiteAction({ id, label, href, onSelect, tone, disabled = false, icon, pressed, name, size, block, submit = false }: SiteActionProps) {
  const marks = slotAttributes(siteActionStyle, { tone, size, block, pad: actionPad(tone, size) });
  const content = (
    <>
      {icon}
      {label}
    </>
  );
  if (href !== undefined && !disabled && !submit && pressed === undefined) {
    return (
      <SiteLink {...marks} data-action={id} href={href} onClick={onSelect} aria-label={name}>
        {content}
      </SiteLink>
    );
  }
  return (
    <button {...marks} data-action={id} type={submit ? "submit" : "button"} disabled={disabled} aria-pressed={pressed} aria-label={name} onClick={onSelect}>
      {content}
    </button>
  );
}
