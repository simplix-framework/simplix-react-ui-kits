import type { MouseEvent, ReactNode } from "react";
import { slotAttributes } from "@simplix-react/ui/design";

import { SiteLink } from "../link/site-link";
import { siteActionStyle } from "./site-action.style";

/** How strongly an action asks to be pressed: one `primary` per region. */
export type SiteActionTone = "primary" | "secondary" | "quiet";

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
}

/** Props for {@link SiteAction}. */
export interface SiteActionProps extends SiteActionSpec {
  readonly size?: "md" | "sm";
  /** Stretches the action over its column. */
  readonly block?: boolean;
}

/**
 * A site action, drawn as a link when it opens an address and as a button otherwise. A disabled
 * action is always a disabled button: a link cannot be disabled, and one that only looks disabled
 * still navigates.
 */
export function SiteAction({ id, label, href, onSelect, tone, disabled = false, icon, size, block }: SiteActionProps) {
  const marks = slotAttributes(siteActionStyle, { tone, size, block });
  const content = (
    <>
      {icon}
      {label}
    </>
  );
  if (href !== undefined && !disabled) {
    return (
      <SiteLink {...marks} data-action={id} href={href} onClick={onSelect}>
        {content}
      </SiteLink>
    );
  }
  return (
    <button {...marks} data-action={id} type="button" disabled={disabled} onClick={onSelect}>
      {content}
    </button>
  );
}
