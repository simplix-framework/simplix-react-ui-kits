import { useCallback, useMemo } from "react";
import { resolveBootEnum } from "@simplix-react-ext/simplix-boot-utils";
import { calendarDayLabel, useAppTimeZone, zoneDateTimeText } from "@simplix-react/headless";
import { i18nBaseValue, seedI18nDefaults } from "@simplix-react/i18n";

/** A text per content language, as the i18n helpers take it. */
type I18nMap = Parameters<typeof i18nBaseValue>[0] & object;
import { useEntityTranslation, useI18nEditLanguage, useLocale, useTranslation } from "@simplix-react/i18n/react";
import type { EntityFacet, EntitySearch, LanguageSelectorPlacement, StatusTone } from "@simplix-react/ui";

import { PACKAGE_NAMESPACE } from "./locales";
import type { PeekTarget } from "../peek";
import type { RecordFormField } from "./record-form-types";
import type { RecordFilter } from "./record-list";
import { bytesText, durationText, figureSign, signedText, withoutByteUnit } from "./record-figure";
import { pickFields } from "./contract-pick";
import { knownFilterOperators } from "./filter-operators";
import { groupedNumber } from "./grouped-number";
import type { RecordBadge, RecordValue } from "./record-value";
import { useReferenceValue } from "./reference-value";

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
  | "excerpt"
  /**
   * Free text a person wrote (a note, a comment): a list cell or card draws its start as prose, cut
   * on a word with an ellipsis at `proseLength` characters, and a detail draws the whole text.
   */
  | "prose"
  /** A language code (`ko`, `en-US`), written as the language's name in the reader's language. */
  | "language";

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
  /**
   * The field beside a `reference` that says why its record cannot be opened: `DELETED` or
   * `UNAVAILABLE` (no access). Absent or any other value means the record opens as usual.
   */
  readonly stateField?: string;
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
   * The field the column sorts by where it is not the field drawn: a reference drawn by its
   * recorded name sorts by that name (`nameField`), since its id orders nothing a reader can see.
   */
  readonly sortField?: string;
  /**
   * Locale → the field the server orders this one by in that language (SimpliX Meta's
   * `searchable.sortAlias`): a translated name sorts by its per-language sort key, so the visible
   * name column sorts in the reader's language rather than not at all.
   */
  readonly sortAlias?: Readonly<Record<string, string>>;
  /** The record's own identifier: drawn with a copy control in a detail. */
  readonly identifier?: boolean;
  /**
   * For a `prose` field, the characters a list cell or card keeps before the cut; absent,
   * {@link PROSE_CHARS}.
   */
  readonly proseLength?: number;
  /**
   * For a `boolean` field, a list cell or card draws a mark with the field's own label when the
   * value is true and nothing when it is false: a "No" badge on every card says nothing. The column
   * keeps no empty cell on the cards that lack it. A detail still draws yes or no.
   */
  readonly markWhenTrue?: boolean;
  /**
   * The list draws the column at every pane width: a field without which another drawn column reads
   * wrong (a consent's withdrawal beside "granted"), kept as the leading and the sorted column are.
   */
  readonly keep?: boolean;
  /**
   * For a `text` field, the address the value opens, computed from the row (a document version that
   * opens the published text of that version): the list cell, the card and the detail draw the value
   * as a link to it, a new tab when the address is on another origin. A row it answers no address for
   * draws the value as plain text.
   */
  readonly linkOf?: (row: Readonly<Record<string, unknown>>) => string | undefined;
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
  /**
   * The tone of each value's badge as SimpliX Meta declares it (an enum value's `tone`, a boolean's
   * `tones`), keyed by the value (`"true"` and `"false"` for a boolean). A screen's
   * {@link ContractOverrides.tones} for the field wins over it; a value neither names is neutral.
   */
  readonly tones?: Readonly<Record<string, StatusTone>>;
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
  prose: { minWidth: 220, wrap: true },
  language: { minWidth: 140 },
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
      const operators = knownFilterOperators(def.operators);
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

/**
 * The fields a detail draws as sections, each with its title and the field names it holds in order:
 * the `SECTIONS` table a detail with more than one section declares.
 */
export type ContractSectionSpec = readonly { readonly key: string; readonly title: string; readonly fields: readonly string[] }[];

/** How {@link useRecordContract}'s `detailSections` names and trims the sections. */
export interface DetailSectionsOptions {
  /** A section's title in the reader's language, from the key the spec names (a catalog key). */
  readonly title: (title: string) => string;
  /** Leave out the fields that draw nothing, and then the sections left with no field. */
  readonly omitEmpty?: boolean;
}

/** What one screen adds to the contract's drawing: tones for its enums, pickers for its references. */
export interface ContractOverrides {
  /** Field → enum value → tone, over the field's own {@link ContractField.tones}. A value with no tone is neutral. */
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
 * boolean as a badge worded by the entity catalog's `values.<field>.true` / `.false` (yes or no where
 * the catalog has none) and toned as SimpliX Meta declares, an instant in the installation's zone, a day as a calendar label, a
 * number grouped, a reference as the referenced record's name that opens its peek. `formField` gives
 * the control: a select, a switch, a date, a number, a reference picker, a text area.
 *
 * @param entity the entity whose field labels and enum labels are read
 * @param overrides tones and pickers one screen supplies
 */
export function useRecordContract(entity: string, overrides: ContractOverrides = {}) {
  const { fieldLabel, enumLabel } = useEntityTranslation(entity);
  // A size is written in the largest unit that fits its value, so its label never names a unit of its own.
  const labelOf = useCallback((field: ContractField): string => (field.kind === "bytes" ? withoutByteUnit(fieldLabel(field.name)) : fieldLabel(field.name)), [fieldLabel]);
  const { t } = useTranslation(PACKAGE_NAMESPACE + "/features");
  // The entity's own words for a boolean's two values (`values.<field>.true`), beside its field labels.
  const { t: entityWord, exists: entityHasWord } = useTranslation(`entity/${entity}`);
  const locale = useLocale();
  const zone = useAppTimeZone();
  const referenceValue = useReferenceValue();
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
          // The screen's tone first, then the one SimpliX Meta declares on the value.
          return { badge: { label, tone: tones?.[field.name]?.[constant] ?? field.tones?.[constant] ?? "neutral" } };
        }
        case "boolean":
          // A mark for the rows it is true of, drawn under the field's own name; nothing on the others.
          if (field.markWhenTrue) return raw ? { badge: { label: fieldLabel(field.name), tone: tones?.[field.name]?.["true"] ?? field.tones?.["true"] ?? "info" } } : null;
          return {
            badge: booleanBadge(Boolean(raw), field, tones?.[field.name], {
              word: (key) => (entityHasWord(key) ? entityWord(key) : undefined),
              yes: t("recordForm.yes"),
              no: t("recordForm.no"),
            }),
          };
        case "instant":
          return zoneDateTimeText(zone, String(raw), locale);
        case "date":
          return calendarDayLabel(String(raw), locale, "iso") || String(raw);
        case "number":
          return figureValue(field, raw, groupedNumber(raw, locale));
        case "money":
          return figureValue(field, raw, moneyText(field, raw, locale));
        case "credits":
          // The plural follows the number (1 credit, 2 credits); the figure is written grouped.
          return figureValue(field, raw, t("recordValue.credits", { count: Number(raw), value: groupedNumber(raw, locale) }));
        case "bytes":
          return { figure: bytesText(raw, locale) };
        case "duration":
          return { figure: durationText(raw, locale) };
        case "excerpt":
          return { excerpt: String(raw) };
        case "prose":
          return proseExcerpt(String(raw), field.proseLength);
        case "language":
          return languageName(String(raw), locale);
        case "reference": {
          const name = field.nameField ? valueAtPath(row, field.nameField) : undefined;
          return referenceValue({
            kind: peekKindOf(field, row),
            id: String(raw),
            // A reference its record names nothing for is drawn by the target's label and its id.
            name: typeof name === "string" && name !== "" ? name : undefined,
            by: field.peekBy,
            noun: field.peekKinds ? enumValueOf(row?.[field.peekKinds.field]) : undefined,
            // An owner of varying kind says which kind a person is; an all-users column draws none.
            sub: field.peekKinds ? t("recordGone.personLine") : undefined,
            state: field.stateField ? enumValueOf(row?.[field.stateField]) : undefined,
          });
        }
        case "json":
          return { text: jsonText(raw), code: true, block: true };
        default: {
          const href = field.kind === "text" && row !== undefined ? field.linkOf?.(row) : undefined;
          return href ? { link: String(raw), href } : textValueOf(field, raw);
        }
      }
    },
    [entityHasWord, entityWord, enumLabel, fieldLabel, locale, referenceValue, t, tones, zone],
  );

  const formField = useCallback(
    (field: ContractField, record: Row | undefined): RecordFormField => {
      const raw = startingValue(field, record);
      const common = { key: field.name, label: labelOf(field), required: field.required };
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
        case "prose":
          return { ...common, kind: "textarea", value: raw == null ? "" : String(raw) };
        case "json":
          return { ...common, kind: "textarea", value: raw == null ? "" : jsonText(raw) };
        case "email":
          return { ...common, kind: "email", value: raw == null ? "" : String(raw) };
        default:
          return { ...common, kind: "text", value: raw == null ? "" : String(raw) };
      }
    },
    [enumLabel, fieldLabel, labelOf, languages, searches, t, zone],
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
        if (isBlankOptionalText(field, values[field.name])) body[field.name] = null;
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
      header: labelOf(field),
      field: (sortFieldOf(field, locale) ?? field.sortField ?? field.name) as keyof R & string,
      ...CONTRACT_COLUMN_SIZE[field.kind],
      // An enum column is as wide as its longest label needs, so no badge is cut.
      ...(field.kind === "enum" && field.enumName && field.options?.length
        ? { width: enumColumnWidth(field.options.map((option) => enumLabel(field.enumName as string, option))) }
        : {}),
      ...(sortFieldOf(field, locale) !== undefined ? { sortable: true } : field.sortable === undefined ? {} : { sortable: field.sortable }),
      // A mark drawn only on the rows it is true of leaves no empty cell on the cards that lack it.
      ...(field.kind === "boolean" && field.markWhenTrue ? { cardKeep: false } : {}),
      // A boolean the entity words in neither value reads only 「Yes」 or 「No」, which says nothing
      // without its name, so a card draws it as a labelled line instead of in the unlabelled badge row.
      ...(field.kind === "boolean" && !field.markWhenTrue && !(entityHasWord(`values.${field.name}.true`) && entityHasWord(`values.${field.name}.false`)) ? { cardPlace: "lines" as const } : {}),
      ...(field.keep ? { keep: true } : {}),
      value: (row: R) => value(field, row as unknown as Row),
    }),
    [entityHasWord, enumLabel, labelOf, value, locale],
  );

  /**
   * Every field as a column. Each one after the leading block is dropped from a pane narrower than
   * the table that holds it, and the leading block drops last, from its end, when the list ladders
   * it; so a wide record set narrows column by column instead of flipping to cards, and the card
   * layout is left to a phone. The first field that carries the rows' state ({@link carriesState})
   * is kept at every width: a table without it reads every row as the same, a revoked grant as an
   * active one.
   */
  const columns = useCallback(
    <R,>(fields: readonly ContractField[]) => {
      const state = fields.find(carriesState);
      return ladderColumns(fields.map((field) => (field === state ? { ...column<R>(field), keep: true } : column<R>(field))));
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
    (field: ContractField, row: Row | undefined) => {
      // A machine message (an error, a trace, a hash, a storage path) is read and copied whole in a
      // record, in the monospaced face and across the panel; a list cell keeps its first line.
      if (field.kind === "excerpt") {
        const raw = row?.[field.name];
        const text = raw == null || raw === "" ? undefined : String(raw);
        return { label: labelOf(field), value: text ? { text, code: true, block: true } : null, wide: true, copy: text !== undefined };
      }
      return {
        label: labelOf(field),
        // A detail draws the whole text and a yes or no, where a list draws the start and a mark.
        value: value(field.kind === "prose" ? { ...field, kind: "longText" } : field.markWhenTrue ? { ...field, markWhenTrue: false } : field, row),
        wide: detailFieldIsWide(field),
        copy: field.identifier === true,
      };
    },
    [labelOf, value],
  );

  // A figure in a record's head is named by the field it draws, as the list's column and the page's
  // tile are, so one value has one name in every language and a screen writes no catalogue key for it.
  const headFigures = useCallback(
    (fields: readonly ContractField[], row: Row | undefined): ContractHeadFigure[] =>
      fields.map((field) => ({ key: field.name, label: labelOf(field), value: value(field, row) })),
    [labelOf, value],
  );

  // A record's name as one line of text: each name field drawn as its kind draws it (an enum by
  // its label, an instant in the installation's zone), the parts joined in order. A header that
  // separates the parts (`" · "`) passes the separator, and the delete dialog names the record the
  // same way by passing it too.
  const recordName = useCallback(
    (fields: readonly ContractField[], row: Row | undefined, options: { readonly separator?: string } = {}): string =>
      recordNameOf(
        fields.map((field) => value(field, row)),
        options.separator,
      ),
    [value],
  );

  /** One field's value as plain text, drawn as its kind draws it: for a notice, a title, a sentence. */
  const text = useCallback((field: ContractField, row: Row | undefined): string => recordValueText(value(field, row)), [value]);

  /** An instant written in the installation's zone and the reader's language, or `""` for none or one that does not parse. */
  const instantText = useCallback((iso: string | null | undefined): string => (iso ? (zoneDateTimeText(zone, iso, locale) ?? "") : ""), [locale, zone]);

  /** A calendar day (`2026-11-30`) written as the reader reads a date, or `""` for none. */
  const dateText = useCallback((day: string | null | undefined): string => (day ? calendarDayLabel(day, locale, "iso") || day : ""), [locale]);

  /** The detail fields a screen names, in the order it names them; a name the table lacks is skipped. */
  const detailFields = useCallback(
    (fields: readonly ContractField[], names: readonly string[], row: Row | undefined) => pickFields(fields, names).map((field) => detailField(field, row)),
    [detailField],
  );

  /**
   * The detail's sections from its `SECTIONS` table, each holding the fields it names in that order.
   * With `omitEmpty`, a field that draws nothing is left out, and then a section left with none.
   */
  const detailSections = useCallback(
    (spec: ContractSectionSpec, fields: readonly ContractField[], row: Row | undefined, options: DetailSectionsOptions) =>
      spec.flatMap((section) => {
        const drawn = detailFields(fields, section.fields, row);
        const kept = options.omitEmpty ? drawn.filter((field) => field.value !== null && field.value !== undefined) : drawn;
        return options.omitEmpty && kept.length === 0 ? [] : [{ key: section.key, title: options.title(section.title), fields: kept }];
      }),
    [detailFields],
  );

  // `enumLabel` is returned for a screen that draws an enum constant outside a column or a filter (a tab per group).
  return useMemo(
    () => ({ value, text, formField, request, column, columns, filters, detailField, detailFields, detailSections, headFigures, fieldLabel, enumLabel, recordName, instantText, dateText }),
    [value, text, formField, request, column, columns, filters, detailField, detailFields, detailSections, headFigures, fieldLabel, enumLabel, recordName, instantText, dateText],
  );
}

/**
 * The badge a drawn value carries, for a record's header: the status, type or kind badge the field
 * is drawn as in the list, or nothing where the value is not a badge.
 *
 * @param value what `useRecordContract().value` drew for the field
 */
/** What a boolean's badge is worded from: the entity's own word for a value, else yes or no. */
export interface BooleanWords {
  /** The entity catalog's text under `key`, or undefined where it has none. */
  readonly word: (key: string) => string | undefined;
  readonly yes: string;
  readonly no: string;
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
