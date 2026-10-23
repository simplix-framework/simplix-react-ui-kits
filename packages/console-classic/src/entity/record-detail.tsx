import type { ReactNode } from "react";
import { Button, CrudDetail, DetailFieldWrapper, DetailFields, Heading } from "@simplix-react/ui";

/** One labelled value of a {@link RecordDetail} section. */
export interface RecordField {
  readonly label: string;
  /** Text, or a node for a value that is more than text (a badge, a link). */
  readonly value: ReactNode;
}

/** One section of a {@link RecordDetail}. */
export interface RecordSection {
  readonly key: string;
  readonly title: string;
  readonly fields: readonly RecordField[];
}

/** Props for {@link RecordDetail}. */
export interface RecordDetailProps {
  /** What the record is called, at the head of the panel. */
  readonly title: string;
  readonly sections: readonly RecordSection[];
  readonly onClose?: () => void;
  /** Shown as the panel's edit action when given. */
  readonly onEdit?: () => void;
  readonly editLabel?: string;
  /** Actions beside edit, for what this record offers on its own. */
  readonly actions?: ReactNode;
  readonly isLoading?: boolean;
}

/**
 * One record, read: its name over sections of labelled values, with the panel's actions.
 *
 * <p>The detail part of {@link CrudPage}. A screen says what each section holds; how a detail reads
 * (two columns of label and value, the footer, the close control) is the kit's.
 */
export function RecordDetail({ title, sections, onClose, onEdit, editLabel, actions, isLoading }: RecordDetailProps) {
  return (
    <CrudDetail
      isLoading={isLoading}
      header={<Heading level={4} tone="muted">{title}</Heading>}
      onClose={onClose}
      footer={
        <CrudDetail.DefaultActions onClose={onClose} onEdit={editLabel ? undefined : onEdit}>
          {actions}
          {editLabel && onEdit ? (
            <Button size="sm" onClick={onEdit}>
              {editLabel}
            </Button>
          ) : null}
        </CrudDetail.DefaultActions>
      }
    >
      {sections.map((section) => (
        <CrudDetail.Section key={section.key} title={section.title} variant="flat" layout="two-column">
          {section.fields.map((field) =>
            typeof field.value === "string" || field.value === null || field.value === undefined ? (
              <DetailFields.DetailTextField key={field.label} label={field.label} value={field.value as string | null | undefined} layout="inline" />
            ) : (
              <DetailFieldWrapper key={field.label} label={field.label} layout="inline">
                {field.value}
              </DetailFieldWrapper>
            ),
          )}
        </CrudDetail.Section>
      ))}
    </CrudDetail>
  );
}
