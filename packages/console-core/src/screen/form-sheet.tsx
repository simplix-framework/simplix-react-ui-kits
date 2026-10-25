import { Fragment, useState, type ReactElement } from "react";
import { PrinterIcon } from "lucide-react";
import { SegmentedControl } from "@simplix-react/ui/interaction";
import { useTranslation } from "@simplix-react/i18n/react";
import {
  Badge,
  Button,
  Checkbox,
  ChoiceChips,
  CrudDetail,
  Input,
  Dialog,
  DialogHeader,
  DialogTitle,
  Flex,
  Grid,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Text,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@simplix-react/ui";
import { partAttributes, slotAttributes } from "@simplix-react/ui/design";

import { FormErrorSummary } from "../entity/form-error-summary";
import { PACKAGE_NAMESPACE as ENTITY_NAMESPACE } from "../entity/locales";
import { RecordFieldView, RowColumnInput, signerLabel } from "../entity/record-form-fields";
import type { ChoiceDetailValue, RecordFormField, SignatureValue, VerdictChoice, VerdictValue } from "../entity/record-form-types";
import { BoundedDialogContent } from "../layout/bounded-dialog-content";
import { TableCard } from "../layout/table-card";
import { PACKAGE_NAMESPACE } from "./locales";
import {
  cellAccess,
  derivedText,
  layoutSections,
  missingForTransition,
  sheetBlocks,
  type ResolvedLayoutBlock,
  type FormSheetCellAccess,
  type FormSheetContext,
  type FormSheetDefinition,
  type FormSheetField,
} from "./form-sheet-model";
import {
  formSheetCellStyle,
  formSheetColumnStyle,
  formSheetDerivedLinkStyle,
  formSheetHeldStyle,
  formSheetIndentStyle,
  formSheetSourceImageStyle,
} from "./form-sheet.style";
import { DocumentViewer, PrintSheet, type ViewerFit } from "./print-preview";

/** Which submission and which template version the sheet shows. */
export interface FormSheetSubmission {
  readonly version: number;
  /** The submission's status, already in the reader's words. */
  readonly status: string;
  readonly templateVersion: string;
}

/** One page image of the source form, a local file. */
export interface FormSheetSourcePage {
  /** 1-based. */
  readonly page: number;
  readonly src: string;
}

/** Props for {@link FormSheet}. */
export interface FormSheetProps {
  readonly form: FormSheetDefinition;
  /** The submission's values, keyed by sourceId. */
  readonly values: Readonly<Record<string, unknown>>;
  /** The last lifecycle transition that has happened. */
  readonly stage: string;
  /** The viewer's roles, including the roles the record assigns them. */
  readonly viewerRoles: readonly string[];
  readonly submission: FormSheetSubmission;
  readonly sourcePages?: readonly FormSheetSourcePage[];
  /** Names a role, as the tooltip on a cell the viewer cannot write says it. */
  readonly roleLabel?: (role: string) => string;
  /**
   * The transition a command just tried and refused; its missing cells are marked. Cells required
   * at any other transition are never marked.
   */
  readonly checkedTransition?: string;
  readonly onChange: (sourceId: string, value: unknown) => void;
  /** A signature cell was pressed; the signing dialog opens inside the sheet. */
  readonly onSign: (sourceId: string) => void;
  /** The submission is submitted or approved and nothing in it changes. */
  readonly readOnly?: boolean;
  /**
   * Where a derived cell's value is recorded, by the cell's source id: a link under its note to the
   * part of the record that holds it (「전기 차단 탭 열기」).
   */
  readonly derivedLinks?: Readonly<Record<string, { readonly label: string; readonly onClick: () => void }>>;
}

type View = "form" | "source";

/**
 * One source form drawn in source order with its labels and merged cells. A cell takes input only
 * for the viewer whose roles include one of its writer roles, and only until its stage has passed;
 * a cell required at a later stage is never marked as missing. A source page view and a print view
 * stand beside it.
 */
export function FormSheet(props: FormSheetProps) {
  const { form, submission, sourcePages = [] } = props;
  const { t } = useTranslation(`${PACKAGE_NAMESPACE}/features`);
  const [view, setView] = useState<View>("form");
  const [printing, setPrinting] = useState(false);

  return (
    <CrudDetail.Section
      title={form.title}
      trailing={
        <Flex gap="xs" align="center">
          <SegmentedControl
            label={t("formSheet.viewLabel")}
            options={[
              { key: "form", label: t("formSheet.viewForm") },
              { key: "source", label: t("formSheet.viewSource") },
            ]}
            value={view}
            onChange={setView}
          />
          <Button size="icon-sm" variant="ghost" aria-label={t("formSheet.print")} title={t("formSheet.print")} onClick={() => setPrinting(true)}>
            <PrinterIcon />
          </Button>
        </Flex>
      }
    >
      {/* What the sheet is, as one quiet line: where it stands, which submission, which revision of the form. */}
      <Text size="sm" tone="muted" className="col-span-full">
        {[submission.status, t("formSheet.version", { version: submission.version }), t("formSheet.templateVersion", { version: submission.templateVersion })].join(" · ")}
      </Text>
      <Stack gap="md" className="col-span-full">
        {view === "form" ? <SheetBody {...props} /> : <SourceView form={form} pages={sourcePages} />}
      </Stack>
      <Dialog open={printing} onOpenChange={setPrinting}>
        <BoundedDialogContent width="xl">
          <DialogHeader>
            <DialogTitle>{t("formSheet.print")}</DialogTitle>
          </DialogHeader>
          <PrintView {...props} />
        </BoundedDialogContent>
      </Dialog>
    </CrudDetail.Section>
  );
}

function SourceView({ form, pages }: { readonly form: FormSheetDefinition; readonly pages: readonly FormSheetSourcePage[] }) {
  const { t } = useTranslation(`${PACKAGE_NAMESPACE}/features`);
  const [page, setPage] = useState(1);
  const [fit, setFit] = useState<ViewerFit>("single");
  const sorted = [...pages].sort((a, b) => a.page - b.page);
  if (sorted.length === 0) return <Text tone="muted">{t("formSheet.noSource")}</Text>;
  const shown = fit === "spread" ? sorted.filter((one) => one.page === page || one.page === page + 1) : sorted.filter((one) => one.page === page);
  return (
    <DocumentViewer size={form.paper} pages={sorted.length} page={page} onPageChange={setPage} fit={fit} onFitChange={setFit}>
      {shown.map((one) => (
        <PrintSheet key={one.page} size={form.paper} margin="0" title={t("formSheet.sourcePage", { page: one.page })}>
          {/* raw img: a source page is a picture, and no framework primitive draws one. */}
          <img src={one.src} alt={t("formSheet.sourcePage", { page: one.page })} {...partAttributes(formSheetSourceImageStyle, {})} />
        </PrintSheet>
      ))}
    </DocumentViewer>
  );
}

function PrintView(props: FormSheetProps) {
  const [page, setPage] = useState(1);
  const [fit, setFit] = useState<ViewerFit>("single");
  return (
    <DocumentViewer size={props.form.paper} pages={1} page={page} onPageChange={setPage} fit={fit} onFitChange={setFit}>
      <PrintSheet size={props.form.paper} title={props.form.title}>
        <SheetBody {...props} readOnly checkedTransition={undefined} />
      </PrintSheet>
    </DocumentViewer>
  );
}

function SheetBody(props: FormSheetProps) {
  const { form, values, checkedTransition } = props;
  const { t } = useTranslation(`${ENTITY_NAMESPACE}/features`);
  const context: FormSheetContext = { stage: props.stage, stages: form.stages, viewerRoles: props.viewerRoles, readOnly: props.readOnly };
  const errors = checkedTransition ? missingForTransition(form.fields, values, checkedTransition) : {};
  const labels = new Map(form.fields.map((field) => [field.sourceId, field.label]));
  const shownErrors = checkedTransition ? Object.fromEntries(Object.entries(errors).map(([key, code]) => [key, t(`recordForm.errors.${code}`)])) : undefined;
  const cell = (field: FormSheetField) => <SheetCell key={field.sourceId} field={field} access={cellAccess(field, context)} sheet={props} required={field.stage === checkedTransition} error={errors[field.sourceId]} />;

  const sections = layoutSections(form, t("formSheet.rest", { ns: `${PACKAGE_NAMESPACE}/features` }));
  const head = (
    <>
      <FormErrorSummary fieldErrors={shownErrors} label={(key) => labels.get(key) ?? key} />
    </>
  );
  if (sections) {
    return (
      <>
        {head}
        {sections.map((section) => (
          <Stack key={section.title} gap="sm" data-sheet-section={section.title}>
            <Text weight="semibold">{section.title}</Text>
            {section.blocks.map((block, at) => (
              <LayoutBlock key={at} block={block} cell={(field) => cell(sameAsHeading(field, section.title) ? { ...field, labelHidden: true } : field)} sheet={props} access={(field) => cellAccess(field, context)} />
            ))}
          </Stack>
        ))}
      </>
    );
  }
  return (
    <>
      {head}
      {sheetBlocks(form.fields).map((block) =>
        block.kind === "flow" ? (
          <Stack key={`flow-${block.fields[0]?.sourceId}`} gap="sm">
            {block.fields.map(cell)}
          </Stack>
        ) : (
          <TableCard key={`table-${block.table}`}>
            <Table>
              <TableBody>
                {block.rows.map((row) => (
                  <TableRow key={row.row}>
                    {row.cells.map((field) => (
                      <TableCell key={field.sourceId} rowSpan={field.cell?.rowSpan} colSpan={field.cell?.columnSpan} {...partAttributes(formSheetCellStyle, { header: field.mode === "static" })}>
                        {cell(field)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableCard>
        ),
      )}
    </>
  );
}

interface LayoutBlockProps {
  readonly block: ResolvedLayoutBlock;
  readonly cell: (field: FormSheetField) => ReactElement;
  readonly sheet: FormSheetProps;
  readonly access: (field: FormSheetField) => FormSheetCellAccess;
}

/**
 * Items answered by the same columns, one row per item, under the source's own column names.
 *
 * <p>A two-party check draws a tick under each party (only the side the viewer writes takes input)
 * and, where the source prints one, a third cell for a count or the item's own name. A verdict draws
 * its three answers as chips in the source's words and a remark cell when the source has one; a row
 * the source leaves blank for the filler takes the item's name.
 */
function ChecksTable({ block, cell, sheet, access }: Omit<LayoutBlockProps, "block"> & { readonly block: Extract<ResolvedLayoutBlock, { kind: "checks" }> }) {
  // Items whose answer is a row of the source's own columns (a tick and a remark) are that table.
  if (block.fields.length > 0 && block.fields.every((field) => field.control?.kind === "row")) {
    const first = block.fields[0]?.control;
    const columns = first?.kind === "row" ? first.columns : [];
    return (
      <TableCard>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{block.title ?? ""}</TableHead>
              {columns.map((column) => (
                <TableHead key={column.key} className={column.tick ? "w-20" : undefined} {...partAttributes(formSheetColumnStyle, { tick: Boolean(column.tick) })}>
                  {column.label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {block.fields.map((field) => {
              const value = (sheet.values[field.sourceId] ?? {}) as Readonly<Record<string, string>>;
              const disabled = access(field).kind !== "editable";
              return (
                <TableRow key={field.sourceId} data-record-field={field.sourceId}>
                  <TableCell>
                    <Text size="sm">{field.label}</Text>
                  </TableCell>
                  {columns.map((column) => (
                    <TableCell key={column.key} {...partAttributes(formSheetColumnStyle, { tick: Boolean(column.tick) })}>
                      <RowColumnInput column={column} value={value} disabled={disabled} label={field.label} onChange={(next) => sheet.onChange(field.sourceId, next)} />
                    </TableCell>
                  ))}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableCard>
    );
  }
  const pair = block.fields.find((field) => field.control?.kind === "checkPair")?.control;
  const verdict = block.fields.find((field) => field.control?.kind === "verdict")?.control;
  const extra = block.fields.flatMap((field) => (field.control?.kind === "checkPair" && field.control.extra ? [field.control.extra] : []))[0];
  const tickHeads = pair?.kind === "checkPair" ? (block.headers.length >= 2 ? block.headers.slice(0, 2) : [...pair.sideLabels]) : [];
  const verdictHeads = verdict?.kind === "verdict" ? (block.headers.length >= 3 ? block.headers.slice(0, 3) : [...verdict.labels]) : [];
  const remarkHead = verdict ? block.headers[3] : undefined;
  // Rows answered by any other control (a choice among levels, a text) take an item column and an
  // answer column; heads past the second name the choices the control already shows, so they go.
  const plainHeads = block.headers.length === 2 ? [block.headers[1] ?? ""] : [""];
  const heads = pair ? [...tickHeads, ...(extra ? [extra.label] : [])] : verdict ? [...verdictHeads, ...(remarkHead ? [remarkHead] : [])] : plainHeads;
  const itemHead = block.title ?? (!pair && !verdict ? block.headers[0] : undefined) ?? "";
  // Tick and answer columns are narrow and centred; a remark or a count takes the rest.
  const narrow = (at: number) => (pair ? at < 2 : verdict ? at < 3 : false);
  const span = 1 + heads.length;
  return (
    <TableCard>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{itemHead}</TableHead>
            {heads.map((head, at) => (
              <TableHead key={`${head}-${at}`} className={narrow(at) ? "w-20" : undefined} {...partAttributes(formSheetColumnStyle, { tick: narrow(at) })}>
                {head}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {block.fields.map((field, index) => {
            const control = field.control;
            const open = access(field).kind === "editable";
            // A sub-group starting here (「차단기」 inside 「특고압설비」) heads its rows with a full-width line.
            const group = block.groups?.find((one) => one.start === index);
            const head = group ? (
              <TableRow key={`group-${index}`}>
                <TableCell colSpan={span}>
                  <Text size="sm" weight="semibold">{group.title}</Text>
                </TableCell>
              </TableRow>
            ) : null;
            const withHead = (row: ReactElement) => (head ? <Fragment key={field.sourceId}>{head}{row}</Fragment> : row);
            if (control?.kind === "checkPair") {
              const value = (sheet.values[field.sourceId] ?? {}) as Record<string, unknown> & { performed?: boolean | null; verified?: boolean | null };
              const tick = (side: "performed" | "verified", head: string) => (
                <TableCell key={side} {...partAttributes(formSheetColumnStyle, { tick: true })}>
                  <Checkbox
                    aria-label={`${field.label} ${head}`}
                    checked={value[side] === true}
                    disabled={!open || control.editable !== side}
                    onCheckedChange={(next) => sheet.onChange(field.sourceId, { ...value, [side]: next === true })}
                  />
                </TableCell>
              );
              const own = control.extra;
              return withHead(
                <TableRow key={field.sourceId} data-record-field={field.sourceId}>
                  <TableCell>
                    <ItemLabel text={field.label} />
                  </TableCell>
                  {tick("performed", tickHeads[0] ?? "")}
                  {tick("verified", tickHeads[1] ?? "")}
                  {extra ? (
                    <TableCell>
                      {own ? (
                        <Input
                          aria-label={`${field.label} ${own.label}`}
                          type={own.numeric ? "number" : "text"}
                          value={String(value[own.key] ?? "")}
                          disabled={!open || control.editable === "none"}
                          onChange={(event) => sheet.onChange(field.sourceId, { ...value, [own.key]: own.numeric ? (event.target.value === "" ? null : Number(event.target.value)) : event.target.value })}
                        />
                      ) : null}
                    </TableCell>
                  ) : null}
                </TableRow>
              );
            }
            if (control?.kind === "verdict") {
              const value = (sheet.values[field.sourceId] ?? { value: null }) as VerdictValue;
              const choices: readonly VerdictChoice[] = ["GOOD", "BAD", "NOT_APPLICABLE"];
              return withHead(
                <TableRow key={field.sourceId} data-record-field={field.sourceId}>
                  <TableCell>
                    {control.named ? (
                      <Input aria-label={field.label} placeholder={control.placeholder ?? field.label} value={value.name ?? ""} disabled={!open} onChange={(event) => sheet.onChange(field.sourceId, { ...value, name: event.target.value })} />
                    ) : (
                      <ItemLabel text={field.label} />
                    )}
                  </TableCell>
                  {/* One answer column per choice, as the source draws them; choosing one clears the others. */}
                  {choices.map((choice, at) => (
                    <TableCell key={choice} {...partAttributes(formSheetColumnStyle, { tick: true })}>
                      <Checkbox
                        aria-label={`${field.label} ${verdictHeads[at]}`}
                        checked={value.value === choice}
                        disabled={!open}
                        onCheckedChange={(next) => sheet.onChange(field.sourceId, { ...value, value: next === true ? choice : null })}
                      />
                    </TableCell>
                  ))}
                  {remarkHead ? (
                    <TableCell>
                      <Input aria-label={`${field.label} ${remarkHead}`} value={value.note ?? ""} disabled={!open} onChange={(event) => sheet.onChange(field.sourceId, { ...value, note: event.target.value })} />
                    </TableCell>
                  ) : null}
                </TableRow>
              );
            }
            if (field.mode === "static") {
              return withHead(
                <TableRow key={field.sourceId}>
                  <TableCell colSpan={span}>
                    <Text size="sm" tone="muted">{field.sourceText || field.label}</Text>
                  </TableCell>
                </TableRow>
              );
            }
            return withHead(
              <TableRow key={field.sourceId}>
                <TableCell>
                  <Text size="sm">{field.label}</Text>
                </TableCell>
                <TableCell colSpan={span - 1}>{cell({ ...field, labelHidden: true })}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableCard>
  );
}

/**
 * A run of signature slots, one row each: who signed and when, the viewer's own slot to sign, or
 * whose signature it waits for. The count signed out of the slots stands above the table.
 */
function SignatureRoster({
  title,
  fields,
  sheet,
  access,
  cell,
}: {
  readonly title?: string;
  readonly fields: readonly FormSheetField[];
  readonly sheet: FormSheetProps;
  readonly access: (field: FormSheetField) => FormSheetCellAccess;
  readonly cell: (field: FormSheetField) => ReactElement;
}) {
  const { t } = useTranslation(`${PACKAGE_NAMESPACE}/features`);
  const signedOf = (field: FormSheetField) => {
    const value = sheet.values[field.sourceId] as SignatureValue | null | undefined;
    return value && !value.dataUrl ? value : null;
  };
  const signed = fields.filter((field) => signedOf(field)).length;
  return (
    <Stack gap="xs">
      <Flex gap="sm" align="center" justify="between">
        {title ? <Text size="sm" tone="muted">{title}</Text> : <span />}
        <Badge variant="outline">{t("formSheet.signedCount", { signed, total: fields.length })}</Badge>
      </Flex>
      <TableCard>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead />
              <TableHead>{t("formSheet.signer")}</TableHead>
              <TableHead>{t("formSheet.signedAt")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {fields.map((field) => {
              const value = signedOf(field);
              const state = access(field);
              return (
                <TableRow key={field.sourceId} data-record-field={field.sourceId}>
                  <TableCell>
                    <Text size="sm">{field.label}</Text>
                  </TableCell>
                  {value ? (
                    <>
                      <TableCell>{signerLabel(value)}</TableCell>
                      <TableCell>{value.at}</TableCell>
                    </>
                  ) : state.kind === "editable" ? (
                    // The viewer's own slot, signed through the sheet's signature dialog.
                    <TableCell colSpan={2}>{cell({ ...field, labelHidden: true })}</TableCell>
                  ) : (
                    <TableCell colSpan={2}>
                      <Text size="sm" tone="muted">
                        {/* The row already names whose signature it is; the cell says only that it waits. */}
                        {state.kind === "notWriter" ? t("formSheet.awaitingSignature") : "\u00a0"}
                      </Text>
                    </TableCell>
                  )}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableCard>
    </Stack>
  );
}

/** Repeated rows of one source table, drawn as that table: the row's name, then a cell per column. */
function RowTable({ title, fields, sheet, access }: { readonly title?: string; readonly fields: readonly FormSheetField[]; readonly sheet: FormSheetProps; readonly access: (field: FormSheetField) => FormSheetCellAccess }) {
  const first = fields[0]?.control;
  const columns = first?.kind === "row" ? first.columns : [];
  return (
    <Stack gap="xs">
      {title ? <Text size="sm" tone="muted">{title}</Text> : null}
      <TableCard>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16" />
              {columns.map((column) => (
                <TableHead key={column.key}>{column.label}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {fields.map((field, at) => {
              const value = (sheet.values[field.sourceId] ?? {}) as Readonly<Record<string, string>>;
              const disabled = access(field).kind !== "editable";
              return (
                <TableRow key={field.sourceId} data-record-field={field.sourceId}>
                  <TableCell>
                    <Text size="caption" tone="muted">{at + 1}</Text>
                  </TableCell>
                  {columns.map((column) => (
                    <TableCell key={column.key}>
                      <RowColumnInput column={column} value={value} disabled={disabled} label={field.label} onChange={(next) => sheet.onChange(field.sourceId, next)} />
                    </TableCell>
                  ))}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableCard>
    </Stack>
  );
}

/** Items a paper form ticks one by one, drawn as chips that are pressed to choose them. */
function TickChips({
  title,
  fields,
  others = [],
  sheet,
  access,
}: {
  readonly title?: string;
  readonly fields: readonly FormSheetField[];
  /** 「Other」 choices drawn as one more chip; pressed, each opens its detail box under the row. */
  readonly others?: readonly FormSheetField[];
  readonly sheet: FormSheetProps;
  readonly access: (field: FormSheetField) => FormSheetCellAccess;
}) {
  const otherValue = (field: FormSheetField) => (sheet.values[field.sourceId] ?? { choice: null }) as ChoiceDetailValue;
  const otherOn = (field: FormSheetField) => otherValue(field).choice !== null && otherValue(field).choice !== undefined;
  return (
    <Stack gap="xs">
      {title ? <Text size="sm" tone="muted">{title}</Text> : null}
      <Flex gap="xs" wrap>
        {fields.map((field) => {
          const on = sheet.values[field.sourceId] === true;
          return (
            <Button
              key={field.sourceId}
              size="sm"
              variant={on ? "default" : "outline"}
              aria-pressed={on}
              data-record-field={field.sourceId}
              disabled={access(field).kind !== "editable"}
              onClick={() => sheet.onChange(field.sourceId, !on)}
            >
              {field.label}
            </Button>
          );
        })}
        {others.map((field) => {
          const on = otherOn(field);
          const control = field.control;
          const chosen = control?.kind === "choiceWithDetail" ? control.otherValue : "OTHER";
          return (
            <Button
              key={field.sourceId}
              size="sm"
              variant={on ? "default" : "outline"}
              aria-pressed={on}
              data-record-field={field.sourceId}
              disabled={access(field).kind !== "editable"}
              onClick={() => sheet.onChange(field.sourceId, on ? { choice: null } : { ...otherValue(field), choice: chosen })}
            >
              {field.label}
            </Button>
          );
        })}
      </Flex>
      {others.filter(otherOn).map((field) => (
        <Input
          key={field.sourceId}
          aria-label={field.label}
          placeholder={field.label}
          value={otherValue(field).detail ?? ""}
          disabled={access(field).kind !== "editable"}
          onChange={(event) => sheet.onChange(field.sourceId, { ...otherValue(field), detail: event.target.value })}
        />
      ))}
    </Stack>
  );
}

function LayoutBlock({ block, cell, sheet, access }: LayoutBlockProps) {
  switch (block.kind) {
    case "note":
      return <Text size="sm" tone="muted">{block.text}</Text>;
    case "static":
      return (
        <Stack gap="xs">
          {block.title ? <Text size="sm" tone="muted">{block.title}</Text> : null}
          <SourceText lines={block.fields.flatMap((field) => (field.sourceText || field.label).split("\n"))} />
        </Stack>
      );
    case "grid": {
      // A table of computed cells that all wait on the same other record says so once.
      const cells = block.rows.flat();
      const notes = new Set(cells.map((field) => (field.mode === "derived" && sheet.values[field.sourceId] === undefined ? field.derivedNote ?? null : "")));
      const waiting = notes.size === 1 ? [...notes][0] : null;
      if (waiting) {
        return (
          <Stack gap="xs">
            {block.title ? <Text size="sm" tone="muted">{block.title}</Text> : null}
            <Text size="sm" tone="muted">
              {block.columns.slice(block.leads ? 1 : 0).join(" · ")}: {waiting}
            </Text>
          </Stack>
        );
      }
      return (
        <Stack gap="xs">
          {block.title ? <Text size="sm" tone="muted">{block.title}</Text> : null}
          <TableCard>
            <Table>
              <TableHeader>
                <TableRow>
                  {block.columns.map((column) => (
                    <TableHead key={column}>{column}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {block.rows.map((row, at) => (
                  <TableRow key={row[0]?.sourceId}>
                    {block.leads ? (
                      <TableCell>
                        <Text size="sm">{block.leads[at]}</Text>
                      </TableCell>
                    ) : null}
                    {row.map((field) => (
                      <TableCell key={field.sourceId}>{cell({ ...field, labelHidden: true })}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableCard>
        </Stack>
      );
    }
    case "checks":
      return <ChecksTable block={block} cell={cell} sheet={sheet} access={access} />;
    case "measurements":
      return (
        <Stack gap="xs">
          {block.title || block.headers?.length ? <Text size="sm" tone="muted">{[block.title, ...(block.headers ?? [])].filter(Boolean).join(" · ")}</Text> : null}
          <Grid columns={3} gap="sm">{block.fields.map(cell)}</Grid>
        </Stack>
      );
    default:
      if (block.fields.length > 2 && block.fields.every((field) => field.control?.kind === "signature")) return <SignatureRoster title={block.title} fields={block.fields} sheet={sheet} access={access} cell={cell} />;
      if (block.fields.length > 0 && block.fields.every((field) => field.control?.kind === "row")) return <RowTable title={block.title} fields={block.fields} sheet={sheet} access={access} />;
      {
        // Ticked items read as chips; the few other cells of the block (an 「기타」 with its detail) follow them.
        const ticks = block.fields.filter((field) => field.control?.kind === "tick");
        if (ticks.length > 1 && ticks.length * 2 > block.fields.length) {
          // An 「other」 choice with its detail joins the chips; anything else follows them.
          const others = block.fields.filter((field) => field.control?.kind === "choiceWithDetail");
          const rest = block.fields.filter((field) => field.control?.kind !== "tick" && field.control?.kind !== "choiceWithDetail");
          return (
            <Stack gap="sm">
              <TickChips title={block.title} fields={ticks} others={others} sheet={sheet} access={access} />
              {rest.length > 0 ? <Grid columns={2} gap="sm">{rest.map(cell)}</Grid> : null}
            </Stack>
          );
        }
      }
      return (
        <Stack gap="xs">
          {block.title ? <Text size="sm" tone="muted">{block.title}</Text> : null}
          <Grid columns={block.columns} gap="sm">
            {block.fields.map((field) => (block.wide.has(field.sourceId) ? <Stack key={field.sourceId} className="col-span-full">{cell(field)}</Stack> : cell(field)))}
          </Grid>
        </Stack>
      );
  }
}

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
function SourceText({ lines }: { readonly lines: readonly string[] }) {
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
function ItemLabel({ text }: { readonly text: string }) {
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
function sameAsHeading(field: FormSheetField, heading: string): boolean {
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

function SheetCell({ field, access, sheet, required, error }: SheetCellProps) {
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
