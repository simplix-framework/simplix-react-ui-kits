import { type FormEvent, type MouseEvent, type ReactNode, useId } from "react";
import { slotAttributes } from "@simplix-react/ui/design";

import { SiteAction, type SiteActionSpec } from "../action/site-action";
import { SiteLink } from "../link/site-link";
import { siteCardTextStyle } from "../install/install.style";
import {
  siteAttachAboutStyle,
  siteAttachLabelStyle,
  siteAttachReasonStyle,
  siteAttachStyle,
  siteAttachTitleStyle,
  siteCardHeadingStyle,
  siteContactActionsStyle,
  siteContactActionStyle,
  siteContactMarkStyle,
  siteContactNoteStyle,
  siteContactRowStyle,
  siteContactStyle,
  siteContactTitleStyle,
  siteSuggestBoxStyle,
  siteSuggestLinkStyle,
} from "./help.style";

/** Props for {@link ContactPanel}. */
export interface ContactPanelProps {
  readonly title: ReactNode;
  /** A glyph before the title, which the product draws. */
  readonly icon?: ReactNode;
  readonly body: ReactNode;
  /** Opens the form. */
  readonly action: SiteActionSpec;
  /** When support answers ("Weekdays 10:00 to 17:00"). */
  readonly hours?: ReactNode;
}

/** The way to ask support before the form opens: its heading, what to expect, the action and the hours. */
export function ContactPanel({ title, icon, body, action, hours }: ContactPanelProps) {
  return (
    <section {...slotAttributes(siteContactStyle, { state: "closed" })}>
      <h2 {...slotAttributes(siteCardHeadingStyle, {})}>
        {icon}
        {title}
      </h2>
      <p {...slotAttributes(siteCardTextStyle, {})}>{body}</p>
      <div {...slotAttributes(siteContactActionsStyle, { spread: true })}>
        <SiteAction {...action} tone={action.tone ?? "primary"} />
        {hours !== undefined ? <span {...slotAttributes(siteContactNoteStyle, {})}>{hours}</span> : null}
      </div>
    </section>
  );
}

/** Props for {@link ContactSent}. */
export interface ContactSentProps {
  readonly title: ReactNode;
  /** The question's ticket, such as a `SiteChip`. */
  readonly ticket?: ReactNode;
  /** Where and when the answer comes. */
  readonly body: ReactNode;
  /** The check mark in the round mark, a glyph the product draws. */
  readonly mark?: ReactNode;
  /** Writes another question. */
  readonly action?: SiteActionSpec;
}

/** A question that arrived: the round mark, the title with its ticket, when the answer comes, and the way to ask again. */
export function ContactSent({ title, ticket, body, mark, action }: ContactSentProps) {
  return (
    <section {...slotAttributes(siteContactStyle, { state: "sent" })}>
      <span {...slotAttributes(siteContactMarkStyle, {})} aria-hidden="true">
        {mark}
      </span>
      <div {...slotAttributes(siteContactRowStyle, {})}>
        <b {...slotAttributes(siteContactTitleStyle, {})}>{title}</b>
        {ticket}
      </div>
      <p {...slotAttributes(siteCardTextStyle, {})}>{body}</p>
      {action !== undefined ? (
        <span {...slotAttributes(siteContactActionStyle, {})}>
          <SiteAction {...action} size="sm" />
        </span>
      ) : null}
    </section>
  );
}

/** Props for {@link ContactForm}. */
export interface ContactFormProps {
  readonly title: ReactNode;
  readonly icon?: ReactNode;
  /** Called when the form is sent; the part stops the page from reloading. */
  readonly onSubmit?: () => void;
  /** The fields in reading order: {@link FieldRow}, {@link FormField}, {@link SuggestBox}, {@link AttachBox}. */
  readonly children: ReactNode;
  /** Sends the question; disabled until the required fields are filled. */
  readonly submit: SiteActionSpec;
  /** Closes the form without sending. */
  readonly cancel?: SiteActionSpec;
  /**
   * What is still missing, or why the question cannot be sent from here, beside the actions. A
   * disabled send or close is described by it, so no action is refused in silence.
   */
  readonly note?: ReactNode;
}

/**
 * A question to support as a form, outlined in the accent: the heading, the fields the product
 * lays in, then send and close with what is still missing. The fields' controls are the product's.
 */
export function ContactForm({ title, icon, onSubmit, children, submit, cancel, note }: ContactFormProps) {
  const noteId = useId();
  const described = (action: SiteActionSpec) => action.describedBy ?? (action.disabled === true && note !== undefined ? noteId : undefined);
  return (
    <form
      {...slotAttributes(siteContactStyle, { state: "open" })}
      noValidate
      onSubmit={(event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        onSubmit?.();
      }}
    >
      <h2 {...slotAttributes(siteCardHeadingStyle, {})}>
        {icon}
        {title}
      </h2>
      {children}
      <div {...slotAttributes(siteContactActionsStyle, {})}>
        <SiteAction {...submit} tone={submit.tone ?? "primary"} describedBy={described(submit)} submit />
        {cancel !== undefined ? <SiteAction {...cancel} describedBy={described(cancel)} /> : null}
        {note !== undefined ? (
          <span {...slotAttributes(siteContactNoteStyle, {})} id={noteId}>
            {note}
          </span>
        ) : null}
      </div>
    </form>
  );
}

/** Props for {@link SuggestBox}. */
export interface SuggestBoxProps {
  /** What the links are ("These may already answer it"). */
  readonly label: ReactNode;
  readonly articles: readonly { readonly key: string; readonly title: ReactNode; readonly href: string; readonly onSelect?: (event: MouseEvent<HTMLElement>) => void }[];
  /** The chevron before each link, a glyph the product draws. */
  readonly mark?: ReactNode;
}

/** Articles a question's subject may already answer, on the accent's soft ground. */
export function SuggestBox({ label, articles, mark }: SuggestBoxProps) {
  return (
    <div {...slotAttributes(siteSuggestBoxStyle, {})}>
      <span {...slotAttributes(siteContactNoteStyle, {})}>{label}</span>
      {articles.map((article) => (
        <SiteLink key={article.key} {...slotAttributes(siteSuggestLinkStyle, {})} href={article.href} onClick={article.onSelect}>
          {mark}
          {article.title}
        </SiteLink>
      ))}
    </div>
  );
}

/** Props for {@link AttachBox}. */
export interface AttachBoxProps {
  /**
   * The product's checkbox that turns the attachment on, labelled with `label`. With a `reason`,
   * `describedBy` is the id of the reason's line, which the checkbox names as its description.
   */
  readonly control: (label: ReactNode, describedBy?: string) => ReactNode;
  /** The attachment's name. */
  readonly title: ReactNode;
  /** A badge beside the name ("Recommended"), such as a `SiteChip`. */
  readonly badge?: ReactNode;
  /** What the attachment holds. */
  readonly about?: ReactNode;
  /** What the attachment is doing now: loading, missing, or what it holds. */
  readonly children?: ReactNode;
  /**
   * Why the attachment cannot be added now, drawn under the checkbox; give it with a disabled
   * checkbox, so the box is not refused in silence.
   */
  readonly reason?: ReactNode;
}

/**
 * Something to attach to a question (the app's diagnostic record): the product's checkbox labelled
 * with the attachment's name, badge and what it holds, then its state.
 */
export function AttachBox({ control, title, badge, about, children, reason }: AttachBoxProps) {
  const reasonId = useId();
  return (
    <div {...slotAttributes(siteAttachStyle, {})}>
      {control(
        <span {...slotAttributes(siteAttachLabelStyle, {})}>
          <b {...slotAttributes(siteAttachTitleStyle, {})}>
            {title}
            {badge}
          </b>
          {about !== undefined ? <span {...slotAttributes(siteAttachAboutStyle, {})}>{about}</span> : null}
        </span>,
        reason !== undefined ? reasonId : undefined,
      )}
      {children}
      {reason !== undefined ? (
        <p {...slotAttributes(siteAttachReasonStyle, {})} id={reasonId}>
          {reason}
        </p>
      ) : null}
    </div>
  );
}
