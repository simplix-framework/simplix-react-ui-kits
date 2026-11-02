import { useCallback, useMemo } from "react";
import { resolveBootEnum } from "@simplix-react-ext/simplix-boot-utils";
import { calendarDayLabel, useAppTimeZone, zoneDateTimeText } from "@simplix-react/headless";
import { i18nBaseValue, seedI18nDefaults } from "@simplix-react/i18n";

/** A text per content language, as the i18n helpers take it. */
type I18nMap = Parameters<typeof i18nBaseValue>[0] & object;
import { useEntityTranslation, useI18nEditLanguage, useLocale, useTranslation } from "@simplix-react/i18n/react";
import { SearchOperator, type EntityFacet, type EntitySearch, type LanguageSelectorPlacement, type StatusTone } from "@simplix-react/ui";

import { PACKAGE_NAMESPACE } from "./locales";
import { usePeekHost, type PeekTarget } from "../peek";
import type { RecordFormField } from "./record-form-types";
import type { RecordFilter } from "./record-list";
import { bytesText, durationText, figureSign, signedText } from "./record-figure";
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
  | "i18nText"
  /** A value the client writes and no response returns (SimpliX Meta's `format: "secret"`), such as a provider key. */
  | "secret"
  /** A structured value (an object or an array), drawn and edited as indented JSON. */
  | "json"
  /** A whole number of credits, written with the word for them (`500 credits`). */
  | "credits"
  /** A size in bytes, written in the largest unit that keeps it at 1 or more (`1.5 MB`). */
  | "bytes"
  /** A span of milliseconds, written as a reader compares it (`850 ms`, `12.3 sec`, `2 min 5 sec`). */
  | "duration"
  /** A machine message (an error, an error code): one monospaced line, copied and shown whole on request. */
  | "excerpt";

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
   * For a `reference` whose target a sibling field picks (SimpliX Meta's `reference.kindField`):
   * that field, and the peek kind each of its values opens. A value with no kind is drawn by name
   * alone, since nothing is served to open.
   */
  readonly peekKinds?: { readonly field: string; readonly kinds: Readonly<Record<string, string>> };
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
  /**
   * For a `number`, `money` or `credits` ledger amount: drawn with its sign written out and tinted
   * by it, a credit green and a debit red.
   */
  readonly signed?: boolean;
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
/** The peek kind a `reference` opens for one record: its own, or the one its kind field's value picks. */
export function peekKindOf(field: Pick<ContractField, "peekKind" | "peekKinds">, row: Readonly<Record<string, unknown>> | undefined): string | undefined {
  if (!field.peekKinds) return field.peekKind;
  const kind = enumValueOf(row?.[field.peekKinds.field]);
  return kind ? field.peekKinds.kinds[kind] : undefined;
}

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
  secret: { minWidth: 140 },
  json: { minWidth: 220, wrap: true },
  credits: { width: 120, align: "end" },
  bytes: { width: 104, align: "end" },
  duration: { width: 112, align: "end" },
  excerpt: { minWidth: 200 },
};

/** A searchable field as the generator writes it, which {@link useRecordContract}'s `filters` turns into a list filter. */
export type ContractFilter =
  | { readonly kind: "choice"; readonly field: string; readonly enumName?: string; readonly options: readonly string[] }
  | { readonly kind: "toggle"; readonly field: string }
  /**
   * A text the reader types a part of (a provider, a plan code), matched as contained. The
   * generator leaves text fields to the keyword search; a screen whose question is asked by one of
   * them declares it. `operators` are the ones the endpoint accepts on the field, first one the
   * default (`["equals"]` for a field the server matches only whole); absent, contains and equals.
   */
  | { readonly kind: "text"; readonly field: string; readonly operators?: readonly string[] }
  /** A figure; a `money` field also names its currency and scale, so the reader types currency units. */
  | { readonly kind: "number"; readonly field: string; readonly currency?: string; readonly scale?: number }
  | { readonly kind: "dateRange"; readonly field: string; readonly dateOnly?: boolean }
  /**
   * The key of another record, filtered by that record's name. It needs the screen's `facets`
   * override for the field; without one the filter is left out, since a bar offering raw ids asks
   * the reader for a value they cannot know.
   */
  | { readonly kind: "reference"; readonly field: string };

/**
 * The list filter a searchable field gives, or nothing for a reference the screen supplies no facet
 * for.
 *
 * @param def the field as the generator wrote it
 * @param label the field's label in the reader's language
 * @param enumLabel the label of an enum value, by enum name and value
 * @param facets field → the facet a reference filter reads
 */
export function recordFilterOf<R>(
  def: ContractFilter,
  label: string,
  enumLabel: (enumName: string, value: string) => string,
  facets?: Readonly<Record<string, EntityFacet>>,
): RecordFilter<R> | undefined {
  const field = def.field as keyof R & string;
  switch (def.kind) {
    case "reference": {
      const facet = facets?.[def.field];
      return facet ? { kind: "entity", field, label, facet } : undefined;
    }
    case "choice": {
      const enumName = def.enumName;
      return { kind: "choice", field, label, options: def.options.map((option) => ({ value: option, label: enumName ? enumLabel(enumName, option) : option })) };
    }
    case "dateRange":
      return { kind: "dateRange", field, label, dateOnly: def.dateOnly ?? false };
    case "number":
      // A money filter is typed in the currency's units, so its label says which currency.
      return { kind: "number", field, label: def.currency ? `${label} (${def.currency})` : label };
    case "text": {
      // An operator the filter bar does not know is dropped; a field left with none takes the default pair.
      const known = new Set<string>(Object.values(SearchOperator));
      const operators = (def.operators ?? []).filter((operator): operator is SearchOperator => known.has(operator));
      return operators.length > 0 ? { kind: "text", field, label, operators } : { kind: "text", field, label };
    }
    default:
      return { kind: def.kind, field, label };
  }
}

/** One key figure of a record's head, drawn from a contract field: the shape `RecordDetail` takes as a `RecordHeadFigure`. */
export interface ContractHeadFigure {
  readonly key: string;
  readonly label: string;
  readonly value: RecordValue;
}

/** How many leading columns of a generated list draw at every pane width. */
export const ALWAYS_DRAWN_COLUMNS = 4;

/** What one screen adds to the contract's drawing: tones for its enums, pickers for its references. */
export interface ContractOverrides {
  /** Field → enum value → tone. A value with no tone is neutral. */
  readonly tones?: Readonly<Record<string, Readonly<Record<string, StatusTone>>>>;
  /** Field → the search a form's reference picker reads. A reference without one is edited as text. */
  readonly searches?: Readonly<Record<string, EntitySearch>>;
  /** Field → the facet a list filter over a reference reads (`createEntityFacet`, called with the list's filters). */
  readonly facets?: Readonly<Record<string, EntityFacet>>;
}

type Row = Readonly<Record<string, unknown>>;

/** A value no other kind draws, as text: in the monospaced face where the contract marks it as a code. */
export function textValueOf(field: Pick<ContractField, "code">, raw: unknown): RecordValue {
  return field.code ? { text: String(raw), code: true } : String(raw);
}

/** A structured value as indented JSON, or the value itself where it is already text. */
export function jsonText(raw: unknown): string {
  return typeof raw === "string" ? raw : JSON.stringify(raw, null, 2);
}

/** Text written in a JSON field as the value it spells, blank as absent, and unparseable text as written. */
function parsedJson(text: string): unknown {
  if (text.trim() === "") return undefined;
  try {
    return JSON.parse(text);
  } catch (error) {
    if (!(error instanceof SyntaxError)) throw error;
    return text;
  }
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

/**
 * A figure as a cell draws it: lined up down the column, and for a `signed` ledger amount with its
 * sign written out and tinted by it.
 */
export function figureValue(field: Pick<ContractField, "signed">, raw: unknown, text: string): RecordValue {
  // An unsigned amount stays plain text, which every cell, card and name already draws.
  if (!field.signed) return text;
  const sign = figureSign(raw);
  return { figure: signedText(text, sign), ...(sign ? { sign } : {}) };
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
 * A `secret` field's input: a password input that opens empty, so a stored value never reaches the
 * screen. On an existing record it is optional and says that a blank entry keeps the stored value.
 */
export function secretFormField(
  common: { readonly key: string; readonly label: string; readonly required?: boolean },
  editing: boolean,
  keepText: string,
): RecordFormField {
  return { ...common, kind: "password", value: "", ...(editing ? { required: false, placeholder: keepText } : {}) };
}

/** Whether a `secret` entry is blank, which a request leaves out so the stored value stays. */
export function isBlankSecret(value: unknown): boolean {
  return value === undefined || value === null || (typeof value === "string" && value.trim() === "");
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
  const { tones, searches, facets } = overrides;

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
          return figureValue(field, raw, groupedNumber(raw, locale));
        case "money":
          return figureValue(field, raw, moneyText(field, raw, locale));
        case "credits":
          return figureValue(field, raw, t("recordValue.credits", { count: groupedNumber(raw, locale) as never }));
        case "bytes":
          return { figure: bytesText(raw, locale) };
        case "duration":
          return { figure: durationText(raw, locale) };
        case "excerpt":
          return { excerpt: String(raw) };
        case "reference": {
          const name = field.nameField ? valueAtPath(row, field.nameField) : undefined;
          const text = typeof name === "string" && name !== "" ? name : String(raw);
          const kind = peekKindOf(field, row);
          if (!kind) return { link: text };
          return { link: text, onClick: () => peek.open({ kind, target: peekTargetOf(field, String(raw), text) }) };
        }
        case "json":
          return { text: jsonText(raw), code: true, block: true };
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
        case "credits":
        case "bytes":
        case "duration":
          return { ...common, kind: "number", value: raw == null || raw === "" ? null : Number(raw) };
        // Edited in the currency's own units; `request` writes it back as the stored whole number.
        case "money":
          return { ...common, kind: "number", value: moneyAmount(field, raw), min: 0, ...(field.currency ? { unit: field.currency } : {}) };
        case "reference": {
          const search = searches?.[field.name];
          const peekKind = peekKindOf(field, record);
          if (search) return { ...common, kind: "reference", value: raw == null ? "" : String(raw), search, peek: Boolean(peekKind), peekKind };
          return { ...common, kind: "text", value: raw == null ? "" : String(raw) };
        }
        case "i18nText": {
          // A record written before its translations existed carries only the plain text; it opens
          // as that text in the base language rather than as an empty map.
          const plain = field.plainField ? record?.[field.plainField] : undefined;
          const map = raw && typeof raw === "object" ? (raw as I18nMap) : undefined;
          return { ...common, kind: "i18nText", multiline: field.multiline === true, languageSelectorPlacement: field.languageSelectorPlacement, value: seedI18nDefaults(map, typeof plain === "string" ? plain : undefined, languages) };
        }
        // Opened empty every time, so a stored value is never put on the screen; on an existing
        // record a blank entry keeps it, which the placeholder says.
        case "secret":
          return secretFormField(common, record !== undefined, t("recordForm.secretKeep"));
        case "longText":
        case "excerpt":
          return { ...common, kind: "textarea", value: raw == null ? "" : String(raw) };
        case "json":
          return { ...common, kind: "textarea", value: raw == null ? "" : jsonText(raw) };
        case "email":
          return { ...common, kind: "email", value: raw == null ? "" : String(raw) };
        default:
          return { ...common, kind: "text", value: raw == null ? "" : String(raw) };
      }
    },
    [enumLabel, fieldLabel, languages, searches, t, zone],
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
        if (field.kind === "secret" && isBlankSecret(values[field.name])) delete body[field.name];
        // Text that does not parse is sent as written, so the server's refusal names the field.
        if (field.kind === "json" && typeof values[field.name] === "string") body[field.name] = parsedJson(values[field.name] as string);
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
      defs.flatMap((def) => {
        const one = recordFilterOf<R>(def, fieldLabel(def.field), enumLabel, facets);
        return one ? [one] : [];
      }),
    [enumLabel, facets, fieldLabel],
  );

  const detailField = useCallback(
    (field: ContractField, row: Row | undefined) => ({
      label: fieldLabel(field.name),
      value: value(field, row),
      wide: field.kind === "longText" || field.kind === "json",
      copy: field.identifier === true,
    }),
    [fieldLabel, value],
  );

  // A figure in a record's head is named by the field it draws, as the list's column and the page's
  // tile are, so one value has one name in every language and a screen writes no catalogue key for it.
  const headFigures = useCallback(
    (fields: readonly ContractField[], row: Row | undefined): ContractHeadFigure[] =>
      fields.map((field) => ({ key: field.name, label: fieldLabel(field.name), value: value(field, row) })),
    [fieldLabel, value],
  );

  // A record's name as one line of text: each name field drawn as its kind draws it (an enum by
  // its label, an instant in the installation's zone), the parts joined in order.
  const recordName = useCallback(
    (fields: readonly ContractField[], row: Row | undefined): string => recordNameOf(fields.map((field) => value(field, row))),
    [value],
  );

  // `enumLabel` is returned for a screen that draws an enum constant outside a column or a filter (a tab per group).
  return useMemo(() => ({ value, formField, request, column, columns, filters, detailField, headFigures, fieldLabel, enumLabel, recordName }), [value, formField, request, column, columns, filters, detailField, headFigures, fieldLabel, enumLabel, recordName]);
}

/** The text a drawn value reads as, or `""` where it draws nothing. */
export function recordValueText(value: RecordValue): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "string" || typeof value === "number") return String(value);
  if ("text" in value) return value.text;
  if ("link" in value) return value.link;
  if ("figure" in value) return value.figure;
  if ("excerpt" in value) return value.excerpt;
  if ("meter" in value) return value.meter.text ?? `${value.meter.value} / ${value.meter.total}`;
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
