import { useEffect, useId, useRef, type ReactNode } from "react";
import { slotAttributes } from "@simplix-react/ui/design";

import { SiteAction, type SiteActionSpec } from "../action/site-action";
import { nameByFirstHeading, useQuestionFocus } from "../form/question-focus";
import {
  siteIdentityMarkStyle,
  siteIdentityMetaStyle,
  siteIdentityNameStyle,
  siteIdentityStyle,
  siteIdentityTextStyle,
  siteSettingsActionsStyle,
  siteSettingsBoxStyle,
  siteSettingsRowActionsStyle,
  siteSettingsRowMetaStyle,
  siteSettingsRowsStyle,
  siteSettingsRowStyle,
  siteSettingsRowTextStyle,
  siteSettingsRowTitleStyle,
  siteSettingsTextStyle,
} from "./account.style";

/** Props for {@link SettingsRows}. */
export interface SettingsRowsProps {
  /** The rows, each a {@link SettingsRow}. */
  readonly children: ReactNode;
}

/** Rows of settings on one card, ruled apart. */
export function SettingsRows({ children }: SettingsRowsProps) {
  return <div {...slotAttributes(siteSettingsRowsStyle, {})}>{children}</div>;
}

/** Props for {@link SettingsRow}. */
export interface SettingsRowProps {
  readonly title: ReactNode;
  /** Beside the title: a `SiteChip` with the setting's state. */
  readonly badge?: ReactNode;
  /** Under the title: the state, date or amount, muted. */
  readonly meta?: ReactNode;
  /** At the end, small: what can be done with the setting. */
  readonly actions?: readonly SiteActionSpec[];
}

/** One setting: its title and chip over its line, its small actions at the end. */
export function SettingsRow({ title, badge, meta, actions = [] }: SettingsRowProps) {
  return (
    <div {...slotAttributes(siteSettingsRowStyle, {})}>
      <div {...slotAttributes(siteSettingsRowTextStyle, {})}>
        <b {...slotAttributes(siteSettingsRowTitleStyle, {})}>
          {title}
          {badge}
        </b>
        {meta !== undefined ? <span {...slotAttributes(siteSettingsRowMetaStyle, {})}>{meta}</span> : null}
      </div>
      {actions.length > 0 ? (
        <div {...slotAttributes(siteSettingsRowActionsStyle, {})}>
          {actions.map((action) => (
            <SiteAction key={action.id} {...action} size="sm" />
          ))}
        </div>
      ) : null}
    </div>
  );
}

/** Props for {@link SettingsBox}. */
export interface SettingsBoxProps {
  /** `danger` sets the box on the bad colour's soft ground. */
  readonly tone?: "plain" | "danger";
  /**
   * The element `id` of the control the page draws in the box's place once it closes (the action the
   * box replaced while asking), which takes back a focus the closing box would drop.
   */
  readonly returnFocusTo?: string;
  readonly children: ReactNode;
}

/**
 * A question or a confirmation inside a section, on a card of its own.
 *
 * <p>The box opens on a press (changing the plan, cancelling, asking for a refund), often in place of
 * the control that opened it, so it takes the focus when it opens and gives it back to that control
 * when it closes, as a typed confirmation does; the reader who asked is read the question and tabs on
 * into it. It is the focus's target, never a Tab stop, and it is named by its first heading (the
 * question's title) so the focus moving in announces the question.
 */
export function SettingsBox({ tone, returnFocusTo, children }: SettingsBoxProps) {
  const root = useRef<HTMLDivElement>(null);
  const headingId = useId();
  // Named before the focus moves in, so the move announces the name.
  useEffect(() => {
    if (root.current !== null) nameByFirstHeading(root.current, headingId);
  }, [headingId]);
  useQuestionFocus(root, returnFocusTo);
  return (
    <div ref={root} tabIndex={-1} role="group" {...slotAttributes(siteSettingsBoxStyle, { tone })}>
      {children}
    </div>
  );
}

/** Props for {@link SettingsText}. */
export interface SettingsTextProps {
  /** `plain`: a quote for a change; `muted`: what a choice means; `strong`: a state in bold. */
  readonly tone?: "plain" | "muted" | "strong";
  readonly children: ReactNode;
}

/** A sentence inside a section in the reading size. */
export function SettingsText({ tone, children }: SettingsTextProps) {
  return <p {...slotAttributes(siteSettingsTextStyle, { tone })}>{children}</p>;
}

/** Props for {@link SettingsActions}. */
export interface SettingsActionsProps {
  /** The committing action first, then the way back. */
  readonly actions: readonly SiteActionSpec[];
  /** Small inside a question; `md` for an action standing alone in the section (cancelling). */
  readonly size?: "sm" | "md";
}

/** The actions of a question inside a section. */
export function SettingsActions({ actions, size = "sm" }: SettingsActionsProps) {
  return (
    <div {...slotAttributes(siteSettingsActionsStyle, {})}>
      {actions.map((action) => (
        <SiteAction key={action.id} {...action} size={size} />
      ))}
    </div>
  );
}

/** Props for {@link IdentityRow}. */
export interface IdentityRowProps {
  /** The round mark's content: an initial, or a glyph the product draws. */
  readonly mark: ReactNode;
  /** `voice` for something of the reader's own voice. */
  readonly tone?: "accent" | "voice";
  /** The mark's accessible name; without it the mark is decoration beside the name. */
  readonly markLabel?: string;
  readonly name: ReactNode;
  readonly meta?: ReactNode;
  /** At the end: a `SiteChip` saying its state. */
  readonly badge?: ReactNode;
}

/** Who or what a part is about: the round mark, the name over its line, and a chip at the end. */
export function IdentityRow({ mark, tone, markLabel, name, meta, badge }: IdentityRowProps) {
  return (
    <div {...slotAttributes(siteIdentityStyle, {})}>
      <span {...slotAttributes(siteIdentityMarkStyle, { tone })} role={markLabel !== undefined ? "img" : undefined} aria-label={markLabel} aria-hidden={markLabel === undefined ? true : undefined}>
        {mark}
      </span>
      <div {...slotAttributes(siteIdentityTextStyle, {})}>
        <b {...slotAttributes(siteIdentityNameStyle, {})}>{name}</b>
        {meta !== undefined ? <span {...slotAttributes(siteIdentityMetaStyle, {})}>{meta}</span> : null}
      </div>
      {badge}
    </div>
  );
}
