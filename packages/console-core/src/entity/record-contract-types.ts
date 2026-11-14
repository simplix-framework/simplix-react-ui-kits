import { i18nBaseValue } from "@simplix-react/i18n";
import type { EntityFacet, EntitySearch, LanguageSelectorPlacement, StatusTone } from "@simplix-react/ui";

import type { RecordBadge, RecordValue } from "./record-value";

/** A text per content language, as the i18n helpers take it. */
export type I18nMap = Parameters<typeof i18nBaseValue>[0] & object;

/**
 * What the contract says one field is, as the generator writes it from SimpliX Meta.
 *
 * <p>The kind decides how the value is drawn in a list cell and a detail field and which control a
 * form edits it with, so a generated screen draws every field the way a finished one does and a
 * screen's blocks hold only its own decisions.
 */
export type ContractFieldKind =
  | "text"
  | "longText"
  | "email"
  | "enum"
  | "boolean"
  | "date"
  | "instant"
  | "time"
  | "number"
  /** An amount of money stored as a whole number of `10^-scale` units of `currency` (SimpliX Meta's `format: "money"`). */
  | "money"
  | "reference"
  /** A text written once per content language (`<field>I18n`), whose plain sibling the server reads. */
  | "i18nText"
  /** A value the client writes and no response returns (SimpliX Meta's `format: "secret"`), such as a provider key. */
  | "secret"
  /** A structured value (an object or an array), drawn and edited as indented JSON. */
  | "json"
  /** A whole number of credits, written with the word for them (`500 credits`). */
  | "credits"
  /** A size in bytes, written in the largest unit that keeps it at 1 or more (`1.5 MB`). */
  | "bytes"
  /** A span of milliseconds, written as a reader compares it (`850 ms`, `12.3 sec`, `2 min 5 sec`). */
  | "duration"
  /** A machine message (an error, an error code): one monospaced line, copied and shown whole on request. */
  | "excerpt"
  /**
   * Free text a person wrote (a note, a comment): a list cell or card draws its start as prose, cut
   * on a word with an ellipsis at `proseLength` characters, and a detail draws the whole text.
   */
  | "prose"
  /** A language code (`ko`, `en-US`), written as the language's name in the reader's language. */
  | "language";

export interface ContractField {
  readonly name: string;
  readonly kind: ContractFieldKind;
  /** The enum the labels are read from (`enumLabel(enumName, value)`), for an `enum` field. */
  readonly enumName?: string;
  /** Every value an `enum` field takes, in the contract's order. */
  readonly options?: readonly string[];
  /** The peek kind a `reference` field opens, which is the referenced entity's name. */
  readonly peekKind?: string;
  /**
   * For a `reference` whose target a sibling field picks (SimpliX Meta's `reference.kindField`):
   * that field, and the peek kind each of its values opens. A value with no kind is drawn by name
   * alone, since nothing is served to open.
   */
  readonly peekKinds?: { readonly field: string; readonly kinds: Readonly<Record<string, string>> };
  /**
   * For a `reference` whose value is another field of the referenced entity than its identifier
   * (SimpliX Meta's `reference.idField`), that field: the peek looks the record up by it.
   */
  readonly peekBy?: string;
  /**
   * The field beside a `reference` that says why its record cannot be opened: `DELETED` or
   * `UNAVAILABLE` (no access). Absent or any other value means the record opens as usual.
   */
  readonly stateField?: string;
  /** The field beside a `reference` that carries the referenced record's name, or a dotted path into the nested record. */
  readonly nameField?: string;
  /** The server owns it: drawn in a detail, never edited in a form. */
  readonly readOnly?: boolean;
  readonly required?: boolean;
  /**
   * For a `number`, `money` or `credits` ledger amount: drawn with its sign written out and tinted
   * by it, a credit green and a debit red.
   */
  readonly signed?: boolean;
  /** Whether the server orders a list by it, as SimpliX Meta's searchable metadata states; absent means unstated. */
  readonly sortable?: boolean;
  /**
   * The field the column sorts by where it is not the field drawn: a reference drawn by its
   * recorded name sorts by that name (`nameField`), since its id orders nothing a reader can see.
   */
  readonly sortField?: string;
  /**
   * Locale → the field the server orders this one by in that language (SimpliX Meta's
   * `searchable.sortAlias`): a translated name sorts by its per-language sort key, so the visible
   * name column sorts in the reader's language rather than not at all.
   */
  readonly sortAlias?: Readonly<Record<string, string>>;
  /** The record's own identifier: drawn with a copy control in a detail. */
  readonly identifier?: boolean;
  /**
   * For a `prose` field, the characters a list cell or card keeps before the cut; absent,
   * {@link PROSE_CHARS}.
   */
  readonly proseLength?: number;
  /**
   * For a `boolean` field, a list cell or card draws a mark with the field's own label when the
   * value is true and nothing when it is false: a "No" badge on every card says nothing. The column
   * keeps no empty cell on the cards that lack it. A detail still draws yes or no.
   */
  readonly markWhenTrue?: boolean;
  /**
   * The list draws the column at every pane width: a field without which another drawn column reads
   * wrong (a consent's withdrawal beside "granted"), kept as the leading and the sorted column are.
   */
  readonly keep?: boolean;
  /**
   * For a `text` field, the address the value opens, computed from the row (a document version that
   * opens the published text of that version): the list cell, the card and the detail draw the value
   * as a link to it, a new tab when the address is on another origin. A row it answers no address for
   * draws the value as plain text.
   */
  readonly linkOf?: (row: Readonly<Record<string, unknown>>) => string | undefined;
  /**
   * A code the reader types or compares (SimpliX Meta's `format: "code"`, from `@CodeValue`): a
   * text value drawn in the monospaced face.
   */
  readonly code?: boolean;
  /** For an `i18nText` field, the plain field the request carries the base language's text in. */
  readonly plainField?: string;
  /** For an `i18nText` field whose plain sibling is long text, the per-language editor is a text area. */
  readonly multiline?: boolean;
  /** For an `i18nText` field, where its language selector is drawn; absent, the installation's default. */
  readonly languageSelectorPlacement?: LanguageSelectorPlacement;
  /** For a `money` field, the ISO 4217 currency the amount is in. */
  readonly currency?: string;
  /** For a `money` field, the decimal places the stored whole number carries: 6 stores millionths. */
  readonly scale?: number;
  /**
   * For a `money` field whose currency differs from row to row, the field of the same row that holds
   * the ISO 4217 currency. The amount is then a whole number of that currency's own smallest unit
   * (won as won, dollars as cents), and each row is written in its own currency.
   */
  readonly currencyField?: string;
  /** The value a new record starts the field with (SimpliX Meta's `defaultValue`). */
  readonly defaultValue?: string | number | boolean;
  /**
   * The tone of each value's badge as SimpliX Meta declares it (an enum value's `tone`, a boolean's
   * `tones`), keyed by the value (`"true"` and `"false"` for a boolean). A screen's
   * {@link ContractOverrides.tones} for the field wins over it; a value neither names is neutral.
   */
  readonly tones?: Readonly<Record<string, StatusTone>>;
}

/** A searchable field as the generator writes it, which {@link useRecordContract}'s `filters` turns into a list filter. */
export type ContractFilter =
  | { readonly kind: "choice"; readonly field: string; readonly enumName?: string; readonly options: readonly string[] }
  | { readonly kind: "toggle"; readonly field: string }
  /**
   * A text the reader types a part of (a provider, a plan code), matched as contained. The
   * generator leaves text fields to the keyword search; a screen whose question is asked by one of
   * them declares it. `operators` are the ones the endpoint accepts on the field, first one the
   * default (`["equals"]` for a field the server matches only whole); absent, contains and equals.
   */
  | { readonly kind: "text"; readonly field: string; readonly operators?: readonly string[] }
  /** A figure; a `money` field also names its currency and scale, so the reader types currency units. */
  | { readonly kind: "number"; readonly field: string; readonly currency?: string; readonly scale?: number }
  | { readonly kind: "dateRange"; readonly field: string; readonly dateOnly?: boolean }
  /**
   * The key of another record, filtered by that record's name. It needs the screen's `facets`
   * override for the field; without one the filter is left out, since a bar offering raw ids asks
   * the reader for a value they cannot know.
   */
  | { readonly kind: "reference"; readonly field: string };

/** One key figure of a record's head, drawn from a contract field: the shape `RecordDetail` takes as a `RecordHeadFigure`. */
export interface ContractHeadFigure {
  readonly key: string;
  readonly label: string;
  readonly value: RecordValue;
}

/**
 * The fields a detail draws as sections, each with its title and the field names it holds in order:
 * the `SECTIONS` table a detail with more than one section declares.
 */
export type ContractSectionSpec = readonly { readonly key: string; readonly title: string; readonly fields: readonly string[] }[];

/** How {@link useRecordContract}'s `detailSections` names and trims the sections. */
export interface DetailSectionsOptions {
  /** A section's title in the reader's language, from the key the spec names (a catalog key). */
  readonly title: (title: string) => string;
  /** Leave out the fields that draw nothing, and then the sections left with no field. */
  readonly omitEmpty?: boolean;
}

/** What one screen adds to the contract's drawing: tones for its enums, pickers for its references. */
export interface ContractOverrides {
  /** Field → enum value → tone, over the field's own {@link ContractField.tones}. A value with no tone is neutral. */
  readonly tones?: Readonly<Record<string, Readonly<Record<string, StatusTone>>>>;
  /** Field → the search a form's reference picker reads. A reference without one is edited as text. */
  readonly searches?: Readonly<Record<string, EntitySearch>>;
  /** Field → the facet a list filter over a reference reads (`createEntityFacet`, called with the list's filters). */
  readonly facets?: Readonly<Record<string, EntityFacet>>;
}

export type Row = Readonly<Record<string, unknown>>;

/**
 * The badge a drawn value carries, for a record's header: the status, type or kind badge the field
 * is drawn as in the list, or nothing where the value is not a badge.
 *
 * @param value what `useRecordContract().value` drew for the field
 */
/** What a boolean's badge is worded from: the entity's own word for a value, else yes or no. */
export interface BooleanWords {
  /** The entity catalog's text under `key`, or undefined where it has none. */
  readonly word: (key: string) => string | undefined;
  readonly yes: string;
  readonly no: string;
}
