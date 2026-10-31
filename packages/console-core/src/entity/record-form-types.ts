import type { EntitySearch } from "@simplix-react/ui";

import type { EvidenceItem } from "../attachment";

/** A choice a select or a multi-select offers. */
export interface RecordOption {
  readonly value: string;
  readonly label: string;
  /** What choosing it means (the value it puts in force); a select draws the chosen one's under the field. */
  readonly description?: string;
}

/** What every field kind carries besides its value. */
export interface FieldCommon {
  readonly key: string;
  readonly label: string;
  /** What to know before filling it in, under the field. */
  readonly hint?: string;
  readonly required?: boolean;
  readonly placeholder?: string;
  /**
   * Whether the field takes input. A string both disables it and says why, shown as the field's
   * tooltip, so a reader facing a locked field learns what would unlock it.
   */
  readonly disabled?: boolean | string;
  /**
   * The label is named for assistive technology only, where a heading right above already says it
   * (a 「건의사항」 box under the 「건의사항」 section).
   */
  readonly labelHidden?: boolean;
  /**
   * Draws the field, and asks for it, only while another field of the same form holds one of these
   * values (「적용 제외 사유」 while 「판정」 is 「허가 제외」). Hidden, it is neither validated nor counted.
   */
  readonly shownWhen?: { readonly field: string; readonly is: readonly string[] };
}

/** How a signature was given: by the signer, by a delegate (drawn with 「代」), or by a proxy. */
export type SignatureActing = "SELF" | "DELEGATED" | "PROXY";

/** A signature a `signature` field holds. */
export interface SignatureValue {
  readonly name: string;
  /** When it was given, as an instant string. */
  readonly at: string;
  readonly acting?: SignatureActing;
  /** The drawn signature as a PNG data URL, while it has not been uploaded yet. */
  readonly dataUrl?: string;
}

/** An attachment a field holds: evidence plus which of the field's requested kinds it answers. */
export interface FieldEvidence extends EvidenceItem {
  /** One of the field's `evidenceKinds`; absent where the field asks for no particular kind. */
  readonly evidenceKind?: string;
}

/** The two sides of a `checkPair` field. */
export interface CheckPairValue {
  readonly performed: boolean | null;
  readonly verified: boolean | null;
}

/** A verdict a `verdict` field holds. */
export type VerdictChoice = "GOOD" | "BAD" | "NOT_APPLICABLE";

/** A `verdict` field's value: the choice, and the reason when it does not apply. */
export interface VerdictValue {
  readonly value: VerdictChoice | null;
  readonly note?: string;
  /** The item's name, on a row the filler names. */
  readonly name?: string;
}

/** A `choiceWithDetail` field's value: the chosen option and the text the 「other」 option opens. */
/** A column of a {@link RecordFormField} of kind `row`. */
export interface RecordRowColumn {
  readonly key: string;
  readonly label: string;
  /** Set for a column answered by one of a few words (상 · 중 · 하); free text otherwise. */
  readonly options?: readonly RecordOption[];
  /** Set for a column answered by one tick (「확인(√)」); stored as "true" or absent. */
  readonly tick?: boolean;
  /** Set for a column the form fills (the company a register row is for); drawn as its value, not a control. */
  readonly readOnly?: boolean;
}

export interface ChoiceDetailValue {
  readonly choice: string | null;
  readonly detail?: string;
}

/** A `range` field's value: a from-to period, both ends as strings of the field's granularity. */
export interface RangeValue {
  readonly from?: string;
  readonly to?: string;
}

/** One field of a {@link RecordForm} or a {@link SettingsForm}, declared rather than drawn. */
export type RecordFormField =
  | ({ readonly kind: "text" | "email" | "textarea"; readonly value?: string } & FieldCommon)
  /** One text per content language, edited a language at a time; filled when any language is. */
  | ({ readonly kind: "i18nText"; readonly value?: Readonly<Record<string, string>>; readonly multiline?: boolean } & FieldCommon)
  | ({ readonly kind: "number"; readonly value?: number | null; readonly unit?: string; readonly min?: number; readonly max?: number } & FieldCommon)
  /**
   * One choice from a list. `clearable` draws a control that returns an optional field to no value,
   * which a select otherwise cannot do once something is picked (frontend invariant #75).
   */
  | ({ readonly kind: "select"; readonly value?: string; readonly options: readonly RecordOption[]; readonly clearable?: boolean } & FieldCommon)
  /** One choice of a few, every option visible at once as a row of radio buttons. */
  | ({ readonly kind: "radio"; readonly value?: string; readonly options: readonly RecordOption[] } & FieldCommon)
  | ({ readonly kind: "multi"; readonly value?: readonly string[]; readonly options: readonly RecordOption[] } & FieldCommon)
  | ({ readonly kind: "date"; readonly value?: string } & FieldCommon)
  /**
   * A one-time code of `length` digits, one box per digit. `invalid` marks the whole group as
   * refused with that message, for a code the server rejected (the form cannot know it is wrong).
   */
  | ({ readonly kind: "otp"; readonly value?: string; readonly length: number; readonly invalid?: string } & FieldCommon)
  | ({ readonly kind: "switch"; readonly value?: boolean } & FieldCommon)
  /** An absolute instant entered in the record's own time zone (an IANA id). */
  | ({ readonly kind: "datetime"; readonly value?: string; readonly zone: string } & FieldCommon)
  /** A wall-clock time 「HH:mm」; `clearable` lets it return to unset. */
  | ({ readonly kind: "time"; readonly value?: string | null; readonly clearable?: boolean } & FieldCommon)
  /** A month 「yyyy-MM」. */
  | ({ readonly kind: "month"; readonly value?: string } & FieldCommon)
  /** A period whose start must come before its end. */
  | ({ readonly kind: "range"; readonly value?: RangeValue; readonly granularity: "date" | "datetime"; readonly zone?: string } & FieldCommon)
  /** A yes or no question that starts unanswered. */
  | ({ readonly kind: "check"; readonly value?: boolean | null } & FieldCommon)
  /**
   * One row of a source table the form repeats (a procedure, a hazard and its control): a cell per
   * column, free text or one of the column's options. Rows of one table are drawn as one table.
   */
  | ({ readonly kind: "row"; readonly value?: Readonly<Record<string, string>>; readonly columns: readonly RecordRowColumn[] } & FieldCommon)
  /** One tick box a paper form prints beside an item (□ 화재): ticked or not, no third answer. */
  | ({ readonly kind: "tick"; readonly value?: boolean } & FieldCommon)
  /** One record picked through a server search; `peek` with `peekKind` draws a preview button. */
  | ({ readonly kind: "reference"; readonly value?: string; readonly search: EntitySearch; readonly peek?: boolean; readonly peekKind?: string } & FieldCommon)
  /** Several records picked through a server search. */
  | ({ readonly kind: "referenceMulti"; readonly value?: readonly string[]; readonly search: EntitySearch } & FieldCommon)
  /**
   * Evidence attached through `onAdd`. Each of `evidenceKinds` missing from the value is drawn as
   * an empty slot, and a required field needs every one of them.
   */
  | ({
      readonly kind: "attachment";
      readonly value?: readonly FieldEvidence[];
      readonly evidenceKinds: readonly string[];
      /** Captures one attachment of the kind asked for; resolves to nothing when cancelled. */
      readonly onAdd?: (evidenceKind: string) => Promise<FieldEvidence | null>;
    } & FieldCommon)
  /** The signer's own signature, captured on a pad; `signer` is a signature already given. */
  | ({
      readonly kind: "signature";
      readonly role: string;
      readonly signer?: SignatureValue;
      readonly signerName?: string;
      /** What the signature attests, written above the pad (「TBM 내용을 듣고 이해했습니다」). */
      readonly statement?: string;
    } & FieldCommon)
  /** One item confirmed by two parties, each on their own side; only `editable` takes input. */
  | ({
      readonly kind: "checkPair";
      readonly performed?: boolean | null;
      readonly verified?: boolean | null;
      readonly performedBy?: string;
      readonly verifiedBy?: string;
      readonly editable: "performed" | "verified" | "none";
      /** The two side captions, such as 「조치」 and 「확인」. */
      readonly sideLabels: readonly [string, string];
      /**
       * A third cell the source prints on the row, entered beside the ticks: the item's own name on a
       * row left blank for the filler (「자율기재」), or a count (「개소」). Stored under its key.
       */
      readonly extra?: { readonly key: string; readonly label: string; readonly numeric?: boolean };
    } & FieldCommon)
  /** Good, bad or not applicable, in the source's own words; not applicable asks for a reason. */
  | ({
      readonly kind: "verdict";
      readonly value?: VerdictChoice | null;
      readonly labels: readonly [string, string, string];
      readonly note?: string;
      /** The row is left blank on the source for the filler to name the item checked (stored as `name`). */
      readonly named?: boolean;
    } & FieldCommon)
  /** A choice whose `otherValue` option opens a text detail that must then be filled. */
  | ({ readonly kind: "choiceWithDetail"; readonly value?: ChoiceDetailValue; readonly options: readonly RecordOption[]; readonly otherValue: string } & FieldCommon)
  /** Rows of sub-fields the reader adds and removes; `initialRows` is where it starts, not a cap. */
  | ({ readonly kind: "repeat"; readonly columns: readonly RecordFormField[]; readonly rows?: readonly Record<string, unknown>[]; readonly initialRows: number } & FieldCommon);

/** The kinds a field can be. */
export type RecordFormFieldKind = RecordFormField["kind"];

/** One section of fields. */
export interface RecordFormSection {
  readonly key: string;
  readonly title?: string;
  readonly fields: readonly RecordFormField[];
  /** Two columns where the fields are short; one where they are sentences. */
  readonly columns?: 1 | 2;
}
