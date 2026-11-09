import { useEffect, useRef, type ReactNode } from "react";
import { AlertBanner, Button, Flex, type StatusTone } from "@simplix-react/ui";
import { CircleAlertIcon, CircleCheckIcon, InfoIcon, TriangleAlertIcon } from "lucide-react";
import { slotAttributes } from "@simplix-react/ui/design";

import { NoticeCard } from "../notice/notice-card";
import { NoticeMenu } from "../notice/notice-menu";
import type { DismissibleNoticeKind } from "../notice/notice-kind";
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
   * The constant the reader's put-away choice is kept under, which makes the notice a standing
   * message: the state it describes holds for as long as the record is in it, whether or not the
   * reader does anything. It is drawn as a notice card with a close, remembered per operator, and
   * listed on the header's control for its tone, so closing it moves the message rather than
   * losing it (frontend invariant #73).
   *
   * <p>Namespaced by the screen that owns it (`speech.userVoice.suspended`) and written at the
   * definition site: the key is per state, not per record, because a key built from a record id
   * is one more entry in the operator's set for every record they ever opened. Absent, the notice
   * is a banner, which is right only for the answer to something the reader just did (a failed
   * read, a refused submit). A `success` tone has no card kind and is always a banner. Inside a
   * dialog a card is not mounted while the dialog is closed, so its owner also declares it with
   * `NoticeDeclaration`.
   */
  readonly noticeKey?: string;
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
  /** Set while the verb's work is running: the button is drawn busy with this word and cannot be pressed again. */
  readonly pending?: string;
}

const NOTICE_TONE: Record<RecordNotice["tone"], StatusTone> = {
  info: "info",
  warning: "warning",
  danger: "danger",
  success: "success",
};

/** The card kind of each tone that has one; `success` confirms something done and has none. */
const NOTICE_CARD_KIND: Partial<Record<RecordNotice["tone"], DismissibleNoticeKind>> = {
  info: "info",
  warning: "warning",
  danger: "danger",
};

/**
 * The notice keys a surface answers for: those of its raised notices that are drawn as cards.
 *
 * @param notices the notices the surface draws, in any number of lists
 * @returns the keys, without repeats
 */
export function standingNoticeKeys(...notices: readonly (readonly RecordNotice[] | undefined)[]): string[] {
  const keys = notices.flatMap((list) =>
    raisedRecordNotices(list).flatMap((notice) => (notice.noticeKey && NOTICE_CARD_KIND[notice.tone] ? [notice.noticeKey] : [])),
  );
  return [...new Set(keys)];
}

/**
 * The way back to a record notice the reader put away, drawn inside the modal surface (a drawer, a
 * dialog) that holds it.
 *
 * <p>A modal's overlay covers the page header and the control it draws for put-away cards, so a
 * card closed in a drawer would otherwise leave nothing the reader can press. This control sits in
 * the surface's own head, next to its close control, and answers only for the notices the surface
 * draws. It draws nothing while none of them is put away. The page header's control stays the way
 * back once the surface is closed.
 */
export function RecordNoticeMenu({ keys }: { readonly keys: readonly string[] }) {
  if (keys.length === 0) return null;
  return <NoticeMenu only={keys} />;
}

/**
 * The banner that answers a refused submit: it carries the alert role, and when a new refusal
 * arrives the focus moves to it and it is scrolled into view, so a refusal raised above the fold of
 * a long form is read and not missed. Drawn through {@link RecordNotices} like every other notice.
 *
 * @param refusal the object the refusal is held in; a new one is a new refusal and moves the focus again
 * @param title the headline, which says who refused (a check the page made, or the server)
 * @param body the sentence the refuser gave, when it did not name fields instead
 */
export function RefusalNotice({ refusal, title, body }: { readonly refusal: object; readonly title: string; readonly body?: string }) {
  const host = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = host.current;
    if (!element) return;
    element.focus({ preventScroll: true });
    // A host with no layout (a server render, a bare DOM) has nothing to scroll.
    element.scrollIntoView?.({ block: "nearest" });
  }, [refusal]);
  return (
    <div ref={host} tabIndex={-1} role="alert" data-record-refusal>
      <RecordNotices notices={[{ key: "submit-refused", tone: "danger", title, body }]} />
    </div>
  );
}

/**
 * Draws {@link RecordNotice}s, one under the other: a standing one (it names a `noticeKey`) as a
 * closable notice card, every other as a banner.
 */
export function RecordNotices({ notices }: { readonly notices?: readonly RecordNotice[] }) {
  const raised = raisedRecordNotices(notices);
  if (raised.length === 0) return null;
  return (
    <>
      {raised.map((notice) => {
        const kind = notice.noticeKey ? NOTICE_CARD_KIND[notice.tone] : undefined;
        if (notice.noticeKey && kind) {
          return (
            <NoticeCard
              key={notice.key}
              noticeKey={notice.noticeKey}
              kind={kind}
              title={notice.title}
              hint={notice.body}
              actionLabel={notice.action?.onClick ? notice.action.label : undefined}
              onAction={notice.action?.onClick}
              // A record's notices are drawn inside a surface that closes (a drawer, a dialog), and
              // the put-away choice outlives it: the entry stays so the way back does too.
              retain
            />
          );
        }
        return (
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
        );
      })}
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
    <Button
      size="sm"
      variant={variant}
      onClick={verb.onClick}
      disabled={Boolean(verb.disabled) || verb.pending !== undefined}
      title={verb.disabled}
      loading={verb.pending !== undefined}
      loadingText={verb.pending}
    >
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
