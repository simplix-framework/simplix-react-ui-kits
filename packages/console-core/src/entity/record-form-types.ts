import type { EntitySearch } from "@simplix-react/ui";

import type { EvidenceItem } from "../attachment";

/** A choice a select or a multi-select offers. */
export interface RecordOption {
  readonly value: string;
  readonly label: string;
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
}

/** A `choiceWithDetail` field's value: the chosen option and the text the 「other」 option opens. */
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
  | ({ readonly kind: "number"; readonly value?: number | null; readonly unit?: string; readonly min?: number; readonly max?: number } & FieldCommon)
  | ({ readonly kind: "select"; readonly value?: string; readonly options: readonly RecordOption[] } & FieldCommon)
  | ({ readonly kind: "multi"; readonly value?: readonly string[]; readonly options: readonly RecordOption[] } & FieldCommon)
  | ({ readonly kind: "date"; readonly value?: string } & FieldCommon)
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
  | ({ readonly kind: "signature"; readonly role: string; readonly signer?: SignatureValue; readonly signerName?: string } & FieldCommon)
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
    } & FieldCommon)
  /** Good, bad or not applicable, in the source's own words; not applicable asks for a reason. */
  | ({ readonly kind: "verdict"; readonly value?: VerdictChoice | null; readonly labels: readonly [string, string, string]; readonly note?: string } & FieldCommon)
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
