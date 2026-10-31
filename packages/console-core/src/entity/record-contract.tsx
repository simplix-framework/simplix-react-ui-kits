import { useCallback, useMemo } from "react";
import { resolveBootEnum } from "@simplix-react-ext/simplix-boot-utils";
import { calendarDayLabel, useAppTimeZone, zoneDateTimeText } from "@simplix-react/headless";
import { useEntityTranslation, useLocale, useTranslation } from "@simplix-react/i18n/react";
import type { EntitySearch, StatusTone } from "@simplix-react/ui";

import { PACKAGE_NAMESPACE } from "./locales";
import { usePeekHost } from "../peek";
import type { RecordFormField } from "./record-form-types";
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
  | "reference";

export interface ContractField {
  readonly name: string;
  readonly kind: ContractFieldKind;
  /** The enum the labels are read from (`enumLabel(enumName, value)`), for an `enum` field. */
  readonly enumName?: string;
  /** Every value an `enum` field takes, in the contract's order. */
  readonly options?: readonly string[];
  /** The peek kind a `reference` field opens, which is the referenced entity's name. */
  readonly peekKind?: string;
  /** The field beside a `reference` that carries the referenced record's name. */
  readonly nameField?: string;
  /** The server owns it: drawn in a detail, never edited in a form. */
  readonly readOnly?: boolean;
  readonly required?: boolean;
}

/** What one screen adds to the contract's drawing: tones for its enums, pickers for its references. */
export interface ContractOverrides {
  /** Field → enum value → tone. A value with no tone is neutral. */
  readonly tones?: Readonly<Record<string, Readonly<Record<string, StatusTone>>>>;
  /** Field → the search a form's reference picker reads. A reference without one is edited as text. */
  readonly searches?: Readonly<Record<string, EntitySearch>>;
}

type Row = Readonly<Record<string, unknown>>;

/** The enum's value as text, whether the server sent the constant or the boot enum object. */
export function enumValueOf(raw: unknown): string {
  if (raw === null || raw === undefined) return "";
  return String(resolveBootEnum(raw as never) || "");
}

/** Text with digit grouping in the reader's locale; a non-number is drawn as it came. */
export function groupedNumber(raw: unknown, locale: string): string {
  if (raw === null || raw === undefined || raw === "") return "";
  const value = typeof raw === "number" ? raw : Number(raw);
  return Number.isFinite(value) ? new Intl.NumberFormat(locale).format(value) : String(raw);
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
        case "reference": {
          const name = field.nameField ? row?.[field.nameField] : undefined;
          const text = typeof name === "string" && name !== "" ? name : String(raw);
          if (!field.peekKind) return { link: text };
          const kind = field.peekKind;
          return { link: text, onClick: () => peek.open({ kind, target: { id: String(raw), name: text } }) };
        }
        default:
          return String(raw);
      }
    },
    [enumLabel, locale, peek, t, tones, zone],
  );

  const formField = useCallback(
    (field: ContractField, record: Row | undefined): RecordFormField => {
      const raw = record?.[field.name];
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
        case "reference": {
          const search = searches?.[field.name];
          if (search) return { ...common, kind: "reference", value: raw == null ? "" : String(raw), search, peek: Boolean(field.peekKind), peekKind: field.peekKind };
          return { ...common, kind: "text", value: raw == null ? "" : String(raw) };
        }
        case "longText":
          return { ...common, kind: "textarea", value: raw == null ? "" : String(raw) };
        case "email":
          return { ...common, kind: "email", value: raw == null ? "" : String(raw) };
        default:
          return { ...common, kind: "text", value: raw == null ? "" : String(raw) };
      }
    },
    [enumLabel, fieldLabel, searches, zone],
  );

  return useMemo(() => ({ value, formField, fieldLabel }), [value, formField, fieldLabel]);
}
