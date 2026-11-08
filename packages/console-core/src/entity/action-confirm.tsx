import { useCallback, useEffect, useReducer, useRef } from "react";
import { getErrorMessage, getValidationErrors } from "@simplix-react/api";
import { useTranslation } from "@simplix-react/i18n/react";
import { ConfirmDialog } from "@simplix-react/ui";

import { PACKAGE_NAMESPACE } from "./locales";

/**
 * A sentence the dialog draws, either fixed or written from the record it is about.
 *
 * <p><b>A confirmation that names the record needs the function form.</b> A translated string
 * carrying `{{name}}` has nowhere to read the name from when it is resolved beside the other
 * labels, so it reaches the reader with the braces still in it, and nothing reports that, because
 * a translator returning its input unchanged is how a missing key already looks.
 */
export type ConfirmSentence<T> = string | ((target: T) => string);

/** What a screen tells this hook about the verb it is guarding. */
export interface ActionConfirmConfig<T> {
  /** The question, in the reader's language: 「이 발송을 다시 보냅니다」. */
  readonly title: ConfirmSentence<T>;
  /** What happens if they say yes, and what it costs. */
  readonly description: ConfirmSentence<T>;
  /**
   * The word on the button that does it: 「다시 보내기」, never 「확인」. A verb that flips with the
   * record (suspend and lift, revoke and reinstate) words the button from the record the question is
   * about, so one confirmation serves both directions.
   */
  readonly confirmLabel: ConfirmSentence<T>;
  /** The word while it is running; a function reads the same record as {@link confirmLabel}. */
  readonly runningLabel: ConfirmSentence<T>;
  /** The word on the way out. */
  readonly cancelLabel: string;
  /**
   * What the verb does, once somebody has said yes.
   *
   * <p><b>Return the run's promise.</b> The dialog stays open on the running label until it
   * settles. When the promise resolves the dialog closes; when it rejects (the server refused the
   * verb) the dialog stays open and says why, and pressing the button again tries again, so a
   * refusal is read where the reader is looking and not in a toast that has gone by the time they
   * look. A verb that catches its own failure and resolves is a success to the dialog, so it lets
   * the rejection through. A verb that returns nothing is followed through {@link running} instead.
   */
  readonly onConfirm: (target: T) => void | PromiseLike<unknown>;
  /**
   * Whether the verb is running now. While it is, the dialog stays open on {@link runningLabel} and
   * refuses a second press; the press after which it reads false again closes the dialog.
   */
  readonly running?: boolean;
  /**
   * Draws the button in the danger tone, for a verb that deletes or takes a record out of use. A
   * function decides from the record, for a verb whose one direction takes it out of use and whose
   * other brings it back.
   */
  readonly destructive?: boolean | ((target: T) => boolean);
}

/** Resolves a sentence against the record the question is about; no record held, no sentence. */
export function confirmSentence<T>(sentence: ConfirmSentence<T>, target: T | null): string {
  return typeof sentence === "function" ? (target === null ? "" : sentence(target)) : sentence;
}

/** Resolves whether the confirm button is drawn in the danger tone for the record held. */
export function confirmDestructive<T>(destructive: ActionConfirmConfig<T>["destructive"], target: T | null): boolean {
  return typeof destructive === "function" ? target !== null && destructive(target) : (destructive ?? false);
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
 * sweep of this console found eight (two resends, a selected resend, two test sends, a call test, a
 * settings save and 모두 읽음), and not one of them was carelessness. There was nothing to copy.
 *
 * <p><b>So this is a wrapper rather than a dialog.</b> {@link ConfirmDialog} is already the
 * framework's general confirmation (drawn in its alert panel, so a long description scrolls and the
 * footer stays reachable at any window height), and the notification centre already asks through it
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
 * undo it, which no annotation carries: `writeActionsAskFirst` in the project's gates names the
 * sites and a person judges each. A verb that must happen at once says so on the line instead.
 *
 * @param config the question, the words, and what to do with the answer
 * @returns the press handler and the dialog to render
 */
export function useActionConfirm<T>(config: ActionConfirmConfig<T>): ActionConfirm<T> {
  const { title, description, confirmLabel, runningLabel, cancelLabel, onConfirm, running, destructive } = config;
  const { t } = useTranslation(`${PACKAGE_NAMESPACE}/features`);
  // The target lives here rather than in the caller because every one of the eight sites would
  // otherwise hold the same piece of state, and a screen guarding two verbs would hold it twice
  // under two names.
  const [state, dispatch] = useReducer(confirmStep<T>, IDLE as ConfirmState<T>);
  // The answer is read synchronously as well, so two presses landing before the next render still
  // run the verb once.
  const sent = useRef(false);
  sent.current = state.phase !== "asking";

  const request = useCallback((next: T) => dispatch({ type: "request", target: next }), []);

  const answer = useCallback(() => {
    const chosen = state.target;
    if (chosen === null || sent.current) return;
    sent.current = true;
    const outcome = onConfirm(chosen);
    if (isThenable(outcome)) {
      dispatch({ type: "sent", follows: "promise" });
      outcome.then(
        () => dispatch({ type: "settled" }),
        (error: unknown) => dispatch({ type: "refused", message: refusalSentence(error) }),
      );
    } else {
      dispatch({ type: "sent", follows: running === undefined ? "nothing" : "running", running });
    }
  }, [onConfirm, running, state.target]);

  useEffect(() => {
    if (running !== undefined) dispatch({ type: "running", running });
  }, [running]);

  // Written from the target rather than beside the labels, so a sentence naming the record has the
  // record to name. Resolved only while one is held: the dialog is closed otherwise and the
  // sentence has nothing to be about.
  const target = state.target;
  const say = (sentence: ConfirmSentence<T>) => confirmSentence(sentence, target);

  const dialog = (
    <ConfirmDialog
      open={target !== null}
      onOpenChange={(open: boolean) => {
        if (!open) dispatch({ type: "dismiss" });
      }}
      onConfirm={answer}
      title={say(title)}
      description={refusedDescription(say(description), state.phase === "asking" ? state.refusal : undefined, t("actionDialog.refused"))}
      cancelLabel={cancelLabel}
      confirmLabel={say(confirmLabel)}
      pendingLabel={say(runningLabel)}
      isPending={confirmBusy(state, running)}
      destructive={confirmDestructive(destructive, target)}
    />
  );

  return { request, dialog };
}

/**
 * What the server said when it refused a verb, as one sentence: the messages it gave for the
 * fields it named, or its own message.
 *
 * @param error what the verb's promise rejected with
 * @returns the sentence the dialog shows
 */
export function refusalSentence(error: unknown): string {
  const named = (getValidationErrors(error) ?? []).map((one) => one.message).filter((message) => message.length > 0);
  return named.length > 0 ? named.join(" ") : getErrorMessage(error);
}

/**
 * The description the dialog draws: the question's own, and while the server's refusal of the last
 * press stands, the refusal first, so the reader meets why nothing happened before the question again.
 *
 * @param sentence what the verb says it does
 * @param refusal the server's sentence, while a refusal stands
 * @param lead the words that say the server refused
 */
export function refusedDescription(sentence: string, refusal: string | undefined, lead: string): string {
  return refusal === undefined ? sentence : [lead, refusal, sentence].filter((part) => part.length > 0).join(" ");
}

/**
 * Where a confirmation stands: asking (open with a record, or closed with none), or sent and
 * waiting for the verb to settle by one of three signs. An asking dialog that holds a refusal is the
 * one whose verb rejected: it is open on the same record, ready for another press.
 */
export type ConfirmState<T> =
  | { readonly phase: "asking"; readonly target: T | null; readonly refusal?: string }
  | { readonly phase: "waiting"; readonly target: T; readonly follows: "promise" | "running"; readonly started: boolean };

/** What moves a confirmation. */
export type ConfirmEvent<T> =
  | { readonly type: "request"; readonly target: T }
  | { readonly type: "sent"; readonly follows: "promise" | "running" | "nothing"; readonly running?: boolean }
  | { readonly type: "running"; readonly running: boolean }
  | { readonly type: "settled" }
  | { readonly type: "refused"; readonly message: string }
  | { readonly type: "dismiss" };

const IDLE: ConfirmState<never> = { phase: "asking", target: null };

/**
 * The step a confirmation takes on one event.
 *
 * <p><b>Sent, it stays open until the verb settles.</b> A promise settles it; a verb followed by
 * `running` settles on the first `false` after a `true`, because a mutation reports itself running
 * on the tick after the press and the `false` read in between is not the end of it. A verb with
 * neither has nothing to wait for and closes at once. A promise that resolves closes it; one that
 * rejects returns it to asking on the same record with the refusal held, and the dialog stays open
 * for another press or a dismissal. A verb followed by `running` has no failure to read, so it closes
 * on success and failure alike and the verb's own toast says which it was.
 *
 * <p><b>While it waits, nothing else lands.</b> A second press, a request for another record and
 * the Escape key are refused, so the reader sees the running label until the answer is in. The one
 * exception is a verb followed by `running` that has not yet reported itself running: Escape still
 * closes it, since such a verb may refuse before it starts and would otherwise hold the dialog.
 */
export function confirmStep<T>(state: ConfirmState<T>, event: ConfirmEvent<T>): ConfirmState<T> {
  switch (event.type) {
    case "request":
      return state.phase === "asking" ? { phase: "asking", target: event.target } : state;
    case "sent":
      if (state.phase !== "asking" || state.target === null) return state;
      return event.follows === "nothing" ? IDLE : { phase: "waiting", target: state.target, follows: event.follows, started: event.follows === "running" && event.running === true };
    case "running":
      if (state.phase !== "waiting" || state.follows !== "running") return state;
      if (event.running) return state.started ? state : { ...state, started: true };
      return state.started ? IDLE : state;
    case "settled":
      return state.phase === "waiting" && state.follows === "promise" ? IDLE : state;
    case "refused":
      return state.phase === "waiting" && state.follows === "promise" ? { phase: "asking", target: state.target, refusal: event.message } : state;
    case "dismiss":
      // A verb followed by `running` that has not reported itself running may never start (it can
      // refuse before calling anything), so the way out stays open until it does.
      return state.phase === "asking" || (state.follows === "running" && !state.started) ? IDLE : state;
  }
}

/** Whether the dialog draws its running label and refuses a press. */
export function confirmBusy<T>(state: ConfirmState<T>, running: boolean | undefined): boolean {
  return state.phase === "waiting" || (state.target !== null && running === true);
}

function isThenable(value: unknown): value is PromiseLike<unknown> {
  return typeof value === "object" && value !== null && typeof (value as { then?: unknown }).then === "function";
}
