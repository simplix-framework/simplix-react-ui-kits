import { HistoryIcon } from "lucide-react";
import { useEntityTranslation, useTranslation } from "@simplix-react/i18n/react";
import {
  CrudList,
  EmptyValue,
  Icon,
  InstantText,
  SearchOperator,
  Text,
  type FilterDef,
  type UseCrudListResult,
} from "@simplix-react/ui";
import { resolveBootEnum } from "@simplix-react-ext/simplix-boot-utils";

import { useAppTimeZone } from "../datetime";
import { PACKAGE_NAMESPACE } from "./locales";
import { EllipsisText } from "../layout/ellipsis-text";
import { PanelList } from "../layout/panel-list";

/**
 * The five things every audit row is read for, as a shape rather than a domain type.
 *
 * <p>This package knows no domain, and an audit event is the one record several of them file
 * against. Declared structurally, the generated DTO satisfies it without console-ui depending on
 * the package that generates it.
 */
export interface AuditEventRow {
  readonly auditEventId?: string;
  readonly occurredAt?: string;
  readonly actorUsername?: string;
  readonly action?: unknown;
  readonly entityType?: string;
  readonly entityLabel?: string;
  readonly ipAddress?: string;
}

/** Props for {@link AuditEventList}. */
export interface AuditEventListProps<T extends AuditEventRow> {
  /** The list controller — `useCrudList` over the audit-event hook, narrowed by `adaptForcedList`. */
  readonly list: UseCrudListResult<T>;
  /** The key the reader's column widths are remembered under. Unique per tab that draws one. */
  readonly resizableColumns: string;
  /** What the tab says when this narrowing genuinely holds nothing. */
  readonly emptyTitle: string;
  /** The line under it, where the tab has something to add. */
  readonly emptyDescription?: string;
  /** Whether the record each row touched is worth a column — false where every row is one record. */
  readonly showTarget?: boolean;
}

/**
 * A slice of the audit log inside a detail panel's tab.
 *
 * <p><b>Every tab that shows audit events shows the same five things</b> — when, who, what action,
 * which record, from where — and each one that built its own answer arrived at a different subset:
 * a grant's 열람 이력 drew two counts and no rows at all, its 변경 tab drew stacked lines with no
 * paging, and a role's history drew a table of its own. Three tabs, three shapes, one kind of
 * record.
 *
 * <p><b>It is a list because the log grows</b> (frontend invariant #71): an investigator asking
 * what a grant's holder opened is asking about all of it, so the tab pages, sorts and searches
 * like the register it is a slice of. What narrows it to this record is a forced request
 * parameter on the caller's side — never a filter, which narrows nothing until the reader commits
 * one.
 *
 * @param props the list, its column-width key, and what it says when empty
 * @returns the tab's audit list
 */
export function AuditEventList<T extends AuditEventRow>({
  list,
  resizableColumns,
  emptyTitle,
  emptyDescription,
  showTarget = true,
}: AuditEventListProps<T>) {
  const { t } = useTranslation(PACKAGE_NAMESPACE + "/features");
  const { enumLabel } = useEntityTranslation("auditEvent");
  const appZone = useAppTimeZone();

  const filters: FilterDef[] = [
    {
      type: "text",
      field: "actorUsername",
      label: t("audit.column.actor"),
      operators: [SearchOperator.CONTAINS],
      defaultOperator: SearchOperator.CONTAINS,
    },
    {
      type: "text",
      field: "ipAddress",
      label: t("audit.column.address"),
      operators: [SearchOperator.CONTAINS],
      defaultOperator: SearchOperator.CONTAINS,
    },
    { type: "dateRange", field: "occurredAt", label: t("audit.column.at") },
  ];
  if (showTarget) {
    filters.splice(2, 0, {
      type: "text",
      field: "entityLabel",
      label: t("audit.column.target"),
      operators: [SearchOperator.CONTAINS],
      defaultOperator: SearchOperator.CONTAINS,
    });
  }

  return (
    <PanelList<T>
      list={list}
      resizableColumns={resizableColumns}
      filters={filters}
      emptyState={{
        icon: <HistoryIcon />,
        title: emptyTitle,
        description: emptyDescription,
      }}
    >
      <CrudList.Column<T>
        field="occurredAt"
        header={t("audit.column.at")}
        width={176}
        sortable
      >
        {({ row }) => <InstantText value={row.occurredAt} displayZone={appZone} format="datetime" />}
      </CrudList.Column>

      <CrudList.Column<T>
        field="actorUsername"
        header={t("audit.column.actor")}
        width={140}
        sortable
      >
        {({ row }) => <EllipsisText>{row.actorUsername || <EmptyValue />}</EllipsisText>}
      </CrudList.Column>

      <CrudList.Column<T> field="action" header={t("audit.column.action")} width={128} sortable>
        {({ row }) => {
          // A boot enum arrives as an object, so the constant is resolved out of it before it
          // can name a catalogue entry.
          const action = resolveBootEnum(row.action);
          return <Text size="sm">{action ? enumLabel("AuditAction", action as string) : <EmptyValue />}</Text>;
        }}
      </CrudList.Column>

      {showTarget && (
        <CrudList.Column<T> field="entityLabel" header={t("audit.column.target")} sortable>
          {({ row }) => <EllipsisText>{row.entityLabel || row.entityType || <EmptyValue />}</EllipsisText>}
        </CrudList.Column>
      )}

      <CrudList.Column<T>
        field="ipAddress"
        header={t("audit.column.address")}
        width={128}
        sortable
      >
        {({ row }) => (
          <Text size="sm" tone="muted" font="mono">
            {row.ipAddress || <EmptyValue />}
          </Text>
        )}
      </CrudList.Column>
    </PanelList>
  );
}
