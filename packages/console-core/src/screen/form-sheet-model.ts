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
  /**
   * For a derived cell, where its value comes from while it has none (「가스 측정에서 입력합니다」);
   * a computed cell without it reads as computed automatically.
   */
  readonly derivedNote?: string;
  /** The label is for assistive technology only; the heading right above already says it. */
  readonly labelHidden?: boolean;
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
  /**
   * How the form is laid out for entry on screen: sections in the source's order, each grouping
   * the cells the source groups. Without it the cells are drawn in source order.
   */
  readonly layout?: FormSheetLayout;
}

/** A block of a web entry layout; `fields` name cells by sourceId. */
export type FormSheetLayoutBlock =
  /** Inputs in a grid of 1 to 3 columns; `wide` cells take the whole row. */
  | { readonly kind: "fields"; readonly title?: string; readonly columns?: 1 | 2 | 3; readonly fields: readonly string[]; readonly wide?: readonly string[] }
  /** Items answered by the same columns, under the source's column names. */
  | {
      readonly kind: "checks";
      readonly title?: string;
      readonly headers?: readonly string[];
      readonly fields: readonly string[];
      /** Sub-groups of one table: each group's name and the index of its first row. */
      readonly groups?: readonly { readonly title: string; readonly start: number }[];
    }
  | { readonly kind: "measurements"; readonly title?: string; readonly headers?: readonly string[]; readonly fields: readonly string[] }
  /** Source text the viewer reads and does not enter. */
  | { readonly kind: "static"; readonly title?: string; readonly fields: readonly string[] }
  /** An instruction the source prints that no cell carries. */
  | { readonly kind: "note"; readonly text: string }
  /** The same cells repeated per person or per line, drawn as a table: a row per entry, a column per cell. */
  | {
      readonly kind: "grid";
      readonly title?: string;
      readonly columns: readonly string[];
      readonly rows: readonly (readonly string[])[];
      /** Each row's name in the first column (「작성자」, 「확인자」), when the first column names rows. */
      readonly leads?: readonly string[];
    };

/** One section of a web entry layout. */
export interface FormSheetLayoutSection {
  readonly title: string;
  readonly blocks: readonly FormSheetLayoutBlock[];
}

/** A source form laid out for entry on screen. */
export interface FormSheetLayout {
  readonly sections: readonly FormSheetLayoutSection[];
}

/** A layout block with its cells resolved. */
export type ResolvedLayoutBlock =
  | { readonly kind: "fields"; readonly title?: string; readonly columns: 1 | 2 | 3; readonly fields: readonly FormSheetField[]; readonly wide: ReadonlySet<string> }
  | { readonly kind: "checks"; readonly title?: string; readonly headers: readonly string[]; readonly fields: readonly FormSheetField[]; readonly groups?: readonly { readonly title: string; readonly start: number }[] }
  | { readonly kind: "measurements"; readonly title?: string; readonly headers?: readonly string[]; readonly fields: readonly FormSheetField[] }
  | { readonly kind: "static"; readonly title?: string; readonly fields: readonly FormSheetField[] }
  | { readonly kind: "note"; readonly text: string }
  | { readonly kind: "grid"; readonly title?: string; readonly columns: readonly string[]; readonly rows: readonly (readonly FormSheetField[])[]; readonly leads?: readonly string[] };

/** A layout section with its blocks resolved. */
export interface ResolvedLayoutSection {
  readonly title: string;
  readonly blocks: readonly ResolvedLayoutBlock[];
}

/** What is wrong with a layout against its form's cells. */
export interface LayoutProblems {
  /** sourceIds the layout names that the form does not have. */
  readonly unknown: readonly string[];
  /** sourceIds the layout names more than once. */
  readonly repeated: readonly string[];
  /** Input and derived cells the layout leaves out. */
  readonly missing: readonly string[];
}

function layoutIds(layout: FormSheetLayout): string[] {
  return layout.sections.flatMap((section) => section.blocks.flatMap((block) => (block.kind === "note" ? [] : block.kind === "grid" ? block.rows.flat() : block.fields)));
}

/**
 * Checks a layout against its form: every input and derived cell placed exactly once, no unknown id.
 *
 * @param form - The form, with its layout.
 * @returns The problems found; all empty for a sound layout or a form without one.
 */
export function layoutProblems(form: FormSheetDefinition): LayoutProblems {
  if (!form.layout) return { unknown: [], repeated: [], missing: [] };
  const ids = layoutIds(form.layout);
  const known = new Set(form.fields.map((field) => field.sourceId));
  const placed = new Set(ids);
  return {
    unknown: ids.filter((id) => !known.has(id)),
    repeated: [...new Set(ids.filter((id, at) => ids.indexOf(id) !== at))],
    missing: sortByOrder(form.fields).filter((field) => field.mode !== "static" && !placed.has(field.sourceId)).map((field) => field.sourceId),
  };
}

/**
 * The form's layout with its cells resolved. A cell the layout leaves out is never lost: input and
 * derived cells it misses are drawn in a last section titled `rest`.
 *
 * @param form - The form, with its layout.
 * @param rest - The title of the section holding cells the layout leaves out.
 * @returns The sections to draw, or null for a form without a layout.
 */
export function layoutSections(form: FormSheetDefinition, rest: string): readonly ResolvedLayoutSection[] | null {
  if (!form.layout) return null;
  const byId = new Map(form.fields.map((field) => [field.sourceId, field]));
  const pick = (ids: readonly string[]) => ids.flatMap((id) => byId.get(id) ?? []);
  const sections: ResolvedLayoutSection[] = form.layout.sections.map((section) => ({
    title: section.title,
    blocks: section.blocks.map((block): ResolvedLayoutBlock => {
      switch (block.kind) {
        case "fields":
          return { kind: "fields", title: block.title, columns: block.columns ?? 2, fields: pick(block.fields), wide: new Set(block.wide ?? []) };
        case "checks":
          return { kind: "checks", title: block.title, headers: block.headers ?? [], fields: pick(block.fields), groups: block.groups };
        case "note":
          return block;
        case "grid":
          return { kind: "grid", title: block.title, columns: block.columns, rows: block.rows.map((row) => pick(row)), leads: block.leads };
        case "measurements":
          return { kind: "measurements", title: block.title, headers: block.headers, fields: pick(block.fields) };
        default:
          return { kind: block.kind, title: block.title, fields: pick(block.fields) };
      }
    }),
  }));
  const missing = layoutProblems(form).missing.flatMap((id) => byId.get(id) ?? []);
  if (missing.length > 0) sections.push({ title: rest, blocks: [{ kind: "fields", columns: 2, fields: missing, wide: new Set() }] });
  return sections;
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
