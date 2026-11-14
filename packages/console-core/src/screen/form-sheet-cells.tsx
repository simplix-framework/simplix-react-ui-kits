import { useState } from "react";
import {
  Button,
  ChoiceChips,
  Dialog,
  DialogHeader,
  DialogTitle,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  Text,
} from "@simplix-react/ui";
import { partAttributes, slotAttributes } from "@simplix-react/ui/design";
import { useTranslation } from "@simplix-react/i18n/react";

import { BoundedDialogContent } from "../layout/bounded-dialog-content";
import { type FormSheetCellAccess, type FormSheetField, derivedText, missingForTransition } from "./form-sheet-model";
import type { FormSheetProps } from "./form-sheet";
import { PACKAGE_NAMESPACE } from "./locales";
import { RecordFieldView, signerLabel } from "../entity/record-form-fields";
import type { RecordFormField, SignatureValue } from "../entity/record-form-types";
import { TableCard } from "../layout/table-card";
import { formSheetDerivedLinkStyle, formSheetHeldStyle, formSheetIndentStyle } from "./form-sheet.style";

/**
 * One line of source text read as the source sets it: a numbered clause (「1. 위험성평가」) as a
 * sub-heading, a circled item (「① 우수」) indented under it, a note (「※ …」) muted, anything else
 * as body text.
 */
function SourceLine({ text, indented }: { readonly text: string; readonly indented?: boolean }) {
  if (/^\d+[.)]\s/.test(text)) return <Text size="sm" weight="semibold">{text}</Text>;
  if (/^[①-⑳]/.test(text) || indented) return <Text size="sm" {...partAttributes(formSheetIndentStyle, { depth: "clause" })}>{text}</Text>;
  if (/^※/.test(text)) return <Text size="caption" tone="muted">{text}</Text>;
  return <Text size="sm">{text}</Text>;
}

/**
 * Source text of several lines: runs of two or more lines that split into the same number of
 * 「 · 」-joined cells are a source table (its first line the head); any other line reads as a
 * {@link SourceLine}.
 */
export function SourceText({ lines }: { readonly lines: readonly string[] }) {
  const cellsOf = (line: string) => line.split(" · ");
  // A line that runs on from a circled item (its second line) keeps the item's indent.
  const parts: ({ kind: "line"; text: string; indented?: boolean } | { kind: "table"; rows: string[][] })[] = [];
  for (const line of lines) {
    const cells = cellsOf(line);
    const last = parts[parts.length - 1];
    if (cells.length >= 2 && last?.kind === "table" && last.rows[0]?.length === cells.length) last.rows.push(cells);
    else if (cells.length >= 2) parts.push({ kind: "table", rows: [cells] });
    else parts.push({ kind: "line", text: line, indented: last?.kind === "line" && (/^[①-⑳]/.test(last.text) || Boolean(last.indented)) && !/^(\d+[.)]|[①-⑳]|※)/.test(line) });
  }
  return (
    <Stack gap="xs">
      {parts.map((part, at) =>
        part.kind === "table" && part.rows.length >= 2 && part.rows.every((row) => row[0] === part.rows[0]?.[0]) ? (
          // Rows that all open with the same cell (「허가기준」) are that cell's table: it captions the rows.
          <Stack key={at} gap="xs">
            <Text size="sm" weight="medium">{part.rows[0]?.[0]}</Text>
            <TableCard>
              <Table>
                <TableBody>
                  {part.rows.map((row, index) => (
                    <TableRow key={index}>
                      {row.slice(1).map((cell, column) => (
                        <TableCell key={column}>
                          <Text size="sm">{cell}</Text>
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableCard>
          </Stack>
        ) : part.kind === "line" || part.rows.length < 2 ? (
          <SourceLine key={at} text={part.kind === "line" ? part.text : part.rows[0]?.join(" · ") ?? ""} indented={part.kind === "line" ? part.indented : false} />
        ) : (
          <TableCard key={at}>
            <Table>
              {/* The first line heads the table only when it reads as column names (short cells);
                  a first line of content (「상 · 사망 또는 영구적 장해 …」) is a row like the rest. */}
              {part.rows[0]?.every((cell) => cell.length <= 12) ? (
                <TableHeader>
                  <TableRow>
                    {part.rows[0]?.map((head, column) => <TableHead key={column}>{head}</TableHead>)}
                  </TableRow>
                </TableHeader>
              ) : null}
              <TableBody>
                {part.rows.slice(part.rows[0]?.every((cell) => cell.length <= 12) ? 1 : 0).map((row, index) => (
                  <TableRow key={index}>
                    {row.map((cell, column) => (
                      <TableCell key={column}>
                        <Text size="sm">{cell}</Text>
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableCard>
        ),
      )}
    </Stack>
  );
}

/**
 * An item's name as a checklist row shows it: when the source follows the item with parenthesised
 * criteria (「화학물질 저장소 … 운영 상태 (표지 부착) (분리보관)」, 「표지 부착 상태 (금지/경고 등)」), the
 * criteria are listed under the item in small text instead of running on in one line. A parenthesis
 * inside the item's own words (「가스(산소) 농도」) or a blank to fill (「(　　개소)」) stays where it is.
 */
export function ItemLabel({ text }: { readonly text: string }) {
  const trailing = /^(.*?\S)((?:\s+\([^()]+\))+)\s*$/.exec(text);
  const head = trailing?.[1];
  const criteria = trailing ? [...(trailing[2] ?? "").matchAll(/\(([^()]+)\)/g)].map((m) => m[1] ?? "") : [];
  // A blank the form leaves to fill (「(　　개소)」) belongs to the item's own words, not guidance under it.
  if (!head || criteria.length === 0 || criteria.some((criterion) => /\u3000|\s{2,}/.test(criterion))) return <Text size="sm">{text}</Text>;
  return (
    <Stack gap="none">
      <Text size="sm">{head}</Text>
      {criteria.map((criterion, at) => (
        <Text key={at} size="caption" tone="muted" {...partAttributes(formSheetIndentStyle, { depth: "note" })}>
          · {criterion}
        </Text>
      ))}
    </Stack>
  );
}

/** Whether a cell's label only repeats the section heading right above it. */
export function sameAsHeading(field: FormSheetField, heading: string): boolean {
  const norm = (text: string) => text.replace(/[\s·:()\[\]]/g, "");
  return norm(field.label) === norm(heading);
}

/** Field kinds whose filled value reads as one line of text. */
const READ_AS_TEXT: ReadonlySet<string> = new Set(["text", "textarea", "email", "number", "date", "datetime", "time", "month", "range", "select", "reference", "referenceMulti"]);

/** Whether a cell holds nothing: no value, blank text, an empty list or an empty row or period. */
function isBlankValue(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === "string") return value.trim() === "";
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === "object") return Object.values(value as Record<string, unknown>).every(isBlankValue);
  return false;
}

/** A filled value as one line: a period as 「from ~ to」, a list joined; null when the cell is empty. */
function filledText(value: unknown): string | null {
  if (value && typeof value === "object" && !Array.isArray(value) && ("from" in value || "to" in value)) {
    const range = value as { from?: string; to?: string };
    return range.from || range.to ? `${range.from ?? ""} ~ ${range.to ?? ""}` : null;
  }
  const text = derivedText(value);
  return text.kind === "value" && text.text.trim() ? text.text : null;
}

interface SheetCellProps {
  readonly field: FormSheetField;
  readonly access: FormSheetCellAccess;
  readonly sheet: FormSheetProps;
  readonly required: boolean;
  readonly error?: ReturnType<typeof missingForTransition>[string];
}

export function SheetCell({ field, access, sheet, required, error }: SheetCellProps) {
  const { t } = useTranslation(`${PACKAGE_NAMESPACE}/features`);
  const value = sheet.values[field.sourceId];

  if (access.kind === "static") {
    const lines = (field.sourceText || field.label).split("\n");
    return lines.length === 1 ? <SourceLine text={lines[0] ?? ""} /> : <SourceText lines={lines} />;
  }
  if (access.kind === "derived") {
    const shown = derivedText(value);
    return (
      <Stack gap="none">
        {field.labelHidden ? null : (
          <Text size="caption" tone="muted">
            {field.label}
          </Text>
        )}
        {shown.kind === "value" ? (
          <Text size="sm">{shown.text}</Text>
        ) : value === undefined ? (
          // Nothing computed yet. Only the field's own note can say what the value is computed from; a
          // bare 「computed」 tag says nothing a reader can act on, so without a note the cell stays empty.
          field.derivedNote ? (
            <Text size="sm" tone="muted">
              {field.derivedNote}
            </Text>
          ) : null
        ) : (
          <Text size="sm" {...slotAttributes(formSheetHeldStyle, {})}>{t("formSheet.held")}</Text>
        )}
        {/* Where the value is recorded, whether or not it has been yet. */}
        {sheet.derivedLinks?.[field.sourceId] ? (
          <Button variant="link" size="sm" className="h-auto self-start" {...partAttributes(formSheetDerivedLinkStyle, {})} onClick={sheet.derivedLinks[field.sourceId]?.onClick}>
            {sheet.derivedLinks[field.sourceId]?.label}
          </Button>
        ) : null}
      </Stack>
    );
  }

  // An empty cell the viewer cannot fill says who fills it, or that its stage passed it by, rather
  // than standing as a disabled box that reads as the viewer's to fill. Submitted and printed
  // sheets keep the blank, as the paper does.
  if (access.kind !== "editable" && isBlankValue(value) && field.control && field.control.kind !== "checkPair" && field.control.kind !== "tick") {
    const note =
      access.kind === "notWriter"
        ? { text: t("formSheet.pendingBy", { roles: access.roles.map((role) => sheet.roleLabel?.(role) ?? role).join(" · ") }), tone: "muted" as const }
        : access.kind === "locked" && access.because === "stagePassed"
          ? { text: t("formSheet.skipped"), tone: "warning" as const }
          : null;
    return (
      <Stack gap="none" data-record-field={field.sourceId} data-cell-state={access.kind}>
        {field.labelHidden ? null : (
          <Text size="caption" tone="muted">
            {field.label}
          </Text>
        )}
        <Text size="sm" tone={note?.tone ?? "muted"}>
          {note?.text ?? "\u00a0"}
        </Text>
      </Stack>
    );
  }

  // A filled cell the viewer cannot change reads as its value, the way the record's own fields do;
  // a disabled box around it would ask for input nobody here can give.
  const shown = filledText(value);
  if (access.kind !== "editable" && shown && field.control && READ_AS_TEXT.has(field.control.kind)) {
    return (
      <Stack gap="none" data-record-field={field.sourceId}>
        {field.labelHidden ? null : (
          <Text size="caption" tone="muted">
            {field.label}
          </Text>
        )}
        <Text size="sm">{shown}</Text>
      </Stack>
    );
  }
  const disabled: boolean | string =
    access.kind === "editable"
      ? false
      : access.kind === "notWriter"
        ? t("formSheet.writerOnly", { roles: access.roles.map((role) => sheet.roleLabel?.(role) ?? role).join(" · ") })
        : access.kind === "locked" && access.because === "stagePassed"
          ? t("formSheet.stagePassed")
          : true;
  const control: RecordFormField = { ...(field.control ?? { kind: "text" as const, key: "", label: "" }), key: field.sourceId, label: field.label, required, disabled, ...(field.labelHidden ? { labelHidden: true } : {}) };

  // A choice among a few words is a row of chips the viewer sees whole, not a list to open.
  if (control.kind === "select" && control.options.length > 0 && control.options.length <= 6 && access.kind === "editable") {
    return (
      <Stack gap="xs" data-record-field={field.sourceId}>
        {control.labelHidden ? null : (
          <Text size="sm" weight="medium">
            {field.label}
          </Text>
        )}
        <ChoiceChips label={field.label} value={typeof value === "string" ? value : null} options={control.options.map((option) => ({ value: option.value, label: option.label }))} onChange={(next) => sheet.onChange(field.sourceId, next)} />
        {control.hint ? (
          <Text size="caption" tone="muted">
            {control.hint}
          </Text>
        ) : null}
      </Stack>
    );
  }
  if (control.kind === "signature") return <SignatureCell field={field} control={control} value={value as SignatureValue | null} sheet={sheet} editable={access.kind === "editable"} />;
  return <RecordFieldView field={control} value={value} onChange={(next) => sheet.onChange(field.sourceId, next)} error={error} errorsShown={Boolean(sheet.checkedTransition)} />;
}

function SignatureCell({
  field,
  control,
  value,
  sheet,
  editable,
}: {
  readonly field: FormSheetField;
  readonly control: RecordFormField;
  readonly value: SignatureValue | null;
  readonly sheet: FormSheetProps;
  readonly editable: boolean;
}) {
  const { t } = useTranslation(`${PACKAGE_NAMESPACE}/features`);
  const [open, setOpen] = useState(false);
  const signed = value && !value.dataUrl ? value : null;
  const reason = typeof control.disabled === "string" ? control.disabled : undefined;

  if (signed || !editable) {
    const body = (
      <Stack gap="none" data-record-field={field.sourceId}>
        {field.labelHidden ? null : (
          <Text size="caption" tone="muted">
            {field.label}
          </Text>
        )}
        <Text size="sm">{signed ? `${signerLabel(signed)} · ${signed.at}` : "-"}</Text>
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

  return (
    <Stack gap="xs" data-record-field={field.sourceId}>
      {field.labelHidden ? null : (
        <Text size="caption" tone="muted">
          {field.label}
        </Text>
      )}
      <Button
        size="sm"
        variant="outline"
        onClick={() => {
          sheet.onSign(field.sourceId);
          setOpen(true);
        }}
      >
        {t("formSheet.sign")}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <BoundedDialogContent width="md">
          <DialogHeader>
            <DialogTitle>{t("formSheet.signTitle", { label: field.label })}</DialogTitle>
          </DialogHeader>
          <RecordFieldView
            field={{ ...control, disabled: false }}
            value={value}
            onChange={(next) => {
              sheet.onChange(field.sourceId, next);
            }}
          />
        </BoundedDialogContent>
      </Dialog>
    </Stack>
  );
}
