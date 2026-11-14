import { useCallback, useMemo } from "react";
import { calendarDayLabel, useAppTimeZone, zoneDateTimeText } from "@simplix-react/headless";
import { i18nBaseValue, seedI18nDefaults } from "@simplix-react/i18n";
import { useEntityTranslation, useI18nEditLanguage, useLocale, useTranslation } from "@simplix-react/i18n/react";

import {
  CONTRACT_COLUMN_SIZE,
  booleanBadge,
  carriesState,
  detailFieldIsWide,
  enumColumnWidth,
  enumValueOf,
  figureValue,
  isBlankOptionalText,
  isBlankSecret,
  jsonText,
  ladderColumns,
  languageName,
  moneyAmount,
  moneyFieldOf,
  moneyStored,
  moneyText,
  parsedJson,
  peekKindOf,
  proseExcerpt,
  recordFilterOf,
  recordNameOf,
  recordValueText,
  secretFormField,
  sortFieldOf,
  startingValue,
  textValueOf,
  valueAtPath,
} from "./record-contract-values";
import type {
  ContractField,
  ContractFilter,
  ContractHeadFigure,
  ContractOverrides,
  ContractSectionSpec,
  DetailSectionsOptions,
  I18nMap,
  Row,
} from "./record-contract-types";
import { PACKAGE_NAMESPACE } from "./locales";
import type { RecordFilter } from "./record-list";
import type { RecordFormField } from "./record-form-types";
import type { RecordValue } from "./record-value";
import { bytesText, durationText, withoutByteUnit } from "./record-figure";
import { groupedNumber } from "./grouped-number";
import { pickFields } from "./contract-pick";
import { useReferenceValue } from "./reference-value";

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
          return figureValue(field, raw, moneyText(moneyFieldOf(field, row), raw, locale));
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

export * from "./record-contract-types";
export * from "./record-contract-values";
