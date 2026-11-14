import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from "react";
import { slotAttributes } from "@simplix-react/ui/design";

import { siteFieldStyle, siteFieldNoteStyle, siteFieldRowStyle, siteTextareaStyle, siteInputStyle, siteFieldInlineStyle } from "./fields.style";

/** Props for {@link FormField}. */
export interface FormFieldProps {
  /** The field's name over the control. */
  readonly label: ReactNode;
  /** The control, then any {@link FieldNote} under it. */
  readonly children: ReactNode;
  /**
   * `label` wraps the control in a `<label>`, which names it; `group` draws a plain box for a
   * control that names itself (a select whose trigger carries its own label, a code's cells).
   */
  readonly as?: "label" | "group";
  /** Draws the name in the muted ink, as a form inside a section does; a sign-in card draws it in the ink. */
  readonly muted?: boolean;
}

/** A field: its name over the control, and any note under it. */
export function FormField({ label, children, as = "label", muted = false }: FormFieldProps) {
  const Tag = as === "label" ? "label" : "div";
  return (
    <Tag {...slotAttributes(siteFieldStyle, { muted })}>
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

/** Props for {@link FieldNote}. */
export interface FieldNoteProps {
  /** `bad` says what is wrong with the value; `good` and `warn` a check that passed or asks for care. */
  readonly tone?: "muted" | "bad" | "good" | "warn";
  /** Spoken as it changes, for a rule that is met while the reader types. */
  readonly live?: boolean;
  /** `caption` for a line standing on its own under a form rather than inside a field. */
  readonly size?: "inherit" | "caption";
  readonly children: ReactNode;
}

/** A short line under a control, in the small print of the field. */
export function FieldNote({ tone, live = false, size, children }: FieldNoteProps) {
  return (
    <small {...slotAttributes(siteFieldNoteStyle, { tone, size })} aria-live={live ? "polite" : undefined}>
      {children}
    </small>
  );
}

/** Props for {@link FieldInline}. */
export interface FieldInlineProps {
  readonly children: ReactNode;
}

/** A control and what stands beside it on one line, such as where a filled-in address came from. */
export function FieldInline({ children }: FieldInlineProps) {
  return <span {...slotAttributes(siteFieldInlineStyle, {})}>{children}</span>;
}

/** Props for {@link SiteInput}: a text input's own attributes, without a class. */
export interface SiteInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "className" | "style" | "size" | "onChange"> {
  /** `sm` sits in a row of small controls. */
  readonly size?: "md" | "sm";
  /** Called with the field's text after every edit. */
  readonly onValueChange?: (value: string) => void;
  /** The value is refused: the line takes the bad colour and the field reports `aria-invalid`. */
  readonly invalid?: boolean;
  /** A value read character by character (a recovery code), in the mono family. */
  readonly mono?: boolean;
}

/** A one-line text field on the control line. */
export function SiteInput({ size, onValueChange, invalid = false, mono = false, type = "text", ...rest }: SiteInputProps) {
  return (
    <input
      type={type}
      aria-invalid={invalid || undefined}
      onChange={onValueChange ? (event) => onValueChange(event.target.value) : undefined}
      {...rest}
      {...slotAttributes(siteInputStyle, { size, mono })}
    />
  );
}

/** Props for {@link SiteTextarea}. */
export interface SiteTextareaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "className" | "style" | "onChange"> {
  /** Called with the text after every edit. */
  readonly onValueChange?: (value: string) => void;
  readonly invalid?: boolean;
}

/** A text of several lines, in the reading size and leading. */
export function SiteTextarea({ onValueChange, invalid = false, ...rest }: SiteTextareaProps) {
  return (
    <textarea
      aria-invalid={invalid || undefined}
      onChange={onValueChange ? (event) => onValueChange(event.target.value) : undefined}
      {...rest}
      {...slotAttributes(siteTextareaStyle, {})}
    />
  );
}
