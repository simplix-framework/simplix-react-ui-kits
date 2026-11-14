import { ProcessLanes, type ProcessLanesProps } from "@simplix-react/process";
import { Button, Flex, Stack } from "@simplix-react/ui";

import { WorkTurnCard, type WorkTurn } from "./work-turn";

/** The procedure a piece of work follows and how far it has come, as {@link ProcessLanes} reads them. */
export type WorkProcedure = Pick<ProcessLanesProps, "definition" | "facts" | "run" | "highlightLanes" | "selected" | "onSelect" | "renderDetail">;

/** Props for {@link WorkProgress}. */
export interface WorkProgressProps {
  readonly turn: WorkTurn;
  readonly procedure: WorkProcedure;
  /** Opens the whole piece of work this record belongs to. */
  readonly onOpenWork?: () => void;
  /** The label of the button that opens the work. */
  readonly openWorkLabel?: string;
}

/**
 * Where a record stands in the work it belongs to, for the record's own detail: whose turn it is
 * and the steps of the procedure in one column, with the way to the whole work.
 */
export function WorkProgress({ turn, procedure, onOpenWork, openWorkLabel }: WorkProgressProps) {
  return (
    <Stack gap="md" data-work-progress>
      <WorkTurnCard turn={turn} />
      {onOpenWork && openWorkLabel ? (
        <Flex justify="end">
          <Button size="sm" variant="outline" onClick={onOpenWork}>
            {openWorkLabel}
          </Button>
        </Flex>
      ) : null}
      <ProcessLanes {...procedure} layout="stack" scrollToActive={false} />
    </Stack>
  );
}
