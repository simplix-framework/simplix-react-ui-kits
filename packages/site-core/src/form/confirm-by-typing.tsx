import type { ReactNode } from "react";
import { slotAttributes } from "@simplix-react/ui/design";

import { SiteAction, type SiteActionSpec } from "../action/site-action";
import { FormField, SiteInput } from "./fields";
import {
  siteConfirmActionsStyle,
  siteConfirmBodyStyle,
  siteConfirmPointStyle,
  siteConfirmStyle,
  siteConfirmTitleStyle,
} from "./form.style";

/** Whether what was typed confirms the question: the word, ignoring the space around it. */
export function typedConfirms(typed: string, word: string): boolean {
  return word !== "" && typed.trim() === word;
}

/** Props for {@link ConfirmByTyping}. */
export interface ConfirmByTypingProps {
  readonly title: ReactNode;
  /** What the deletion takes with it: a sentence, or points drawn as a list. */
  readonly body?: ReactNode;
  readonly points?: readonly { readonly key: string; readonly text: ReactNode }[];
  /** The field's name ("Type DELETE to confirm"). */
  readonly label: ReactNode;
  /** The word that confirms (a fixed word, or the account's email). */
  readonly word: string;
  readonly value: string;
  readonly onValueChange: (value: string) => void;
  readonly placeholder?: string;
  /** The deletion; enabled only once the word is typed. */
  readonly confirm: SiteActionSpec;
  /** The way back. */
  readonly cancel: SiteActionSpec;
  /**
   * `danger`: the bad colour's soft ground, for a deletion inside another card; `plain`: a card of
   * its own, the field's name muted.
   */
  readonly tone?: "danger" | "plain";
}

/**
 * A question that only goes ahead once a word is typed, drawn in place where it was asked (deleting
 * a voice, deleting the account). The confirming action stays disabled until {@link typedConfirms}.
 * On the danger ground it is an `alertdialog` named by its title.
 */
export function ConfirmByTyping({ title, body, points, label, word, value, onValueChange, placeholder, confirm, cancel, tone = "danger" }: ConfirmByTypingProps) {
  const ok = typedConfirms(value, word);
  const danger = tone === "danger";
  const name = typeof title === "string" ? title : undefined;
  return (
    <div {...slotAttributes(siteConfirmStyle, { tone })} role={danger ? "alertdialog" : undefined} aria-label={danger ? name : undefined}>
      <b {...slotAttributes(siteConfirmTitleStyle, { tone })}>{title}</b>
      {body !== undefined ? <p {...slotAttributes(siteConfirmBodyStyle, { list: false })}>{body}</p> : null}
      {points !== undefined ? (
        <ul {...slotAttributes(siteConfirmBodyStyle, { list: true })}>
          {points.map((point) => (
            <li key={point.key} {...slotAttributes(siteConfirmPointStyle, {})}>
              {point.text}
            </li>
          ))}
        </ul>
      ) : null}
      <FormField label={label} muted={!danger}>
        <SiteInput value={value} onValueChange={onValueChange} placeholder={placeholder} autoComplete="off" />
      </FormField>
      <div {...slotAttributes(siteConfirmActionsStyle, {})}>
        <SiteAction {...confirm} tone={confirm.tone ?? "danger"} size="sm" disabled={!ok || confirm.disabled === true} />
        <SiteAction {...cancel} size="sm" />
      </div>
    </div>
  );
}
