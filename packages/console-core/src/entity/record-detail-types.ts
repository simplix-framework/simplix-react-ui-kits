import type { ReactNode } from "react";

import { CountedTab } from "../layout/page-tabs";
import type { RecordNotice, RecordVerb } from "./record-blocks";
import type { PermissionMatrixProps } from "./permission-matrix";
import type { RecordListProps } from "./record-list";
import type { RecordBadge, RecordValue } from "./record-value";
import type { StageGateProps } from "./stage-gate";
import type { EvidenceGridProps } from "../attachment/evidence-grid";
import type { ApprovalFlowProps } from "../layout/approval-flow";
import type { CheckMatrixProps } from "../layout/check-matrix";
import type { MeasurementGridProps } from "../layout/measurement-grid";
import type { FormSheetProps } from "../screen/form-sheet";
import type { HistoryRailProps } from "../screen/history-rail";
import type { RecordHistory } from "./record-history-layout";
import type { ChangeHistoryRead } from "../identity/change-history";
import type { ScoreSheetProps } from "../screen/score-sheet";

/** One labelled value of a {@link RecordDetail} section. */
export interface RecordField {
  readonly label: string;
  readonly value: RecordValue;
  /** Spans the section's full width, for a sentence rather than a value. */
  readonly wide?: boolean;
  /** The value is one the reader carries elsewhere: a control beside it copies it, and a toast says so. */
  readonly copy?: boolean;
}

/** One section of a {@link RecordDetail}. */
export interface RecordSection {
  readonly key: string;
  readonly title?: string;
  readonly fields: readonly RecordField[];
}

/** What a tab of a {@link RecordDetail} holds, drawn top to bottom. */
export interface RecordTabContent {
  /**
   * What the tab says while nothing is registered on it: what is missing and the verb that
   * registers it, drawn in the body instead of an empty list or a blank panel.
   */
  readonly empty?: { readonly title: string; readonly description?: string; readonly action?: RecordVerb };
  readonly sections?: readonly RecordSection[];
  /** A sub-collection, drawn with every list feature unless the tab turns one off. */
  // The rows of a sub-list are the screen's own type, so the tab carries them untyped.
  readonly list?: RecordListProps<any>;
  /** The list's own heading, where the tab's sections above it are about something else (「협조 요청」 under 「작업 전 논의」). */
  readonly listTitle?: string;
  /** What a role may do, by area and action, under the sections. */
  readonly matrix?: PermissionMatrixProps & { readonly title?: string };
  /** Sections drawn after the matrix: what the matrix alone cannot say. */
  readonly afterSections?: readonly RecordSection[];
  readonly notices?: readonly RecordNotice[];
  readonly note?: string;
  /**
   * The kit's record parts a tab holds without the screen composing them, drawn in this order
   * above the sections: the approval steps, the gate of the next command, then below the sections
   * the source form, the measurement grid, the score sheet, the check grid, the evidence and the
   * record's history.
   */
  readonly flow?: ApprovalFlowProps;
  readonly gate?: StageGateProps;
  readonly sheet?: FormSheetProps;
  readonly measurements?: MeasurementGridProps;
  readonly score?: ScoreSheetProps;
  readonly checkMatrix?: CheckMatrixProps;
  readonly evidence?: EvidenceGridProps;
  readonly history?: HistoryRailProps;
  /** The rail's own heading, where the tab's sections above it are about something else (「Timeline」 under 「Last error」). */
  readonly historyTitle?: string;
  /**
   * The record's change history from the audit log, drawn as the kit's history table with its own
   * refusal when the reader may not read the log.
   */
  readonly changes?: { readonly history: ChangeHistoryRead; readonly emptyBody?: string };
}

/** One tab of a {@link RecordDetail}. */
export interface RecordTab extends RecordTabContent {
  readonly key: string;
  readonly label: string;
  readonly count?: number;
  /** What the tab still lacks (「미등록」); see {@link CountedTab}. */
  readonly missing?: string;
  /** Why the tab cannot be opened yet; see {@link CountedTab}. */
  readonly disabled?: string;
  /** The tab's own verbs, which change with the open tab. */
  readonly verbs?: readonly RecordVerb[];
}

/** A switch drawn at the end of a record's tab strip. */
export interface RecordTabToggle {
  readonly label: string;
  readonly on: boolean;
  readonly onChange: (on: boolean) => void;
}

/** One key figure in a record's head. */
export interface RecordHeadFigure {
  readonly key: string;
  readonly label: string;
  readonly value: RecordValue;
  /** The figure's recent periods, oldest first, drawn as a small line beside it. */
  readonly trend?: readonly number[];
}

/** Props for {@link RecordDetail}. */
export interface RecordDetailProps {
  /** What the record is called, at the head of the panel. */
  readonly title: string;
  /**
   * Draws the title in the monospaced face, for a record named by an identifier the reader may type
   * or compare (a provider's event name, a setting key). The face tells the screen's title from an
   * untranslated key, which an identifier's dotted shape otherwise resembles.
   */
  readonly titleCode?: boolean;
  /** What the record is to the reader, under its name: a role and where it belongs. */
  readonly subtitle?: string;
  /**
   * The record's key figures under its name, two to four of them (a balance, what is held, the
   * daily limit), each drawn by its value's own kind, so a meter or a signed amount reads there as
   * it reads in the list.
   */
  readonly figures?: readonly RecordHeadFigure[];
  /** Draws the person the record is beside the name, tinted by this seed (their id). */
  readonly avatar?: string;
  /**
   * Where the record stands, as a badge beside its name, so a reader who opened it from a list
   * card keeps the state the card showed.
   */
  readonly status?: RecordBadge;
  /**
   * The record's progress through its stages, drawn in a column beside the record while the record
   * is wide enough to spare one and, below that, at the foot of its first tab, under its own
   * heading. A screen declares it once and the kit places it; a history that belongs to one tab
   * only is that tab's `history`. Progress is not audit: who changed what is the `changes` tab.
   */
  readonly history?: RecordHistory;
  /** The tabs; the first is open. A record with no tabs passes `sections` instead. */
  readonly tabs?: readonly RecordTab[];
  readonly sections?: readonly RecordSection[];
  readonly notices?: readonly RecordNotice[];
  readonly note?: string;
  /** The tab open first, by key. */
  readonly defaultTab?: string;
  /** The reading verbs: they open something else and change nothing on this record. */
  readonly verbs?: readonly RecordVerb[];
  /** The record's finishing actions, beside the close control; the last primary one is the main one. */
  readonly actions?: readonly RecordVerb[];
  readonly onClose?: () => void;
  /** Draws a back control in the footer in place of close, for a record standing as a page. */
  readonly onBack?: () => void;
  /** Replaces the name block at the head: a page draws its own fixed head there. */
  readonly head?: ReactNode;
  /**
   * Where the open tab's verbs are drawn. `tab` (the default) puts them at the top of the tab;
   * `footer` puts them in the command row ahead of the record's actions, so a row too wide for one
   * line breaks into the tab's verbs above and the record's commands below.
   */
  readonly tabVerbs?: "tab" | "footer";
  /** A switch at the end of the tab strip that changes which tabs are drawn (a 「고급 보기」). */
  readonly tabToggle?: RecordTabToggle;
  /** Who made it and when it last changed, at the foot. */
  readonly audit?: { readonly id?: string; readonly createdAt?: string; readonly updatedAt?: string };
  readonly isLoading?: boolean;
  /**
   * The record's enum fields, field name to enum name ({@link fieldEnumsOf} builds it from the
   * contract's field table), so a changes tab labels an enum value the audit record names no
   * enum for.
   */
  readonly fieldEnums?: Readonly<Record<string, string>>;
}
