import { InfoIcon, ScaleIcon } from "lucide-react";
import { useState, type ReactNode } from "react";
import { useTranslation } from "@simplix-react/i18n/react";
import {
  AlertBanner,
  Button,
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Icon,
  Stack,
  Text,
} from "@simplix-react/ui";

import { BoundedDialogContent } from "../layout";

/** The statute behind one value, as the server holds it. */
export interface StatuteBasis {
  /** The law's own name — 「산업안전보건법」. */
  readonly law: string | undefined;
  /** The article, with its clause and item — 「제29조 ③」. */
  readonly article: string | undefined;
  /** What the article says, where the pack ships the text. */
  readonly note?: string;
  /** Which pack version supplied it, where one did. */
  readonly packVersion?: string;
}

/** Props for {@link StatuteBasisButton}. */
export interface StatuteBasisButtonProps {
  /** The citation to show. */
  readonly basis: StatuteBasis;
  /** What the article is the basis OF — the value's own name, for the dialog's title. */
  readonly subject?: string;
  /** Overrides the button's label; the default is 「근거 조문」. */
  readonly label?: string;
  /** Rendered under the citation — a screen's own note about how it applies here. */
  readonly children?: ReactNode;
}

/**
 * 「근거 조문」 — the article a value rests on, and the record that opens it.
 *
 * <p><b>Eleven frames draw this button and every one of them means the same thing:</b> the number
 * on the screen came from a statute, and the person defending a schedule to an inspector has to be
 * able to say which. Built per screen it was eleven dialogs that would have agreed on the day they
 * were written.
 *
 * <p><b>A citation the server did not send is not drawn as an empty dialog.</b> Some values have no
 * statute behind them — 작업허가 유효 시간 is one, and the seed leaves its article empty rather than
 * inventing one. The button says so where it stands instead of opening onto a heading over nothing,
 * because a reader who opens an empty record reads it as a basis that failed to load.
 *
 * <p><b>What it never does is state the article itself.</b> The law and the article travel with the
 * value from the server; a citation written into a screen is one that stops being true when the pack
 * moves, and nothing in the build compares the two.
 */
export function StatuteBasisButton({ basis, subject, label, children }: StatuteBasisButtonProps) {
  const { t } = useTranslation("common");
  const [open, setOpen] = useState(false);
  const citation = [basis.law, basis.article].filter(Boolean).join(" ");

  if (!citation) {
    return (
      <Button size="sm" variant="outline" disabled title={t("statute.none")}>
        <ScaleIcon />
        {label ?? t("statute.open")}
      </Button>
    );
  }

  return (
    <>
      <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
        <ScaleIcon />
        {label ?? t("statute.open")}
      </Button>

      <StatuteBasisDialog
        basis={basis}
        subject={subject}
        open={open}
        onOpenChange={setOpen}
      >
        {children}
      </StatuteBasisDialog>
    </>
  );
}

/** Props for {@link StatuteBasisDialog}. */
export interface StatuteBasisDialogProps {
  /** The citation to show. Absent while nothing is open. */
  readonly basis?: StatuteBasis;
  /** What the article is the basis OF — the record's own name, for the dialog's title. */
  readonly subject?: string;
  /** Whether it is open. */
  readonly open: boolean;
  /** Told when the reader closes it. */
  readonly onOpenChange: (open: boolean) => void;
  /** Rendered under the citation — a screen's own note about how it applies here. */
  readonly children?: ReactNode;
}

/**
 * The same dialog {@link StatuteBasisButton} opens, for a caller that owns the opening itself.
 *
 * @remarks
 * A row action is a press with no component of its own, so it cannot use the button — and a screen
 * that draws 「근거」 on every row would otherwise hand-roll a second dialog that agrees with this
 * one only on the day it is written. The button now renders this, so there is one shape and two
 * ways in.
 *
 * <p>Renders nothing when there is no citation, for the same reason the button disables itself: a
 * heading over nothing reads as a basis that failed to load.
 */
export function StatuteBasisDialog({
  basis,
  subject,
  open,
  onOpenChange,
  children,
}: StatuteBasisDialogProps) {
  const { t } = useTranslation("common");
  const citation = [basis?.law, basis?.article].filter(Boolean).join(" ");
  if (!citation) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <BoundedDialogContent width="md">
        <DialogHeader>
          <DialogTitle>
            {subject ? t("statute.titleOf", { subject }) : t("statute.title")}
          </DialogTitle>
          <DialogDescription>{t("statute.intro")}</DialogDescription>
        </DialogHeader>

        <Stack gap="md">
          <Stack gap="xs">
            <Text size="caption" tone="muted">{t("statute.citation")}</Text>
            <Text weight="medium">{citation}</Text>
          </Stack>

          {basis?.note && (
            <Stack gap="xs">
              <Text size="caption" tone="muted">{t("statute.note")}</Text>
              <Text size="sm">{basis.note}</Text>
            </Stack>
          )}

          {children}

          {/* The text is the pack's copy of the article rather than the statute itself, and a
              reader defending a decision needs to know which they are holding. */}
          <AlertBanner
            tone="info"
            icon={InfoIcon}
            density="sm"
            title={t("statute.packTitle")}
            subtitle={
              basis?.packVersion
                ? t("statute.packBody", { version: basis.packVersion })
                : t("statute.packUnknown")
            }
          />
        </Stack>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("statute.close")}
          </Button>
        </DialogFooter>
      </BoundedDialogContent>
    </Dialog>
  );
}
