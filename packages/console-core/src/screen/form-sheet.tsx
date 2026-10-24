import { useState } from "react";
import { useTranslation } from "@simplix-react/i18n/react";
import {
  Badge,
  Button,
  CrudDetail,
  Dialog,
  DialogHeader,
  DialogTitle,
  Flex,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Text,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@simplix-react/ui";
import { partAttributes, slotAttributes } from "@simplix-react/ui/design";

import { FormErrorSummary } from "../entity/form-error-summary";
import { PACKAGE_NAMESPACE as ENTITY_NAMESPACE } from "../entity/locales";
import { RecordFieldView, signerLabel } from "../entity/record-form-fields";
import type { RecordFormField, SignatureValue } from "../entity/record-form-types";
import { BoundedDialogContent } from "../layout/bounded-dialog-content";
import { TableCard } from "../layout/table-card";
import { PACKAGE_NAMESPACE } from "./locales";
import {
  cellAccess,
  derivedText,
  missingForTransition,
  sheetBlocks,
  type FormSheetCellAccess,
  type FormSheetContext,
  type FormSheetDefinition,
  type FormSheetField,
} from "./form-sheet-model";
import { formSheetCellStyle, formSheetHeldStyle, formSheetSourceImageStyle } from "./form-sheet.style";
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
        <Flex gap="xs" align="center" wrap>
          <Badge variant="outline">{t("formSheet.version", { version: submission.version })}</Badge>
          <Badge variant="outline">{submission.status}</Badge>
          <Badge variant="outline">{t("formSheet.templateVersion", { version: submission.templateVersion })}</Badge>
          {(["form", "source"] as const).map((one) => (
            <Button key={one} size="xs" variant={view === one ? "default" : "outline"} onClick={() => setView(one)}>
              {t(one === "form" ? "formSheet.viewForm" : "formSheet.viewSource")}
            </Button>
          ))}
          <Button size="xs" variant="outline" onClick={() => setPrinting(true)}>
            {t("formSheet.print")}
          </Button>
        </Flex>
      }
    >
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

  return (
    <>
      <FormErrorSummary fieldErrors={shownErrors} label={(key) => labels.get(key) ?? key} />
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

  if (access.kind === "static") return <Text size="sm">{field.sourceText || field.label}</Text>;
  if (access.kind === "derived") {
    const shown = derivedText(value);
    return (
      <Stack gap="none">
        <Text size="caption" tone="muted">
          {field.label}
        </Text>
        {shown.kind === "value" ? <Text size="sm">{shown.text}</Text> : <Text size="sm" {...slotAttributes(formSheetHeldStyle, {})}>{t("formSheet.held")}</Text>}
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
  const control: RecordFormField = { ...(field.control ?? { kind: "text" as const, key: "", label: "" }), key: field.sourceId, label: field.label, required, disabled };

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
        <Text size="caption" tone="muted">
          {field.label}
        </Text>
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
      <Text size="caption" tone="muted">
        {field.label}
      </Text>
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
