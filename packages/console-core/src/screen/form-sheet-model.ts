import { validateField, type FieldErrorCode } from "../entity/record-form-rules";
import type { RecordFormField } from "../entity/record-form-types";
import type { PaperSize } from "./print-preview";

/** Whether a cell is source text, a value the viewer may enter, or a value computed elsewhere. */
export type FormSheetCellMode = "static" | "input" | "derived";

/** Where a cell sits in a table the source form draws, with the merges the source makes. */
export interface FormSheetCellPlace {
  /** Which table of the form the cell belongs to; cells sharing it are drawn as one table. */
  readonly table: string;
  /** 1-based row and column of the cell's top-left corner. */
  readonly row: number;
  readonly column: number;
  readonly rowSpan?: number;
  readonly columnSpan?: number;
}

/** One cell of a source form, normalised from the form's specification. */
export interface FormSheetField {
  /** The identifier the source form gives the cell; also the key of its value. */
  readonly sourceId: string;
  /** Position in the source form; cells are drawn in this order. */
  readonly order: number;
  /** The source's own label. */
  readonly label: string;
  /** The source's wording for a static cell, when it differs from the label. */
  readonly sourceText?: string;
  readonly mode: FormSheetCellMode;
  /**
   * The lifecycle transition at which the cell becomes required. The cell takes input until that
   * transition has happened and is locked afterwards; null for a cell no transition requires.
   */
  readonly stage: string | null;
  /** The roles that write the cell; empty for static and derived cells. */
  readonly writerRoles: readonly string[];
  /** The field kind an input cell is entered with. Its key, label and disabled state are the sheet's. */
  readonly control?: RecordFormField;
  /** The cell's place in a source table, where the source draws it inside one. */
  readonly cell?: FormSheetCellPlace;
  /** The 1-based source page the cell is printed on. */
  readonly page?: number;
}

/** A source form, normalised: its cells and the lifecycle its stages are read against. */
export interface FormSheetDefinition {
  readonly title: string;
  /** The paper the source form is printed on. */
  readonly paper: PaperSize;
  /**
   * The lifecycle's transitions in the order they happen. A stage missing from this list (an
   * event that can recur) never counts as passed.
   */
  readonly stages: readonly string[];
  readonly fields: readonly FormSheetField[];
}

/** What the viewer can do with one cell. */
export type FormSheetCellAccess =
  | { readonly kind: "static" }
  | { readonly kind: "derived" }
  | { readonly kind: "editable" }
  /** The cell's stage has passed, or the whole submission is read-only. */
  | { readonly kind: "locked"; readonly because: "stagePassed" | "readOnly" }
  /** The viewer holds none of the roles that write it. */
  | { readonly kind: "notWriter"; readonly roles: readonly string[] };

/** The context a cell's access is judged in. */
export interface FormSheetContext {
  /** The last transition that has happened. */
  readonly stage: string;
  readonly stages: readonly string[];
  readonly viewerRoles: readonly string[];
  readonly readOnly?: boolean;
}

/**
 * Whether the transition a cell becomes required at has already happened.
 *
 * @param cellStage - The cell's stage, or null.
 * @param current - The last transition that has happened.
 * @param stages - The lifecycle's transitions in order.
 * @returns True when the cell's stage is at or before the current one in the lifecycle.
 */
export function hasStagePassed(cellStage: string | null, current: string, stages: readonly string[]): boolean {
  if (cellStage === null) return false;
  const at = stages.indexOf(cellStage);
  if (at < 0) return false;
  return at <= stages.indexOf(current);
}

/**
 * What the viewer can do with a cell: static and derived cells are drawn read-only, an input cell
 * is editable for its writers until its stage passes.
 *
 * @param field - The cell.
 * @param context - The current stage, the lifecycle, the viewer's roles and the read-only flag.
 * @returns The cell's access.
 */
export function cellAccess(field: FormSheetField, context: FormSheetContext): FormSheetCellAccess {
  if (field.mode === "static") return { kind: "static" };
  if (field.mode === "derived") return { kind: "derived" };
  if (context.readOnly) return { kind: "locked", because: "readOnly" };
  if (hasStagePassed(field.stage, context.stage, context.stages)) return { kind: "locked", because: "stagePassed" };
  if (!field.writerRoles.some((role) => context.viewerRoles.includes(role))) return { kind: "notWriter", roles: field.writerRoles };
  return { kind: "editable" };
}

/**
 * The sourceIds of the cells the viewer can enter now.
 *
 * @param fields - The form's cells.
 * @param context - See {@link cellAccess}.
 * @returns The editable cells' sourceIds, in drawing order.
 */
export function editableCells(fields: readonly FormSheetField[], context: FormSheetContext): readonly string[] {
  return sortByOrder(fields).filter((field) => cellAccess(field, context).kind === "editable").map((field) => field.sourceId);
}

function isBlank(value: unknown): boolean {
  return value === null || value === undefined || (typeof value === "string" && value.trim() === "") || (Array.isArray(value) && value.length === 0);
}

/**
 * The input cells a transition requires that do not hold an acceptable value. Only cells whose stage
 * equals the transition are checked: a cell required later is not an error while it is empty.
 *
 * @param fields - The form's cells.
 * @param values - The submission's values, keyed by sourceId.
 * @param transition - The transition the command performs.
 * @returns Why each refused cell refuses its value, keyed by sourceId, in drawing order.
 */
export function missingForTransition(
  fields: readonly FormSheetField[],
  values: Readonly<Record<string, unknown>>,
  transition: string,
): Readonly<Record<string, FieldErrorCode>> {
  const errors: Record<string, FieldErrorCode> = {};
  for (const field of sortByOrder(fields)) {
    if (field.mode !== "input" || field.stage !== transition) continue;
    const value = values[field.sourceId];
    const code = field.control ? validateField({ ...field.control, key: field.sourceId, required: true }, value) : isBlank(value) ? "required" : null;
    if (code) errors[field.sourceId] = code;
  }
  return errors;
}

/** A derived cell's value: computed, or held while what it is computed from is unresolved. */
export type DerivedText = { readonly kind: "value"; readonly text: string } | { readonly kind: "held" };

/**
 * How a derived cell's value is drawn. A missing value is held, never drawn as 0 or as empty.
 *
 * @param value - The computed value.
 * @returns The text to draw, or held.
 */
export function derivedText(value: unknown): DerivedText {
  if (value === null || value === undefined || (typeof value === "number" && Number.isNaN(value))) return { kind: "held" };
  if (Array.isArray(value)) {
    const parts = value.filter((part) => part !== null && part !== undefined).map(String);
    return parts.length === 0 ? { kind: "held" } : { kind: "value", text: parts.join(", ") };
  }
  if (typeof value === "object") return { kind: "held" };
  return { kind: "value", text: String(value) };
}

/** One row of a source table, its cells left to right. */
export interface FormSheetTableRow {
  readonly row: number;
  readonly cells: readonly FormSheetField[];
}

/** A run of cells drawn one under another, or a source table drawn with its merges. */
export type FormSheetBlock =
  | { readonly kind: "flow"; readonly fields: readonly FormSheetField[] }
  | { readonly kind: "table"; readonly table: string; readonly rows: readonly FormSheetTableRow[] };

function sortByOrder(fields: readonly FormSheetField[]): FormSheetField[] {
  return [...fields].sort((a, b) => a.order - b.order);
}

/**
 * Splits a form into the blocks it is drawn in, in source order. A table stands where its first
 * cell stands; cells between two cells of one table that sit outside it follow the table.
 *
 * @param fields - The form's cells.
 * @returns The blocks in drawing order.
 */
export function sheetBlocks(fields: readonly FormSheetField[]): readonly FormSheetBlock[] {
  const blocks: FormSheetBlock[] = [];
  const tables = new Map<string, FormSheetField[]>();
  for (const field of sortByOrder(fields)) {
    if (field.cell) {
      const cells = tables.get(field.cell.table);
      if (cells) {
        cells.push(field);
        continue;
      }
      tables.set(field.cell.table, [field]);
      blocks.push({ kind: "table", table: field.cell.table, rows: [] });
      continue;
    }
    const last = blocks[blocks.length - 1];
    if (last?.kind === "flow") (last.fields as FormSheetField[]).push(field);
    else blocks.push({ kind: "flow", fields: [field] });
  }
  return blocks.map((block) => {
    if (block.kind === "flow") return block;
    const byRow = new Map<number, FormSheetField[]>();
    for (const field of tables.get(block.table) ?? []) {
      const row = field.cell?.row ?? 0;
      byRow.set(row, [...(byRow.get(row) ?? []), field]);
    }
    const rows = [...byRow.entries()]
      .sort(([a], [b]) => a - b)
      .map(([row, cells]) => ({ row, cells: cells.sort((a, b) => (a.cell?.column ?? 0) - (b.cell?.column ?? 0)) }));
    return { ...block, rows };
  });
}
