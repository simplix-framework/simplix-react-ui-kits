import { useCallback, useMemo } from "react";
import { resolveBootEnum } from "@simplix-react-ext/simplix-boot-utils";
import { calendarDayLabel, useAppTimeZone, zoneDateTimeText } from "@simplix-react/headless";
import { i18nBaseValue, seedI18nDefaults } from "@simplix-react/i18n";

/** A text per content language, as the i18n helpers take it. */
type I18nMap = Parameters<typeof i18nBaseValue>[0] & object;
import { useEntityTranslation, useI18nEditLanguage, useLocale, useTranslation } from "@simplix-react/i18n/react";
import type { EntitySearch, LanguageSelectorPlacement, StatusTone } from "@simplix-react/ui";

import { PACKAGE_NAMESPACE } from "./locales";
import { usePeekHost, type PeekTarget } from "../peek";
import type { RecordFormField } from "./record-form-types";
import type { RecordFilter } from "./record-list";
import type { RecordValue } from "./record-value";

/**
 * What the contract says one field is, as the generator writes it from SimpliX Meta.
 *
 * <p>The kind decides how the value is drawn in a list cell and a detail field and which control a
 * form edits it with, so a generated screen draws every field the way a finished one does and a
 * screen's blocks hold only its own decisions.
 */
export type ContractFieldKind =
  | "text"
  | "longText"
  | "email"
  | "enum"
  | "boolean"
  | "date"
  | "instant"
  | "time"
  | "number"
  /** An amount of money stored as a whole number of `10^-scale` units of `currency` (SimpliX Meta's `format: "money"`). */
  | "money"
  | "reference"
  /** A text written once per content language (`<field>I18n`), whose plain sibling the server reads. */
  | "i18nText";

export interface ContractField {
  readonly name: string;
  readonly kind: ContractFieldKind;
  /** The enum the labels are read from (`enumLabel(enumName, value)`), for an `enum` field. */
  readonly enumName?: string;
  /** Every value an `enum` field takes, in the contract's order. */
  readonly options?: readonly string[];
  /** The peek kind a `reference` field opens, which is the referenced entity's name. */
  readonly peekKind?: string;
  /**
   * For a `reference` whose value is another field of the referenced entity than its identifier
   * (SimpliX Meta's `reference.idField`), that field: the peek looks the record up by it.
   */
  readonly peekBy?: string;
  /** The field beside a `reference` that carries the referenced record's name, or a dotted path into the nested record. */
  readonly nameField?: string;
  /** The server owns it: drawn in a detail, never edited in a form. */
  readonly readOnly?: boolean;
  readonly required?: boolean;
  /** Whether the server orders a list by it, as SimpliX Meta's searchable metadata states; absent means unstated. */
  readonly sortable?: boolean;
  /**
   * Locale → the field the server orders this one by in that language (SimpliX Meta's
   * `searchable.sortAlias`): a translated name sorts by its per-language sort key, so the visible
   * name column sorts in the reader's language rather than not at all.
   */
  readonly sortAlias?: Readonly<Record<string, string>>;
  /** The record's own identifier: drawn with a copy control in a detail. */
  readonly identifier?: boolean;
  /**
   * A code the reader types or compares (SimpliX Meta's `format: "code"`, from `@CodeValue`): a
   * text value drawn in the monospaced face.
   */
  readonly code?: boolean;
  /** For an `i18nText` field, the plain field the request carries the base language's text in. */
  readonly plainField?: string;
  /** For an `i18nText` field whose plain sibling is long text, the per-language editor is a text area. */
  readonly multiline?: boolean;
  /** For an `i18nText` field, where its language selector is drawn; absent, the installation's default. */
  readonly languageSelectorPlacement?: LanguageSelectorPlacement;
  /** For a `money` field, the ISO 4217 currency the amount is in. */
  readonly currency?: string;
  /** For a `money` field, the decimal places the stored whole number carries: 6 stores millionths. */
  readonly scale?: number;
  /** The value a new record starts the field with (SimpliX Meta's `defaultValue`). */
  readonly defaultValue?: string | number | boolean;
}

/** The record a reference opens: its value, its name, and the field the value matches where it is not the identifier. */
export function peekTargetOf(field: Pick<ContractField, "peekBy">, id: string, name: string | undefined): PeekTarget {
  return { id, ...(name !== undefined ? { name } : {}), ...(field.peekBy ? { by: field.peekBy } : {}) };
}

/**
 * What a form field starts from: the record's value when one is being edited, the contract's
 * default for a new record. A new record's switch whose entity starts it on is drawn on.
 */
export function startingValue(field: Pick<ContractField, "name" | "defaultValue">, record: Readonly<Record<string, unknown>> | undefined): unknown {
  return record ? record[field.name] : field.defaultValue;
}

/**
 * The column geometry each kind takes: a value of known size gets a fixed width, free text a floor
 * that takes the spare width. One table of numbers for every generated list, so two lists showing
 * the same kinds line up.
 */
export const CONTRACT_COLUMN_SIZE: Readonly<Record<ContractFieldKind, { readonly width?: number; readonly minWidth?: number; readonly wrap?: boolean; readonly align?: "end" }>> = {
  text: { minWidth: 140 },
  longText: { minWidth: 220, wrap: true },
  email: { minWidth: 200 },
  enum: { width: 120 },
  boolean: { width: 96 },
  date: { width: 128 },
  instant: { width: 176 },
  time: { width: 96 },
  // A figure is compared down the column, so it sits against the end edge where the place values line up.
  number: { width: 112, align: "end" },
  money: { width: 128, align: "end" },
  reference: { minWidth: 160 },
  i18nText: { minWidth: 140 },
};

/** A searchable field as the generator writes it, which {@link useRecordContract}'s `filters` turns into a list filter. */
export type ContractFilter =
  | { readonly kind: "choice"; readonly field: string; readonly enumName?: string; readonly options: readonly string[] }
  | { readonly kind: "toggle"; readonly field: string }
  /** A figure; a `money` field also names its currency and scale, so the reader types currency units. */
  | { readonly kind: "number"; readonly field: string; readonly currency?: string; readonly scale?: number }
  | { readonly kind: "dateRange"; readonly field: string; readonly dateOnly?: boolean };

/** How many leading columns of a generated list draw at every pane width. */
export const ALWAYS_DRAWN_COLUMNS = 4;

/** What one screen adds to the contract's drawing: tones for its enums, pickers for its references. */
export interface ContractOverrides {
  /** Field → enum value → tone. A value with no tone is neutral. */
  readonly tones?: Readonly<Record<string, Readonly<Record<string, StatusTone>>>>;
  /** Field → the search a form's reference picker reads. A reference without one is edited as text. */
  readonly searches?: Readonly<Record<string, EntitySearch>>;
}

type Row = Readonly<Record<string, unknown>>;

/** A value no other kind draws, as text: in the monospaced face where the contract marks it as a code. */
export function textValueOf(field: Pick<ContractField, "code">, raw: unknown): RecordValue {
  return field.code ? { text: String(raw), code: true } : String(raw);
}

/** The enum's value as text, whether the server sent the constant or the boot enum object. */
export function enumValueOf(raw: unknown): string {
  if (raw === null || raw === undefined) return "";
  return String(resolveBootEnum(raw as never) || "");
}

/** The value at a dotted path (`position.name`), or `undefined` where any step is absent. */
export function valueAtPath(row: Row | undefined, path: string): unknown {
  let at: unknown = row;
  for (const step of path.split(".")) {
    if (at === null || typeof at !== "object") return undefined;
    at = (at as Row)[step];
  }
  return at;
}

/**
 * The field a column over `field` sorts by in `locale`: its sort alias for that language, else for
 * the language without its region (`ko` for `ko-KR`), else none. The cell still draws `field`'s
 * value, so only the request's sort key changes.
 */
export function sortFieldOf(field: Pick<ContractField, "sortAlias">, locale: string): string | undefined {
  const alias = field.sortAlias;
  if (!alias) return undefined;
  return alias[locale] ?? alias[locale.split("-")[0] ?? locale];
}

/** Text with digit grouping in the reader's locale; a non-number is drawn as it came. */
export function groupedNumber(raw: unknown, locale: string): string {
  if (raw === null || raw === undefined || raw === "") return "";
  const value = typeof raw === "number" ? raw : Number(raw);
  return Number.isFinite(value) ? new Intl.NumberFormat(locale).format(value) : String(raw);
}

/** The amount a `money` field's stored whole number stands for, in the currency's own units. */
export function moneyAmount(field: Pick<ContractField, "scale">, raw: unknown): number | null {
  if (raw === null || raw === undefined || raw === "") return null;
  const stored = typeof raw === "number" ? raw : Number(raw);
  return Number.isFinite(stored) ? stored / 10 ** (field.scale ?? 0) : null;
}

/** The stored whole number an amount in the currency's own units is written back as. */
export function moneyStored(field: Pick<ContractField, "scale">, amount: unknown): number | null {
  if (amount === null || amount === undefined || amount === "") return null;
  const value = typeof amount === "number" ? amount : Number(amount);
  return Number.isFinite(value) ? Math.round(value * 10 ** (field.scale ?? 0)) : null;
}

/**
 * The list request's filters with every `money` filter's amount, typed in the currency's own units,
 * turned into the stored whole number the server compares. A filter key is `<field>.<operator>`.
 *
 * @returns the adapter's `transformFilters`, or undefined when no filter is a money filter
 */
export function moneyFilterTransform(
  defs: readonly ContractFilter[],
): ((filters: Record<string, unknown>) => Record<string, unknown>) | undefined {
  const scales = new Map<string, number>();
  for (const def of defs) if (def.kind === "number" && def.scale !== undefined) scales.set(def.field, def.scale);
  if (scales.size === 0) return undefined;
  return (filters) => {
    const out: Record<string, unknown> = { ...filters };
    for (const [key, value] of Object.entries(filters)) {
      const scale = scales.get(key.split(".")[0] ?? "");
      if (scale === undefined) continue;
      out[key] = Array.isArray(value) ? value.map((one) => moneyStored({ scale }, one)) : moneyStored({ scale }, value);
    }
    return out;
  };
}

/**
 * A `money` value as currency in the reader's locale. It keeps as many decimal places as the
 * stored scale can hold beyond the currency's own, so a fraction of a cent is not rounded away.
 */
export function moneyText(field: Pick<ContractField, "currency" | "scale">, raw: unknown, locale: string): string {
  const amount = moneyAmount(field, raw);
  if (amount === null) return raw == null ? "" : String(raw);
  if (!field.currency) return new Intl.NumberFormat(locale).format(amount);
  const format = new Intl.NumberFormat(locale, { style: "currency", currency: field.currency });
  const digits = Math.max(format.resolvedOptions().maximumFractionDigits ?? 0, Math.min(field.scale ?? 0, 20));
  return new Intl.NumberFormat(locale, { style: "currency", currency: field.currency, maximumFractionDigits: digits }).format(amount);
}

/**
 * Draws and edits fields by their contract kind.
 *
 * <p>`value` gives a list cell or a detail field: an enum as a badge with its translated label, a
 * boolean as a yes or no badge, an instant in the installation's zone, a day as a calendar label, a
 * number grouped, a reference as the referenced record's name that opens its peek. `formField` gives
 * the control: a select, a switch, a date, a number, a reference picker, a text area.
 *
 * @param entity the entity whose field labels and enum labels are read
 * @param overrides tones and pickers one screen supplies
 */
export function useRecordContract(entity: string, overrides: ContractOverrides = {}) {
  const { fieldLabel, enumLabel } = useEntityTranslation(entity);
  const { t } = useTranslation(PACKAGE_NAMESPACE + "/features");
  const locale = useLocale();
  const zone = useAppTimeZone();
  const peek = usePeekHost();
  const { languages } = useI18nEditLanguage();
  const { tones, searches } = overrides;

  const value = useCallback(
    (field: ContractField, row: Row | undefined): RecordValue => {
      const raw = row?.[field.name];
      if (raw === null || raw === undefined || raw === "") return null;
      switch (field.kind) {
        case "enum": {
          const constant = enumValueOf(raw);
          if (!constant) return null;
          const label = field.enumName ? enumLabel(field.enumName, constant) : constant;
          return { badge: { label, tone: tones?.[field.name]?.[constant] ?? "neutral" } };
        }
        case "boolean":
          return { badge: { label: raw ? t("recordForm.yes") : t("recordForm.no"), tone: raw ? "success" : "neutral" } };
        case "instant":
          return zoneDateTimeText(zone, String(raw), locale);
        case "date":
          return calendarDayLabel(String(raw), locale, "iso") || String(raw);
        case "number":
          return groupedNumber(raw, locale);
        case "money":
          return moneyText(field, raw, locale);
        case "reference": {
          const name = field.nameField ? valueAtPath(row, field.nameField) : undefined;
          const text = typeof name === "string" && name !== "" ? name : String(raw);
          if (!field.peekKind) return { link: text };
          const kind = field.peekKind;
          return { link: text, onClick: () => peek.open({ kind, target: peekTargetOf(field, String(raw), text) }) };
        }
        default:
          return textValueOf(field, raw);
      }
    },
    [enumLabel, locale, peek, t, tones, zone],
  );

  const formField = useCallback(
    (field: ContractField, record: Row | undefined): RecordFormField => {
      const raw = startingValue(field, record);
      const common = { key: field.name, label: fieldLabel(field.name), required: field.required };
      switch (field.kind) {
        case "enum":
          return {
            ...common,
            kind: "select",
            value: enumValueOf(raw),
            options: (field.options ?? []).map((option) => ({ value: option, label: field.enumName ? enumLabel(field.enumName, option) : option })),
          };
        case "boolean":
          return { ...common, kind: "switch", value: raw === true };
        case "date":
          return { ...common, kind: "date", value: raw == null ? "" : String(raw) };
        case "instant":
          return { ...common, kind: "datetime", value: raw == null ? "" : String(raw), zone };
        case "time":
          return { ...common, kind: "time", value: raw == null ? null : String(raw), clearable: !field.required };
        case "number":
          return { ...common, kind: "number", value: raw == null || raw === "" ? null : Number(raw) };
        // Edited in the currency's own units; `request` writes it back as the stored whole number.
        case "money":
          return { ...common, kind: "number", value: moneyAmount(field, raw), min: 0, ...(field.currency ? { unit: field.currency } : {}) };
        case "reference": {
          const search = searches?.[field.name];
          if (search) return { ...common, kind: "reference", value: raw == null ? "" : String(raw), search, peek: Boolean(field.peekKind), peekKind: field.peekKind };
          return { ...common, kind: "text", value: raw == null ? "" : String(raw) };
        }
        case "i18nText": {
          // A record written before its translations existed carries only the plain text; it opens
          // as that text in the base language rather than as an empty map.
          const plain = field.plainField ? record?.[field.plainField] : undefined;
          const map = raw && typeof raw === "object" ? (raw as I18nMap) : undefined;
          return { ...common, kind: "i18nText", multiline: field.multiline === true, languageSelectorPlacement: field.languageSelectorPlacement, value: seedI18nDefaults(map, typeof plain === "string" ? plain : undefined, languages) };
        }
        case "longText":
          return { ...common, kind: "textarea", value: raw == null ? "" : String(raw) };
        case "email":
          return { ...common, kind: "email", value: raw == null ? "" : String(raw) };
        default:
          return { ...common, kind: "text", value: raw == null ? "" : String(raw) };
      }
    },
    [enumLabel, fieldLabel, languages, searches, zone],
  );

  /**
   * The request a form's values make: each `i18nText` field also writes its plain sibling, in the
   * base language, because the server validates and sorts by the plain text, and each `money`
   * field goes back from the currency's units to the stored whole number.
   */
  const request = useCallback(
    (fields: readonly ContractField[], values: Readonly<Record<string, unknown>>): Record<string, unknown> => {
      const body: Record<string, unknown> = { ...values };
      for (const field of fields) {
        if (field.kind === "money" && field.name in values) body[field.name] = moneyStored(field, values[field.name]);
        if (field.kind !== "i18nText" || !field.plainField) continue;
        const map = values[field.name];
        body[field.plainField] = i18nBaseValue(map && typeof map === "object" ? (map as I18nMap) : undefined, languages);
      }
      return body;
    },
    [languages],
  );

  const column = useCallback(
    <R,>(field: ContractField) => ({
      key: field.name,
      header: fieldLabel(field.name),
      field: (sortFieldOf(field, locale) ?? field.name) as keyof R & string,
      ...CONTRACT_COLUMN_SIZE[field.kind],
      ...(sortFieldOf(field, locale) !== undefined ? { sortable: true } : field.sortable === undefined ? {} : { sortable: field.sortable }),
      value: (row: R) => value(field, row as unknown as Row),
    }),
    [fieldLabel, value, locale],
  );

  /**
   * Every field as a column. The leading columns always draw; each one after them is dropped from a
   * pane narrower than the table that holds it, so a wide record set narrows column by column
   * instead of flipping to cards, and the card layout is left to a phone.
   */
  const columns = useCallback(
    <R,>(fields: readonly ContractField[]) => {
      let running = 0;
      return fields.map((field, index) => {
        const drawn = column<R>(field);
        running += drawn.width ?? drawn.minWidth ?? 0;
        return index < ALWAYS_DRAWN_COLUMNS ? drawn : { ...drawn, minTableWidth: running };
      });
    },
    [column],
  );

  /** The searchable fields as list filters, labelled by the field and, for an enum, by its values. */
  const filters = useCallback(
    <R,>(defs: readonly ContractFilter[]): RecordFilter<R>[] =>
      defs.map((def): RecordFilter<R> => {
        const field = def.field as keyof R & string;
        const label = fieldLabel(def.field);
        switch (def.kind) {
          case "choice": {
            const enumName = def.enumName;
            return { kind: "choice", field, label, options: def.options.map((option) => ({ value: option, label: enumName ? enumLabel(enumName, option) : option })) };
          }
          case "dateRange":
            return { kind: "dateRange", field, label, dateOnly: def.dateOnly ?? false };
          case "number":
            // A money filter is typed in the currency's units, so its label says which currency.
            return { kind: "number", field, label: def.currency ? `${label} (${def.currency})` : label };
          default:
            return { kind: def.kind, field, label };
        }
      }),
    [enumLabel, fieldLabel],
  );

  const detailField = useCallback(
    (field: ContractField, row: Row | undefined) => ({
      label: fieldLabel(field.name),
      value: value(field, row),
      wide: field.kind === "longText",
      copy: field.identifier === true,
    }),
    [fieldLabel, value],
  );

  // A record's name as one line of text: each name field drawn as its kind draws it (an enum by
  // its label, an instant in the installation's zone), the parts joined in order.
  const recordName = useCallback(
    (fields: readonly ContractField[], row: Row | undefined): string => recordNameOf(fields.map((field) => value(field, row))),
    [value],
  );

  // `enumLabel` is returned for a screen that draws an enum constant outside a column or a filter (a tab per group).
  return useMemo(() => ({ value, formField, request, column, columns, filters, detailField, fieldLabel, enumLabel, recordName }), [value, formField, request, column, columns, filters, detailField, fieldLabel, enumLabel, recordName]);
}

/** The text a drawn value reads as, or `""` where it draws nothing. */
export function recordValueText(value: RecordValue): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "string" || typeof value === "number") return String(value);
  if ("text" in value) return value.text;
  if ("link" in value) return value.link;
  if ("badges" in value) return value.badges.map((badge) => badge.label).join(" ");
  if ("badge" in value) return value.badge.label;
  return "";
}

/**
 * A record's name from the values of its name fields, in order, joined by a space with the parts
 * that draw nothing left out.
 */
export function recordNameOf(values: readonly RecordValue[]): string {
  return values.map(recordValueText).filter((part) => part !== "").join(" ");
}

/**
 * A field table's enum fields, field name to enum name: what a changes tab needs to label an enum
 * value the audit record names no enum for.
 *
 * @param fields the record's contract fields
 * @returns each field that declares an `enumName`, by name
 */
export function fieldEnumsOf(fields: readonly ContractField[]): Readonly<Record<string, string>> {
  const enums: Record<string, string> = {};
  for (const field of fields) {
    if (field.enumName) enums[field.name] = field.enumName;
  }
  return enums;
}
