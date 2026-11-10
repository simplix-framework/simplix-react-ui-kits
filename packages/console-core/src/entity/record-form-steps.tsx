import type { ReactNode } from "react";
import { useLocale, useTranslation } from "@simplix-react/i18n/react";
import { Heading, Text } from "@simplix-react/ui";
import { partAttributes, slotAttributes } from "@simplix-react/ui/design";

import { PACKAGE_NAMESPACE } from "./locales";
import { fieldShown } from "./record-form-rules";
import {
  stepReviewRowStyle,
  stepReviewRowsStyle,
  stepReviewStyle,
  stepReviewTermStyle,
  stepReviewValueStyle,
} from "./record-form-steps.style";
import type { RecordFormField, RecordFormSection } from "./record-form-types";

/** What a stepped {@link RecordForm} takes besides its sections: each section is one step. */
export interface RecordFormStepOptions {
  /**
   * Checks the values of the step the reader is leaving, after its required fields are filled.
   * Throwing holds the reader on the step and says why in the form's banner: a {@link ClientRefusal}
   * marks the fields it names, any other error shows its message. A check that needs no request
   * belongs here (a period that ends before it starts, an address that is taken); one that does
   * belongs to the submit.
   *
   * @param keys the keys of the step's shown fields
   * @param values every value entered so far
   */
  readonly validateStep?: (keys: readonly string[], values: Readonly<Record<string, unknown>>) => void;
  /**
   * How a value reads in the review where the default cannot say it: a value the screen holds more
   * about than the form does. Returns nothing to leave the default.
   */
  readonly reviewValue?: (field: RecordFormField, value: unknown) => ReactNode | undefined;
}

/** Whether a value says nothing: an unset field reads as 「not set」, never as an empty line. */
function empty(value: unknown): boolean {
  return value === null || value === undefined || (typeof value === "string" && value.trim() === "") || (Array.isArray(value) && value.length === 0);
}

/**
 * A field's value as the review reads it: the label of a chosen option, the name of a picked
 * record, a date in the reader's language, yes or no for a switch.
 *
 * @param field the declared field, which holds the options and the search a value is named through
 * @param value the value as entered
 * @param words the form's own words
 * @param locale the reader's language
 */
export function reviewTextOf(
  field: RecordFormField,
  value: unknown,
  words: { readonly t: (key: string, values?: Record<string, string | number | boolean>) => string },
  locale: string,
): string {
  const { t } = words;
  const unset = t("recordForm.notSet");
  const labelOf = (options: readonly { readonly value: string; readonly label: string }[], one: unknown) => options.find((option) => option.value === String(one))?.label ?? String(one);
  // A switch or a tick that was never touched is an answer (no); a yes-or-no question that was never answered is not.
  if (field.kind === "check") return value === null || value === undefined ? unset : value ? t("recordForm.yes") : t("recordForm.no");
  if (field.kind === "switch" || field.kind === "tick") return value ? t("recordForm.yes") : t("recordForm.no");
  if (empty(value)) return unset;
  switch (field.kind) {
    case "password":
      return t("recordForm.entered");
    case "i18nText": {
      const texts = value as Readonly<Record<string, string>>;
      return texts[locale] || Object.values(texts).find(Boolean) || unset;
    }
    case "number":
      return field.unit ? `${String(value)} ${field.unit}` : String(value);
    case "select":
    case "radio":
      return labelOf(field.options, value);
    case "multi":
      return (value as readonly string[]).map((one) => labelOf(field.options, one)).join(", ");
    case "reference":
      return labelOf(field.search.options, value);
    case "referenceMulti":
      return (value as readonly string[]).map((one) => labelOf(field.search.options, one)).join(", ");
    case "datetime":
      return new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short", timeZone: field.zone }).format(new Date(String(value)));
    case "range": {
      const range = value as { readonly from?: string; readonly to?: string };
      return `${range.from ?? unset} ~ ${range.to ?? unset}`;
    }
    case "repeat":
      return t("recordForm.rows", { count: Array.isArray(value) ? value.length : 0 });
    case "attachment":
      return t("recordForm.files", { count: Array.isArray(value) ? value.length : 0 });
    default:
      return typeof value === "object" ? JSON.stringify(value) : String(value);
  }
}

/**
 * The last step of a stepped form: every answer the reader gave, by step, before anything is sent.
 * A field that is hidden by an earlier choice is not listed, since it will not be sent either.
 */
export function RecordFormReview({
  sections,
  values,
  options,
}: {
  readonly sections: readonly RecordFormSection[];
  readonly values: Readonly<Record<string, unknown>>;
  readonly options?: RecordFormStepOptions;
}) {
  const { t } = useTranslation(PACKAGE_NAMESPACE + "/features");
  const locale = useLocale();
  return (
    <div {...partAttributes(stepReviewStyle, {})}>
      <Text tone="muted">{t("recordForm.reviewLead")}</Text>
      {sections.map((section) => {
        const rows = section.fields.filter((field) => fieldShown(field, values));
        if (rows.length === 0) return null;
        return (
          <section key={section.key} aria-label={section.title ?? section.key}>
            {section.title ? <Heading level={5}>{section.title}</Heading> : null}
            <dl {...partAttributes(stepReviewRowsStyle, {})}>
              {rows.map((field) => (
                <div key={field.key} {...partAttributes(stepReviewRowStyle, {})}>
                  <dt {...slotAttributes(stepReviewTermStyle, {})}>{field.label}</dt>
                  <dd {...slotAttributes(stepReviewValueStyle, {})}>{options?.reviewValue?.(field, values[field.key]) ?? reviewTextOf(field, values[field.key], { t }, locale)}</dd>
                </div>
              ))}
            </dl>
          </section>
        );
      })}
    </div>
  );
}
