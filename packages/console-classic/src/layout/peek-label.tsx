import { useCan } from "@simplix-react/access/react";
import { EmptyValue, Flex, Text } from "@simplix-react/ui";

import { usePeekHost } from "../peek";
import { EllipsisText } from "./ellipsis-text";
import { PeekTriggerButton, type PeekAppearance } from "./detail-peek-dialog";

/** Props for {@link RecordPeekLabel}. */
export interface RecordPeekLabelProps {
  /** The record's identifier. Without it the name stands alone. */
  readonly id?: string | null;
  /** What it is called, which is the value the row exists to show. */
  readonly name?: string | null;
  /** The kind the app registered its dialog under. */
  readonly kind: string;
  /** What a reader must be allowed to view before the trigger is drawn. */
  readonly subject: string;
  /** What the trigger says. */
  readonly label: string;
  /** Which shape the trigger takes — the default icon beside the value, `"inline"` in a card. */
  readonly appearance?: PeekAppearance;
}

/**
 * A record named on somebody else's screen, with the way to read it without leaving.
 *
 * <p><b>One component rather than the wiring repeated per module.</b> Every foreign key printed as
 * a name owes the reader the record behind it, and written out at each site the second one is a
 * link and the third is nothing at all. The kind crosses the module boundary — the dialog lives in
 * the entity's own module and the app joins them — so this needs nothing but a string.
 *
 * <p><b>Gated on reading that register, not on the row.</b> An operator who may see this record and
 * not the one it names gets the name and no trigger, rather than a dialog that answers with a
 * refusal.
 *
 * @param props which record, what it is called, and which register it belongs to
 * @returns the name, with a trigger where the reader may follow it
 */
export function RecordPeekLabel({
  id,
  name,
  kind,
  subject,
  label,
  appearance,
}: RecordPeekLabelProps) {
  const canView = useCan("view", subject);
  const peek = usePeekHost();

  const shown = name ?? "";
  if (!id || !canView || !shown) {
    return shown ? <Text as="span">{shown}</Text> : <EmptyValue />;
  }

  // A real gap. Drawn `gap="none"` the trigger stood on the name it points at — the button
  // carries its own padding, so a row with no gap puts its mark against the last glyph.
  return (
    <Flex gap="xs" align="center" minSize>
      <EllipsisText>{shown}</EllipsisText>
      <PeekTriggerButton
        label={label}
        target={shown}
        appearance={appearance}
        onClick={() => peek.open({ kind, target: { id, name: shown } })}
      />
    </Flex>
  );
}
