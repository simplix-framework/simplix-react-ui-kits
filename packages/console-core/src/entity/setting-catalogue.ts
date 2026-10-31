import type { RecordFormField, RecordFormSection, RecordOption } from "./record-form-types";

/**
 * How a setting's text value is read and edited. A product's own type enum maps onto these by
 * value; a type the kit does not know is edited as text.
 */
export type SettingValueType = "TEXT" | "NUMBER" | "CHOICE" | "ZONE" | "CURRENCY";

/** One stored setting of a key-value catalogue, as the screen reads it. */
export interface SettingCatalogueRow {
  /** The stored row's id, which a save names. */
  readonly id: string;
  /** The key the product reads it by, and the field's key on the form. */
  readonly key: string;
  readonly value?: string | null;
  /** How the value is edited; an unknown type is edited as text. */
  readonly type?: string | null;
  /** The group whose tab draws it. */
  readonly group?: string | null;
  /** Whether the screen may change it. */
  readonly editable?: boolean | null;
  /** For a choice, the values it may take, in order. */
  readonly options?: readonly string[];
}

/** The words a catalogue form needs from the product, looked up per key. */
export interface SettingCatalogueWords {
  /** The field's label; a key with no label falls back to the key itself. */
  readonly label: (key: string) => string | undefined;
  /** What to know before changing it. */
  readonly hint?: (key: string) => string | undefined;
  /** A choice's option label; a value with none is shown as itself. */
  readonly option?: (key: string, value: string) => string | undefined;
  /** Why a row the screen cannot change is locked, shown as the field's tooltip. */
  readonly readOnly: (row: SettingCatalogueRow) => string;
}

/** One change a batch save writes: the stored row and its new value. */
export interface SettingChange {
  readonly row: SettingCatalogueRow;
  readonly value: string;
}

/**
 * The option list the runtime knows for a kind, so a zone or a currency picker is never a
 * transcribed list that goes stale with tzdb or ISO 4217.
 */
function runtimeValues(kind: "timeZone" | "currency"): readonly string[] {
  const intl = Intl as unknown as { supportedValuesOf?: (key: string) => string[] };
  return intl.supportedValuesOf ? intl.supportedValuesOf(kind) : [];
}

/** Adds the stored value to a list that lacks it, so a select never shows an empty trigger. */
function withStored(values: readonly string[], stored: string): readonly string[] {
  return stored && !values.includes(stored) ? [stored, ...values] : values;
}

/**
 * The editor a setting row is drawn with, chosen by its type.
 *
 * <p>Text and number are inputs; a choice is a select over the row's own options; a zone and a
 * currency are selects over what the runtime knows. A row the screen cannot change is drawn
 * disabled with the reason as its tooltip, so a locked field says what locks it.
 *
 * @param row - The stored setting.
 * @param words - The product's labels for the key, its hint and its options.
 * @returns The form field that edits the row's value.
 */
export function settingField(row: SettingCatalogueRow, words: SettingCatalogueWords): RecordFormField {
  const stored = row.value ?? "";
  const common = {
    key: row.key,
    label: words.label(row.key) ?? row.key,
    hint: words.hint?.(row.key),
    disabled: row.editable === false ? words.readOnly(row) : undefined,
  };
  const optionsOf = (values: readonly string[]): RecordOption[] =>
    values.map((value) => ({ value, label: words.option?.(row.key, value) ?? value }));
  switch (row.type) {
    case "NUMBER":
      return { ...common, kind: "number", value: stored === "" ? null : Number(stored) };
    case "CHOICE":
      return { ...common, kind: "select", value: stored, options: optionsOf(withStored(row.options ?? [], stored)) };
    case "ZONE":
      return { ...common, kind: "select", value: stored, options: optionsOf(withStored(runtimeValues("timeZone"), stored)) };
    case "CURRENCY":
      return { ...common, kind: "select", value: stored, options: optionsOf(withStored(runtimeValues("currency"), stored)) };
    default:
      return { ...common, kind: "text", value: stored };
  }
}

/**
 * The rows of one group as a form section, in the order they arrived.
 *
 * @param rows - Every stored setting.
 * @param group - The group to draw.
 * @param words - The product's labels.
 */
export function settingSection(
  rows: readonly SettingCatalogueRow[],
  group: string,
  words: SettingCatalogueWords,
): RecordFormSection {
  return { key: group, columns: 2, fields: rows.filter((row) => row.group === group).map((row) => settingField(row, words)) };
}

/**
 * What a batch save writes: only the editable rows whose value changed.
 *
 * <p>Sending every row back would stamp each with a new audit entry on every save, and the change
 * history would then say nothing about what an operator actually did. An empty number field is
 * written as an empty value, which reads as "not chosen".
 *
 * @param rows - The stored settings the form was drawn from.
 * @param values - The form's values, keyed by setting key.
 */
export function changedSettings(
  rows: readonly SettingCatalogueRow[],
  values: Readonly<Record<string, unknown>>,
): SettingChange[] {
  const changes: SettingChange[] = [];
  for (const row of rows) {
    if (row.editable === false || !(row.key in values)) continue;
    const raw = values[row.key];
    const value = raw === null || raw === undefined ? "" : String(raw);
    if (value !== (row.value ?? "")) changes.push({ row, value });
  }
  return changes;
}

/**
 * Splits a stored option list on the separator the product stores it with.
 *
 * @param stored - The stored list, or nothing.
 * @param separator - What the product puts between two options.
 */
export function settingOptions(stored: string | null | undefined, separator: string): string[] {
  return (stored ?? "").split(separator).map((option) => option.trim()).filter((option) => option !== "");
}
