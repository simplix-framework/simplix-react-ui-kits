import { useCallback, useState } from "react";
import { ConfirmDialog } from "@simplix-react/ui";

/**
 * A sentence the dialog draws, either fixed or written from the record it is about.
 *
 * <p><b>A confirmation that names the record needs the function form.</b> A translated string
 * carrying `{{name}}` has nowhere to read the name from when it is resolved beside the other
 * labels, so it reaches the reader with the braces still in it — and nothing reports that, because
 * a translator returning its input unchanged is how a missing key already looks.
 */
export type ConfirmSentence<T> = string | ((target: T) => string);

/** What a screen tells this hook about the verb it is guarding. */
export interface ActionConfirmConfig<T> {
  /** The question, in the reader's language — 「이 발송을 다시 보냅니다」. */
  readonly title: ConfirmSentence<T>;
  /** What happens if they say yes, and what it costs. */
  readonly description: ConfirmSentence<T>;
  /** The word on the button that does it — 「다시 보내기」, never 「확인」. */
  readonly confirmLabel: string;
  /** The word while it is running. */
  readonly runningLabel: string;
  /** The word on the way out. */
  readonly cancelLabel: string;
  /** What the verb does, once somebody has said yes. */
  readonly onConfirm: (target: T) => void;
  /** Whether it is running now, so the dialog can say so and refuse a second press. */
  readonly running?: boolean;
}

/** What the screen wires: one function for the press, one node to render. */
export interface ActionConfirm<T> {
  /** Put this on the row action or the panel verb. It opens the question. */
  readonly request: (target: T) => void;
  /** Render this once, anywhere in the page. */
  readonly dialog: React.ReactNode;
}

/**
 * A confirmation in front of a verb that writes something nothing takes back.
 *
 * <p><b>The framework wires one of these for delete and for nothing else.</b> `useCrudDeleteWired`
 * exists, so a delete that forgot to ask is caught by its own absence; every other irreversible verb
 * has no shape to clone, and each screen ends up calling `.mutate()` straight from a row action. A
 * sweep of this console found eight — two resends, a selected resend, two test sends, a call test, a
 * settings save and 모두 읽음 — and not one of them was carelessness. There was nothing to copy.
 *
 * <p><b>So this is a wrapper rather than a dialog.</b> {@link ConfirmDialog} is already the
 * framework's general confirmation — drawn in its alert panel, so a long description scrolls and the
 * footer stays reachable at any window height — and the notification centre already asks through it
 * before marking one post read. What was missing was not a dialog but the hook that holds the target
 * between the press and the answer, which is the piece every one of the eight sites would otherwise
 * write again. Building a second dialog would have put two confirmation shapes in one console that
 * drift apart on padding and button order.
 *
 * <p><b>Not the delete dialog.</b> {@code CrudDelete} takes the same labels and is the wrong base:
 * it is the one shape a reader has learned means 「this record is going away」, and borrowing it for a
 * resend would say that about a message being sent again.
 *
 * <p><b>The labels are the caller's and there are no defaults.</b> A confirmation whose button says
 * 「확인」 asks the reader to remember what they pressed; one that says 「다시 보내기」 answers the
 * question it is asking. Making them required is what stops the next screen shipping 「확인」.
 *
 * <p><b>What this does not decide is whether a verb needs one.</b> That is whether the product can
 * undo it, which no annotation carries — `writeActionsAskFirst` in the project's gates names the
 * sites and a person judges each. A verb that must happen at once says so on the line instead.
 *
 * @param config the question, the words, and what to do with the answer
 * @returns the press handler and the dialog to render
 */
export function useActionConfirm<T>(config: ActionConfirmConfig<T>): ActionConfirm<T> {
  const { title, description, confirmLabel, runningLabel, cancelLabel, onConfirm, running } = config;
  // The target lives here rather than in the caller because every one of the eight sites would
  // otherwise hold the same piece of state, and a screen guarding two verbs would hold it twice
  // under two names.
  const [target, setTarget] = useState<T | null>(null);

  const request = useCallback((next: T) => setTarget(next), []);

  const answer = useCallback(() => {
    // Read before clearing: the dialog closes on the same tick, and a handler that read the state
    // afterwards would fire the verb against null on every second press.
    const chosen = target;
    setTarget(null);
    if (chosen !== null) onConfirm(chosen);
  }, [onConfirm, target]);

  // Written from the target rather than beside the labels, so a sentence naming the record has the
  // record to name. Resolved only while one is held: the dialog is closed otherwise and the
  // sentence has nothing to be about.
  const say = (sentence: ConfirmSentence<T>) =>
    typeof sentence === "function" ? (target === null ? "" : sentence(target)) : sentence;

  const dialog = (
    <ConfirmDialog
      open={target !== null}
      onOpenChange={(open: boolean) => {
        if (!open) setTarget(null);
      }}
      onConfirm={answer}
      title={say(title)}
      description={say(description)}
      cancelLabel={cancelLabel}
      confirmLabel={confirmLabel}
      pendingLabel={runningLabel}
      isPending={running}
    />
  );

  return { request, dialog };
}
