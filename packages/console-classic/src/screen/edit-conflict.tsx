import { TriangleAlertIcon } from "lucide-react";
import type { ReactNode } from "react";
import { useTranslation } from "@simplix-react/i18n/react";
import {
  AlertBanner,
  Badge,
  Button,
  Dialog,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Flex,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Text,
} from "@simplix-react/ui";

import { BoundedDialogContent, SizedHead, TableCard } from "../layout";
import { ActionButton, type ActionOrUnbuilt } from "../notice";

/** Whose value a field keeps. `same` is not a choice — it is the absence of a disagreement. */
export type ConflictChoice = "mine" | "theirs";

/** One field the two saves disagree about, or agree about. */
export interface ConflictField {
  /** Stable key, and what the choice is recorded under. */
  readonly key: string;
  /** What the field is called on the form the operator was filling in. */
  readonly label: string;
  /** What this session was about to save. */
  readonly mine: ReactNode;
  /** What is in the record now, because somebody else saved first. */
  readonly theirs: ReactNode;
  /**
   * Whether the two are the same value.
   *
   * <p>Judged by the caller rather than here: two DTO fields are equal by the domain's rules, not
   * by `===` on whatever was rendered, and a formatted value that happens to read alike is not
   * the same value.
   */
  readonly same?: boolean;
}

interface EditConflictDialogProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  /** Who saved first and when — 「김안전 님이 09:41에 저장했습니다」. */
  readonly rival: string;
  /** Every field of the form, agreeing ones included. */
  readonly fields: readonly ConflictField[];
  /** Which side each disagreeing field is currently set to keep. */
  readonly choices: Readonly<Record<string, ConflictChoice>>;
  readonly onChoose: (key: string, choice: ConflictChoice) => void;
  /** Throws this session's edit away and takes the record as it now stands. */
  readonly onDiscardMine: ActionOrUnbuilt;
  readonly onCancel: () => void;
  /** Saves the record as the choices describe it. */
  readonly onSaveChoices: ActionOrUnbuilt;
}

/**
 * 편집 충돌 · 변경 감지 (P-16) — two people saved the same record, and neither change is thrown
 * away without being seen.
 *
 * <p><b>The conflict is raised at save, not at open.</b> Locking a record when somebody starts
 * editing it means a person who walked away from their desk blocks everybody else, and nothing on
 * screen says why. The server's optimistic version is what detects this, so the dialog opens on a
 * refused save rather than on a claim.
 *
 * <p><b>Field by field, because 「mine」 and 「theirs」 wholesale always loses one of them.</b> The
 * two saves usually touch different fields; a dialog offering only two buttons makes the operator
 * discard a colleague's work to keep their own.
 *
 * <p><b>Fields that agree are drawn too.</b> Showing only the disagreements leaves the reader
 * unable to tell a short conflict from a form they misremember, and 「같음」 is what says the rest
 * of the record survived.
 *
 * <p><b>What is discarded is still recorded.</b> The value this dialog drops goes to the record's
 * change history (P-18), so 「why is my edit not there」 has an answer.
 */
export function EditConflictDialog({
  open,
  onOpenChange,
  rival,
  fields,
  choices,
  onChoose,
  onDiscardMine,
  onCancel,
  onSaveChoices,
}: EditConflictDialogProps) {
  const { t } = useTranslation("common");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <BoundedDialogContent width="xl">
        <DialogHeader>
          <DialogTitle>{t("conflict.title")}</DialogTitle>
        </DialogHeader>

        <Stack gap="md">
          <Text size="caption" tone="muted">
            {t("conflict.lead", { rival })}
          </Text>

          <TableCard>
            {/* Bounded: one row per field of the form being saved. */}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("conflict.columnField")}</TableHead>
                  <TableHead>{t("conflict.columnMine")}</TableHead>
                  <TableHead>{t("conflict.columnTheirs")}</TableHead>
                  <SizedHead width={168}>{t("conflict.columnChoice")}</SizedHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fields.map((field) => (
                  <TableRow key={field.key}>
                    <TableCell>{field.label}</TableCell>
                    <TableCell>{field.mine}</TableCell>
                    <TableCell>{field.theirs}</TableCell>
                    <TableCell>
                      {field.same ? (
                        <Badge variant="outline">{t("conflict.same")}</Badge>
                      ) : (
                        // Two buttons rather than `ChipFilter`: the framework's chips read and
                        // write a list's committed filters, and this pick belongs to one row of a
                        // dialog that has no list under it. What the chips give the eye — a pill
                        // row whose chosen option is solid — is what the pair of variants gives.
                        <Flex gap="xs">
                          {(["mine", "theirs"] as const).map((side) => (
                            <Button
                              key={side}
                              size="xs"
                              variant={(choices[field.key] ?? "mine") === side ? "default" : "outline"}
                              onClick={() => onChoose(field.key, side)}
                            >
                              {t(`conflict.${side}`)}
                            </Button>
                          ))}
                        </Flex>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableCard>
        </Stack>

        <DialogFooter>
          <ActionButton
            behaviour={onDiscardMine}
            variant="outline"
            className="mr-auto"
            label={t("conflict.discardMine")}
          />
          <Button variant="outline" onClick={onCancel}>
            {t("conflict.cancel")}
          </Button>
          <ActionButton behaviour={onSaveChoices} label={t("conflict.saveChoices")} />
        </DialogFooter>
      </BoundedDialogContent>
    </Dialog>
  );
}

interface SessionHoldBannerProps {
  /** Who is holding it, by name rather than by account id. */
  readonly holder: string;
  /** Since when, already formatted by the caller against the site's own clock. */
  readonly since: ReactNode;
  /**
   * Takes the hold away from them.
   *
   * <p>Omitted for a reader who may not — and where it is offered, taking it leaves an audit
   * record, because a hold taken silently is indistinguishable from one that lapsed.
   */
  readonly onReclaim?: ActionOrUnbuilt;
  /** Opens the record without the hold, so it can at least be read. */
  readonly onOpenReadOnly?: ActionOrUnbuilt;
}

/**
 * 편집 충돌 · 변경 감지 (P-16) — the other shape: a record one person has to hold while they run it.
 *
 * <p><b>A held session is not a save conflict and must not be drawn as one.</b> A TBM being
 * delivered or an inspection being walked is a single occupancy rather than two edits meeting, so
 * the answer is to name the holder up front rather than to merge two versions afterwards.
 *
 * <p><b>Taking the hold is recorded.</b> The button is destructive because the consequence lands
 * on somebody who is mid-task, and the record of who took it is what makes that recoverable.
 */
export function SessionHoldBanner({ holder, since, onReclaim, onOpenReadOnly }: SessionHoldBannerProps) {
  const { t } = useTranslation("common");

  return (
    <Stack gap="sm">
      <AlertBanner tone="warning" icon={TriangleAlertIcon} title={t("conflict.heldTitle", { holder })} subtitle={t("conflict.heldBody")} />
      <Flex gap="sm" align="center" wrap>
        <Badge variant="outline">{since}</Badge>
        {onOpenReadOnly && (
          <ActionButton behaviour={onOpenReadOnly} variant="outline" label={t("conflict.openReadOnly")} />
        )}
        {onReclaim && (
          <ActionButton behaviour={onReclaim} variant="destructive" label={t("conflict.reclaim")} />
        )}
      </Flex>
    </Stack>
  );
}
