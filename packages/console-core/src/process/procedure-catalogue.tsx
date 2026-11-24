import { ProcessLanes, type ProcessLanesProps } from "@simplix-react/process";
import { useState } from "react";

import { Button, Dialog, DialogHeader, DialogTitle, EmptyState, Flex, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Stack } from "@simplix-react/ui";
import { partAttributes, slotAttributes } from "@simplix-react/ui/design";

import { RecordVerbButton } from "../entity/record-blocks";
import { BoundedDialogContent } from "../layout/bounded-dialog-content";
import { WHOLE_VIEW_METRICS } from "./whole-view";
import { procedureChoicesLabelStyle, procedureChoicesStyle, procedureHeadStyle, procedureNameStyle, procedureNoteStyle } from "./procedure-catalogue.style";

/** One procedure a reader can choose. */
export interface ProcedureChoice {
  readonly key: string;
  /** The name of the work the procedure carries. */
  readonly label: string;
  /** How a piece of that work starts, in the reader's words. */
  readonly note?: string;
  /** The kind of work the procedure belongs to, in the reader's words. Where the procedures carry one, they are chosen in two steps. */
  readonly group?: string;
}

/** Props for {@link ProcedureChoices}. */
export interface ProcedureChoicesProps {
  /** What the row of choices is, said to assistive technology. */
  readonly label: string;
  readonly procedures: readonly ProcedureChoice[];
  /** The chosen procedure's key. */
  readonly selected?: string;
  readonly onSelect: (key: string) => void;
  /** What the row of kinds of work is, said to assistive technology and beside it. Left out, the row carries no words of its own. */
  readonly groupLabel?: string;
}

/**
 * The procedures of a product to choose one from. Where they carry a kind of work (`group`), the
 * reader chooses in two steps, each a row of buttons: the kind, then a procedure of that kind, so
 * every choice is in sight and none needs a list opened. Without kinds it is one select, so a
 * product with many procedures keeps the room under it for the chosen procedure's drawing.
 */
export function ProcedureChoices({ label, procedures, selected, onSelect, groupLabel }: ProcedureChoicesProps) {
  const groups = [...new Set(procedures.map((one) => one.group).filter((group): group is string => group !== undefined))];
  const chosen = procedures.find((one) => one.key === selected);
  // The kind the reader last picked; until then, the kind of the chosen procedure, or the first.
  const [picked, setPicked] = useState<string | undefined>(undefined);
  if (groups.length > 0) {
    const group = picked !== undefined && groups.includes(picked) ? picked : (chosen?.group ?? groups[0]);
    return (
      <Stack {...partAttributes(procedureChoicesStyle, {})}>
        <Flex align="center" wrap gap="xs" role="group" aria-label={groupLabel ?? label} data-procedure-groups>
          {groupLabel ? <span {...slotAttributes(procedureChoicesLabelStyle, {})}>{groupLabel}</span> : null}
          {groups.map((one) => (
            <Button key={one} type="button" size="sm" variant={one === group ? "secondary" : "outline"} aria-pressed={one === group} data-procedure-group={one} onClick={() => setPicked(one)}>
              {one}
            </Button>
          ))}
        </Flex>
        <Flex align="center" wrap gap="xs" role="group" aria-label={label} data-procedure-choices>
          <span {...slotAttributes(procedureChoicesLabelStyle, {})}>{label}</span>
          {procedures
            .filter((one) => one.group === group)
            .map((one) => (
              <Button key={one.key} type="button" size="sm" variant={one.key === selected ? "secondary" : "outline"} aria-pressed={one.key === selected} data-procedure-choice={one.key} onClick={() => onSelect(one.key)}>
                {one.label}
              </Button>
            ))}
        </Flex>
      </Stack>
    );
  }
  return (
    <Flex align="center" {...partAttributes(procedureChoicesStyle, {})}>
      <span {...slotAttributes(procedureChoicesLabelStyle, {})}>{label}</span>
      <Select value={selected ?? ""} onValueChange={onSelect}>
        <SelectTrigger size="sm" className="w-72" aria-label={label} data-procedure-choices>
          <SelectValue placeholder={label} />
        </SelectTrigger>
        <SelectContent>
          {procedures.map((one) => (
            <SelectItem key={one.key} value={one.key} data-procedure-choice={one.key}>
              {one.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </Flex>
  );
}

/** Props for {@link ProcedureCatalogue}. */
export interface ProcedureCatalogueProps {
  /** What the row of choices is, said to assistive technology. */
  readonly label: string;
  readonly procedures: readonly ProcedureChoice[];
  /** The chosen procedure's key. */
  readonly selected?: string;
  readonly onSelect: (key: string) => void;
  /** What the row of kinds of work is, where the procedures carry a kind. */
  readonly groupLabel?: string;
  /** The chosen procedure, as the lanes draw it. */
  readonly procedure?: Pick<ProcessLanesProps, "definition" | "facts" | "highlightLanes">;
  /** The way to start a piece of the chosen work; left out where the catalogue is only read. */
  readonly start?: { readonly label: string; readonly onStart: () => void; readonly disabled?: string };
  /** What stands under the choices while none is chosen. */
  readonly empty: { readonly title: string; readonly description?: string };
}

/**
 * Every procedure of a product, one at a time: the procedures to choose from, and under
 * it the chosen one drawn whole, as lanes. The same part is the question a reader answers before
 * starting a piece of work: with `start`, the chosen procedure carries the button that starts it,
 * so the reader sees every step and who takes it before anything is made.
 */
export function ProcedureCatalogue({ label, procedures, selected, onSelect, groupLabel, procedure, start, empty }: ProcedureCatalogueProps) {
  const chosen = procedures.find((one) => one.key === selected);
  return (
    <Stack gap="none" className="min-h-0 flex-1" data-procedure-catalogue>
      <ProcedureChoices label={label} procedures={procedures} selected={selected} onSelect={onSelect} groupLabel={groupLabel} />
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
