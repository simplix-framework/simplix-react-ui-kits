import { useTranslation } from "@simplix-react/i18n/react";
import { Button, CrudDetail, DetailFieldWrapper, Dialog, DialogFooter, DialogHeader, DialogTitle, Flex, Stack, Stepline } from "@simplix-react/ui";

import { PACKAGE_NAMESPACE } from "../entity/locales";
import { RecordNote, RecordNotices, RecordVerbButton, type RecordNotice, type RecordVerb } from "../entity/record-blocks";
import type { RecordSection } from "../entity/record-detail";
import { RecordFormSections, useRecordFormValues, type RecordFormSection } from "../entity/record-form";
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
    readonly onSubmit: (values: Readonly<Record<string, unknown>>) => void;
  };
}

/**
 * A decision on a request: what was asked, what the decider sets, where it stands, and the verbs
 * that refuse or grant it.
 *
 * <p>The foot always offers 「취소」 first, so leaving without deciding never means pressing the
 * main button. The main button is named by the command it runs (`submit.label`), and while a
 * required field is empty, or the caller gives a reason, it is drawn disabled with the reason under it.
 */
export function ActionDialog({ title, open, onOpenChange, notices, sections, fields = [], steps, note, leading = [], trailing = [], submit, closeLabel }: ActionDialogProps) {
  const { t } = useTranslation(`${PACKAGE_NAMESPACE}/features`);
  const { t: tUi } = useTranslation("simplix/ui");
  const form = useRecordFormValues(fields);
  const blocked = submit?.disabled ?? (form.missing.length > 0 ? t("recordForm.fillBeforeSubmit", { count: form.missing.length }) : undefined);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <BoundedDialogContent width="lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <Stack gap="sm">
          <RecordNotices notices={notices} />
          {sections?.map((section) => (
            <CrudDetail.Section key={section.key} title={section.title} variant="flat" layout="two-column">
              {section.fields.map((field) => (
                <DetailFieldWrapper key={field.label} label={field.label} layout="inline" className={field.wide ? "col-span-full" : undefined}>
                  <RecordValueView value={field.value} />
                </DetailFieldWrapper>
              ))}
            </CrudDetail.Section>
          ))}
          {fields.length > 0 ? <RecordFormSections sections={fields} form={form} flat /> : null}
          {steps ? <Stepline items={steps.items.map((step) => ({ key: step.key, label: step.label }))} current={steps.current} completedKeys={steps.done ? [...steps.done] : undefined} /> : null}
          <RecordNote text={note} />
        </Stack>
        <DialogFooter>
          <Flex gap="sm" justify="between" className="w-full">
            <Flex gap="sm" align="start">
              <Button size="sm" variant="outline" onClick={() => onOpenChange(false)}>
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
                    onClick: () => {
                      submit.onSubmit(form.values);
                      onOpenChange(false);
                    },
                  }}
                />
              ) : null}
            </Flex>
          </Flex>
        </DialogFooter>
      </BoundedDialogContent>
    </Dialog>
  );
}
