import { Text } from "@simplix-react/ui";
import { useTranslation } from "@simplix-react/i18n/react";

import { PACKAGE_NAMESPACE } from "./locales";

interface FormErrorSummaryProps {
  /** What the server refused, keyed by the field it refused. */
  fieldErrors?: Record<string, string>;
  /** Names a field the way the form's own label names it. */
  label: (field: string) => string;
  /**
   * What the server calls each refused field, keyed by the field —
   * `useCrudFormSubmit`'s `fieldLabels`. Read only where the form has no name of its own.
   */
  serverLabels?: Record<string, string>;
}

/**
 * Whether a resolver answered with the key it was asked for rather than with a name.
 *
 * @remarks
 * i18next prints the key when the catalogue has no entry, so `t("form.originalApproverName")`
 * returns that whole string and the summary renders it. Two shapes give it away: the text ends in
 * the field name after a dot, which is what a `` t(`form.${field}`) `` resolver produces, or it is
 * a dotted identifier with no space in it, which no label ever is.
 *
 * @param text - What the resolver answered.
 * @param field - The field it was asked about.
 * @returns true when the answer is a lookup key rather than a name.
 */
function isLookupKey(text: string, field: string): boolean {
  if (!text) return true;
  if (text === field || text.endsWith(`.${field}`)) return true;
  return /^[A-Za-z_][A-Za-z0-9_]*(\.[A-Za-z0-9_]+)+$/.test(text);
}

/**
 * What a refused form says at the top of itself: how many fields have to change, and which.
 *
 * @remarks
 * A panel is taller than the screen, so the field that caused a refusal is regularly scrolled out
 * of view when the reader presses save. The count on the save button says something was refused
 * but not what, which leaves the reader scrolling the whole panel looking for a red mark. Naming
 * the fields here turns that search into a read.
 *
 * <p><b>A form can only name the fields it draws.</b> When the server refuses one it does not — a
 * field it fills in itself, or one added to the DTO since the screen was built — the form's own
 * resolver has no entry and i18next answers with the lookup key, so the reader is handed
 * `form.originalApproverName` and can do nothing with it. Three names are tried in order: the
 * form's own label, then the server's (`@FieldLabel`, already in the reader's language), then the
 * server's message for that field, which at least says what was wrong with it.
 *
 * <p>Renders nothing until something is refused, so it costs a form nothing to carry.
 */
export function FormErrorSummary({
  fieldErrors,
  label,
  serverLabels,
}: FormErrorSummaryProps) {
  const { t } = useTranslation(PACKAGE_NAMESPACE + "/features");

  const fields = Object.keys(fieldErrors ?? {});
  if (fields.length === 0) return null;

  const nameOf = (field: string) => {
    const own = label(field);
    if (!isLookupKey(own, field)) return own;
    return serverLabels?.[field] || fieldErrors?.[field] || field;
  };

  // Two fields can share one name — a server that labels both `originalApproverId` and
  // `originalApproverName` 「원 결재자」 would have the summary say it twice. The count states how
  // many names are listed rather than how many fields were refused, so the figure and the line
  // under it always agree.
  const names = [...new Set(fields.map(nameOf))];

  return (
    <div className="rounded-md border border-destructive/40 bg-destructive/5 px-3 py-2">
      <Text as="p" size="sm" weight="medium" tone="destructive">
        {t("formErrors.title", { count: names.length })}
      </Text>
      <Text as="p" size="caption" className="text-destructive/90">
        {names.join(" · ")}
      </Text>
    </div>
  );
}
