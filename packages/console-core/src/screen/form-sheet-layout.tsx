import { Fragment, type ReactElement } from "react";
import {
  Badge,
  Button,
  Checkbox,
  Flex,
  Grid,
  Input,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Text,
} from "@simplix-react/ui";
import { partAttributes } from "@simplix-react/ui/design";
import { useTranslation } from "@simplix-react/i18n/react";

import type { ChoiceDetailValue, SignatureValue, VerdictChoice, VerdictValue } from "../entity/record-form-types";
import type { FormSheetCellAccess, FormSheetField, ResolvedLayoutBlock } from "./form-sheet-model";
import type { FormSheetProps } from "./form-sheet";
import { ItemLabel, SourceText } from "./form-sheet-cells";
import { PACKAGE_NAMESPACE } from "./locales";
import { RowColumnInput, signerLabel } from "../entity/record-form-fields";
import { TableCard } from "../layout/table-card";
import { formSheetColumnStyle } from "./form-sheet.style";

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

export function LayoutBlock({ block, cell, sheet, access }: LayoutBlockProps) {
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
