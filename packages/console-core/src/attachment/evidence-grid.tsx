import { useTranslation } from "@simplix-react/i18n/react";
import {
  Badge,
  Button,
  Card,
  Flex,
  Grid,
  Icon,
  Stack,
  Text,
  type IconName,
} from "@simplix-react/ui";

import { PACKAGE_NAMESPACE } from "./locales";
import { evidenceBodyStyle, evidenceIconStyle } from "./evidence-grid.style";
import { partAttributes, slotAttributes } from "@simplix-react/ui/design";

/** What a piece of evidence is. The three are read differently and are drawn apart. */
export type EvidenceKind = "photo" | "file" | "signature";

/** Where an attachment stands between the field and the record. */
export type EvidenceState = "held" | "pendingSync" | "failed" | "missing";

/** One attachment, with what makes it evidence rather than a file. */
export interface EvidenceItem {
  /** Stable key within the grid. */
  readonly id: string;
  readonly kind: EvidenceKind;
  /** What it is called — the photo's subject, the file's name, the signer's name. */
  readonly label: string;
  /**
   * What was recorded beside it, already formatted by the caller.
   *
   * <p>A photo carries when and where it was taken and by whom; a file carries who uploaded it and
   * when; a signature carries the means, the moment, and the hash of what was on screen when it was
   * given. A photo with no time and place is worth nothing to an inspector, and a signature with no
   * render hash is worth nothing to anybody — so this line is not decoration.
   */
  readonly provenance: string;
  /** Where it stands. Defaults to `held`. */
  readonly state?: EvidenceState;
  /** Whether the statute keeps it, which is what makes it undeletable. */
  readonly retained?: boolean;
  /** A thumbnail, when the caller has one it may show. */
  readonly thumbnailUrl?: string;
}

/** The icon each kind is drawn with. */
const KIND_ICON: Readonly<Record<EvidenceKind, IconName>> = {
  photo: "image",
  file: "file-text",
  signature: "pen-line",
};

export interface EvidenceGridProps {
  /** What the group is called — 현장 사진, 파일과 서명. */
  readonly title?: string;
  readonly items: readonly EvidenceItem[];
  /** Offered on an attachment whose upload failed. */
  readonly onRetry?: (item: EvidenceItem) => void;
  /** Offered on an attachment the reader may open. */
  readonly onOpen?: (item: EvidenceItem) => void;
}

/**
 * 첨부·증빙 (P-31) — attachments drawn as evidence rather than as files.
 *
 * <p><b>What is recorded beside a file is what makes it evidence.</b> A photo without when and
 * where means nothing to an inspector, and a signature without what-was-signed means nothing to
 * anyone — so every tile carries its provenance line, and the three kinds are drawn apart because
 * they are read differently.
 *
 * <p><b>A required attachment that is absent is drawn.</b> An empty slot is the only way a reader
 * learns that the statute wants a photo they have not taken; left out, the grid of what exists
 * looks complete.
 *
 * <p><b>An upload that failed is drawn too.</b> Evidence made offline waits to be synchronised and
 * one that failed can be retried — a tile that vanishes on failure takes the retry with it and the
 * record is quietly short one photo.
 *
 * <p><b>Retention is a lock, not a warning.</b> A retained item cannot be deleted at all, which is
 * why the badge sits on the tile rather than in a note under the grid.
 */
export function EvidenceGrid({ title, items, onRetry, onOpen }: EvidenceGridProps) {
  // The catalogue is registered under the component name the module declares, so the namespace a
  // caller reads has to carry it — without `/features` every key resolves to its own key and the
  // grid prints `evidence.retained` at the reader.
  const { t } = useTranslation(`${PACKAGE_NAMESPACE}/features`);

  if (items.length === 0) return null;

  return (
    <Stack gap="sm">
      {title && <Text weight="medium">{title}</Text>}
      <Grid columns={3} gap="md">
        {items.map((item) => {
          const state = item.state ?? "held";
          const wrong = state === "failed" || state === "missing";
          return (
            <Card key={item.id} padding="none" {...partAttributes(evidenceBodyStyle, {})}>
              <Stack gap="sm">
                <Flex gap="sm" align="start" justify="between">
                  <Flex gap="sm" align="center">
                    <Icon name={KIND_ICON[item.kind]} {...slotAttributes(evidenceIconStyle, { wrong })} />
                    <Text weight="medium">{item.label}</Text>
                  </Flex>
                  {item.retained && <Badge variant="outline">{t("evidence.retained")}</Badge>}
                </Flex>

                {/* Never the file alone: the line under the name is what an inspector reads. */}
                <Text size="caption" tone="muted">
                  {item.provenance}
                </Text>

                {state !== "held" && (
                  <Flex gap="sm" align="center" wrap>
                    <Badge variant={state === "missing" ? "outline" : "destructive"}>
                      {t(`evidence.state.${state}`)}
                    </Badge>
                    {state === "failed" && onRetry && (
                      <Button variant="outline" size="xs" onClick={() => onRetry(item)}>
                        {t("evidence.retry")}
                      </Button>
                    )}
                  </Flex>
                )}

                {onOpen && state === "held" && (
                  <Flex>
                    <Button variant="outline" size="xs" onClick={() => onOpen(item)}>
                      {t("evidence.open")}
                    </Button>
                  </Flex>
                )}
              </Stack>
            </Card>
          );
        })}
      </Grid>
    </Stack>
  );
}
