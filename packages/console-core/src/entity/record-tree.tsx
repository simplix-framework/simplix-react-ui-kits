import { useMemo, type ReactNode } from "react";
import { ChipFilter, CrudTree, useFilterBarState, type RowActionDef } from "@simplix-react/ui";

import type { RecordAction, RecordColumn } from "./record-list";
import { RecordValueView } from "./record-value";

/**
 * The tree's features. Every one is on; a screen turns one off by naming it, so no tree goes
 * without search, the chip row, the expand control or its row actions by accident.
 */
export interface RecordTreeFeatures {
  readonly search?: boolean;
  readonly chips?: boolean;
  readonly expand?: boolean;
  readonly rowActions?: boolean;
  readonly count?: boolean;
}

/** Props for {@link RecordTree}. */
export interface RecordTreeProps<Row> {
  /** The roots; each row carries its children under `childrenField`. */
  readonly rows: readonly Row[];
  readonly columns: readonly RecordColumn<Row>[];
  readonly idField: keyof Row & string;
  readonly childrenField: keyof Row & string;
  readonly activeRowId?: string | null;
  readonly onRowClick?: (row: Row) => void;
  /** The fields the search box looks in. */
  readonly searchFields?: readonly (keyof Row & string)[];
  readonly searchPlaceholder?: string;
  /** A chip row; a node stays when it or anything beneath it matches a lit chip. */
  readonly chips?: {
    readonly options: readonly { readonly value: string; readonly label: string; readonly match: (row: Row) => boolean }[];
  };
  readonly actions?: readonly RecordAction<Row>[];
  /** The count beside the toolbar, as a sentence (a tree counts more than its rows). */
  readonly count?: string;
  /** How deep the tree opens. */
  readonly initialExpandedDepth?: number;
  readonly features?: RecordTreeFeatures;
  readonly leading?: ReactNode;
}

const CHIP_FIELD = "recordTree.chip";

function pruned<Row>(rows: readonly Row[], childrenField: keyof Row & string, keep: (row: Row) => boolean): Row[] {
  const out: Row[] = [];
  for (const row of rows) {
    const children = pruned(((row as Record<string, unknown>)[childrenField] as Row[] | undefined) ?? [], childrenField, keep);
    if (keep(row) || children.length > 0) out.push({ ...row, [childrenField]: children });
  }
  return out;
}

/**
 * A tree of records: the organization tree a console draws, with search, a chip row, the
 * expand control, the count and row actions.
 */
export function RecordTree<Row>({
  rows,
  columns,
  idField,
  childrenField,
  activeRowId,
  onRowClick,
  searchFields,
  searchPlaceholder,
  chips,
  actions = [],
  count,
  initialExpandedDepth = 2,
  features = {},
  leading,
}: RecordTreeProps<Row>) {
  const on = (feature: keyof RecordTreeFeatures) => features[feature] !== false;
  const chipState = useFilterBarState();
  const lit = (chipState.committedValues[CHIP_FIELD] as string[] | undefined) ?? [];
  const shown = useMemo(() => {
    if (!on("chips") || !chips || lit.length === 0) return [...rows];
    const matchers = chips.options.filter((option) => lit.includes(option.value)).map((option) => option.match);
    return pruned(rows, childrenField, (row) => matchers.some((match) => match(row)));
    // `on` reads the features prop, which the dependency list carries.
  }, [rows, chips, lit.join("|"), childrenField, features.chips]);

  const rowActions: RowActionDef<Row>[] = on("rowActions")
    ? actions.map((action) => ({
        type: action.type,
        label: action.label,
        onClick: (row: Row) => action.onClick?.(row),
        disabled: action.disabled ? (row: Row) => Boolean(action.disabled?.(row)) : undefined,
        disabledReason: action.disabled ? (row: Row) => action.disabled?.(row) || undefined : undefined,
      }))
    : [];

  const chipRow =
    on("chips") && chips ? (
      <ChipFilter
        field={CHIP_FIELD}
        state={chipState}
        options={chips.options.map(({ value, label }) => ({ value, label }))}
      />
    ) : null;

  return (
    <CrudTree>
      <CrudTree.Toolbar
        count={on("count") ? count : undefined}
        leading={
          leading || chipRow ? (
            <>
              {leading}
              {chipRow}
            </>
          ) : undefined
        }
      >
        {on("search") ? <CrudTree.Search placeholder={searchPlaceholder} /> : null}
        {on("expand") ? <CrudTree.ExpandToggle /> : null}
      </CrudTree.Toolbar>
      <CrudTree.TableCard fill>
        <CrudTree.Table<Row>
          data={shown}
          tree={{ idField, childrenField, initialExpandedDepth }}
          searchFields={searchFields ? [...searchFields] : undefined}
          density="compact"
          activeRowId={activeRowId ?? null}
          onRowClick={onRowClick}
          actions={rowActions.length > 0 ? rowActions : undefined}
        >
          {columns.map((column) => (
            <CrudTree.Column<Row> key={column.key} field={column.field} header={column.header} width={column.width} minWidth={column.width}>
              {column.value ? ({ row }) => <RecordValueView value={column.value?.(row)} /> : undefined}
            </CrudTree.Column>
          ))}
        </CrudTree.Table>
      </CrudTree.TableCard>
    </CrudTree>
  );
}
