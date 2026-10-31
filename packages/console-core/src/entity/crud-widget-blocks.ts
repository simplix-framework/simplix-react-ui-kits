import type { ReactNode } from "react";

import type { RecordNotice, RecordVerb } from "./record-blocks";
import type { ContractOverrides } from "./record-contract";
import type { RecordBadge } from "./record-value";
import type { RecordSection, RecordTab } from "./record-detail";
import type { RecordFormSection } from "./record-form";

/**
 * What a generated form reads from its `form.blocks.tsx`: every key is optional, and a form states
 * only the ones it departs in.
 *
 * <p><b>One list, for the blocks file and for the generated form.</b> The generated form types the
 * value its blocks hook returns as that hook's own type intersected with this one, so a key the
 * kit gains after a blocks file was written stays optional for that file instead of failing its
 * typecheck. A key is added here and nowhere else.
 */
export interface CrudFormBlocks {
  readonly title?: string;
  readonly sections?: readonly RecordFormSection[];
  readonly notices?: readonly RecordNotice[];
  readonly submitLabel?: string;
  /** An explanation of what the form decides, drawn as the kit's note card under the fields. */
  readonly note?: string;
  /**
   * What the form says beside a field while it is filled in, from the values as they stand: a clash
   * with another record, a consequence of the value. Keyed by field; a field absent says nothing.
   */
  readonly fieldNotices?: (values: Readonly<Record<string, unknown>>) => Readonly<Record<string, string | undefined>>;
  /** The request from the form's values; on an edit the loaded record goes underneath it. */
  readonly toRequest?: (values: Readonly<Record<string, unknown>>, record?: Readonly<Record<string, unknown>>) => Record<string, unknown>;
}

/**
 * What a generated detail reads from its `detail.blocks.tsx`: every key is optional, and a record
 * states only the ones it departs in. Typed into the generated detail the same way
 * {@link CrudFormBlocks} is typed into the generated form.
 */
export interface CrudDetailBlocks {
  /** Tones for this record's enums and pickers for its references. */
  readonly contract?: ContractOverrides;
  readonly title?: string;
  readonly subtitle?: string;
  readonly status?: RecordBadge;
  readonly notices?: readonly RecordNotice[];
  readonly verbs?: readonly RecordVerb[];
  readonly actions?: readonly RecordVerb[];
  readonly defaultTab?: string;
  /** The tabs, or a function of the generated ones (the overview and a list per holder) that keeps, reorders or adds to them. */
  readonly tabs?: readonly RecordTab[] | ((generated: readonly RecordTab[]) => readonly RecordTab[]);
  readonly sections?: readonly RecordSection[];
  /**
   * An explanation of what the record is, drawn as the kit's note card under the fields: a record
   * without tabs carries it here, a tab carries its own in `note`.
   */
  readonly note?: string;
  /** Confirmations this record's own verbs open, rendered beside the detail. */
  readonly dialogs?: ReactNode;
}
