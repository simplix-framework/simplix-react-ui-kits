import { type ReactNode, useState } from "react";
import { useTranslation } from "@simplix-react/i18n/react";
import { ProcessLanes } from "@simplix-react/process";
import { ProcessDiff, ProcessEditor, ProcessProblems, useProcessProblems, type EditorProblem, type EditorScope, type EditorTarget, type ProcessEditing } from "@simplix-react/process/edit";
import type { Act, Facts, ProcessDefinition } from "@simplix-react/process-core";
import { Button, DetailList, DetailListRow, EmptyState, Flex, Label, Stack, StatusBadge, Tabs, TabsContent, TabsTrigger, Text, Textarea } from "@simplix-react/ui";
import { partAttributes, slotAttributes } from "@simplix-react/ui/design";

import { RecordVerbButton } from "../entity/record-blocks";
import { PageTabStrip } from "../layout/page-tab-strip";
import { PACKAGE_NAMESPACE } from "./locales";
import type { ProcedureChoice } from "./procedure-catalogue";
import { procedureChoicesStyle, procedureHeadStyle, procedureNameStyle, procedureNoteStyle, procedureTabBodyStyle } from "./procedure-catalogue.style";
import { WHOLE_VIEW_METRICS } from "./whole-view";

/** One published version of a procedure. */
export interface ProcedureVersion {
  readonly key: string;
  /** How the version is called, such as its number. */
  readonly label: string;
  /** When it was published, already written for the reader. */
  readonly publishedOn?: string;
  /** Who published it. */
  readonly by?: string;
  /** What the version changed, in the publisher's words. */
  readonly note?: string;
  /** Where the version came from, where the product tells versions apart by it (set here, or registered by a release); drawn as a mark beside its name. */
  readonly origin?: string;
  readonly definition: ProcessDefinition;
}

/** Props for {@link ProcedureSettings}. */
export interface ProcedureSettingsProps {
  /** What the row of choices is, said to assistive technology. */
  readonly label: string;
  readonly procedures: readonly ProcedureChoice[];
  /** The chosen procedure's key. */
  readonly selected?: string;
  readonly onSelect: (key: string) => void;
  /** The chosen procedure as it is being edited. Left out with `selected` set, nothing is drawn under the choices. */
  readonly editing?: ProcessEditing;
  /** The facts the procedure is drawn with. */
  readonly facts?: Facts;
  /** The published versions, newest first. The first is the one in force. */
  readonly versions: readonly ProcedureVersion[];
  /** Problems found by the product's own rules, beside the ones the definition format has. */
  readonly problems?: readonly EditorProblem[];
  /** What the product knows about the part being edited and the procedure format does not, as lines read under its fields: the command an act runs, the screens it is done on. */
  readonly describe?: (target: EditorTarget, definition: ProcessDefinition) => readonly { readonly label: string; readonly value: string }[];
  /** Fields of the product's own for the part being edited. */
  readonly renderFields?: (target: EditorTarget, editing: ProcessEditing) => ReactNode;
  /** The reader's word for a member of the product's own that differs between versions. */
  readonly fieldLabel?: (field: string) => string | undefined;
  /** Publishes the procedure as it stands, with what the publisher wrote about the change. Left out, the reader may read and not change: no editor and no publishing. */
  readonly onPublish?: (note: string) => void;
  /** What the editor lets the reader change; `wording` for a product whose flow is fixed elsewhere. */
  readonly scope?: EditorScope;
  /** The lanes an act may be given to, where not every lane may take it. */
  readonly lanesFor?: (act: Act) => readonly string[];
  /** The tab the screen opens on. */
  readonly defaultTab?: "edit" | "check" | "versions";
  /** The version the history opens on; the one in force when left out. */
  readonly defaultVersion?: string;
  /** What stands under the choices while none is chosen. */
  readonly empty: { readonly title: string; readonly description?: string };
}

/**
 * The procedures of a product, set up one at a time: the chosen procedure edited on its drawing,
 * checked before it is published, and read version by version. Publishing is offered on the
 * check, where the problems and what changed from the version in force are both in sight, and
 * only while there is no problem and something changed.
 */
export function ProcedureSettings({ label, procedures, selected, onSelect, editing, facts, versions, problems, describe, renderFields, fieldLabel, onPublish, scope, lanesFor, defaultTab = "edit", defaultVersion, empty }: ProcedureSettingsProps) {
  const chosen = procedures.find((one) => one.key === selected);
  return (
    <Stack gap="none" className="min-h-0 flex-1" data-procedure-settings>
      <Flex wrap role="group" aria-label={label} {...partAttributes(procedureChoicesStyle, {})}>
        {procedures.map((one) => (
          <Button key={one.key} size="sm" variant={one.key === selected ? "primary" : "outline"} aria-pressed={one.key === selected} onClick={() => onSelect(one.key)} data-procedure-choice={one.key}>
            {one.label}
          </Button>
        ))}
      </Flex>
      {chosen && editing ? (
        <Chosen key={chosen.key} chosen={chosen} editing={editing} facts={facts} versions={versions} problems={problems} describe={describe} renderFields={renderFields} fieldLabel={fieldLabel} onPublish={onPublish} scope={scope} lanesFor={lanesFor} defaultTab={defaultTab} defaultVersion={defaultVersion} />
      ) : (
        <EmptyState size="sm" title={empty.title} description={empty.description} />
      )}
    </Stack>
  );
}

type ChosenProps = Pick<ProcedureSettingsProps, "facts" | "versions" | "problems" | "describe" | "renderFields" | "fieldLabel" | "onPublish" | "scope" | "lanesFor" | "defaultVersion"> & { readonly chosen: ProcedureChoice; readonly editing: ProcessEditing; readonly defaultTab: "edit" | "check" | "versions" };

function Chosen({ chosen, editing, facts, versions, problems, describe, renderFields, fieldLabel, onPublish, scope, lanesFor, defaultTab, defaultVersion }: ChosenProps) {
  const { t } = useTranslation(`${PACKAGE_NAMESPACE}/settings`);
  const inForce = versions[0];
  const listed = useProcessProblems(editing.definition, problems);
  const changed = inForce === undefined || JSON.stringify(inForce.definition) !== JSON.stringify(editing.definition);
  const [note, setNote] = useState("");
  const blocked = listed.length > 0 ? t("blocked.problems") : !changed ? t("blocked.same") : note.trim() === "" ? t("blocked.note") : undefined;
  const [versionKey, setVersionKey] = useState(defaultVersion ?? inForce?.key);
  const at = versions.findIndex((version) => version.key === versionKey);
  const version = versions[at];
  const earlier = versions[at + 1];
  const fields = (target: EditorTarget, session: ProcessEditing): ReactNode => {
    const lines = describe?.(target, session.definition) ?? [];
    return (
      <>
        {lines.length > 0 ? (
          <DetailList>
            {lines.map((line) => (
              <DetailListRow key={line.label} primary={line.label} trailing={line.value} />
            ))}
          </DetailList>
        ) : null}
        {renderFields?.(target, session)}
      </>
    );
  };
  const tabs = onPublish ? (["edit", "check", "versions"] as const) : (["edit", "versions"] as const);
  return (
    <>
      <Flex align="center" justify="between" wrap {...partAttributes(procedureHeadStyle, {})}>
        <Stack gap="none" className="min-w-0">
          <span {...slotAttributes(procedureNameStyle, {})}>{chosen.label}</span>
          {chosen.note ? <span {...slotAttributes(procedureNoteStyle, {})}>{chosen.note}</span> : null}
        </Stack>
        <Flex gap="sm" align="center">
          {inForce ? <StatusBadge tone="neutral" label={`${inForce.label} · ${t("inForce")}`} /> : null}
          {onPublish ? <StatusBadge tone={changed ? "warning" : "success"} label={t(changed ? "status.draft" : "status.same")} data-procedure-changed={changed} /> : null}
        </Flex>
      </Flex>
      <Tabs defaultValue={onPublish || defaultTab !== "check" ? defaultTab : "edit"} className="flex min-h-0 flex-1 flex-col">
        <PageTabStrip fromStart>
          {tabs.map((key) => (
            <TabsTrigger key={key} value={key} data-procedure-tab={key}>
              {t(`tabs.${key}`)}
              {key === "check" && listed.length > 0 ? ` ${listed.length}` : null}
            </TabsTrigger>
          ))}
        </PageTabStrip>
        <TabsContent value="edit" className="min-h-0 flex-1 overflow-auto" {...partAttributes(procedureTabBodyStyle, {})}>
          {onPublish ? <ProcessEditor editing={editing} facts={facts} problems={problems} scope={scope} lanesFor={lanesFor} renderFields={describe || renderFields ? fields : undefined} /> : <ProcessLanes definition={editing.definition} facts={facts} layout="lanes" metrics={WHOLE_VIEW_METRICS} scrollToActive={false} />}
        </TabsContent>
        {onPublish ? (
          <TabsContent value="check" className="min-h-0 flex-1 overflow-auto" {...partAttributes(procedureTabBodyStyle, {})}>
            <Stack gap="lg">
              <Stack gap="xs">
                <Label htmlFor="procedure-change-note">{t("note")}</Label>
                <Textarea id="procedure-change-note" value={note} onChange={(event) => setNote(event.target.value)} rows={2} data-procedure-note />
                <Flex justify="end">
                  <RecordVerbButton verb={{ label: t("publish"), onClick: () => { onPublish(note.trim()); setNote(""); }, kind: "primary", disabled: blocked }} />
                </Flex>
              </Stack>
              <ProcessProblems definition={editing.definition} problems={problems} />
              {inForce ? (
                <Stack gap="sm">
                  <Text size="sm" weight="semibold">
                    {t("changes")}
                  </Text>
                  <ProcessDiff before={inForce.definition} after={editing.definition} facts={facts} fieldLabel={fieldLabel} />
                </Stack>
              ) : null}
            </Stack>
          </TabsContent>
        ) : null}
        <TabsContent value="versions" className="min-h-0 flex-1 overflow-auto" {...partAttributes(procedureTabBodyStyle, {})}>
          <Stack gap="lg">
            <Flex gap="sm" wrap role="group" aria-label={t("tabs.versions")}>
              {versions.map((one, index) => (
                <Button key={one.key} size="sm" variant={one.key === versionKey ? "primary" : "outline"} aria-pressed={one.key === versionKey} onClick={() => setVersionKey(one.key)} data-procedure-version={one.key}>
                  {one.label}
                  {one.origin ? ` · ${one.origin}` : null}
                  {index === 0 ? ` · ${t("inForce")}` : null}
                </Button>
              ))}
            </Flex>
            {version ? (
              <>
                <Stack gap="none">
                  <Text size="sm" weight="semibold">
                    {[version.label, version.origin, version.publishedOn].filter(Boolean).join(" · ")}
                  </Text>
                  {version.by ? (
                    <Text size="caption" tone="muted">
                      {t("by")} · {version.by}
                    </Text>
                  ) : null}
                  {version.note ? <Text size="sm">{version.note}</Text> : null}
                </Stack>
                {earlier ? (
                  <Stack gap="sm">
                    <Text size="sm" weight="semibold">
                      {t("compared")}
                    </Text>
                    <ProcessDiff before={earlier.definition} after={version.definition} facts={facts} fieldLabel={fieldLabel} />
                  </Stack>
                ) : (
                  <Stack gap="sm">
                    <Text size="caption" tone="muted">
                      {t("first")}
                    </Text>
                    <ProcessLanes definition={version.definition} facts={facts} scrollToActive={false} />
                  </Stack>
                )}
              </>
            ) : null}
          </Stack>
        </TabsContent>
      </Tabs>
    </>
  );
}
