import { CrudDetail, DetailFieldWrapper, Dialog, DialogFooter, DialogHeader, DialogTitle, Flex, Stack, Stepline } from "@simplix-react/ui";

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
}

/**
 * A decision on a request: what was asked, what the decider sets, where it stands, and the verbs
 * that refuse or grant it.
 */
export function ActionDialog({ title, open, onOpenChange, notices, sections, fields = [], steps, note, leading = [], trailing = [] }: ActionDialogProps) {
  const form = useRecordFormValues(fields);
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
          {fields.length > 0 ? <RecordFormSections sections={fields} form={form} /> : null}
          {steps ? <Stepline items={steps.items.map((step) => ({ key: step.key, label: step.label }))} current={steps.current} completedKeys={steps.done ? [...steps.done] : undefined} /> : null}
          <RecordNote text={note} />
        </Stack>
        <DialogFooter>
          <Flex gap="xs" justify="between" className="w-full">
            <Flex gap="xs">
              {leading.map((verb) => (
                <RecordVerbButton key={verb.label} verb={verb} />
              ))}
            </Flex>
            <Flex gap="xs">
              {trailing.map((verb) => (
                <RecordVerbButton key={verb.label} verb={verb} />
              ))}
            </Flex>
          </Flex>
        </DialogFooter>
      </BoundedDialogContent>
    </Dialog>
  );
}
