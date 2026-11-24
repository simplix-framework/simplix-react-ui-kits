import type { RecordVerb } from "./record-blocks";
import type { StageCondition, StageGateProps } from "./stage-gate";
import type { StageConditionState } from "./stage-gate-verdict";

/** One command of a record as a server answers it: what it is called, and why it cannot run now. */
export interface CommandAnswer {
  /** What the screen passes back to run it; left out for an entry that only names what comes later. */
  readonly ref?: string;
  readonly label: string;
  readonly kind: "primary" | "plain" | "danger";
  /** The reason it cannot run; set, the button is drawn disabled with this reason. */
  readonly disabled?: string;
}

/**
 * The verbs of a record from the commands a server answered with.
 *
 * <p>The screen decides nothing here: whether a command may run and why not are in the answer, and
 * the screen adds only what pressing does.
 *
 * @param commands the commands, in the order the server gave them
 * @param press runs a command by the `ref` its answer carries
 */
export function verbsFromCommands(commands: readonly CommandAnswer[], press: (ref: string) => void): RecordVerb[] {
  return commands.map((command) => {
    const ref = command.ref;
    return { label: command.label, kind: command.kind, ...(command.disabled !== undefined ? { disabled: command.disabled } : {}), ...(ref !== undefined ? { onClick: () => press(ref) } : {}) };
  });
}

/** The gate of a command as a server answers it: the command's name and where each precondition stands. */
export interface StageGateAnswer {
  readonly label: string;
  readonly conditions: readonly { readonly key: string; readonly label: string; readonly state: StageConditionState; readonly detail?: string }[];
}

const CONDITION_ORDER: Readonly<Record<StageConditionState, number>> = { unmet: 0, held: 1, met: 2 };

/**
 * The props of a {@link StageGate} from the gate a server answered with: what is still to do reads
 * first, then what waits on a judgment, then what is met.
 *
 * @param answer the gate, or undefined where the record has no such command
 * @param onRun runs the command
 * @param goTo the way to where an unmet condition is filled, by the condition's label
 * @returns the props, or undefined where there is no gate to draw
 */
export function stageGateFromAnswer(
  answer: StageGateAnswer | undefined,
  onRun: () => void,
  goTo?: (condition: string) => StageCondition["go"],
): StageGateProps | undefined {
  if (!answer) return undefined;
  const conditions = answer.conditions.map((condition): StageCondition => {
    const go = condition.state === "unmet" ? goTo?.(condition.label) : undefined;
    return { ...condition, ...(go ? { go } : {}) };
  });
  return { command: { label: answer.label, onRun }, conditions: [...conditions].sort((a, b) => CONDITION_ORDER[a.state] - CONDITION_ORDER[b.state]) };
}
