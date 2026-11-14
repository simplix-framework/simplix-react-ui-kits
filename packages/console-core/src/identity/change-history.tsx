import { createContext, useContext } from "react";
import { AlertTriangleIcon, HistoryIcon, LockIcon } from "lucide-react";
import { useEntityTranslation, useLocale, useTranslation } from "@simplix-react/i18n/react";
import { CrudList, EMPTY_VALUE_TEXT, EmptyState, EmptyValue, Flex, InstantText, SearchOperator, Stack, Text } from "@simplix-react/ui";

import { EnumBadge } from "../badge";
import type { ChangeHistoryEvent } from "./change-history-source";
import { EllipsisText, FREE_TEXT_MIN_WIDTH, PanelList, StrongText, useWideList, WIDE_LIST_WIDTH } from "../layout";
import { useAppTimeZone, zoneDateTimeText } from "../datetime";
import { CONTRACT_COLUMN_SIZE } from "../entity/record-contract";
import type { ChangeHistoryRead } from "./change-history-read";

/**
 * The sizing of the two columns a reader must always be able to read whole: when a change happened
 * and who made it. Both widths come from the table every generated list sizes its columns by, so an
 * instant is as wide here as in any list that shows one and a person as wide as a reference, and no
 * number is written for this table alone. Narrower, a date or a name is cut by an ellipsis while the
 * table scrolls sideways anyway, which hides the two facts an audit trail exists to show.
 *
 * <p>The columns spread these objects, so the definition a test reads is the one the table draws.
 */
export const CHANGE_HISTORY_COLUMNS = {
  when: { width: CONTRACT_COLUMN_SIZE.instant.width ?? FREE_TEXT_MIN_WIDTH },
  who: { width: CONTRACT_COLUMN_SIZE.reference.minWidth ?? FREE_TEXT_MIN_WIDTH },
} as const;

/** What a value reads as when the row has none: never blank, so a gap is a gap and not a bug. */
const NOTHING = EMPTY_VALUE_TEXT;

/**
 * The catalogue name of an audited entity.
 *
 * <p>The recorder writes the entity's Java simple name (`IdentityProviderConfig`) and the
 * catalogues are keyed by the same name lower-camel (`identityProviderConfig`), one character
 * apart, and getting it wrong resolves nothing while looking like a missing translation.
 */
function entityKeyOf(entityType: string): string {
  return entityType ? entityType.charAt(0).toLowerCase() + entityType.slice(1) : entityType;
}

interface ChangeHistoryTableProps {
  /** What {@link useChangeHistory} answered. */
  readonly history: ChangeHistoryRead;
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
   * the first callers and "this setting has no recorded change yet" is false on a permission matrix.
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
   * says "supervisor candidate". The screen that owns the record is the only place that knows which
   * registration to read, which is why the resolution arrives from there.
   *
   * <p>Return `undefined` for anything not recognised: a field this caller does not name, or a key
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
   * says "failed" to "waiting". The entity's own contract knows each field's enum, so the table reads it from
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
  // The audited entity's own labels, which is where the "Field" label comes from.
  //
  // **The record stores the field's name and the screen resolves it.** Storing the label instead
  // would freeze one language into evidence (a Japanese inspector would read Korean), and
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
  // "Reason" is dropped on a narrow table and the row carries it instead. Measured on the same
  // element the table measures, because a detail panel's width is not the window's.
  const { ref, wide } = useWideList();

  /**
   * One side of a change, as a reader reads it.
   *
   * <p>An enum's constant is stored, not its label ("Category MANAGEMENT" where "Management" belongs), and
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
  // failure reads as "this record was never changed", the one conclusion an audit trail must never
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

  // Loading and emptiness are the list's own states: it draws a skeleton for the first and the
  // empty state it was given for the second, and drawing them here would take the search box away
  // with them.

  // Four fixed columns and one floor, and "Changed values" is the floor. Every other column here holds a
  // value of known size (an instant, an address, a badge, a short sentence), so room spent on any
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
        {...CHANGE_HISTORY_COLUMNS.when}
        sortable
      >
        {({ row }) => <InstantText value={row.occurredAt} displayZone={zone} format="datetime" />}
      </CrudList.Column>

      {/* A width rather than a floor, so the remainder still goes to "Changed values". It is the
          width a reference takes in every generated list (CHANGE_HISTORY_COLUMNS), enough for a
          person's name; a longer address truncates inside the column instead of setting it, with the
          full text on the element. */}
      <CrudList.Column<ChangeHistoryEvent>
        field="actor"
        header={t("history.actor")}
        {...CHANGE_HISTORY_COLUMNS.who}
        sortable
      >
        {({ row }) => <EllipsisText title={row.actor ?? ""}>{row.actor || NOTHING}</EllipsisText>}
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
          values, and a reader asking "why is this value what it is" is asking about one of them, but
          the PAGE counts events, so opening them out into rows would make the pager lie. They are
          lines inside the row that owns them. */}
      {/* **The table's only floor, so the whole remainder comes here.** 256 is what one value pair
          takes on a single line; below it the pair wraps over four. The three fixed columns before it
          take 176 + 160 + 180, so under about 770px of host the table cannot hold them and this
          floor, and its own `overflow-x: auto` carries the difference (the date and the person stay
          whole while it scrolls): "Reason" leaves first, at
          WIDE_LIST_WIDTH, rather than being pushed past the edge with nothing to say it went.

          It also has to be able to shrink: a pair of values can be any length, and a cell that
          widens to fit them pushes "Reason" off the right edge of a detail panel with no scrollbar
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
                      the cell's edge with no ellipsis and no `title` ("Site inspection trip - edit check
                      to Si") and nothing to say the rest is there. The row has vertical room and
                      the reader has none horizontally. */}
                  <Text size="caption" tone="muted" className="whitespace-normal break-words">
                    {valueOf(change.before, change.valueEnum, change.field)} →{" "}
                    {valueOf(change.after, change.valueEnum, change.field)}
                  </Text>
                </Flex>
              ))}
              {/* Only where the column is not drawn beside it: printed in both places the row
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
          176 + 160 + 180 + 256 + 140 = 912px and a detail panel is 572px wide with no horizontal
          scrollbar, so this column left no sign it existed: a reader did not know there was a
          reason to look for, which is worse than a value they can see is cut. Where it goes, the row
          below carries it.

          A width, not a floor. A reason is one line somebody typed and this column ellipsizes it
          with the full text on the element, so extra room here buys a few more characters of a
          sentence the row below already carries in full, while "Changed values" wraps every pair it
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

export * from "./change-history-read";
