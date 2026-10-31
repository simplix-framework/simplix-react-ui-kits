import { CalendarIcon, CameraIcon, EyeIcon, ImageIcon, PlusIcon, Trash2Icon, UploadIcon, XIcon } from "lucide-react";
import { useRef, useState, type ReactNode } from "react";
import { useI18nEditLanguage, useTranslation } from "@simplix-react/i18n/react";
import {
  Badge,
  Button,
  Checkbox,
  Calendar,
  EmptyValue,
  FieldWrapper,
  Flex,
  Input,
  FormFields,
  Grid,
  Popover,
  PopoverContent,
  PopoverTrigger,
  SignaturePad,
  Stack,
  Text,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  type TimeValue,
} from "@simplix-react/ui";

import { partAttributes, slotAttributes } from "@simplix-react/ui/design";

import { EvidenceGrid } from "../attachment";
import { useConsoleOnAPhone } from "../shell/phone-shell";
import { usePeekHost } from "../peek";
import { EntitySearchCombobox } from "./entity-search-combobox";
import { PACKAGE_NAMESPACE } from "./locales";
import { attachmentDropStyle, otpDigitStyle, otpGroupStyle, repeatRowStyle } from "./record-form.style";
import { otpBackspace, otpInsert, otpMove } from "./record-form-otp";
import { disabledReason, emptyRow, validateField, type FieldErrorCode } from "./record-form-rules";
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

/** 「HH:mm」 to the picker's value. */
function parseTime(text: string | null | undefined): TimeValue | null {
  const match = /^(\d{2}):(\d{2})$/.exec(text ?? "");
  return match ? { hours: Number(match[1]), minutes: Number(match[2]) } : null;
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

/** A calendar date string, decoded from its own components rather than through a time zone. */
function parseLocalDate(text: string | undefined): Date | undefined {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(text ?? "");
  return match ? new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3])) : undefined;
}

function formatLocalDate(date: Date | undefined): string | undefined {
  return date ? `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` : undefined;
}

/** A zone-tagged Date from the date-time picker, encoded the way it will be sent. */
function encodeInstant(date: Date | null): string {
  return date ? (JSON.parse(JSON.stringify(date)) as string) : "";
}

/**
 * Draws one {@link RecordFormField} against its value, in every surface that renders field kinds:
 * a record form, a settings form, an action dialog, and the rows of a repeat field.
 *
 * <p>A field disabled with a reason carries that reason as its tooltip.
 */
export function RecordFieldView(props: RecordFieldViewProps) {
  const reason = disabledReason(props.field.disabled);
  const body = (
    <Stack gap="none" data-record-field={props.field.key}>
      <FieldBody {...props} />
    </Stack>
  );
  if (!reason) return body;
  return (
    <Tooltip>
      <TooltipTrigger asChild>{body}</TooltipTrigger>
      <TooltipContent>{reason}</TooltipContent>
    </Tooltip>
  );
}

/** The prompt an empty select shows when the field names none: what to do, and the first choices as examples. */
function choicePrompt(t: (key: string, options?: Record<string, string>) => string, options: readonly { readonly label: string }[]): string {
  const examples = options.slice(0, 2).map((option) => option.label).join(", ");
  return examples ? t("recordForm.choosePromptWithExamples", { examples }) : t("recordForm.choosePrompt");
}

function FieldBody({ field, value, onChange, error, errorsShown, serverError }: RecordFieldViewProps) {
  const { t } = useTranslation(PACKAGE_NAMESPACE + "/features");
  const message = error ? t(`recordForm.errors.${error}`) : serverError;
  const disabled = Boolean(field.disabled);
  const common = { label: field.label, description: field.hint, required: field.required, disabled, error: message, ...(field.labelHidden ? { layout: "hidden" as const } : {}) };
  switch (field.kind) {
    case "number":
      return <FormFields.NumberField {...common} value={(value as number | null) ?? null} onChange={onChange} suffix={field.unit} min={field.min} max={field.max} placeholder={field.placeholder} />;
    case "select": {
      // The chosen option's meaning reads under the field; before a choice the field's own hint does.
      const chosen = field.options.find((option) => option.value === value)?.description;
      const options = field.options.map(({ value: optionValue, label }) => ({ value: optionValue, label }));
      return <FormFields.SelectField {...common} description={chosen ?? common.description} value={value as string} onChange={onChange} options={options} clearable={field.clearable} placeholder={field.placeholder ?? choicePrompt(t, field.options)} />;
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
      return <I18nTextBody common={common} value={(value ?? {}) as Readonly<Record<string, string>>} onChange={onChange} />;
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
      return <RowCells columns={field.columns} value={(value ?? {}) as Readonly<Record<string, string>>} disabled={Boolean(field.disabled)} label={field.label} onChange={onChange} />;
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
    default:
      return <FormFields.TextField {...common} type={field.kind === "email" ? "email" : "text"} value={(value as string) ?? ""} onChange={onChange} placeholder={field.placeholder} />;
  }
}

/** A multilingual text, one language at a time, on the language the reader picked last. */
function I18nTextBody({ common, value, onChange }: { readonly common: Common; readonly value: Readonly<Record<string, string>>; readonly onChange: (value: unknown) => void }) {
  const language = useI18nEditLanguage();
  return (
    <FormFields.I18nTextField
      {...common}
      value={{ ...value }}
      onChange={onChange}
      languages={language.languages}
      selectedLanguage={language.selectedLanguage}
      onLanguageChange={language.onLanguageChange}
    />
  );
}

interface Common {
  readonly label: string;
  readonly description?: string;
  readonly required?: boolean;
  readonly disabled: boolean;
  readonly error?: string;
}

type FieldOf<K extends RecordFormField["kind"]> = Extract<RecordFormField, { kind: K }>;

function MonthField({ common, value, onChange, placeholder }: { readonly common: Common; readonly value: string; readonly onChange: (value: unknown) => void; readonly placeholder?: string }) {
  const [open, setOpen] = useState(false);
  const match = /^(\d{4})-(\d{2})$/.exec(value);
  const selected = match ? new Date(Number(match[1]), Number(match[2]) - 1, 1) : undefined;
  return (
    <FieldWrapper {...common}>
      {(control) => (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button id={control.id} type="button" variant="outline" disabled={common.disabled}>
              <CalendarIcon />
              {value || placeholder || ""}
            </Button>
          </PopoverTrigger>
          <PopoverContent>
            <Calendar
              mode="month"
              selected={selected}
              onSelect={(date) => {
                onChange(`${date.getFullYear()}-${pad(date.getMonth() + 1)}`);
                setOpen(false);
              }}
            />
          </PopoverContent>
        </Popover>
      )}
    </FieldWrapper>
  );
}

/**
 * A one-time code as one box per digit. The boxes form one group named by the field's label; each
 * box is named by its position. Typing moves on, Backspace moves back, the arrows move between
 * boxes, and a pasted code fills every box.
 */
function OtpField({ field, common, value, onChange }: { readonly field: FieldOf<"otp">; readonly common: Common; readonly value: string; readonly onChange: (value: unknown) => void }) {
  const { t } = useTranslation(PACKAGE_NAMESPACE + "/features");
  const boxes = useRef<(HTMLInputElement | null)[]>([]);
  const focus = (index: number) => {
    const box = boxes.current[index];
    box?.focus();
    box?.select();
  };
  const apply = (edit: { readonly code: string; readonly focus: number } | null) => {
    if (!edit) return;
    onChange(edit.code);
    // At once, not on the next frame: a fast typist's next key must land in the next box.
    focus(edit.focus);
  };
  const invalid = Boolean(common.error);
  return (
    <FieldWrapper {...common}>
      {(control) => (
        <div role="group" aria-labelledby={control.labelId} aria-invalid={invalid || undefined} data-invalid={invalid || undefined} {...slotAttributes(otpGroupStyle, {})}>
          {Array.from({ length: field.length }, (_, index) => (
            <Input
              key={index}
              ref={(element: HTMLInputElement | null) => {
                boxes.current[index] = element;
              }}
              id={index === 0 ? control.id : undefined}
              value={value[index] ?? ""}
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={1}
              autoComplete={index === 0 ? "one-time-code" : "off"}
              disabled={common.disabled}
              aria-invalid={invalid || undefined}
              aria-label={t("recordForm.otpDigit", { index: index + 1, count: field.length })}
              onFocus={(event) => event.currentTarget.select()}
              onChange={(event) => apply(otpInsert(value, index, event.currentTarget.value.slice(-1) || "", field.length))}
              onPaste={(event) => {
                event.preventDefault();
                apply(otpInsert(value, index, event.clipboardData.getData("text"), field.length));
              }}
              onKeyDown={(event) => {
                if (event.key === "Backspace") {
                  event.preventDefault();
                  apply(otpBackspace(value, index));
                  return;
                }
                const next = otpMove(event.key, index, field.length);
                if (next === null) return;
                event.preventDefault();
                focus(next);
              }}
              {...partAttributes(otpDigitStyle, {})}
            />
          ))}
        </div>
      )}
    </FieldWrapper>
  );
}

function RangeField({ field, common, value, onChange }: { readonly field: FieldOf<"range">; readonly common: Common; readonly value: RangeValue; readonly onChange: (value: unknown) => void }) {
  const { t } = useTranslation(PACKAGE_NAMESPACE + "/features");
  if (field.granularity === "date")
    return (
      <FormFields.DateRangeField
        {...common}
        value={{ from: parseLocalDate(value.from), to: parseLocalDate(value.to) }}
        onChange={(range) => onChange({ from: formatLocalDate(range.from), to: formatLocalDate(range.to) })}
      />
    );
  return (
    <FieldWrapper {...common}>
      <Grid columns={2} gap="sm">
        <FormFields.DateTimeField label={t("recordForm.from")} disabled={common.disabled} value={value.from || null} displayZone={field.zone} onChange={(next) => onChange({ ...value, from: encodeInstant(next) })} />
        <FormFields.DateTimeField label={t("recordForm.to")} disabled={common.disabled} value={value.to || null} displayZone={field.zone} onChange={(next) => onChange({ ...value, to: encodeInstant(next) })} />
      </Grid>
    </FieldWrapper>
  );
}

function ReferenceField({ field, common, value, onChange }: { readonly field: FieldOf<"reference">; readonly common: Common; readonly value: string; readonly onChange: (value: unknown) => void }) {
  const { t } = useTranslation(PACKAGE_NAMESPACE + "/features");
  const peek = usePeekHost();
  const name = field.search.options.find((option) => option.value === value)?.label;
  const peekKind = field.peek ? field.peekKind : undefined;
  return (
    <EntitySearchCombobox
      {...common}
      value={value}
      onChange={onChange}
      search={field.search}
      placeholder={field.placeholder}
      suffixControl={
        peekKind && value ? (
          <Button type="button" size="icon-sm" variant="ghost" aria-label={t("recordForm.peek", { target: name ?? "" })} onClick={() => peek.open({ kind: peekKind, target: { id: value, name } })}>
            <EyeIcon />
          </Button>
        ) : undefined
      }
    />
  );
}

function ReferenceMultiField({ field, common, value, onChange }: { readonly field: FieldOf<"referenceMulti">; readonly common: Common; readonly value: readonly string[]; readonly onChange: (value: unknown) => void }) {
  const { t } = useTranslation(PACKAGE_NAMESPACE + "/features");
  // A search moves on to other pages, so the names of what was picked are kept as they were seen.
  const names = useRef(new Map<string, string>());
  for (const option of field.search.options) names.current.set(option.value, option.label);
  return (
    <Stack gap="xs">
      <EntitySearchCombobox
        {...common}
        value=""
        onChange={(id) => {
          if (id && !value.includes(id)) onChange([...value, id]);
        }}
        search={field.search}
        placeholder={field.placeholder}
      />
      {value.length > 0 ? (
        <Flex gap="xs" wrap>
          {value.map((id) => (
            <Badge key={id} variant="secondary">
              {names.current.get(id) ?? id}
              {/* A locked list offers no remove control at all, rather than one that does nothing. */}
              {common.disabled ? null : (
                <Button type="button" size="icon-xs" variant="ghost" aria-label={t("recordForm.remove")} onClick={() => onChange(value.filter((other) => other !== id))}>
                  <XIcon />
                </Button>
              )}
            </Badge>
          ))}
        </Flex>
      ) : null}
    </Stack>
  );
}

/** A file picked or dropped into an attachment field, as the evidence it becomes once saved. */
function pickedEvidence(file: File, index: number, evidenceKind: string | undefined, provenance: string): FieldEvidence {
  return {
    id: `picked:${Date.now()}:${index}:${file.name}`,
    kind: file.type.startsWith("image/") ? "photo" : "file",
    label: file.name,
    provenance,
    state: "pendingSync",
    ...(evidenceKind ? { evidenceKind } : {}),
  };
}

function fileSize(bytes: number): string {
  return bytes >= 1024 * 1024 ? `${(bytes / (1024 * 1024)).toFixed(1)}MB` : `${Math.max(1, Math.round(bytes / 1024))}KB`;
}

/**
 * An attachment field: what it holds, and always a way to add to it.
 *
 * <p>A field with an `onAdd` capture keeps one button per requested kind; any other field takes
 * files from a picker or a drop on the full-width zone, and holds them as waiting to upload until
 * the record is saved. On a phone the zone gives way to a camera and an album button, each tall
 * enough for a thumb.
 */
function AttachmentField({ field, common, value, onChange }: { readonly field: FieldOf<"attachment">; readonly common: Common; readonly value: readonly FieldEvidence[]; readonly onChange: (value: unknown) => void }) {
  const { t } = useTranslation(PACKAGE_NAMESPACE + "/features");
  const onAPhone = useConsoleOnAPhone();
  const fileInput = useRef<HTMLInputElement>(null);
  const cameraInput = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  // Only a required field draws its missing kinds as slots to fill; an optional one that holds
  // nothing says so in a line, so 「필수」 never stands on a field nobody has to fill.
  const absent = field.required ? field.evidenceKinds.filter((kind) => !value.some((item) => item.evidenceKind === kind && item.state !== "missing")) : [];
  const slots: FieldEvidence[] = absent.map((kind) => ({ id: `missing:${kind}`, kind: "file", label: kind, provenance: t("recordForm.evidenceMissing"), state: "missing", evidenceKind: kind }));
  const add = async (kind: string) => {
    const item = await field.onAdd?.(kind);
    if (item) onChange([...value, item]);
  };
  const take = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const kind = absent[0] ?? field.evidenceKinds[0];
    onChange([...value, ...Array.from(files).map((file, index) => pickedEvidence(file, index, kind, t("recordForm.pickedProvenance", { size: fileSize(file.size) })))]);
  };
  const addable = field.evidenceKinds.length > 0 ? field.evidenceKinds : [""];
  const pickers = (
    <>
      <input ref={fileInput} type="file" multiple hidden disabled={common.disabled} onChange={(event) => { take(event.currentTarget.files); event.currentTarget.value = ""; }} />
      <input ref={cameraInput} type="file" accept="image/*" capture="environment" hidden disabled={common.disabled} onChange={(event) => { take(event.currentTarget.files); event.currentTarget.value = ""; }} />
    </>
  );
  return (
    <FieldWrapper {...common}>
      <Stack gap="sm">
        {value.length + slots.length > 0 ? <EvidenceGrid items={[...value, ...slots]} /> : null}
        {field.onAdd ? (
          <Flex gap="xs" wrap>
            {addable.map((kind) => (
              <Button key={kind} type="button" size="sm" variant="outline" disabled={common.disabled} onClick={() => void add(kind)}>
                <PlusIcon />
                {kind ? t("recordForm.addEvidenceOf", { kind }) : t("recordForm.addEvidence")}
              </Button>
            ))}
          </Flex>
        ) : onAPhone ? (
          <Grid columns={2} gap="sm">
            {pickers}
            <Button type="button" variant="outline" className="h-12" disabled={common.disabled} onClick={() => cameraInput.current?.click()}>
              <CameraIcon />
              {t("recordForm.takePhoto")}
            </Button>
            <Button type="button" variant="outline" className="h-12" disabled={common.disabled} onClick={() => fileInput.current?.click()}>
              <ImageIcon />
              {t("recordForm.pickFromAlbum")}
            </Button>
          </Grid>
        ) : (
          <div
            className="flex w-full flex-wrap items-center justify-between"
            {...slotAttributes(attachmentDropStyle, { dragging })}
            onDragOver={(event) => { if (common.disabled) return; event.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={(event) => { event.preventDefault(); setDragging(false); if (!common.disabled) take(event.dataTransfer.files); }}
          >
            {pickers}
            <Text size="sm" tone="muted">
              {value.length > 0 ? t("recordForm.dropMore") : t("recordForm.dropHint")}
            </Text>
            <Button type="button" size="sm" variant="outline" disabled={common.disabled} onClick={() => fileInput.current?.click()}>
              <UploadIcon />
              {t("recordForm.chooseFile")}
            </Button>
          </div>
        )}
      </Stack>
    </FieldWrapper>
  );
}

/** The signer's name as drawn: a delegated signature carries 「代」 before the name. */
export function signerLabel(signature: Pick<SignatureValue, "name" | "acting">): string {
  return signature.acting === "DELEGATED" ? `代 ${signature.name}` : signature.name;
}

/**
 * A signature field: what is being signed and by whom, written above the pad, and a text control to
 * start the pad again.
 *
 * <p>The role is plain text beside the signer, never a chip that reads as a button. Starting again
 * remounts the pad, which is the one way to empty it from outside.
 */
function SignatureField({ field, common, value, onChange }: { readonly field: FieldOf<"signature">; readonly common: Common; readonly value: SignatureValue | null; readonly onChange: (value: unknown) => void }) {
  const { t } = useTranslation(PACKAGE_NAMESPACE + "/features");
  const [round, setRound] = useState(0);
  const given = value && !value.dataUrl ? value : null;
  const signer = [field.signerName, field.role].filter(Boolean).join(" · ");
  return (
    <FieldWrapper {...common}>
      <Stack gap="xs">
        {field.statement ? <Text size="sm">{field.statement}</Text> : null}
        {signer ? (
          <Text size="sm" tone="muted">
            {t("recordForm.signer", { signer })}
          </Text>
        ) : null}
        {given ? (
          <Text size="sm">
            {signerLabel(given)} · {given.at}
          </Text>
        ) : (
          <>
            <SignaturePad
              key={round}
              mode="drawn"
              disabled={common.disabled}
              className="[&_[data-slot=signature-pad-clear]]:hidden"
              onChange={(dataUrl) => onChange(dataUrl ? { name: field.signerName ?? "", at: new Date().toISOString(), acting: "SELF", dataUrl } satisfies SignatureValue : null)}
            />
            {common.disabled ? null : (
              <Flex justify="end">
                <Button
                  type="button"
                  variant="outline"
                  className="min-h-11 min-w-11"
                  onClick={() => {
                    setRound((n) => n + 1);
                    onChange(null);
                  }}
                >
                  {t("recordForm.signAgain")}
                </Button>
              </Flex>
            )}
          </>
        )}
      </Stack>
    </FieldWrapper>
  );
}

function CheckPairField({ field, common, value, onChange }: { readonly field: FieldOf<"checkPair">; readonly common: Common; readonly value: CheckPairValue; readonly onChange: (value: unknown) => void }) {
  const side = (key: "performed" | "verified", label: string, by: string | undefined) => (
    <FormFields.CheckboxField
      label={label}
      description={by}
      disabled={common.disabled || field.editable !== key}
      value={value[key] === true}
      onChange={(checked) => onChange({ ...value, [key]: checked })}
    />
  );
  return (
    <FieldWrapper {...common}>
      <Grid columns={2} gap="sm">
        {side("performed", field.sideLabels[0], field.performedBy)}
        {side("verified", field.sideLabels[1], field.verifiedBy)}
      </Grid>
    </FieldWrapper>
  );
}

const VERDICTS: readonly VerdictChoice[] = ["GOOD", "BAD", "NOT_APPLICABLE"];

function VerdictField({ field, common, error, value, onChange }: { readonly field: FieldOf<"verdict">; readonly common: Common; readonly error?: FieldErrorCode; readonly value: VerdictValue; readonly onChange: (value: unknown) => void }) {
  const { t } = useTranslation(PACKAGE_NAMESPACE + "/features");
  return (
    <Stack gap="xs">
      <FormFields.RadioGroupField
        {...common}
        error={error === "noteRequired" ? undefined : common.error}
        direction="row"
        value={value.value ?? ""}
        onChange={(next) => onChange({ ...value, value: next as VerdictChoice })}
        options={VERDICTS.map((choice, index) => ({ value: choice, label: field.labels[index] ?? choice }))}
      />
      {value.value === "NOT_APPLICABLE" ? (
        <FormFields.TextareaField
          label={t("recordForm.notApplicableReason")}
          required
          disabled={common.disabled}
          error={error === "noteRequired" ? common.error : undefined}
          value={value.note ?? ""}
          onChange={(note) => onChange({ ...value, note })}
        />
      ) : null}
    </Stack>
  );
}

function ChoiceDetailField({ field, common, error, value, onChange }: { readonly field: FieldOf<"choiceWithDetail">; readonly common: Common; readonly error?: FieldErrorCode; readonly value: ChoiceDetailValue; readonly onChange: (value: unknown) => void }) {
  const { t } = useTranslation(PACKAGE_NAMESPACE + "/features");
  return (
    <Stack gap="xs">
      <FormFields.RadioGroupField
        {...common}
        error={error === "detailRequired" ? undefined : common.error}
        value={value.choice ?? ""}
        onChange={(choice) => onChange({ ...value, choice })}
        options={[...field.options]}
      />
      {value.choice === field.otherValue ? (
        <FormFields.TextField
          label={t("recordForm.otherDetail")}
          required
          disabled={common.disabled}
          error={error === "detailRequired" ? common.error : undefined}
          value={value.detail ?? ""}
          onChange={(detail) => onChange({ ...value, detail })}
        />
      ) : null}
    </Stack>
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

/** What one column of a repeated row needs to draw its control. */
interface RowColumnProps {
  readonly column: RecordRowColumn;
  readonly value: Readonly<Record<string, string>>;
  readonly disabled: boolean;
  readonly label: string;
  readonly onChange: (next: Readonly<Record<string, string>>) => void;
}

/**
 * One column of a repeated source row: a text box for a free column, a row of choices for a column
 * answered by a few words (상 · 중 · 하).
 */
export function RowColumnInput({ column, value, disabled, label, onChange }: RowColumnProps) {
  if (column.readOnly) {
    const text = value[column.key];
    return text ? (
      <Text aria-label={`${label} ${column.label}`} className="whitespace-nowrap">
        {text}
      </Text>
    ) : (
      <EmptyValue />
    );
  }
  if (column.tick) {
    return (
      <Checkbox
        aria-label={`${label} ${column.label}`}
        checked={value[column.key] === "true"}
        disabled={disabled}
        onCheckedChange={(next) => onChange({ ...value, [column.key]: next === true ? "true" : "" })}
      />
    );
  }
  if (column.options?.length) {
    return (
      <Flex gap="none" role="radiogroup" aria-label={`${label} ${column.label}`}>
        {column.options.map((option) => (
          <Button
            key={option.value}
            size="xs"
            variant={value[column.key] === option.value ? "default" : "outline"}
            role="radio"
            aria-checked={value[column.key] === option.value}
            disabled={disabled}
            onClick={() => onChange({ ...value, [column.key]: option.value })}
          >
            {option.label}
          </Button>
        ))}
      </Flex>
    );
  }
  return (
    <Input
      aria-label={`${label} ${column.label}`}
      // A free cell keeps room for a date or a total beside wide choice columns.
      className="min-w-28"
      value={value[column.key] ?? ""}
      disabled={disabled}
      onChange={(event) => onChange({ ...value, [column.key]: event.target.value })}
    />
  );
}

/** The cells of one repeated source row side by side, for a row drawn outside its table. */
export function RowCells({ columns, ...rest }: Omit<RowColumnProps, "column"> & { readonly columns: readonly RecordRowColumn[] }) {
  return (
    <Flex gap="xs" align="center">
      {columns.map((column) => (
        <RowColumnInput key={column.key} column={column} {...rest} />
      ))}
    </Flex>
  );
}
