import { useRef, useState } from "react";
import {
  Badge,
  Button,
  Calendar,
  Checkbox,
  EmptyValue,
  FieldWrapper,
  Flex,
  FormFields,
  Grid,
  Input,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Stack,
  Text,
} from "@simplix-react/ui";
import { CalendarIcon, EyeIcon, XIcon } from "lucide-react";
import { partAttributes, slotAttributes } from "@simplix-react/ui/design";
import { useTranslation } from "@simplix-react/i18n/react";

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
import { EntitySearchCombobox } from "./entity-search-combobox";
import type { FieldErrorCode } from "./record-form-rules";
import { PACKAGE_NAMESPACE } from "./locales";
import { otpDigitStyle, otpGroupStyle } from "./record-form.style";
import { otpBackspace, otpInsert, otpMove } from "./record-form-otp";
import { usePeekHost } from "../peek";
import { encodeInstant, formatLocalDate, pad, parseLocalDate } from "./record-form-field-values";

export interface Common {
  readonly label: string;
  readonly description?: string;
  readonly required?: boolean;
  readonly disabled: boolean;
  readonly error?: string;
}

export type FieldOf<K extends RecordFormField["kind"]> = Extract<RecordFormField, { kind: K }>;

export function MonthField({ common, value, onChange, placeholder }: { readonly common: Common; readonly value: string; readonly onChange: (value: unknown) => void; readonly placeholder?: string }) {
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
export function OtpField({ field, common, value, onChange }: { readonly field: FieldOf<"otp">; readonly common: Common; readonly value: string; readonly onChange: (value: unknown) => void }) {
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

export function RangeField({ field, common, value, onChange }: { readonly field: FieldOf<"range">; readonly common: Common; readonly value: RangeValue; readonly onChange: (value: unknown) => void }) {
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

export function ReferenceField({ field, common, value, onChange }: { readonly field: FieldOf<"reference">; readonly common: Common; readonly value: string; readonly onChange: (value: unknown) => void }) {
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

export function ReferenceMultiField({ field, common, value, onChange }: { readonly field: FieldOf<"referenceMulti">; readonly common: Common; readonly value: readonly string[]; readonly onChange: (value: unknown) => void }) {
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

export function CheckPairField({ field, common, value, onChange }: { readonly field: FieldOf<"checkPair">; readonly common: Common; readonly value: CheckPairValue; readonly onChange: (value: unknown) => void }) {
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

export function VerdictField({ field, common, error, value, onChange }: { readonly field: FieldOf<"verdict">; readonly common: Common; readonly error?: FieldErrorCode; readonly value: VerdictValue; readonly onChange: (value: unknown) => void }) {
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

export function ChoiceDetailField({ field, common, error, value, onChange }: { readonly field: FieldOf<"choiceWithDetail">; readonly common: Common; readonly error?: FieldErrorCode; readonly value: ChoiceDetailValue; readonly onChange: (value: unknown) => void }) {
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

export * from "./record-form-field-evidence";
