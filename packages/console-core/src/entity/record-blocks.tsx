import type { ReactNode } from "react";
import { AlertBanner, Button, Flex, type StatusTone } from "@simplix-react/ui";
import { CircleAlertIcon, CircleCheckIcon, InfoIcon, TriangleAlertIcon } from "lucide-react";
import { slotAttributes } from "@simplix-react/ui/design";

import { recordNoteIconStyle, recordNoteStyle, verbBlockedReasonStyle, verbBlockedStyle } from "./record-blocks.style";

/** A message inside a panel, a form or a dialog: it stays as long as what it explains is on screen. */
export interface RecordNotice {
  readonly key: string;
  readonly tone: "info" | "warning" | "danger" | "success";
  readonly title: string;
  readonly body?: string;
  /** An action the message offers, such as opening the list it is about. */
  readonly action?: { readonly label: string; readonly onClick?: () => void };
  /**
   * Whether the state the notice is about holds (`when: record?.standing === "SUSPENDED"`). A
   * notice whose `when` is false is not drawn, so a detail declares every notice it can raise in
   * one list; absent, it is drawn.
   */
  readonly when?: boolean;
}

/** The glyph each tone's notice leads with, so the tone is not carried by colour alone. */
const NOTICE_ICON = { info: InfoIcon, warning: TriangleAlertIcon, danger: CircleAlertIcon, success: CircleCheckIcon } as const;

/**
 * The notices whose state holds, in their declared order.
 *
 * @param notices every notice the record can raise
 */
export function raisedRecordNotices(notices: readonly RecordNotice[] | undefined): RecordNotice[] {
  return (notices ?? []).filter((notice) => notice.when !== false);
}

/** A control in a row of verbs: the panel's reading verbs, a tab's own verbs, a dialog's foot. */
export interface RecordVerb {
  readonly label: string;
  readonly onClick?: () => void;
  /** The reason it cannot be pressed; set, it is drawn disabled with this reason written under it. */
  readonly disabled?: string;
  /** `primary` finishes the work, `danger` cannot be taken back lightly, `plain` is anything else. */
  readonly kind?: "primary" | "danger" | "plain" | "quiet";
}

const NOTICE_TONE: Record<RecordNotice["tone"], StatusTone> = {
  info: "info",
  warning: "warning",
  danger: "danger",
  success: "success",
};

/** Draws {@link RecordNotice}s, one under the other. */
export function RecordNotices({ notices }: { readonly notices?: readonly RecordNotice[] }) {
  const raised = raisedRecordNotices(notices);
  if (raised.length === 0) return null;
  return (
    <>
      {raised.map((notice) => (
        <AlertBanner
          key={notice.key}
          tone={NOTICE_TONE[notice.tone]}
          icon={NOTICE_ICON[notice.tone]}
          title={notice.title}
          subtitle={notice.body}
          bordered
          trailing={
            notice.action ? (
              <Button size="sm" variant="outline" onClick={notice.action.onClick}>
                {notice.action.label}
              </Button>
            ) : undefined
          }
        />
      ))}
    </>
  );
}

/**
 * The sentence that says how to read a detail, a form or a dialog, drawn as a card: never bare text
 * under the rows. `plain` drops the frame and the icon where the note already sits inside a card
 * (an explanation card's lead); `icon` replaces the default info glyph, `null` draws none.
 */
export function RecordNote({ text, plain = false, icon }: { readonly text?: string; readonly plain?: boolean; readonly icon?: ReactNode | null }) {
  if (!text) return null;
  const glyph = plain || icon === null ? null : (icon ?? <InfoIcon aria-hidden />);
  return (
    <p {...slotAttributes(recordNoteStyle, { framed: !plain })}>
      {glyph ? <span className="inline-flex [&>svg]:size-full" {...slotAttributes(recordNoteIconStyle, {})}>{glyph}</span> : null}
      <span className="min-w-0">{text}</span>
    </p>
  );
}

/** A row of {@link RecordVerb} buttons; `end` pushes them to the trailing edge. */
export function RecordVerbs({ verbs, end = false }: { readonly verbs?: readonly RecordVerb[]; readonly end?: boolean }) {
  if (!verbs || verbs.length === 0) return null;
  return (
    <Flex gap="xs" wrap justify={end ? "end" : "start"}>
      {verbs.map((verb) => (
        <RecordVerbButton key={verb.label} verb={verb} />
      ))}
    </Flex>
  );
}

/**
 * One {@link RecordVerb}.
 *
 * <p>A disabled verb writes its reason under itself, so the reader learns what is missing without
 * hovering a control that answers nothing; the full reason stays as the title when the line is cut.
 */
export function RecordVerbButton({ verb }: { readonly verb: RecordVerb }) {
  const variant = verb.kind === "primary" ? "primary" : verb.kind === "danger" ? "destructive" : verb.kind === "quiet" ? "ghost" : "outline";
  const button = (
    <Button size="sm" variant={variant} onClick={verb.onClick} disabled={Boolean(verb.disabled)} title={verb.disabled}>
      {verb.label}
    </Button>
  );
  if (!verb.disabled) return button;
  return (
    <span className="inline-flex max-w-60 flex-col items-stretch" title={verb.disabled} {...slotAttributes(verbBlockedStyle, {})}>
      {button}
      <span className="line-clamp-2" {...slotAttributes(verbBlockedReasonStyle, {})}>{verb.disabled}</span>
    </span>
  );
}
