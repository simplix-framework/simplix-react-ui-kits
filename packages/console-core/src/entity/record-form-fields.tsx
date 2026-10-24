import { CalendarIcon, EyeIcon, PlusIcon, Trash2Icon, XIcon } from "lucide-react";
import { useRef, useState, type ReactNode } from "react";
import { useTranslation } from "@simplix-react/i18n/react";
import {
  Badge,
  Button,
  Calendar,
  Card,
  FieldWrapper,
  Flex,
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

import { EvidenceGrid } from "../attachment";
import { usePeekHost } from "../peek";
import { EntitySearchCombobox } from "./entity-search-combobox";
import { PACKAGE_NAMESPACE } from "./locales";
import { disabledReason, emptyRow, validateField, type FieldErrorCode } from "./record-form-rules";
import type {
  CheckPairValue,
  ChoiceDetailValue,
  FieldEvidence,
  RangeValue,
  RecordFormField,
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

function FieldBody({ field, value, onChange, error, errorsShown }: RecordFieldViewProps) {
  const { t } = useTranslation(PACKAGE_NAMESPACE + "/features");
  const message = error ? t(`recordForm.errors.${error}`) : undefined;
  const disabled = Boolean(field.disabled);
  const common = { label: field.label, description: field.hint, required: field.required, disabled, error: message };
  switch (field.kind) {
    case "number":
      return <FormFields.NumberField {...common} value={(value as number | null) ?? null} onChange={onChange} suffix={field.unit} min={field.min} max={field.max} placeholder={field.placeholder} />;
    case "select":
      return <FormFields.SelectField {...common} value={value as string} onChange={onChange} options={[...field.options]} placeholder={field.placeholder} />;
    case "multi":
      return <FormFields.MultiSelectField {...common} value={[...((value as string[]) ?? [])]} onChange={onChange} options={[...field.options]} placeholder={field.placeholder} />;
    case "date":
      return <FormFields.DateField {...common} value={(value as string) || null} onChange={(next) => onChange(formatLocalDate(next ?? undefined) ?? "")} placeholder={field.placeholder} />;
    case "switch":
      return <FormFields.SwitchField {...common} value={Boolean(value)} onChange={onChange} />;
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
    case "month":
      return <MonthField common={common} value={(value as string) ?? ""} onChange={onChange} placeholder={field.placeholder} />;
    case "range":
      return <RangeField field={field} common={common} value={(value ?? {}) as RangeValue} onChange={onChange} />;
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
              <Button type="button" size="icon-xs" variant="ghost" disabled={common.disabled} aria-label={t("recordForm.remove")} onClick={() => onChange(value.filter((other) => other !== id))}>
                <XIcon />
              </Button>
            </Badge>
          ))}
        </Flex>
      ) : null}
    </Stack>
  );
}

function AttachmentField({ field, common, value, onChange }: { readonly field: FieldOf<"attachment">; readonly common: Common; readonly value: readonly FieldEvidence[]; readonly onChange: (value: unknown) => void }) {
  const { t } = useTranslation(PACKAGE_NAMESPACE + "/features");
  const absent = field.evidenceKinds.filter((kind) => !value.some((item) => item.evidenceKind === kind && item.state !== "missing"));
  const slots: FieldEvidence[] = absent.map((kind) => ({ id: `missing:${kind}`, kind: "file", label: kind, provenance: t("recordForm.evidenceMissing"), state: "missing", evidenceKind: kind }));
  const add = async (kind: string) => {
    const item = await field.onAdd?.(kind);
    if (item) onChange([...value, item]);
  };
  const addable = field.evidenceKinds.length > 0 ? field.evidenceKinds : [""];
  return (
    <FieldWrapper {...common}>
      <Stack gap="sm">
        <EvidenceGrid items={[...value, ...slots]} />
        {field.onAdd ? (
          <Flex gap="xs" wrap>
            {addable.map((kind) => (
              <Button key={kind} type="button" size="sm" variant="outline" disabled={common.disabled} onClick={() => void add(kind)}>
                <PlusIcon />
                {kind ? t("recordForm.addEvidenceOf", { kind }) : t("recordForm.addEvidence")}
              </Button>
            ))}
          </Flex>
        ) : null}
      </Stack>
    </FieldWrapper>
  );
}

/** The signer's name as drawn: a delegated signature carries 「代」 before the name. */
export function signerLabel(signature: Pick<SignatureValue, "name" | "acting">): string {
  return signature.acting === "DELEGATED" ? `代 ${signature.name}` : signature.name;
}

function SignatureField({ field, common, value, onChange }: { readonly field: FieldOf<"signature">; readonly common: Common; readonly value: SignatureValue | null; readonly onChange: (value: unknown) => void }) {
  const given = value && !value.dataUrl ? value : null;
  return (
    <FieldWrapper {...common} labelExtra={<Badge variant="outline">{field.role}</Badge>}>
      {given ? (
        <Text size="sm">
          {signerLabel(given)} · {given.at}
        </Text>
      ) : (
        <SignaturePad
          mode="drawn"
          disabled={common.disabled}
          onChange={(dataUrl) => onChange(dataUrl ? { name: field.signerName ?? "", at: new Date().toISOString(), acting: "SELF", dataUrl } satisfies SignatureValue : null)}
        />
      )}
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
    <Card key={index}>
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
    </Card>
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
