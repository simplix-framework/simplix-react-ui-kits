import type { ReactNode } from "react";
import { slotAttributes } from "@simplix-react/ui/design";

import { SiteAction, type SiteActionSpec } from "../action/site-action";
import { siteFailureActionsStyle, siteFailureMarkStyle, siteFailureTextStyle, siteFailureTitleStyle } from "./site-failure.style";

/** Props for {@link SiteFailure}. */
export interface SiteFailureProps {
  /** The glyph in the round mark, a glyph the product draws. */
  readonly mark: ReactNode;
  /**
   * `quiet` for an address the site has no page for, `bad` for a page that failed while it was shown,
   * `good` for a done thing the page reports (a mailed link accepted).
   */
  readonly tone?: "quiet" | "bad" | "good";
  readonly title: ReactNode;
  /** What happened and what the reader can do about it. */
  readonly body?: ReactNode;
  /** The ways on, the first one primary. */
  readonly actions?: readonly SiteActionSpec[];
  /**
   * Announces the sentence when it arrives after the page opened: `alert` for something that went
   * wrong and needs the reader, `status` for a wait or a result. Left out, the sentence is read with
   * the page.
   */
  readonly live?: "alert" | "status";
}

/**
 * The site's page for an address it does not have, a page that failed, or a session the site cannot
 * go on with: the round mark, the one h1, what happened and the ways on. It stands directly in a
 * `SitePage` with `rhythm="done"`, which centres the column's content, inside the site window, so
 * the reader is still on the site.
 */
export function SiteFailure({ mark, tone, title, body, actions = [], live }: SiteFailureProps) {
  return (
    <>
      <span {...slotAttributes(siteFailureMarkStyle, { tone })} aria-hidden="true">
        {mark}
      </span>
      <h1 {...slotAttributes(siteFailureTitleStyle, {})}>{title}</h1>
      {body !== undefined ? (
        <p {...slotAttributes(siteFailureTextStyle, {})} {...(live === undefined ? {} : { role: live })}>
          {body}
        </p>
      ) : null}
      {actions.length > 0 ? (
        <div {...slotAttributes(siteFailureActionsStyle, {})}>
          {actions.map((action) => (
            <SiteAction key={action.id} {...action} size="lg" />
          ))}
        </div>
      ) : null}
    </>
  );
}
