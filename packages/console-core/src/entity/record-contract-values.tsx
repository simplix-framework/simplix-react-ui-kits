import type { EntityFacet, StatusTone } from "@simplix-react/ui";
import { resolveBootEnum } from "@simplix-react-ext/simplix-boot-utils";

import type { BooleanWords, ContractField, ContractFieldKind, ContractFilter, Row } from "./record-contract-types";
import type { PeekTarget } from "../peek";
import type { RecordBadge, RecordValue } from "./record-value";
import type { RecordFilter } from "./record-list";
import type { RecordFormField } from "./record-form-types";
import { figureSign, signedText } from "./record-figure";
import { knownFilterOperators } from "./filter-operators";

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
  prose: { minWidth: 220, wrap: true },
  language: { minWidth: 140 },
};

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
      const operators = knownFilterOperators(def.operators);
      return operators.length > 0 ? { kind: "text", field, label, operators } : { kind: "text", field, label };
    }
    default:
      return { kind: def.kind, field, label };
  }
}

/**
 * How many leading columns of a generated list carry no tier of their own: they draw until every
 * later column has dropped, and then the list's ladder drops them from their end too
 * (`ladderColumns` with `NAMING_COLUMNS`), so a narrow pane draws a narrower table before cards.
 */
export const ALWAYS_DRAWN_COLUMNS = 4;

/**
 * The column ladder every generated list climbs: each column after the leading block is dropped from
 * a pane narrower than the table that holds it, so a wide record set narrows column by column. A
 * list that writes its own columns runs them through this rather than copying the loop.
 *
 * @param columns the drawn columns, in order, each with its fixed width or its floor
 * @param always how many leading columns carry no tier of their own
 * @returns the same columns, each after the leading block with the table width it needs
 */
export function ladderColumns<C extends { readonly width?: number; readonly minWidth?: number }>(
  columns: readonly C[],
  always: number = ALWAYS_DRAWN_COLUMNS,
): (C & { readonly minTableWidth?: number })[] {
  let running = 0;
  return columns.map((column, index) => {
    running += column.width ?? column.minWidth ?? 0;
    return index < always ? column : { ...column, minTableWidth: running };
  });
}

/** Pixels a badge adds around its label: its padding and border, and the cell's own padding. */
const ENUM_BADGE_CHROME = 40;

/**
 * The width an enum column takes: the kind's standard width, or the width its longest label needs
 * where that is wider, so a label such as 「Google Cloud TTS」 is never cut. The label is measured by
 * its characters at the badge's type size: a full-width character (Hangul, kana, CJK) at its em, any
 * other at about half of it.
 *
 * @param labels the labels of every value, in the reader's language
 */
export function enumColumnWidth(labels: readonly string[]): number {
  const standard = CONTRACT_COLUMN_SIZE.enum.width ?? 0;
  let widest = 0;
  for (const label of labels) {
    let width = 0;
    for (const char of label) width += /[ᄀ-ᇿ　-鿿가-힯＀-￯]/.test(char) ? 12 : 7;
    widest = Math.max(widest, width);
  }
  return Math.max(standard, Math.ceil(widest + ENUM_BADGE_CHROME));
}

/** A value no other kind draws, as text: in the monospaced face where the contract marks it as a code. */
export function textValueOf(field: Pick<ContractField, "code">, raw: unknown): RecordValue {
  return field.code ? { text: String(raw), code: true } : String(raw);
}

/** Characters a `prose` field keeps in a list cell or card when the field names no length. */
export const PROSE_CHARS = 200;

/**
 * The start of a text, read as prose: line breaks fold into spaces and a cut falls on a word with an
 * ellipsis after it, so a card shows a sentence and not a machine message's first line.
 *
 * @param text the whole text
 * @param limit the characters kept; the whole text when it fits
 */
export function proseExcerpt(text: string, limit: number = PROSE_CHARS): string {
  const flat = text.replace(/\s+/g, " ").trim();
  if (flat.length <= limit) return flat;
  const cut = flat.slice(0, limit);
  const lastSpace = cut.lastIndexOf(" ");
  // A cut inside the last word drops that word, unless the text is one long word.
  const kept = lastSpace > limit * 0.6 ? cut.slice(0, lastSpace) : cut;
  return `${kept.trimEnd()}…`;
}

/**
 * A language code as the language's name in the reader's language (`ko` as the language's own
 * name for a Korean reader). A code the runtime does not know, or that is not a language tag, is drawn as it came.
 *
 * @param code the stored code (`en`, `pt-BR`, `ko_KR`)
 * @param locale the reader's language
 */
export function languageName(code: string, locale: string): string {
  try {
    return new Intl.DisplayNames([locale], { type: "language" }).of(code.replace(/_/g, "-")) ?? code;
  } catch (error) {
    // A structurally invalid tag (`not a code`) is a RangeError; any other failure is not ours to hide.
    if (error instanceof RangeError) return code;
    throw error;
  }
}

/** A structured value as indented JSON, or the value itself where it is already text. */
export function jsonText(raw: unknown): string {
  return typeof raw === "string" ? raw : JSON.stringify(raw, null, 2);
}

/** Text written in a JSON field as the value it spells, blank as absent, and unparseable text as written. */
export function parsedJson(text: string): unknown {
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

/**
 * Whether a field is an optional text the reader left blank. The request carries `null` for it, so a
 * field they did not touch stays unset and a field they cleared is unset, where an empty string would
 * be stored for every optional text on every save (the server's checks read an empty string as a value).
 */
export function isBlankOptionalText(field: Pick<ContractField, "kind" | "required">, value: unknown): boolean {
  return (field.kind === "text" || field.kind === "longText") && field.required !== true && typeof value === "string" && value.trim() === "";
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

/** The decimal places a currency writes: none for won, two for dollars. */
function currencyDigits(currency: string): number {
  try {
    return new Intl.NumberFormat("en", { style: "currency", currency }).resolvedOptions().maximumFractionDigits ?? 2;
  } catch {
    return 2;
  }
}

/**
 * The currency and scale a `money` field is written in for one row: its own, or, for a field whose
 * currency is a field of the row, that currency with the decimal places it writes.
 */
export function moneyFieldOf(field: Pick<ContractField, "currency" | "scale" | "currencyField">, row: Row | undefined): Pick<ContractField, "currency" | "scale"> {
  const code = field.currencyField ? valueAtPath(row, field.currencyField) : undefined;
  if (typeof code !== "string" || code.trim() === "") return field;
  const currency = code.trim().toUpperCase();
  return { currency, scale: currencyDigits(currency) };
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
 * A boolean value as a badge: worded by the entity's `values.<field>.true` / `.false` (an offered
 * voice reads 「Offered」, not 「Yes」), else yes or no; toned by the screen's override for the value,
 * else the tone SimpliX Meta declares on the field, else a true value success and a false one neutral.
 *
 * @param value the value
 * @param field the field, with the tones Meta declares
 * @param override the screen's tones for this field, keyed `"true"` and `"false"`
 * @param words the entity catalog's reader and the kit's yes and no
 */
export function booleanBadge(
  value: boolean,
  field: Pick<ContractField, "name" | "tones">,
  override: Readonly<Record<string, StatusTone>> | undefined,
  words: BooleanWords,
): RecordBadge {
  const key = value ? "true" : "false";
  const label = words.word(`values.${field.name}.${key}`) ?? (value ? words.yes : words.no);
  return { label, tone: override?.[key] ?? field.tones?.[key] ?? (value ? "success" : "neutral") };
}

export function badgeOf(value: RecordValue): RecordBadge | undefined {
  return value && typeof value === "object" && "badge" in value ? value.badge : undefined;
}

/**
 * Whether a field is the kind that tells one row's state from another's: an enum whose values carry
 * a tone other than neutral (an active grant against a revoked one). A screen that states `keep`
 * for the field, either way, has decided it.
 *
 * @param field the contract field
 */
export function carriesState(field: Pick<ContractField, "kind" | "keep" | "tones">): boolean {
  return field.keep === undefined && field.kind === "enum" && Object.values(field.tones ?? {}).some((tone) => tone !== "neutral");
}

/** The text a drawn value reads as, or `""` where it draws nothing. */
export function recordValueText(value: RecordValue): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "string" || typeof value === "number") return String(value);
  if ("text" in value) return value.text;
  if ("link" in value) return value.link;
  if ("gone" in value) return value.gone.name;
  if ("figure" in value) return value.figure;
  if ("excerpt" in value) return value.excerpt;
  if ("meter" in value) return value.meter.text ?? `${value.meter.value} / ${value.meter.total}`;
  if ("badges" in value) return value.badges.map((badge) => badge.label).join(" ");
  if ("badge" in value) return value.badge.label;
  return "";
}

/**
 * A record's name from the values of its name fields, in order, joined by `separator` (a space
 * unless the screen names another) with the parts that draw nothing left out.
 */
export function recordNameOf(values: readonly RecordValue[], separator: string = " "): string {
  return values.map(recordValueText).filter((part) => part !== "").join(separator);
}

/**
 * Whether a detail draws a field across the panel's full width rather than in a cell of its
 * two-column grid. Long text, JSON and a machine message (an error, a hash, a storage path) run past
 * half a panel, so a half-width cell clips them or pushes them out of the panel.
 *
 * @param field the contract field
 */
export function detailFieldIsWide(field: ContractField): boolean {
  return field.kind === "longText" || field.kind === "json" || field.kind === "excerpt" || field.kind === "prose";
}

/**
 * Whether a record's name is an identifier: every field it is named by is drawn as code. The detail
 * then draws its title in the code face (`RecordDetail.titleCode`), as the list draws the column, so
 * the two agree by construction.
 *
 * @param fields the fields the record is named by
 */
export function recordNameIsCode(fields: readonly ContractField[]): boolean {
  return fields.length > 0 && fields.every((field) => field.code === true);
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
