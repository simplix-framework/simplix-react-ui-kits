import { AlertTriangleIcon, HistoryIcon, LockIcon } from "lucide-react";
import { useCan } from "@simplix-react/access/react";
import { useEntityTranslation, useLocale, useTranslation } from "@simplix-react/i18n/react";
import {
  CrudList,
  EmptyState,
  EmptyValue,
  Flex,
  Icon,
  InstantText,
  SearchOperator,
  Stack,
  Text,
  useCrudList,
  useInvalidateEntity,
} from "@simplix-react/ui";
import { adaptOrvalList } from "@simplix-react/ui";
import type { OrvalListHookLike } from "@simplix-react/ui";

import { EnumBadge } from "../badge";
import { useChangeHistorySource, useOptionalChangeHistorySource, type ChangeHistoryEvent } from "./change-history-source";
import { createContext, useContext } from "react";
import { EllipsisText, PanelList, StrongText, useWideList, WIDE_LIST_WIDTH } from "../layout";
import { useAppTimeZone, zoneDateTimeText } from "../datetime";

import { useConsoleSubject } from "./console-product";

/** How many events one page of a history tab carries. */
const PAGE_SIZE = 20;

/** How a caller narrows the history below the entity type. */
export interface ChangeHistoryScope {
  /**
   * One record's history rather than the whole type's.
   *
   * <p>An installation-wide setting has exactly one record, so the type alone is the record. A
   * workplace does not: B-02's 이력 tab is about the workplace on screen, and the type alone would
   * answer with every workplace's changes under a heading that says otherwise.
   */
  readonly entityId?: string;
  /**
   * The kinds of change this tab is about, rather than every event the type records.
   *
   * <p>N-03's 변경 이력 tab is about what a role may do, and `UserRole` also records renames. An
   * account's is about what was done TO the account — a profile edit, a rank change, a suspension
   * — while the same entity type carries every sign-in that account ever made, so a tab that did
   * not narrow would bury three edits under eighty-eight sign-ins.
   *
   * <p>Several rather than one, because a record's life is rarely one action: creation, update,
   * deactivation and role change are all 「이 계정을 고친 것」.
   */
  readonly actions?: readonly string[];
}

/**
 * What a record's change history reads as, for the screen that owns the record.
 *
 * <p><b>One read serves the tab badge and the tab body.</b> The count on the tab and the rows
 * under it are the same question asked once; two reads would let the badge say four while the
 * table shows three for as long as the second is in flight.
 *
 * <p><b>The audit permission is checked here, not by the caller.</b> The endpoint is the audit
 * log's, guarded by 증빙·보존, and a caller passing its own screen's permission instead sends a
 * request the server refuses — the reader then meets a bare 「권한이 부족합니다」 dialog over a
 * record that opened perfectly well, with nothing on the page to say what was refused or why. A
 * 보건관리자 opening B-02 was exactly that: `SAFETY_SITE` list is enough for the workplace and not
 * for its history. Putting the condition beside the request makes forgetting it impossible rather
 * than unlikely.
 *
 * <p><b>One tab of one record is still the audit log.</b> This panel reads the same surface J-08
 * reads, narrowed to one entity, so it gates on the same group — which is what lets a role that
 * may read the log read a record's history without holding the installation's own machinery.
 *
 * @param entityType the audited entity's simple name, as the recorder writes it
 * @param enabled whether the screen wants the history at all — combined with, never instead of,
 *        the audit permission this hook checks for itself
 * @param scope which record to narrow to, when the type holds more than one
 * @returns the events newest first, how many there are in total, and whether the read has answered
 */
/**
 * Where the audit log answers when the mounted reader names no address of its own, so a save can
 * tell every history over it to read again.
 */
const DEFAULT_AUDIT_ADDRESS = "/api/v1/admin/audit-log";

/** The prefix a save invalidates: the mounted reader's own address, else the default. */
function useAuditAddress(): string {
  return useOptionalChangeHistorySource()?.address ?? DEFAULT_AUDIT_ADDRESS;
}

/**
 * Tells every change history to read itself again.
 *
 * <p><b>For the save, which is rarely where the history is held.</b> A screen reads its history in
 * the page and writes the record in a widget, so the save has no history to call `refresh` on —
 * and without this it refetches the record, leaves the log as it was, and the operator who just
 * changed a value opens the tab and does not find what they did. Reported that way on 인증 연계.
 *
 * <p>By the audit log's own address, so one call reaches every history over every entity. A save
 * writes one row and nothing else moved; refetching a handful of tabs nobody has open costs a
 * request each and is what makes the tab the reader DOES have open correct.
 *
 * @returns a function to call once the save has answered
 */
export function useRefreshChangeHistory(): () => Promise<void> {
  return useInvalidateEntity(useAuditAddress());
}

export function useChangeHistory(
  entityType: string,
  enabled: boolean,
  scope: ChangeHistoryScope = {},
) {
  const mayReadAudit = useCan("list", useConsoleSubject("auditLog"));
  // By the audit log's own address rather than by this tab's parameters: a save writes a row that
  // every history over that entity may want, and naming the prefix takes them all.
  const invalidateAudit = useInvalidateEntity(useAuditAddress());
  const asked = enabled && mayReadAudit;
  const read = useChangeHistorySource();
  // A caller that narrows to a record has nothing to ask until it knows which record.
  const ready = asked && (scope.entityId === undefined || scope.entityId.length > 0);

  // The reader, wrapped as the shape `adaptOrvalList` takes — so the translation from the list's
  // own state (a one-based page, a `{ field, direction }` sort, a filter map) into the server's
  // grammar is the framework's one implementation rather than a second copy here. Written by hand
  // the first attempt read the list's params as though they were already the server's, and every
  // read came back a failure the screen drew as 「불러오지 못했습니다」.
  const orvalLike: OrvalListHookLike = (params, options) => {
    const { page, size, sort, ...filters } = (params ?? {}) as Record<string, unknown>;
    const answer = read(
      {
        entityType,
        entityId: scope.entityId,
        actions: scope.actions,
        page: typeof page === "number" ? page : 0,
        size: typeof size === "number" ? size : PAGE_SIZE,
        sort: Array.isArray(sort) ? (sort as string[]) : undefined,
        filters,
      },
      ready && options?.query?.enabled !== false,
    );
    return {
      data: {
        content: answer.events,
        totalElements: answer.totalElements,
        totalPages: answer.totalPages,
      },
      isLoading: answer.isLoading,
      error: answer.isError ? new Error("change-history read failed") : null,
    };
  };

  const listHook = adaptOrvalList<ChangeHistoryEvent>(orvalLike);

  const list = useCrudList<ChangeHistoryEvent>(listHook, {
    stateMode: "server",
    defaultPageSize: PAGE_SIZE,
    defaultSort: { field: "occurredAt", direction: "desc" },
    filterMode: "deferred",
  });

  const answered = {
    events: list.data,
    totalPages: list.pagination.totalPages,
    totalElements: list.pagination.total,
    isLoading: list.isLoading,
    isError: list.error !== null,
  };

  return {
    events: answered.events,
    /**
     * Reads the history again, for a caller that has just written something into it.
     *
     * <p><b>A save on the screen puts a row in this tab and nothing tells the tab.</b> The two
     * are different queries — one over the record, one over the audit log — so a save that
     * refetches the record leaves the history exactly as it was, and the operator who just
     * changed a value opens the tab, does not find it, and concludes the log does not work. It
     * was reported that way.
     *
     * <p>Called after the save rather than on an interval: the moment a row appears is known
     * exactly, and polling an audit log to notice one's own write is the shape that costs a
     * request a second for a page nobody is looking at.
     */
    refresh: invalidateAudit,
    /**
     * Whether this account may read the audit log at all.
     *
     * <p>Read by a caller that decides whether to draw the tab: a tab that is there and refuses
     * is worse than one that is not, because the reader presses it, meets a refusal, and cannot
     * tell whether the record has no history or they may not see it. The hook checks the same
     * permission the request needs, so the caller cannot check a different one.
     */
    readable: mayReadAudit,
    /** Which entity's history this is, so the table can read that entity's field labels. */
    entityType,
    /** The list controller the table draws from — its filters, its sort, its pager. */
    list,
    /**
     * Absent rather than zero while the read has not answered, and absent again when it failed —
     * a tab reading 「변경 이력 0」 over a failed read tells the operator this setting has never
     * been changed, which is a claim nobody made.
     */
    total: asked && !answered.isError ? answered.totalElements : undefined,
    isLoading: answered.isLoading,
    /**
     * Whether the read failed.
     *
     * <p>Kept apart from an empty result: both hand back no rows, and drawn the same way the
     * failure reads as 「이 설정을 바꾼 적이 없다」 — the one conclusion an audit trail must never
     * invite when it is simply unreachable.
     */
    isError: answered.isError,
  };
}

/** What a value reads as when the row has none — never blank, so a gap is a gap and not a bug. */
const NOTHING = "—";

/**
 * The catalogue name of an audited entity.
 *
 * <p>The recorder writes the entity's Java simple name (`IdentityProviderConfig`) and the
 * catalogues are keyed by the same name lower-camel (`identityProviderConfig`) — one character
 * apart, and getting it wrong resolves nothing while looking like a missing translation.
 */
function entityKeyOf(entityType: string): string {
  return entityType ? entityType.charAt(0).toLowerCase() + entityType.slice(1) : entityType;
}

interface ChangeHistoryTableProps {
  /** What {@link useChangeHistory} answered. */
  readonly history: ReturnType<typeof useChangeHistory>;
  /**
   * Whether the reader may not read the audit log at all.
   *
   * <p>The refusal's wording lives here rather than at each call site: every screen with a history
   * tab draws this table, and a copy of the sentence at each is a place for it to drift.
   */
  readonly denied?: boolean;
  /**
   * What the empty state says when nothing has changed.
   *
   * <p>Defaults to a sentence about a record rather than about a setting: the settings screens were
   * the first callers and 「이 설정을 바꾼 기록이 아직 없습니다」 is false on a permission matrix.
   * A caller with a better sentence passes it.
   */
  readonly emptyBody?: string;
  /**
   * What one stored value is called, for a field whose names this table cannot look up itself.
   *
   * <p><b>A value that is neither an enum constant nor free text.</b> The recorder names the
   * catalogue beside an enum, and this table resolves it exactly; a field whose values are rows an
   * installation registered at startup has no catalogue to name, so the stored key falls through
   * and the audit trail prints `SUPERVISOR_CANDIDATE` where every other surface showing that record
   * says 관리감독자 지정 대상. The screen that owns the record is the only place that knows which
   * registration to read, which is why the resolution arrives from there.
   *
   * <p>Return `undefined` for anything not recognised — a field this caller does not name, or a key
   * the installation no longer registers. The stored value then stands as it is, which is what an
   * audit trail owes a reader: evidence that has lost its label is still evidence, and blanking it
   * would say the value was empty.
   *
   * @param field the changed field's name, as the record stores it
   * @param value one side of the change, as the record stores it
   */
  readonly resolveValue?: (field: string, value: string) => string | undefined;
  /**
   * The audited entity's enum fields, field name to enum name, as its contract declares them.
   *
   * <p>A recorder that names no catalogue beside a value leaves an enum constant with nothing to
   * say which enum it belongs to, and the row prints `FAILED → QUEUED` where every other surface
   * says 실패 → 대기. The entity's own contract knows each field's enum, so the table reads it from
   * here. Defaults to what the enclosing {@link FieldEnumsProvider} supplies, which a record detail
   * fills from its field table.
   */
  readonly fieldEnums?: Readonly<Record<string, string>>;
  /**
   * What a changed field is called, for a field the entity's catalogue cannot name.
   *
   * <p>A key-value catalogue (an installation's settings) records each change under the key that
   * moved, and the key's label lives in the owning screen's catalogue rather than in the entity's
   * `fields`. Return `undefined` for a field this caller does not name; the entity's catalogue,
   * then the stored name, answer for it.
   *
   * @param field the changed field's name, as the record stores it
   */
  readonly resolveField?: (field: string) => string | undefined;
}

/** What {@link changeValueLabel} reads a value through. */
export interface ChangeValueReaders {
  readonly fieldEnums?: Readonly<Record<string, string>>;
  readonly enumLabel: (enumName: string, value: string) => string;
  readonly resolveValue?: (field: string, value: string) => string | undefined;
  /** What a side with no value reads as. */
  readonly nothing: string;
  /** What a stored boolean reads as. */
  readonly switched: (on: boolean) => string;
  /**
   * What a stored instant reads as in the reader's zone, else `undefined` to show it as stored.
   *
   * <p>A recorder writes an instant as ISO-8601 (`2026-11-01T06:13:37.117945Z`), which no operator
   * reads as a time; it is printed the way every other instant on the screen is.
   */
  readonly instant?: (value: string) => string | undefined;
}

/** An ISO-8601 instant as a recorder stores it: a date, a time, and `Z` or an offset. */
const STORED_INSTANT = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:\d{2})$/;

/**
 * One side of a change, as a reader reads it: the enum the recorder names, else the enum the
 * entity's contract declares for the field, else what the owning screen resolves, else a switch's
 * state, else the stored text.
 */
export function changeValueLabel(
  change: { readonly value?: string; readonly valueEnum?: string; readonly field?: string },
  readers: ChangeValueReaders,
): string {
  const { value, valueEnum, field } = change;
  if (!value) return readers.nothing;
  const enumName = valueEnum ?? (field ? readers.fieldEnums?.[field] : undefined);
  if (enumName) return readers.enumLabel(enumName, value);
  const named = readers.resolveValue?.(field ?? "", value);
  if (named) return named;
  // A boolean is stored as the word the language prints, and 「false → true」 says nothing to an
  // operator reading what somebody switched. It is not an enum, so the recorder names no
  // catalogue for it and nothing else in this pair can tell the reader which way it went.
  if (value === "true" || value === "false") return readers.switched(value === "true");
  if (STORED_INSTANT.test(value)) return readers.instant?.(value) ?? value;
  return value;
}

const FieldEnumsContext = createContext<Readonly<Record<string, string>> | undefined>(undefined);

/** Supplies {@link ChangeHistoryTableProps.fieldEnums} to every history table below it. */
export const FieldEnumsProvider = FieldEnumsContext.Provider;

/**
 * Who changed a setting, when, and to which record.
 *
 * <p>The same four columns on every settings screen: a change to the security policy and a change
 * to the installation's own values are the same kind of event, and an operator who learns to read
 * one has learned to read them all.
 *
 * <p>The screen that owns the record decides which entity to ask about; this only draws the
 * answer.
 */
export function ChangeHistoryTable({
  history,
  denied,
  emptyBody,
  resolveValue,
  resolveField,
  fieldEnums: givenFieldEnums,
}: ChangeHistoryTableProps) {
  const providedFieldEnums = useContext(FieldEnumsContext);
  const fieldEnums = givenFieldEnums ?? providedFieldEnums;
  // The console's shared namespace: this table is drawn by screens in four different modules, so
  // its labels cannot live in any one module's catalogue.
  const { t } = useTranslation("common");
  const { t: tUi } = useTranslation("simplix/ui");
  const { enumLabel } = useEntityTranslation("auditEvent");
  // The audited entity's own labels, which is where 「항목」 comes from.
  //
  // **The record stores the field's name and the screen resolves it.** Storing the label instead
  // would freeze one language into evidence — a Japanese inspector would read Korean — and
  // storing nothing is what the column looked like until now: `disableWhenAbsent` in front of
  // somebody asking why a setting changed. The name IS the stable half (it identifies the field
  // whatever the label is later called), so it stays in the record and the wording is looked up
  // at read time. A field the catalogue no longer carries falls back to its stored name, which is
  // visible rather than lost.
  const { fieldLabel } = useEntityTranslation(entityKeyOf(history.entityType));
  // The reader's own zone, never the browser's: a history read eight hours off is indistinguishable
  // from one that is right.
  const zone = useAppTimeZone();
  const locale = useLocale();
  // 「사유」 is dropped on a narrow table and the row carries it instead. Measured on the same
  // element the table measures, because a detail panel's width is not the window's.
  const { ref, wide } = useWideList();

  /**
   * One side of a change, as a reader reads it.
   *
   * <p>An enum's constant is stored, not its label — 「분류 MANAGEMENT」 where 관리 belongs — and
   * the value alone cannot say which catalogue to look in. The recorder names the enum beside the
   * value, so this resolves it exactly rather than guessing; where it names none, the entity's
   * contract says which enum the field is ({@link ChangeHistoryTableProps.fieldEnums}).
   *
   * <p>Where it names none, the owning screen gets its turn ({@link ChangeHistoryTableProps.resolveValue}):
   * a value keyed into a table the installation registered has no catalogue for the recorder to
   * name, and only that screen knows which registration to read. Anything neither of them claims is
   * text and stands as it is.
   */
  const valueOf = (
    value: string | undefined,
    valueEnum: string | undefined,
    field: string | undefined,
  ) =>
    changeValueLabel(
      { value, valueEnum, field },
      {
        fieldEnums,
        enumLabel,
        resolveValue,
        nothing: NOTHING,
        switched: (on) => tUi(`common.${on ? "on" : "off"}`),
        instant: (stored) => zoneDateTimeText(zone, stored, locale) ?? undefined,
      },
    );

  if (denied) {
    return (
      <EmptyState
        size="sm"
        icon={<LockIcon />}
        title={t("history.deniedTitle")}
        description={t("history.deniedBody")}
      />
    );
  }

  // A read that failed is not a history with nothing in it, and drawn as an empty list the
  // failure reads as 「이 기록을 바꾼 적이 없다」 — the one conclusion an audit trail must never
  // invite when it is simply unreachable.
  if (history.isError) {
    return (
      <EmptyState
        size="sm"
        icon={<AlertTriangleIcon />}
        title={t("history.loadFailed")}
      />
    );
  }

  // Loading and emptiness are the list's own states — it draws a skeleton for the first and the
  // empty state it was given for the second, and drawing them here would take the search box away
  // with them.

  // Four fixed columns and one floor, and 「바뀐 값」 is the floor. Every other column here holds a
  // value of known size — an instant, an address, a badge, a short sentence — so room spent on any
  // of them is padding, and the one column whose content has no size of its own is the one that
  // widens with the table. In a drawer at 1600px that is 350px of remainder landing where the
  // value pairs are, instead of on the instant column that needs 131px of it.
  return (
    <PanelList<ChangeHistoryEvent>
      rootRef={ref}
      list={history.list}
      resizableColumns="change-history"
      filters={[
        {
          type: "text",
          field: "actorUsername",
          label: t("history.actor"),
          operators: [SearchOperator.CONTAINS],
          defaultOperator: SearchOperator.CONTAINS,
        },
        {
          type: "dateRange",
          field: "occurredAt",
          label: t("history.occurredAt"),
        },
      ]}
      emptyState={{
        icon: <HistoryIcon />,
        title: t("history.emptyTitle"),
        description: emptyBody ?? t("history.emptyBody"),
      }}
    >
      <CrudList.Column<ChangeHistoryEvent>
        field="occurredAt"
        header={t("history.occurredAt")}
        width={150}
        sortable
      >
        {({ row }) => <InstantText value={row.occurredAt} displayZone={zone} format="datetime" />}
      </CrudList.Column>

      {/* A width rather than a floor: an address is as long as somebody's account name and this
          column ellipsizes it, so the room it would take from 「바뀐 값」 shows the reader nothing
          they cannot get from the row. A declared width caps the cell too, so a long address
          truncates inside the column instead of setting it. */}
      <CrudList.Column<ChangeHistoryEvent>
        field="actor"
        header={t("history.actor")}
        width={110}
        sortable
      >
        {({ row }) => <EllipsisText>{row.actor || NOTHING}</EllipsisText>}
      </CrudList.Column>

      {/* As wide as the audit log's own action column: the same badges, and a narrower column cuts
          the longer action names mid-word. */}
      <CrudList.Column<ChangeHistoryEvent> field="action" header={t("history.action")} width={180}>
        {({ row }) => (
          <EnumBadge
            enumName="AuditAction"
            value={row.action}
            enumLabel={enumLabel}
            fallback={<EmptyValue />}
          />
        )}
      </CrudList.Column>

      {/* Every value the event moved, one line each. A save that moved three fields moved three
          values, and a reader asking 「이 값이 왜 이렇게 됐나」 is asking about one of them — but
          the PAGE counts events, so opening them out into rows would make the pager lie. They are
          lines inside the row that owns them. */}
      {/* **The table's only floor, so the whole remainder comes here.** 256 is what one value pair
          takes on a single line; below it the pair wraps over four. The four fixed columns take
          150 + 150 + 120 + 180, so under about 850px of host the table cannot hold all five and
          its own `overflow-x: auto` carries the difference — 「사유」 leaves first, at
          WIDE_LIST_WIDTH, rather than being pushed past the edge with nothing to say it went.

          It also has to be able to shrink: a pair of values can be any length, and a cell that
          widens to fit them pushes 「사유」 off the right edge of a detail panel with no scrollbar
          to say it went. `minSize` lets the column give way and the values wrap inside it. */}
      <CrudList.Column<ChangeHistoryEvent> field="changes" header={t("history.changed")} minWidth={256}>
        {({ row }) =>
          (row.changes ?? []).length === 0 ? (
            <EmptyValue />
          ) : (
            <Stack gap="none" minSize>
              {(row.changes ?? []).map((change, at) => (
                <Flex key={`${row.eventId}:${at}`} gap="xs" align="start" wrap minSize>
                  <StrongText size="caption">{resolveField?.(change.field ?? "") ?? fieldLabel(change.field ?? "")}</StrongText>
                  {/* Wrapping rather than clipping. A pair of values can be any length and this
                      cell is 164px inside a detail panel, so a line that will not wrap is cut at
                      the cell's edge with no ellipsis and no `title` — 「현장 점검 출장 - 편집 확인
                      → 현」 and nothing to say the rest is there. The row has vertical room and
                      the reader has none horizontally. */}
                  <Text size="caption" tone="muted" className="whitespace-normal break-words">
                    {valueOf(change.before, change.valueEnum, change.field)} →{" "}
                    {valueOf(change.after, change.valueEnum, change.field)}
                  </Text>
                </Flex>
              ))}
              {/* Only where the column is not drawn beside it — printed in both places the row
                  says everything twice, which reads as a defect of its own. Wrapped for the same
                  reason as the values above: moving a sentence out of a column that ran off the
                  panel and into one that clips it buys the reader nothing. */}
              {!wide && row.reason ? (
                <Text size="caption" tone="muted" className="whitespace-normal break-words">
                  {t("history.reason")} · {row.reason}
                </Text>
              ) : null}
            </Stack>
          )
        }
      </CrudList.Column>

      {/* Dropped on a narrow table rather than pushed past its edge. Five columns take at least
          150 + 110 + 120 + 256 + 140 = 776px and a detail panel is 572px wide with no horizontal
          scrollbar, so this column left no sign it existed — a reader did not know there was a
          사유 to look for, which is worse than a value they can see is cut. Where it goes, the row
          below carries it.

          A width, not a floor. A reason is one line somebody typed and this column ellipsizes it
          with the full text on the element, so extra room here buys a few more characters of a
          sentence the row below already carries in full — while 「바뀐 값」 wraps every pair it
          cannot fit onto another line. */}
      <CrudList.Column<ChangeHistoryEvent>
        field="reason"
        header={t("history.reason")}
        width={140}
        minTableWidth={WIDE_LIST_WIDTH}
      >
        {({ row }) => <EllipsisText title={row.reason ?? ""}>{row.reason || <EmptyValue />}</EllipsisText>}
      </CrudList.Column>
    </PanelList>
  );
}
