import type {
  CheckPairValue,
  ChoiceDetailValue,
  FieldEvidence,
  RangeValue,
  RecordFormField,
  RecordFormSection,
  SignatureValue,
  VerdictValue,
} from "./record-form-types";

/** Why a field refuses the value it holds. */
export type FieldErrorCode =
  /** A required field, or a required part of it, is empty. */
  | "required"
  /** A period ends before or when it starts. */
  | "rangeOrder"
  /** A verdict of 「not applicable」 gives no reason. */
  | "noteRequired"
  /** The 「other」 choice gives no detail. */
  | "detailRequired"
  /** A required evidence kind has nothing attached. */
  | "evidenceMissing"
  /** A row of a repeat field has a required sub-field left empty. */
  | "rowIncomplete";

function blank(value: unknown): boolean {
  return value === null || value === undefined || (typeof value === "string" && value.trim() === "") || (Array.isArray(value) && value.length === 0);
}

/**
 * The value a field starts with: its declared value, or the empty value of its kind.
 *
 * @param field - The declared field.
 * @returns The initial form value.
 */
export function initialFieldValue(field: RecordFormField): unknown {
  switch (field.kind) {
    case "multi":
    case "referenceMulti":
      return field.value ?? [];
    case "attachment":
      return field.value ?? [];
    case "switch":
    case "tick":
      return field.value ?? false;
    case "number":
    case "check":
    case "time":
      return field.value ?? null;
    case "range":
    case "i18nText":
      return field.value ?? {};
    case "row":
      return field.value ?? {};
    case "signature":
      return field.signer ?? null;
    case "checkPair":
      return { performed: field.performed ?? null, verified: field.verified ?? null } satisfies CheckPairValue;
    case "verdict":
      return { value: field.value ?? null, note: field.note ?? "" } satisfies VerdictValue;
    case "choiceWithDetail":
      return field.value ?? ({ choice: null, detail: "" } satisfies ChoiceDetailValue);
    case "repeat": {
      if (field.rows) return field.rows.map((row) => ({ ...row }));
      return Array.from({ length: Math.max(0, field.initialRows) }, () => emptyRow(field.columns));
    }
    default:
      return field.value ?? "";
  }
}

/**
 * One fresh row of a repeat field: every column at its initial value.
 *
 * @param columns - The repeat field's sub-fields.
 * @returns A row keyed by column key.
 */
export function emptyRow(columns: readonly RecordFormField[]): Record<string, unknown> {
  return Object.fromEntries(columns.map((column) => [column.key, initialFieldValue(column)]));
}

/**
 * Whether a range ends after it starts. Both ends are ISO strings of one granularity, so they
 * compare as text; a half-filled range is not out of order.
 *
 * @param range - The period.
 * @returns true when both ends are set and `from` is not before `to`.
 */
export function isRangeOutOfOrder(range: RangeValue | null | undefined): boolean {
  if (!range?.from || !range.to) return false;
  return Date.parse(range.from) >= Date.parse(range.to);
}

/**
 * What is wrong with one field's value, or null when nothing is.
 *
 * <p>Some checks hold whether or not the field is required: a period in the wrong order, a
 * 「not applicable」 without a reason, an 「other」 without a detail, and a row with a required
 * sub-field left empty are wrong even in an optional field once the reader has started on it.
 *
 * @param field - The declared field.
 * @param value - The value the form holds for it.
 * @returns The error code, or null.
 */
export function validateField(field: RecordFormField, value: unknown): FieldErrorCode | null {
  const required = Boolean(field.required);
  switch (field.kind) {
    // An unticked box is an answer, so neither control can be left empty.
    case "switch":
    case "tick":
      return null;
    case "check":
      return required && (value === null || value === undefined) ? "required" : null;
    case "range": {
      const range = (value ?? {}) as RangeValue;
      if (required && (blank(range.from) || blank(range.to))) return "required";
      return isRangeOutOfOrder(range) ? "rangeOrder" : null;
    }
    case "attachment": {
      const items = ((value ?? []) as readonly FieldEvidence[]).filter((item) => item.state !== "missing" && item.state !== "failed");
      if (!required) return null;
      if (field.evidenceKinds.length === 0) return items.length === 0 ? "required" : null;
      return field.evidenceKinds.every((kind) => items.some((item) => item.evidenceKind === kind)) ? null : "evidenceMissing";
    }
    case "signature": {
      const signature = value as SignatureValue | null | undefined;
      return required && !signature?.dataUrl && !signature?.at ? "required" : null;
    }
    case "checkPair": {
      const pair = (value ?? {}) as CheckPairValue;
      if (!required || field.editable === "none") return null;
      return pair[field.editable] === null || pair[field.editable] === undefined ? "required" : null;
    }
    case "verdict": {
      const verdict = (value ?? {}) as VerdictValue;
      if (verdict.value === "NOT_APPLICABLE" && blank(verdict.note)) return "noteRequired";
      return required && !verdict.value ? "required" : null;
    }
    case "choiceWithDetail": {
      const choice = (value ?? {}) as ChoiceDetailValue;
      if (choice.choice === field.otherValue && blank(choice.detail)) return "detailRequired";
      return required && blank(choice.choice) ? "required" : null;
    }
    case "i18nText":
      // A multilingual text is filled once any language carries words.
      return required && !Object.values((value ?? {}) as Readonly<Record<string, string>>).some((entry) => typeof entry === "string" && entry.trim() !== "") ? "required" : null;
    case "otp":
      // A partial code is as unusable as none, so a required code asks for every digit.
      return required && String(value ?? "").length !== field.length ? "required" : null;
    case "repeat": {
      const rows = (value ?? []) as readonly Record<string, unknown>[];
      if (required && rows.length === 0) return "required";
      return rows.some((row) => field.columns.some((column) => validateField(column, row[column.key]) !== null)) ? "rowIncomplete" : null;
    }
    default:
      return required && blank(value) ? "required" : null;
  }
}

/**
 * Every field of a form that refuses its value, keyed by field key, in drawing order.
 *
 * @param sections - The form's sections.
 * @param values - The values the form holds.
 * @returns The refused fields with their error codes.
 */
export function formFieldErrors(sections: readonly RecordFormSection[], values: Readonly<Record<string, unknown>>): Readonly<Record<string, FieldErrorCode>> {
  const errors: Record<string, FieldErrorCode> = {};
  for (const section of sections)
    for (const field of section.fields) {
      if (!fieldShown(field, values)) continue;
      const code = validateField(field, values[field.key]);
      if (code) errors[field.key] = code;
    }
  return errors;
}

/**
 * How many of the required fields hold an answer, for the count at the head of a form.
 *
 * <p>A switch or a tick is always answered, so neither is counted. A disabled field is counted like
 * any other: it carries the required mark and is validated before sending, so the count states the
 * same set the marks do (a locked field holding its value counts as filled).
 */
export function requiredProgress(sections: readonly RecordFormSection[], values: Readonly<Record<string, unknown>>): { readonly total: number; readonly filled: number } {
  let total = 0;
  let filled = 0;
  for (const section of sections)
    for (const field of section.fields) {
      if (!field.required || field.kind === "switch" || field.kind === "tick" || !fieldShown(field, values)) continue;
      total += 1;
      if (validateField(field, values[field.key]) === null) filled += 1;
    }
  return { total, filled };
}

/**
 * Whether a field is drawn for the values the form holds: always, unless it names another field
 * whose value must be one of a list ({@link FieldCommon.shownWhen}).
 */
export function fieldShown(field: Pick<RecordFormField, "shownWhen">, values: Readonly<Record<string, unknown>>): boolean {
  if (!field.shownWhen) return true;
  const value = values[field.shownWhen.field];
  return (Array.isArray(value) ? value : [value]).some((v) => typeof v === "string" && field.shownWhen?.is.includes(v));
}

/** The reason a field is disabled, when it was given as a string. */
export function disabledReason(disabled: boolean | string | undefined): string | undefined {
  return typeof disabled === "string" && disabled !== "" ? disabled : undefined;
}

/**
 * The sentence drawn under a field: why it is locked, when it was disabled with a reason, then what
 * else it says (its hint, or the chosen option's meaning). A reader facing a locked field reads what
 * would unlock it without having to find a tooltip on a control that takes no pointer.
 *
 * @param disabled the field's `disabled`
 * @param own what the field says under itself otherwise
 */
export function fieldDescription(disabled: boolean | string | undefined, own: string | undefined): string | undefined {
  const said = [disabledReason(disabled), own].filter((part): part is string => part !== undefined && part !== "");
  return said.length > 0 ? said.join(" ") : undefined;
}
