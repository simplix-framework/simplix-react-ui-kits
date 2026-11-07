import { useState } from "react";
import { useTranslation } from "@simplix-react/i18n/react";
import { Button, CrudDetail, DetailFieldWrapper, Dialog, DialogFooter, DialogHeader, DialogTitle, Flex, Stack, Stepline } from "@simplix-react/ui";

import { PACKAGE_NAMESPACE } from "../entity/locales";
import { RecordNote, RecordNotices, RecordVerbButton, type RecordNotice, type RecordVerb } from "../entity/record-blocks";
import type { RecordSection } from "../entity/record-detail";
import { RecordFormSections, refusalOf, useRecordFormValues, type RecordFormSection, type SubmitRefusal } from "../entity/record-form";
import { RecordValueView } from "../entity/record-value";
import { BoundedDialogContent } from "../layout/bounded-dialog-content";

/** One step of what the decision sets in motion. */
export interface ActionStep {
  readonly key: string;
  readonly label: string;
}

/** Props for {@link ActionDialog}. */
export interface ActionDialogProps {
  readonly title: string;
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  /** What the reader must know before deciding, loudest first. */
  readonly notices?: readonly RecordNotice[];
  /** What was asked: who, what, until when, why. */
  readonly sections?: readonly RecordSection[];
  /** What the decider sets. */
  readonly fields?: readonly RecordFormSection[];
  /** Where the request stands, with the step being decided now. */
  readonly steps?: { readonly items: readonly ActionStep[]; readonly current: string; readonly done?: readonly string[] };
  readonly note?: string;
  /** Verbs on the leading side: closing, refusing. */
  readonly leading?: readonly RecordVerb[];
  /** Verbs on the trailing side, the main one last. */
  readonly trailing?: readonly RecordVerb[];
  /**
   * The button that finishes the dialog, drawn last: it checks the required fields and hands the
   * entered values over, and the dialog closes when it returns.
   */
  /** The word on the button that closes without acting; the default is the common 「취소」, which a cancel command's own label would echo. */
  readonly closeLabel?: string;
  readonly submit?: {
    readonly label: string;
    readonly kind?: "primary" | "danger";
    /** Why the decision cannot be made yet, beyond an empty required field; drawn under the button. */
    readonly disabled?: string;
    /** The word on the button while a returned promise is pending; the default is the common 「처리하는 중」. */
    readonly runningLabel?: string;
    /**
     * Runs the decision. A returned promise holds the dialog open, with the button busy and nothing
     * able to close it, until it settles: it closes when the promise resolves, and when it rejects
     * the dialog stays with what the decider typed and says why the server refused. Returning
     * nothing closes the dialog at once, as before.
     */
    readonly onSubmit: (values: Readonly<Record<string, unknown>>) => void | Promise<unknown>;
  };
}

/** What {@link settleSubmit} tells its caller as the decision runs. */
export interface SubmitSettling {
  /** Called with true while a returned promise is pending and false once it settles. */
  readonly pending: (pending: boolean) => void;
  /** The decision went through: the dialog may close. */
  readonly done: () => void;
  /** The decision was refused, with whatever the rejection carried. */
  readonly refused: (error: unknown) => void;
}

/**
 * Follows a decision after it was run: a plain return is done at once; a promise is pending until
 * it settles, then done on success and refused on rejection.
 *
 * @param sent what the decision's `onSubmit` returned
 * @param on what to do as it moves
 */
export function settleSubmit(sent: void | Promise<unknown>, on: SubmitSettling): void {
  if (!sent || typeof (sent as Promise<unknown>).then !== "function") {
    on.done();
    return;
  }
  on.pending(true);
  (sent as Promise<unknown>).then(
    () => {
      on.pending(false);
      on.done();
    },
    (error: unknown) => {
      on.pending(false);
      on.refused(error);
    },
  );
}

/**
 * A decision on a request: what was asked, what the decider sets, where it stands, and the verbs
 * that refuse or grant it.
 *
 * <p>The foot always offers 「취소」 first, so leaving without deciding never means pressing the
 * main button. The main button is named by the command it runs (`submit.label`), and while a
 * required field is empty, or the caller gives a reason, it is drawn disabled with the reason under it.
 */
export function ActionDialog(props: ActionDialogProps) {
  // Held here, above the body that mounts with each opening, so the root's own ways of closing
  // (its close mark) are held too while a decision is on its way to the server.
  const [pending, setPending] = useState(false);
  return (
    <Dialog open={props.open} onOpenChange={(open) => (open || !pending ? props.onOpenChange(open) : undefined)}>
      {/* The body mounts with each opening, so the fields start from their initial values every time
          rather than holding what the last submit or cancel left in them. */}
      {props.open ? <ActionDialogBody {...props} pending={pending} setPending={setPending} /> : null}
    </Dialog>
  );
}

function ActionDialogBody({
  title,
  onOpenChange,
  notices,
  sections,
  fields = [],
  steps,
  note,
  leading = [],
  trailing = [],
  submit,
  closeLabel,
  pending,
  setPending,
}: ActionDialogProps & { readonly pending: boolean; readonly setPending: (pending: boolean) => void }) {
  const { t } = useTranslation(`${PACKAGE_NAMESPACE}/features`);
  const { t: tUi } = useTranslation("simplix/ui");
  const form = useRecordFormValues(fields);
  const [refusal, setRefusal] = useState<SubmitRefusal | undefined>(undefined);
  const blocked = submit?.disabled ?? (form.missing.length > 0 ? t("recordForm.fillBeforeSubmit", { count: form.missing.length }) : undefined);
  return (
      <BoundedDialogContent
        width="lg"
        // A decision on its way to the server is not abandoned by a stray press or the Escape key.
        onEscapeKeyDown={(event) => pending && event.preventDefault()}
        onInteractOutside={(event) => pending && event.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <Stack gap="sm">
          <RecordNotices notices={refusal ? [{ key: "submit-refused", tone: "danger", title: t("recordForm.refused"), body: refusal.message }, ...(notices ?? [])] : notices} />
          {sections?.map((section) => (
            <CrudDetail.Section key={section.key} title={section.title} variant="flat" layout="two-column">
              {section.fields.map((field) => (
                <DetailFieldWrapper key={field.label} label={field.label} layout="inline" className={field.wide ? "col-span-full" : undefined}>
                  <RecordValueView value={field.value} />
                </DetailFieldWrapper>
              ))}
            </CrudDetail.Section>
          ))}
          {fields.length > 0 ? <RecordFormSections sections={fields} form={form} flat refusal={refusal} /> : null}
          {steps ? <Stepline items={steps.items.map((step) => ({ key: step.key, label: step.label }))} current={steps.current} completedKeys={steps.done ? [...steps.done] : undefined} /> : null}
          <RecordNote text={note} />
        </Stack>
        <DialogFooter>
          <Flex gap="sm" justify="between" className="w-full">
            <Flex gap="sm" align="start">
              <Button size="sm" variant="outline" disabled={pending} onClick={() => onOpenChange(false)}>
                {closeLabel ?? tUi("common.cancel")}
              </Button>
              {leading.map((verb) => (
                <RecordVerbButton key={verb.label} verb={verb} />
              ))}
            </Flex>
            <Flex gap="sm" align="start">
              {trailing.map((verb) => (
                <RecordVerbButton key={verb.label} verb={verb} />
              ))}
              {submit ? (
                <RecordVerbButton
                  verb={{
                    label: submit.label,
                    kind: submit.kind === "danger" ? "danger" : "primary",
                    disabled: blocked,
                    pending: pending ? (submit.runningLabel ?? t("actionDialog.running")) : undefined,
                    onClick: () => {
                      setRefusal(undefined);
                      settleSubmit(submit.onSubmit(form.values), {
                        pending: setPending,
                        done: () => onOpenChange(false),
                        // The typed reason stays in the form, which this dialog still holds.
                        refused: (error) => setRefusal(refusalOf(error, fields.flatMap((section) => section.fields.map((field) => field.key)))),
                      });
                    },
                  }}
                />
              ) : null}
            </Flex>
          </Flex>
        </DialogFooter>
      </BoundedDialogContent>
  );
}
