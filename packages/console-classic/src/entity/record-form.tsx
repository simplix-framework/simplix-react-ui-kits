import { useState, type FormEvent, type ReactNode } from "react";
import { useTranslation } from "@simplix-react/i18n/react";
import { Button, CrudForm, Flex, FormFields, Heading } from "@simplix-react/ui";

import { RecordNote, RecordNotices, RecordVerbButton, type RecordNotice, type RecordVerb } from "./record-blocks";
import { PACKAGE_NAMESPACE } from "./locales";

/** A choice a select or a multi-select offers. */
export interface RecordOption {
  readonly value: string;
  readonly label: string;
}

/** One field of a {@link RecordForm} or a {@link SettingsForm}, declared rather than drawn. */
export type RecordFormField =
  | ({ readonly kind: "text" | "email" | "textarea"; readonly value?: string } & FieldCommon)
  | ({ readonly kind: "number"; readonly value?: number | null; readonly unit?: string; readonly min?: number; readonly max?: number } & FieldCommon)
  | ({ readonly kind: "select"; readonly value?: string; readonly options: readonly RecordOption[] } & FieldCommon)
  | ({ readonly kind: "multi"; readonly value?: readonly string[]; readonly options: readonly RecordOption[] } & FieldCommon)
  | ({ readonly kind: "date"; readonly value?: string } & FieldCommon)
  | ({ readonly kind: "switch"; readonly value?: boolean } & FieldCommon);

interface FieldCommon {
  readonly key: string;
  readonly label: string;
  /** What to know before filling it in, under the field. */
  readonly hint?: string;
  readonly required?: boolean;
  readonly placeholder?: string;
  readonly disabled?: boolean;
}

/** One section of fields. */
export interface RecordFormSection {
  readonly key: string;
  readonly title?: string;
  readonly fields: readonly RecordFormField[];
  /** Two columns where the fields are short; one where they are sentences. */
  readonly columns?: 1 | 2;
}

type Values = Record<string, unknown>;

function initialValues(sections: readonly RecordFormSection[]): Values {
  const values: Values = {};
  for (const section of sections) for (const field of section.fields) values[field.key] = field.value ?? (field.kind === "multi" ? [] : field.kind === "switch" ? false : field.kind === "number" ? null : "");
  return values;
}

function isEmpty(value: unknown): boolean {
  return value === null || value === undefined || value === "" || (Array.isArray(value) && value.length === 0);
}

/** Draws one {@link RecordFormField} against a value. */
function FieldView({ field, value, onChange, error }: { readonly field: RecordFormField; readonly value: unknown; readonly onChange: (value: unknown) => void; readonly error?: string }) {
  const common = { label: field.label, description: field.hint, required: field.required, disabled: field.disabled, error };
  switch (field.kind) {
    case "number":
      return <FormFields.NumberField {...common} value={(value as number | null) ?? null} onChange={onChange} suffix={field.unit} min={field.min} max={field.max} placeholder={field.placeholder} />;
    case "select":
      return <FormFields.SelectField {...common} value={value as string} onChange={onChange} options={[...field.options]} placeholder={field.placeholder} />;
    case "multi":
      return <FormFields.MultiSelectField {...common} value={[...((value as string[]) ?? [])]} onChange={onChange} options={[...field.options]} placeholder={field.placeholder} />;
    case "date":
      return <FormFields.DateField {...common} value={(value as string) || null} onChange={(next) => onChange(next ? next.toISOString().slice(0, 10) : "")} placeholder={field.placeholder} />;
    case "switch":
      return <FormFields.SwitchField {...common} value={Boolean(value)} onChange={onChange} />;
    case "textarea":
      return <FormFields.TextareaField {...common} value={(value as string) ?? ""} onChange={onChange} placeholder={field.placeholder} />;
    default:
      return <FormFields.TextField {...common} type={field.kind === "email" ? "email" : "text"} value={(value as string) ?? ""} onChange={onChange} placeholder={field.placeholder} />;
  }
}

/** The fields of a form's sections with their values, shared by {@link RecordForm} and {@link SettingsForm}. */
export function useRecordFormValues(sections: readonly RecordFormSection[]) {
  const [values, setValues] = useState<Values>(() => initialValues(sections));
  const [shown, setShown] = useState(false);
  const missing = sections.flatMap((s) => s.fields).filter((f) => f.required && isEmpty(values[f.key])).map((f) => f.key);
  return {
    values,
    set: (key: string, value: unknown) => setValues((current) => ({ ...current, [key]: value })),
    missing,
    showErrors: () => setShown(true),
    errorsShown: shown,
  };
}

/** Draws form sections against their values; for a form inside something else (a dialog). */
export function RecordFormSections({ sections, form }: { readonly sections: readonly RecordFormSection[]; readonly form: ReturnType<typeof useRecordFormValues> }) {
  const { t } = useTranslation(PACKAGE_NAMESPACE + "/features");
  return (
    <>
      {sections.map((section) => (
        <CrudForm.Section key={section.key} title={section.title} layout={section.columns === 2 ? "two-column" : "single-column"}>
          {section.fields.map((field) => (
            <FieldView
              key={field.key}
              field={field}
              value={form.values[field.key]}
              onChange={(value) => form.set(field.key, value)}
              error={form.errorsShown && form.missing.includes(field.key) ? t("recordForm.required") : undefined}
            />
          ))}
        </CrudForm.Section>
      ))}
    </>
  );
}

/** Props for {@link RecordForm}. */
export interface RecordFormProps {
  readonly title: string;
  readonly sections: readonly RecordFormSection[];
  readonly notices?: readonly RecordNotice[];
  readonly note?: string;
  /** The verb that finishes it, such as 「초대 보내기」. */
  readonly submitLabel: string;
  readonly onSubmit?: (values: Readonly<Record<string, unknown>>) => void;
  readonly onCancel?: () => void;
  /** Actions beside the submit, such as a narrower alternative. */
  readonly actions?: readonly RecordVerb[];
  /** What the form edits beyond its fields, drawn under them: a permission matrix, a list of rows. */
  readonly children?: ReactNode;
}

/**
 * A record being made or changed, in the panel the record would open in: sections of declared
 * fields, the messages that explain them, and the finishing verbs. Required fields left empty are
 * marked when the reader tries to finish, and nothing is sent until they are filled.
 */
export function RecordForm({ title, sections, notices, note, submitLabel, onSubmit, onCancel, actions = [], children }: RecordFormProps) {
  const { t: tUi } = useTranslation("simplix/ui");
  const form = useRecordFormValues(sections);
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (form.missing.length > 0) {
      form.showErrors();
      return;
    }
    onSubmit?.(form.values);
  };
  return (
    <CrudForm
      variant="panel"
      onSubmit={submit}
      onClose={onCancel}
      header={<Heading level={4} tone="muted">{title}</Heading>}
      footer={
        <CrudForm.Actions spread={Boolean(onCancel)}>
          {onCancel ? (
            <Button type="button" size="sm" variant="outline" onClick={onCancel}>
              {tUi("common.cancel")}
            </Button>
          ) : null}
          {actions.map((action) => (
            <RecordVerbButton key={action.label} verb={action} />
          ))}
          <Button type="submit" size="sm">
            {submitLabel}
          </Button>
        </CrudForm.Actions>
      }
    >
      <RecordFormSections sections={sections} form={form} />
      {children}
      <RecordNotices notices={notices} />
      <RecordNote text={note} />
    </CrudForm>
  );
}

/** Props for {@link SettingsForm}. */
export interface SettingsFormProps {
  readonly sections: readonly RecordFormSection[];
  readonly notices?: readonly RecordNotice[];
  readonly note?: string;
  /** Saves the settings; with it the form carries 취소 and 저장 once a value has changed. */
  readonly onSave?: (values: Readonly<Record<string, unknown>>) => void;
}

/**
 * An installation's settings on a page of their own: sections of declared fields with their units
 * and hints. Saved from the page header's action, so it draws no footer of its own.
 */
export function SettingsForm({ sections, notices, note, onSave }: SettingsFormProps) {
  const { t: tUi } = useTranslation("simplix/ui");
  const [saved, setSaved] = useState(() => initialValues(sections));
  const form = useRecordFormValues(sections);
  const changed = Object.keys(form.values).some((key) => JSON.stringify(form.values[key]) !== JSON.stringify(saved[key]));
  return (
    <>
      <RecordNotices notices={notices} />
      <RecordFormSections sections={sections} form={form} />
      <RecordNote text={note} />
      {onSave ? (
        <Flex gap="xs" justify="end">
          <Button type="button" size="sm" variant="outline" disabled={!changed} onClick={() => Object.entries(saved).forEach(([key, value]) => form.set(key, value))}>
            {tUi("common.cancel")}
          </Button>
          <Button
            type="button"
            size="sm"
            disabled={!changed}
            onClick={() => {
              if (form.missing.length > 0) {
                form.showErrors();
                return;
              }
              onSave(form.values);
              setSaved(form.values);
            }}
          >
            {tUi("common.save")}
          </Button>
        </Flex>
      ) : null}
    </>
  );
}
