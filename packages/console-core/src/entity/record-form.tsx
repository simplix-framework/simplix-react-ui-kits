import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { getErrorMessage, getValidationErrors } from "@simplix-react/api";
import { useTranslation } from "@simplix-react/i18n/react";
import { Button, CrudForm, Flex, Heading, Stack, Text, useUnsavedChanges } from "@simplix-react/ui";
import { slotAttributes } from "@simplix-react/ui/design";

import { RecordNote, RecordNotices, RecordVerbButton, type RecordNotice, type RecordVerb } from "./record-blocks";
import { FormErrorSummary } from "./form-error-summary";
import { PACKAGE_NAMESPACE } from "./locales";
import { formMoreStyle } from "./record-form.style";
import { RecordFieldView } from "./record-form-fields";
import { fieldShown, formFieldErrors, initialFieldValue, requiredProgress } from "./record-form-rules";
import type { RecordFormSection } from "./record-form-types";

export type { RecordFormField, RecordFormSection, RecordOption } from "./record-form-types";

type Values = Record<string, unknown>;

function initialValues(sections: readonly RecordFormSection[]): Values {
  const values: Values = {};
  for (const section of sections) for (const field of section.fields) values[field.key] = initialFieldValue(field);
  return values;
}

/**
 * Whether any value of a form differs from the one it started with. Values are compared by their
 * JSON, since a field's value may be a list or a per-language map; a key the baseline never held
 * (a field a later section draws) is not a change.
 *
 * @param baseline the values the form started with
 * @param values the values as they stand
 */
export function valuesChanged(baseline: Readonly<Record<string, unknown>>, values: Readonly<Record<string, unknown>>): boolean {
  return Object.keys(values).some((key) => key in baseline && JSON.stringify(values[key]) !== JSON.stringify(baseline[key]));
}

/**
 * Moves the focus to the first control of a field, after the error marks have been drawn.
 *
 * @param key - The field's key, as its wrapper's `data-record-field` carries it.
 */
function focusField(key: string | undefined): void {
  if (!key || typeof document === "undefined") return;
  requestAnimationFrame(() => {
    const wrapper = document.querySelector(`[data-record-field="${CSS.escape(key)}"]`);
    const control = wrapper?.querySelector<HTMLElement>("input, textarea, button, [tabindex]:not([tabindex='-1'])");
    control?.focus();
    wrapper?.scrollIntoView({ block: "center" });
  });
}

/** What the server answered when it refused a submit: its message, and the fields it named. */
export interface SubmitRefusal {
  /** The server's own sentence, in the reader's language; absent when it named fields instead. */
  readonly message?: string;
  /** The server's message per refused field, keyed by the form field it belongs to. */
  readonly fields: Readonly<Record<string, string>>;
  /** What the server calls each refused field, for a field the form does not draw. */
  readonly labels: Readonly<Record<string, string>>;
}

/**
 * Reads a refused submit. A server field is matched to the form field of the same key, or to the
 * localized field it is the plain half of (`roleName` for `roleNameI18n`).
 */
export function refusalOf(error: unknown, fieldKeys: readonly string[]): SubmitRefusal {
  const invalid = getValidationErrors(error) ?? [];
  const fields: Record<string, string> = {};
  const labels: Record<string, string> = {};
  for (const one of invalid) {
    const key = fieldKeys.includes(one.field) ? one.field : fieldKeys.includes(`${one.field}I18n`) ? `${one.field}I18n` : one.field;
    if (!fields[key]) fields[key] = one.message;
    if (one.label && !labels[key]) labels[key] = one.label;
  }
  const drawn = Object.keys(fields).some((key) => fieldKeys.includes(key));
  return { message: drawn ? undefined : getErrorMessage(error), fields, labels };
}

/** The fields of a form's sections with their values, shared by {@link RecordForm} and {@link SettingsForm}. */
export function useRecordFormValues(sections: readonly RecordFormSection[]) {
  const [values, setValues] = useState<Values>(() => initialValues(sections));
  const [shown, setShown] = useState(false);
  const errors = formFieldErrors(sections, values);
  const missing = Object.keys(errors);
  return {
    values,
    set: (key: string, value: unknown) => setValues((current) => ({ ...current, [key]: value })),
    /** The keys of the fields that refuse their value, in drawing order. */
    missing,
    /** Why each refused field refuses it. */
    errors,
    /** Marks the refused fields and moves the focus to the first of them. */
    showErrors: () => {
      setShown(true);
      focusField(missing[0]);
    },
    errorsShown: shown,
  };
}

/** Draws form sections against their values; for a form inside something else (a dialog). */
export function RecordFormSections({
  sections,
  form,
  flat = false,
  refusal,
  fieldNotices,
}: {
  readonly sections: readonly RecordFormSection[];
  readonly form: ReturnType<typeof useRecordFormValues>;
  /** Draws the sections without their card, for a surface that is already one: a dialog, a panel. */
  readonly flat?: boolean;
  /** The fields the server refused on the last submit. */
  readonly refusal?: SubmitRefusal;
  /** What each field says beside it for the values as they stand ({@link RecordFormProps.fieldNotices}). */
  readonly fieldNotices?: RecordFormProps["fieldNotices"];
}) {
  const live = fieldNotices?.(form.values) ?? {};
  const fieldLabels = new Map(sections.flatMap((section) => section.fields).map((field) => [field.key, field.label]));
  const { t } = useTranslation(PACKAGE_NAMESPACE + "/features");
  const shownErrors = form.errorsShown ? Object.fromEntries(Object.entries(form.errors).map(([key, code]) => [key, t(`recordForm.errors.${code}`)])) : undefined;
  return (
    <>
      <FormErrorSummary
        fieldErrors={shownErrors ?? (refusal && Object.keys(refusal.fields).length > 0 ? refusal.fields : undefined)}
        label={(key) => fieldLabels.get(key) ?? key}
        serverLabels={refusal?.labels}
      />
      {sections.map((section) => (
        <CrudForm.Section key={section.key} title={section.title} variant={flat ? "flat" : undefined} layout={section.columns === 2 ? "two-column" : "single-column"}>
          {section.fields.filter((field) => fieldShown(field, form.values)).map((field) => (
            <RecordFieldView
              key={field.key}
              field={live[field.key] ? { ...field, hint: live[field.key] } : field}
              value={form.values[field.key]}
              onChange={(value) => form.set(field.key, value)}
              error={form.errorsShown ? form.errors[field.key] : undefined}
              errorsShown={form.errorsShown}
              serverError={refusal?.fields[field.key]}
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
  /**
   * Sends the values. A returned promise that rejects is the server refusing them: the form says
   * so in a banner at its top and marks the fields the refusal names, instead of the rejection
   * escaping as an unhandled error while the form looks as if nothing happened.
   */
  readonly onSubmit?: (values: Readonly<Record<string, unknown>>) => void | Promise<unknown>;
  readonly onCancel?: () => void;
  /** Actions beside the submit, such as a narrower alternative. */
  readonly actions?: readonly RecordVerb[];
  /** What the form edits beyond its fields, drawn under them: a permission matrix, a list of rows. */
  readonly children?: ReactNode;
  /**
   * What the form says beside a field while it is being filled in, computed from the values as
   * they stand (a rank another record already holds). It takes the field's hint line while it has
   * something to say, so it sits where the reader is looking and leaves when the value changes.
   */
  readonly fieldNotices?: (values: Readonly<Record<string, unknown>>) => Readonly<Record<string, string | undefined>>;
}

/**
 * A record being made or changed, in the panel the record would open in: sections of declared
 * fields, the messages that explain them, and the finishing verbs. Required fields left empty are
 * marked when the reader tries to finish, and nothing is sent until they are filled.
 */
export function RecordForm({ title, sections, notices, note, submitLabel, onSubmit, onCancel, actions = [], children, fieldNotices }: RecordFormProps) {
  const { t: tUi } = useTranslation("simplix/ui");
  const { t } = useTranslation(PACKAGE_NAMESPACE + "/features");
  const form = useRecordFormValues(sections);
  const progress = requiredProgress(sections, form.values);
  const [refusal, setRefusal] = useState<SubmitRefusal | undefined>(undefined);
  const [pending, setPending] = useState(false);
  // Leaving with typed input asks first, whether by the cancel button or the panel's close, and
  // closing the tab warns too. A save in flight is not unsaved, so it never asks.
  const [baseline] = useState(() => initialValues(sections));
  const { guardedNavigate, dialog } = useUnsavedChanges({ isDirty: valuesChanged(baseline, form.values) && !pending });
  const leave = onCancel ? () => guardedNavigate(onCancel) : undefined;
  const fieldKeys = sections.flatMap((section) => section.fields.map((field) => field.key));
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (form.missing.length > 0) {
      form.showErrors();
      return;
    }
    setRefusal(undefined);
    const sent = onSubmit?.(form.values);
    if (!sent || typeof (sent as Promise<unknown>).then !== "function") return;
    setPending(true);
    (sent as Promise<unknown>)
      .catch((error: unknown) => setRefusal(refusalOf(error, fieldKeys)))
      .finally(() => setPending(false));
  };
  return (
    // The form checks its own values and says why in the field and the summary, in the reader's
    // language; the browser's constraint bubble would stop the submit first, in its own.
    <>
      <CrudForm
        variant="panel"
        noValidate
        onSubmit={submit}
        onClose={leave}
        header={
          // How many required fields are answered, so a reader who sees the first few fields of a long
          // form knows how much is still below.
          <Stack gap="none" minSize>
            <Heading level={4}>{title}</Heading>
            {progress.total > 0 ? (
              <Text as="span" size="caption" tone="muted" aria-live="polite" data-form-progress>
                {t("recordForm.progress", { total: progress.total, filled: progress.filled })}
              </Text>
            ) : null}
          </Stack>
        }
        footer={
          <CrudForm.Actions spread={Boolean(onCancel)}>
            {onCancel ? (
              <Button type="button" size="sm" variant="outline" onClick={leave}>
                {tUi("common.cancel")}
              </Button>
            ) : null}
            {actions.map((action) => (
              <RecordVerbButton key={action.label} verb={action} />
            ))}
            <Button type="submit" size="sm" loading={pending} loadingText={submitLabel} disabled={pending}>
              {submitLabel}
            </Button>
          </CrudForm.Actions>
        }
      >
        {/* Notices come first: a reason the form cannot go through is read before any field is filled. */}
        <RecordNotices notices={refusal ? [{ key: "submit-refused", tone: "danger", title: t("recordForm.refused"), body: refusal.message }, ...(notices ?? [])] : notices} />
        <RecordFormSections sections={sections} form={form} refusal={refusal} fieldNotices={fieldNotices} />
        {children}
        <RecordNote text={note} />
        <FormMore />
      </CrudForm>
      {dialog}
    </>
  );
}

/**
 * Sticks to the foot of the scrolling body while fields remain below it, fading the last visible
 * field so the reader can tell the form goes on; at the end it is the room that keeps the last
 * field clear of the save bar. The fade is painted only while the body overflows below, since
 * with nothing under it a fade only shows its own colour against whatever surface the form is on.
 */
function FormMore() {
  const ref = useRef<HTMLDivElement | null>(null);
  const [overflow, setOverflow] = useState(false);
  useEffect(() => {
    const body = ref.current?.closest<HTMLElement>("[data-crud-slot=body]");
    if (!body) return;
    // One pixel of slack: fractional layout leaves scrollHeight a subpixel past the box.
    const measure = () => setOverflow(body.scrollTop + body.clientHeight < body.scrollHeight - 1);
    measure();
    body.addEventListener("scroll", measure, { passive: true });
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(measure);
    observer?.observe(body);
    if (body.firstElementChild) observer?.observe(body.firstElementChild);
    return () => {
      body.removeEventListener("scroll", measure);
      observer?.disconnect();
    };
  }, []);
  return <div ref={ref} aria-hidden data-form-more className="pointer-events-none sticky bottom-0 h-8 shrink-0" {...slotAttributes(formMoreStyle, { overflow })} />;
}

/** Props for {@link SettingsForm}. */
export interface SettingsFormProps {
  readonly sections: readonly RecordFormSection[];
  readonly notices?: readonly RecordNotice[];
  readonly note?: string;
  /**
   * Saves the settings; with it the form carries 취소 and 저장 once a value has changed. A promise
   * keeps the form dirty until it resolves, so a refused save leaves the edits in place to retry.
   */
  readonly onSave?: (values: Readonly<Record<string, unknown>>) => void | Promise<void>;
}

/**
 * An installation's settings on a page of their own: sections of declared fields with their units
 * and hints. Saved from the page header's action, so it draws no footer of its own.
 */
export function SettingsForm({ sections, notices, note, onSave }: SettingsFormProps) {
  const { t: tUi } = useTranslation("simplix/ui");
  const [saved, setSaved] = useState(() => initialValues(sections));
  const [saving, setSaving] = useState(false);
  const form = useRecordFormValues(sections);
  const changed = Object.keys(form.values).some((key) => JSON.stringify(form.values[key]) !== JSON.stringify(saved[key]));
  // Sections stand apart by the form's section gap, as they do in every other form.
  return (
    <Stack gap="md">
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
            disabled={!changed || saving}
            onClick={() => {
              if (form.missing.length > 0) {
                form.showErrors();
                return;
              }
              const values = form.values;
              const result = onSave(values);
              if (!(result instanceof Promise)) {
                setSaved(values);
                return;
              }
              setSaving(true);
              result.then(() => setSaved(values), () => undefined).finally(() => setSaving(false));
            }}
          >
            {tUi("common.save")}
          </Button>
        </Flex>
      ) : null}
    </Stack>
  );
}
