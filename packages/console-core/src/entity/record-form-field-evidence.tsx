import { useRef, useState } from "react";
import { CameraIcon, ImageIcon, PlusIcon, UploadIcon } from "lucide-react";
import { useTranslation } from "@simplix-react/i18n/react";
import { Button, FieldWrapper, Flex, Grid, SignaturePad, Stack, Text } from "@simplix-react/ui";
import { slotAttributes } from "@simplix-react/ui/design";

import type { Common, FieldOf } from "./record-form-field-parts";
import { EvidenceGrid } from "../attachment";
import { useConsoleOnAPhone } from "../shell/phone-shell";
import { PACKAGE_NAMESPACE } from "./locales";
import { attachmentDropStyle } from "./record-form.style";
import type { FieldEvidence, SignatureValue } from "./record-form-types";
import { joinParts } from "../layout/join-parts";

/** A file picked or dropped into an attachment field, as the evidence it becomes once saved. */
function pickedEvidence(file: File, index: number, evidenceKind: string | undefined, provenance: string): FieldEvidence {
  return {
    id: `picked:${Date.now()}:${index}:${file.name}`,
    kind: file.type.startsWith("image/") ? "photo" : "file",
    label: file.name,
    provenance,
    state: "pendingSync",
    ...(evidenceKind ? { evidenceKind } : {}),
  };
}

function fileSize(bytes: number): string {
  return bytes >= 1024 * 1024 ? `${(bytes / (1024 * 1024)).toFixed(1)}MB` : `${Math.max(1, Math.round(bytes / 1024))}KB`;
}

/**
 * An attachment field: what it holds, and always a way to add to it.
 *
 * <p>A field with an `onAdd` capture keeps one button per requested kind; any other field takes
 * files from a picker or a drop on the full-width zone, and holds them as waiting to upload until
 * the record is saved. On a phone the zone gives way to a camera and an album button, each tall
 * enough for a thumb.
 */
export function AttachmentField({ field, common, value, onChange }: { readonly field: FieldOf<"attachment">; readonly common: Common; readonly value: readonly FieldEvidence[]; readonly onChange: (value: unknown) => void }) {
  const { t } = useTranslation(PACKAGE_NAMESPACE + "/features");
  const onAPhone = useConsoleOnAPhone();
  const fileInput = useRef<HTMLInputElement>(null);
  const cameraInput = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  // Only a required field draws its missing kinds as slots to fill; an optional one that holds
  // nothing says so in a line, so 「필수」 never stands on a field nobody has to fill.
  const absent = field.required ? field.evidenceKinds.filter((kind) => !value.some((item) => item.evidenceKind === kind && item.state !== "missing")) : [];
  const slots: FieldEvidence[] = absent.map((kind) => ({ id: `missing:${kind}`, kind: "file", label: kind, provenance: t("recordForm.evidenceMissing"), state: "missing", evidenceKind: kind }));
  const add = async (kind: string) => {
    const item = await field.onAdd?.(kind);
    if (item) onChange([...value, item]);
  };
  const take = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const kind = absent[0] ?? field.evidenceKinds[0];
    onChange([...value, ...Array.from(files).map((file, index) => pickedEvidence(file, index, kind, t("recordForm.pickedProvenance", { size: fileSize(file.size) })))]);
  };
  const addable = field.evidenceKinds.length > 0 ? field.evidenceKinds : [""];
  const pickers = (
    <>
      <input ref={fileInput} type="file" multiple hidden disabled={common.disabled} onChange={(event) => { take(event.currentTarget.files); event.currentTarget.value = ""; }} />
      <input ref={cameraInput} type="file" accept="image/*" capture="environment" hidden disabled={common.disabled} onChange={(event) => { take(event.currentTarget.files); event.currentTarget.value = ""; }} />
    </>
  );
  return (
    <FieldWrapper {...common}>
      <Stack gap="sm">
        {value.length + slots.length > 0 ? <EvidenceGrid items={[...value, ...slots]} /> : null}
        {field.onAdd ? (
          <Flex gap="xs" wrap>
            {addable.map((kind) => (
              <Button key={kind} type="button" size="sm" variant="outline" disabled={common.disabled} onClick={() => void add(kind)}>
                <PlusIcon />
                {kind ? t("recordForm.addEvidenceOf", { kind }) : t("recordForm.addEvidence")}
              </Button>
            ))}
          </Flex>
        ) : onAPhone ? (
          <Grid columns={2} gap="sm">
            {pickers}
            <Button type="button" variant="outline" className="h-12" disabled={common.disabled} onClick={() => cameraInput.current?.click()}>
              <CameraIcon />
              {t("recordForm.takePhoto")}
            </Button>
            <Button type="button" variant="outline" className="h-12" disabled={common.disabled} onClick={() => fileInput.current?.click()}>
              <ImageIcon />
              {t("recordForm.pickFromAlbum")}
            </Button>
          </Grid>
        ) : (
          <div
            className="flex w-full flex-wrap items-center justify-between"
            {...slotAttributes(attachmentDropStyle, { dragging })}
            onDragOver={(event) => { if (common.disabled) return; event.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={(event) => { event.preventDefault(); setDragging(false); if (!common.disabled) take(event.dataTransfer.files); }}
          >
            {pickers}
            <Text size="sm" tone="muted">
              {value.length > 0 ? t("recordForm.dropMore") : t("recordForm.dropHint")}
            </Text>
            <Button type="button" size="sm" variant="outline" disabled={common.disabled} onClick={() => fileInput.current?.click()}>
              <UploadIcon />
              {t("recordForm.chooseFile")}
            </Button>
          </div>
        )}
      </Stack>
    </FieldWrapper>
  );
}

/** The signer's name as drawn: a delegated signature carries 「代」 before the name. */
export function signerLabel(signature: Pick<SignatureValue, "name" | "acting">): string {
  return signature.acting === "DELEGATED" ? `代 ${signature.name}` : signature.name;
}

/**
 * A signature field: what is being signed and by whom, written above the pad, and a text control to
 * start the pad again.
 *
 * <p>The role is plain text beside the signer, never a chip that reads as a button. Starting again
 * remounts the pad, which is the one way to empty it from outside.
 */
export function SignatureField({ field, common, value, onChange }: { readonly field: FieldOf<"signature">; readonly common: Common; readonly value: SignatureValue | null; readonly onChange: (value: unknown) => void }) {
  const { t } = useTranslation(PACKAGE_NAMESPACE + "/features");
  const [round, setRound] = useState(0);
  const given = value && !value.dataUrl ? value : null;
  const signer = joinParts(field.signerName, field.role);
  return (
    <FieldWrapper {...common}>
      <Stack gap="xs">
        {field.statement ? <Text size="sm">{field.statement}</Text> : null}
        {signer ? (
          <Text size="sm" tone="muted">
            {t("recordForm.signer", { signer })}
          </Text>
        ) : null}
        {given ? (
          <Text size="sm">
            {signerLabel(given)} · {given.at}
          </Text>
        ) : (
          <>
            <SignaturePad
              key={round}
              mode="drawn"
              disabled={common.disabled}
              className="[&_[data-slot=signature-pad-clear]]:hidden"
              onChange={(dataUrl) => onChange(dataUrl ? { name: field.signerName ?? "", at: new Date().toISOString(), acting: "SELF", dataUrl } satisfies SignatureValue : null)}
            />
            {common.disabled ? null : (
              <Flex justify="end">
                <Button
                  type="button"
                  variant="outline"
                  className="min-h-11 min-w-11"
                  onClick={() => {
                    setRound((n) => n + 1);
                    onChange(null);
                  }}
                >
                  {t("recordForm.signAgain")}
                </Button>
              </Flex>
            )}
          </>
        )}
      </Stack>
    </FieldWrapper>
  );
}
