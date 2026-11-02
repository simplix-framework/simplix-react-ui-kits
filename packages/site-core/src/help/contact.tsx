import type { FormEvent, MouseEvent, ReactNode } from "react";
import { slotAttributes } from "@simplix-react/ui/design";

import { SiteAction, type SiteActionSpec } from "../action/site-action";
import { SiteLink } from "../link/site-link";
import { siteCardTextStyle } from "../install/install.style";
import {
  siteAttachAboutStyle,
  siteAttachLabelStyle,
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
  siteFieldRowStyle,
  siteFieldStyle,
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
  /** What is still missing, beside the actions. */
  readonly note?: ReactNode;
}

/**
 * A question to support as a form, outlined in the accent: the heading, the fields the product
 * lays in, then send and close with what is still missing. The fields' controls are the product's.
 */
export function ContactForm({ title, icon, onSubmit, children, submit, cancel, note }: ContactFormProps) {
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
        <SiteAction {...submit} tone={submit.tone ?? "primary"} submit />
        {cancel !== undefined ? <SiteAction {...cancel} /> : null}
        {note !== undefined ? <span {...slotAttributes(siteContactNoteStyle, {})}>{note}</span> : null}
      </div>
    </form>
  );
}

/** Props for {@link FormField}. */
export interface FormFieldProps {
  /** The field's name over the control. */
  readonly label: ReactNode;
  /** The product's control. */
  readonly children: ReactNode;
  /**
   * `label` wraps the control in a `<label>`, which names it; `group` draws a plain box for a
   * control that names itself (a select whose trigger carries its own label).
   */
  readonly as?: "label" | "group";
}

/** A field: its name over the product's control. */
export function FormField({ label, children, as = "label" }: FormFieldProps) {
  const Tag = as === "label" ? "label" : "div";
  return (
    <Tag {...slotAttributes(siteFieldStyle, {})}>
      {label}
      {children}
    </Tag>
  );
}

/** Props for {@link FieldRow}. */
export interface FieldRowProps {
  readonly children: ReactNode;
}

/** Fields side by side, one below the narrow tier. */
export function FieldRow({ children }: FieldRowProps) {
  return <div {...slotAttributes(siteFieldRowStyle, {})}>{children}</div>;
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
  /** The product's checkbox that turns the attachment on. */
  readonly control: (label: ReactNode) => ReactNode;
  /** The attachment's name. */
  readonly title: ReactNode;
  /** A badge beside the name ("Recommended"), such as a `SiteChip`. */
  readonly badge?: ReactNode;
  /** What the attachment holds. */
  readonly about?: ReactNode;
  /** What the attachment is doing now: loading, missing, or what it holds. */
  readonly children?: ReactNode;
}

/**
 * Something to attach to a question (the app's diagnostic record): the product's checkbox labelled
 * with the attachment's name, badge and what it holds, then its state.
 */
export function AttachBox({ control, title, badge, about, children }: AttachBoxProps) {
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
      )}
      {children}
    </div>
  );
}
