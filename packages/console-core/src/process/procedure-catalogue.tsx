import { ProcessLanes, type ProcessLanesProps } from "@simplix-react/process";
import { Button, Dialog, DialogHeader, DialogTitle, EmptyState, Flex, Stack } from "@simplix-react/ui";
import { partAttributes, slotAttributes } from "@simplix-react/ui/design";

import { RecordVerbButton } from "../entity/record-blocks";
import { BoundedDialogContent } from "../layout/bounded-dialog-content";
import { WHOLE_VIEW_METRICS } from "./whole-view";
import { procedureChoicesStyle, procedureHeadStyle, procedureNameStyle, procedureNoteStyle } from "./procedure-catalogue.style";

/** One procedure a reader can choose. */
export interface ProcedureChoice {
  readonly key: string;
  /** The name of the work the procedure carries. */
  readonly label: string;
  /** How a piece of that work starts, in the reader's words. */
  readonly note?: string;
}

/** Props for {@link ProcedureCatalogue}. */
export interface ProcedureCatalogueProps {
  /** What the row of choices is, said to assistive technology. */
  readonly label: string;
  readonly procedures: readonly ProcedureChoice[];
  /** The chosen procedure's key. */
  readonly selected?: string;
  readonly onSelect: (key: string) => void;
  /** The chosen procedure, as the lanes draw it. */
  readonly procedure?: Pick<ProcessLanesProps, "definition" | "facts" | "highlightLanes">;
  /** The way to start a piece of the chosen work; left out where the catalogue is only read. */
  readonly start?: { readonly label: string; readonly onStart: () => void; readonly disabled?: string };
  /** What stands under the choices while none is chosen. */
  readonly empty: { readonly title: string; readonly description?: string };
}

/**
 * Every procedure of a product, one at a time: a row of the procedures to choose from, and under
 * it the chosen one drawn whole, as lanes. The same part is the question a reader answers before
 * starting a piece of work: with `start`, the chosen procedure carries the button that starts it,
 * so the reader sees every step and who takes it before anything is made.
 */
export function ProcedureCatalogue({ label, procedures, selected, onSelect, procedure, start, empty }: ProcedureCatalogueProps) {
  const chosen = procedures.find((one) => one.key === selected);
  return (
    <Stack gap="none" className="min-h-0 flex-1" data-procedure-catalogue>
      <Flex wrap role="group" aria-label={label} {...partAttributes(procedureChoicesStyle, {})}>
        {procedures.map((one) => (
          <Button key={one.key} size="sm" variant={one.key === selected ? "primary" : "outline"} aria-pressed={one.key === selected} onClick={() => onSelect(one.key)} data-procedure-choice={one.key}>
            {one.label}
          </Button>
        ))}
      </Flex>
      {chosen && procedure ? (
        <>
          <Flex align="center" justify="between" wrap {...partAttributes(procedureHeadStyle, {})}>
            <Stack gap="none" className="min-w-0">
              <span {...slotAttributes(procedureNameStyle, {})}>{chosen.label}</span>
              {chosen.note ? <span {...slotAttributes(procedureNoteStyle, {})}>{chosen.note}</span> : null}
            </Stack>
            {start ? <RecordVerbButton verb={{ label: start.label, onClick: start.onStart, kind: "primary", disabled: start.disabled }} /> : null}
          </Flex>
          {/* The lanes scroll inside their own box, so the row of lane names stays in sight. */}
          <Stack gap="none" className="min-h-0 flex-1 overflow-hidden">
            <ProcessLanes key={chosen.key} {...procedure} layout="lanes" metrics={WHOLE_VIEW_METRICS} scrollToActive={false} className="h-full" />
          </Stack>
        </>
      ) : (
        <EmptyState size="sm" title={empty.title} description={empty.description} />
      )}
    </Stack>
  );
}

/** Props for {@link ProcedureDialog}. */
export interface ProcedureDialogProps extends ProcedureCatalogueProps {
  /** What the dialog is for: reading the procedures, or starting a piece of work. */
  readonly title: string;
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
}

/**
 * The catalogue of procedures in a dialog as large as the window, opened over the screen the
 * reader is on: to read how a kind of work goes, or to choose the work to start and see all of
 * it first.
 */
export function ProcedureDialog({ title, open, onOpenChange, ...catalogue }: ProcedureDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <BoundedDialogContent width="window" className="h-dvh" data-procedure-dialog>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        {/* The dialog itself never scrolls: the catalogue fills it and only the lanes scroll, in their own box. */}
        <Stack gap="none" className="min-h-0 min-w-0 flex-1 overflow-hidden">
          <ProcedureCatalogue {...catalogue} />
        </Stack>
      </BoundedDialogContent>
    </Dialog>
  );
}
