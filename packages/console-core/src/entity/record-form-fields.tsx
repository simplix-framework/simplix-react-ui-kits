import type { ReactNode } from "react";
import { PlusIcon, Trash2Icon, XIcon } from "lucide-react";
import { useI18nEditLanguage, useTranslation } from "@simplix-react/i18n/react";
import { Button, FieldWrapper, Flex, FormFields, Grid, Stack, type LanguageSelectorPlacement } from "@simplix-react/ui";
import { partAttributes } from "@simplix-react/ui/design";

import { PACKAGE_NAMESPACE } from "./locales";
import { repeatRowStyle } from "./record-form.style";
import { emptyRow, fieldDescription, validateField, type FieldErrorCode } from "./record-form-rules";
import type {
  CheckPairValue,
  ChoiceDetailValue,
  FieldEvidence,
  RangeValue,
  RecordFormField,
  RecordRowColumn,
  SignatureValue,
  VerdictChoice,
  VerdictValue,
} from "./record-form-types";
import {
  AttachmentField,
  CheckPairField,
  ChoiceDetailField,
  type Common,
  type FieldOf,
  MonthField,
  OtpField,
  RangeField,
  ReferenceField,
  ReferenceMultiField,
  RowCells,
  SignatureField,
  VerdictField,
} from "./record-form-field-parts";
import { choicePrompt, encodeInstant, formatLocalDate, pad, parseTime } from "./record-form-field-values";

/** Props for {@link RecordFieldView}. */
export interface RecordFieldViewProps {
  readonly field: RecordFormField;
  readonly value: unknown;
  readonly onChange: (value: unknown) => void;
  /** What is wrong with the value, once the form shows its errors. */
  readonly error?: FieldErrorCode;
  /** Whether the form shows its errors, which a repeat field passes on to its rows. */
  readonly errorsShown?: boolean;
  /** What the server said about the value when it refused the last submit, in the reader's language. */
  readonly serverError?: string;
}

/**
 * Draws one {@link RecordFormField} against its value, in every surface that renders field kinds:
 * a record form, a settings form, an action dialog, and the rows of a repeat field.
 *
 * <p>A field disabled with a reason draws that reason under itself, in the field's own description.
 */
export function RecordFieldView(props: RecordFieldViewProps) {
  return (
    <Stack gap="none" data-record-field={props.field.key}>
      <FieldBody {...props} />
    </Stack>
  );
}

function FieldBody({ field, value, onChange, error, errorsShown, serverError }: RecordFieldViewProps) {
  const { t } = useTranslation(PACKAGE_NAMESPACE + "/features");
  const message = error ? t(`recordForm.errors.${error}`) : serverError;
  const disabled = Boolean(field.disabled);
  const common = { label: field.label, description: fieldDescription(field.disabled, field.hint), required: field.required, disabled, error: message, ...(field.labelHidden ? { layout: "hidden" as const } : {}) };
  switch (field.kind) {
    case "number":
      return <FormFields.NumberField {...common} value={(value as number | null) ?? null} onChange={onChange} suffix={field.unit} min={field.min} max={field.max} placeholder={field.placeholder} />;
    case "select": {
      // The chosen option's meaning reads under the field; before a choice the field's own hint does.
      const chosen = field.options.find((option) => option.value === value)?.description;
      const options = field.options.map(({ value: optionValue, label }) => ({ value: optionValue, label }));
      return <FormFields.SelectField {...common} description={fieldDescription(field.disabled, chosen ?? field.hint)} value={value as string} onChange={onChange} options={options} clearable={field.clearable} clearLabel={field.clearLabel} placeholder={field.placeholder ?? choicePrompt(t, field.options)} />;
    }
    case "radio":
      return <FormFields.RadioGroupField {...common} direction="row" value={(value as string) ?? ""} onChange={onChange} options={[...field.options]} />;
    case "multi":
      return <FormFields.MultiSelectField {...common} value={[...((value as string[]) ?? [])]} onChange={onChange} options={[...field.options]} placeholder={field.placeholder ?? choicePrompt(t, field.options)} />;
    case "date":
      return <FormFields.DateField {...common} value={(value as string) || null} onChange={(next) => onChange(formatLocalDate(next ?? undefined) ?? "")} placeholder={field.placeholder} />;
    case "switch":
      return <FormFields.SwitchField {...common} value={Boolean(value)} onChange={onChange} />;
    case "i18nText":
      return <I18nTextBody common={common} multiline={field.multiline === true} placement={field.languageSelectorPlacement} value={(value ?? {}) as Readonly<Record<string, string>>} onChange={onChange} />;
    case "textarea":
      return <FormFields.TextareaField {...common} value={(value as string) ?? ""} onChange={onChange} placeholder={field.placeholder} />;
    case "datetime":
      return <FormFields.DateTimeField {...common} value={(value as string) || null} onChange={(next) => onChange(encodeInstant(next))} displayZone={field.zone} placeholder={field.placeholder} />;
    case "time": {
      const clear = field.clearable && value ? (
        <Button type="button" size="icon-sm" variant="ghost" aria-label={t("recordForm.clear")} disabled={disabled} onClick={() => onChange(null)}>
          <XIcon />
        </Button>
      ) : undefined;
      return <FormFields.TimeField {...common} value={parseTime(value as string | null)} onChange={(next) => onChange(`${pad(next.hours)}:${pad(next.minutes)}`)} suffixControl={clear} />;
    }
    case "otp":
      return <OtpField field={field} common={{ ...common, error: field.invalid ?? common.error }} value={(value as string) ?? ""} onChange={onChange} />;
    case "month":
      return <MonthField common={common} value={(value as string) ?? ""} onChange={onChange} placeholder={field.placeholder} />;
    case "range":
      return <RangeField field={field} common={common} value={(value ?? {}) as RangeValue} onChange={onChange} />;
    case "row":
      // Wrapped like every other kind, so a reason the field is locked (and its hint and error) is drawn under it.
      return (
        <FieldWrapper {...common}>
          <RowCells columns={field.columns} value={(value ?? {}) as Readonly<Record<string, string>>} disabled={disabled} label={field.label} onChange={onChange} />
        </FieldWrapper>
      );
    case "tick":
      return <FormFields.CheckboxField {...common} value={value === true} onChange={(next) => onChange(next)} />;
    case "check":
      return (
        <FormFields.RadioGroupField
          {...common}
          direction="row"
          value={value === true ? "yes" : value === false ? "no" : ""}
          onChange={(next) => onChange(next === "yes")}
          options={[
            { value: "yes", label: t("recordForm.yes") },
            { value: "no", label: t("recordForm.no") },
          ]}
        />
      );
    case "reference":
      return <ReferenceField field={field} common={common} value={(value as string) ?? ""} onChange={onChange} />;
    case "referenceMulti":
      return <ReferenceMultiField field={field} common={common} value={(value as readonly string[]) ?? []} onChange={onChange} />;
    case "attachment":
      return <AttachmentField field={field} common={common} value={(value as readonly FieldEvidence[]) ?? []} onChange={onChange} />;
    case "signature":
      return <SignatureField field={field} common={common} value={value as SignatureValue | null} onChange={onChange} />;
    case "checkPair":
      return <CheckPairField field={field} common={common} value={(value ?? { performed: null, verified: null }) as CheckPairValue} onChange={onChange} />;
    case "verdict":
      return <VerdictField field={field} common={common} error={error} value={(value ?? { value: null }) as VerdictValue} onChange={onChange} />;
    case "choiceWithDetail":
      return <ChoiceDetailField field={field} common={common} error={error} value={(value ?? { choice: null }) as ChoiceDetailValue} onChange={onChange} />;
    case "repeat":
      return <RepeatField field={field} common={common} errorsShown={Boolean(errorsShown)} value={(value as readonly Record<string, unknown>[]) ?? []} onChange={onChange} />;
    case "password":
      return <FormFields.TextField {...common} type="password" value={(value as string) ?? ""} onChange={onChange} placeholder={field.placeholder} />;
    default:
      return <FormFields.TextField {...common} type={field.kind === "email" ? "email" : "text"} value={(value as string) ?? ""} onChange={onChange} placeholder={field.placeholder} />;
  }
}

/** A multilingual text, one language at a time, on the language the reader picked last. */
function I18nTextBody({ common, multiline, placement, value, onChange }: { readonly common: Common; readonly multiline: boolean; readonly placement?: LanguageSelectorPlacement; readonly value: Readonly<Record<string, string>>; readonly onChange: (value: unknown) => void }) {
  const language = useI18nEditLanguage();
  const Field = multiline ? FormFields.I18nTextareaField : FormFields.I18nTextField;
  return (
    <Field
      {...common}
      value={{ ...value }}
      onChange={onChange}
      languages={language.languages}
      selectedLanguage={language.selectedLanguage}
      onLanguageChange={language.onLanguageChange}
      languageSelectorPlacement={placement}
    />
  );
}

function RepeatField({ field, common, errorsShown, value, onChange }: { readonly field: FieldOf<"repeat">; readonly common: Common; readonly errorsShown: boolean; readonly value: readonly Record<string, unknown>[]; readonly onChange: (value: unknown) => void }) {
  const { t } = useTranslation(PACKAGE_NAMESPACE + "/features");
  const setCell = (index: number, key: string, cell: unknown) => onChange(value.map((row, i) => (i === index ? { ...row, [key]: cell } : row)));
  const rows: ReactNode[] = value.map((row, index) => (
    // Rows have no identity of their own until saved; the position is what the reader sees.
    // oxlint-disable-next-line no-array-index-key
    // A ruled row, not a card: the form section is already the frame, and a box per row is a box in a box.
    <div key={index} {...partAttributes(repeatRowStyle, {})}>
      <Flex gap="sm" align="start">
        <Grid columns={Math.min(field.columns.length, 3) as 1 | 2 | 3} gap="sm" className="flex-1">
          {field.columns.map((column) => (
            <RecordFieldView
              key={column.key}
              field={column.disabled === undefined && common.disabled ? { ...column, disabled: true } : column}
              value={row[column.key]}
              onChange={(cell) => setCell(index, column.key, cell)}
              error={errorsShown ? (validateField(column, row[column.key]) ?? undefined) : undefined}
              errorsShown={errorsShown}
            />
          ))}
        </Grid>
        <Button type="button" size="icon-sm" variant="ghost" disabled={common.disabled} aria-label={t("recordForm.removeRow")} onClick={() => onChange(value.filter((_, i) => i !== index))}>
          <Trash2Icon />
        </Button>
      </Flex>
    </div>
  ));
  return (
    <FieldWrapper {...common} error={common.error && value.length === 0 ? common.error : undefined}>
      <Stack gap="sm">
        {rows}
        <Flex>
          <Button type="button" size="sm" variant="outline" disabled={common.disabled} onClick={() => onChange([...value, emptyRow(field.columns)])}>
            <PlusIcon />
            {t("recordForm.addRow")}
          </Button>
        </Flex>
      </Stack>
    </FieldWrapper>
  );
}

export * from "./record-form-field-parts";
