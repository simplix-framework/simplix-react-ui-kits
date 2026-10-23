import type { ReactNode } from "react";
import {
  Badge,
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
import {
  chatCardStyle,
  chatPreviewStyle,
  mailBodyStyle,
  mailCardStyle,
  mailFooterStyle,
  mailHeaderStyle,
  wordingButtonStyle,
} from "./message-preview.style";
import { slotAttributes } from "@simplix-react/ui/design";

/**
 * How loud one button of a wording is drawn.
 *
 * <p>Fixed when the wording is reviewed, alongside what the button says: which of three buttons
 * somebody trapped in a pit is meant to press is not a decision the screen showing them makes.
 */
export type WordingButtonGrade = "PRIMARY" | "NORMAL" | "URGENT";

/** One button a wording carries. */
export interface WordingButton {
  /** What it says, in the wording's own language. */
  readonly label: string;
  /** How loud it is drawn, or absent for the plain one. */
  readonly grade?: WordingButtonGrade;
}

/**
 * The buttons of one wording, drawn at the grades it fixed.
 *
 * <p>Pressable by nobody: a preview whose buttons worked would be a preview of a different thing.
 *
 * @param buttons what the wording carries
 * @returns the stack of them, or nothing where it carries none
 */
function WordingButtons({ buttons }: { readonly buttons: readonly WordingButton[] }) {
  if (buttons.length === 0) return null;
  return (
    <Stack gap="xs">
      {buttons.map((button) => (
        <div
          key={button.label}
          {...slotAttributes(wordingButtonStyle, { grade: button.grade ?? "NORMAL" })}
        >
          <Text as="span" size="sm">
            {button.label}
          </Text>
        </div>
      ))}
    </Stack>
  );
}

/** A run of the wording: prose as it stands, or a table it laid out. */
type WordingBlock =
  | { readonly kind: "text"; readonly text: string }
  | { readonly kind: "table"; readonly head: readonly string[]; readonly rows: readonly (readonly string[])[] };

/** A row of a table, as the wording holds it: cells between vertical bars. */
const TABLE_ROW = /^\s*\|(.*)\|\s*$/;

/**
 * @param line one line of the wording
 * @returns its cells, or null where the line is prose
 */
function cellsOf(line: string): string[] | null {
  const matched = TABLE_ROW.exec(line);
  return matched ? matched[1].split("|").map((cell) => cell.trim()) : null;
}

/**
 * The wording split into what it holds.
 *
 * <p><b>A wording that lays out three approvals in three columns has to be able to say so.</b>
 * Held as prose, the three came out as three sentences with dashes in them and the column names
 * were nowhere — the reader could not tell whether the middle value was who raised the request or
 * who has to answer it. A run of lines between vertical bars is a table, and the first of them
 * names the columns.
 *
 * @param body the wording as it would go out
 * @returns its runs, in order
 */
function blocksOf(body: string): WordingBlock[] {
  const blocks: WordingBlock[] = [];
  let prose: string[] = [];
  let table: string[][] = [];

  const closeProse = () => {
    if (prose.length === 0) return;
    blocks.push({ kind: "text", text: prose.join("\n").replace(/^\n+|\n+$/g, "") });
    prose = [];
  };
  const closeTable = () => {
    if (table.length === 0) return;
    blocks.push({ kind: "table", head: table[0], rows: table.slice(1) });
    table = [];
  };

  for (const line of body.split("\n")) {
    const cells = cellsOf(line);
    if (cells) {
      closeProse();
      table.push(cells);
      continue;
    }
    closeTable();
    prose.push(line);
  }
  closeProse();
  closeTable();
  return blocks.filter((block) => block.kind !== "text" || block.text.length > 0);
}

/**
 * A wording's body, with whatever structure it carries.
 *
 * <p><b>The wording's own line breaks are kept.</b> What separates 구역 from 작업 from 발령시각 in
 * the message people receive is a newline, and a preview that reflowed them would be a preview of
 * a message nobody sends.
 *
 * @param text the body as it would go out
 * @param tables whether this channel renders a table the wording laid out — mail does, a message
 *        counted in bytes does not, and drawing one there would show a message nobody receives
 * @returns the body
 */
export function WordingBody({
  text,
  tables = false,
}: {
  readonly text: string;
  readonly tables?: boolean;
}) {
  if (!tables) {
    return <span className="whitespace-pre-wrap">{text}</span>;
  }
  return (
    <Stack gap="sm">
      {blocksOf(text).map((block, at) =>
        block.kind === "text" ? (
          <span key={`t${at}`} className="whitespace-pre-wrap">
            {block.text}
          </span>
        ) : (
          // Bounded: the rows are the ones this wording holds, and a wording is one stored field
          // that a person wrote — there is no page after it and nothing to filter. What fixes the
          // count is the wording itself.
          <Table key={`b${at}`}>
            <TableHeader>
              <TableRow>
                {block.head.map((cell) => (
                  <TableHead key={cell}>{cell}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {block.rows.map((row) => (
                <TableRow key={row.join("|")}>
                  {row.map((cell, column) => (
                    <TableCell key={`${column}-${cell}`}>{cell}</TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )
      )}
    </Stack>
  );
}

/** Props for {@link MailPreview}. */
export interface MailPreviewProps {
  /** The subject line, which is where the recipient decides whether to open it. */
  readonly subject: ReactNode;
  /** What the sender line says. */
  readonly from: ReactNode;
  /** What the recipient line says. */
  readonly to: ReactNode;
  /** The message itself. */
  readonly children: ReactNode;
  /** The line under it — who sent it and on whose behalf. */
  readonly footer?: ReactNode;
  /**
   * The buttons the wording carries, where it carries any.
   *
   * <p><b>A mail wording carries these as readily as a chat one does.</b> An approval request whose
   * only action is 「결재함 보기」 and an invitation whose only action is 「Chấp nhận lời mời」 are
   * both a button in the message people receive, and a preview that drops them shows a mail nobody
   * is sent. The prop existed on the chat preview alone, so the wording's buttons reached the page
   * and stopped there — leaving one preview drawing a sentence that explains buttons the reader
   * cannot see.
   */
  readonly buttons?: readonly WordingButton[];
  /** What the two meta lines are called, in the language the message is written in. */
  readonly labels: { readonly from: string; readonly to: string };
}

/**
 * One message as it lands in a mail client.
 *
 * <p><b>Drawn as the client draws it, because that is the only place it is ever read.</b> A
 * message reviewed as a paragraph in a settings form reads as prose; read as a subject line above
 * a sender the recipient does not recognise, on a phone, it is a different message — and the
 * subject is where somebody decides whether to open it at all.
 *
 * <p><b>Here rather than in each screen.</b> Five frames on this board preview a message, and a
 * copy per screen drifts on the parts that carry the whole point: whether the subject stands
 * apart, whether the sender is above the body, and where the footer sits.
 *
 * @param props the subject, the two meta lines, the body and the footer
 * @returns the preview
 */
export function MailPreview({ subject, from, to, children, footer, buttons = [], labels }: MailPreviewProps) {
  return (
    // raw layout: a mail client's own frame, which the design system has no primitive for
    <div className="max-w-2xl overflow-hidden" {...slotAttributes(mailCardStyle, {})}>
      <div {...slotAttributes(mailHeaderStyle, {})}>
        <Stack gap="none">
          <Text weight="medium">{subject}</Text>
          {/* A label with nothing after it promises a value and delivers none, and a reader
              checking who a message goes to cannot tell that from a value that failed to load.
              The line carries only the halves that have something to say. */}
          <Text as="span" size="caption" tone="muted">
            {[
              from ? (
                <span key="from">
                  {labels.from} {from}
                </span>
              ) : null,
              to ? (
                <span key="to">
                  {labels.to} {to}
                </span>
              ) : null,
            ]
              .filter(Boolean)
              .flatMap((part, index) => (index === 0 ? [part] : [<span key="sep"> · </span>, part]))}
          </Text>
        </Stack>
      </div>
      {/* The wording's own line breaks are kept. What separates 구역 from 작업 from 발령시각 in
          the message people receive is a newline, and a preview that reflowed them would be a
          preview of a message nobody sends. */}
      <div {...slotAttributes(mailBodyStyle, {})}>
        <Stack gap="md">
          <span className="whitespace-pre-wrap">{children}</span>
          <WordingButtons buttons={buttons} />
        </Stack>
      </div>
      {footer ? (
        <div {...slotAttributes(mailFooterStyle, {})}>
          <Text as="span" size="caption" tone="muted">
            {footer}
          </Text>
        </div>
      ) : null}
    </div>
  );
}

/** Props for {@link ChatPreview}. */
export interface ChatPreviewProps {
  /** The app this arrives in — 알림톡, LINE, SMS. */
  readonly app: ReactNode;
  /** Who it appears to come from. */
  readonly sender: ReactNode;
  /** The message itself. */
  readonly children: ReactNode;
  /** The buttons the wording carries, where the channel fixed them in advance. */
  readonly buttons?: readonly WordingButton[];
  /** The line under the bubble — a length, a reason, a caveat. */
  readonly note?: ReactNode;
}

/**
 * One message as it lands in a messenger.
 *
 * <p><b>Drawn at the width it is read at.</b> A phone is the only place these arrive, and a
 * message that fits a settings form and not a bubble is a message somebody will meet cut in half.
 *
 * <p><b>The app's own name is on it because that is where the trust comes from.</b> A worker who
 * cannot read Korean identifies the sender by the channel before they read a word of it — which is
 * also why a safety notice never shares a channel with advertising.
 *
 * @param props the app, the sender, the body, the buttons and the note
 * @returns the preview
 */
export function ChatPreview({ app, sender, children, buttons = [], note }: ChatPreviewProps) {
  return (
    // raw layout: a messenger bubble at phone width, which the design system has no primitive for
    <div className="max-w-sm" {...slotAttributes(chatPreviewStyle, {})}>
      <Stack gap="xs">
        <Flex align="center" gap="xs">
          <Badge variant="secondary">{app}</Badge>
          <Text as="span" size="caption" tone="muted">
            {sender}
          </Text>
        </Flex>
        <div {...slotAttributes(chatCardStyle, {})}>
          <Stack gap="sm">
            <span className="whitespace-pre-wrap">{children}</span>
            {/* Drawn as the channel draws them, at the grades the wording fixed. */}
            <WordingButtons buttons={buttons} />
          </Stack>
        </div>
        {note ? (
          <Text as="span" size="caption" tone="muted">
            {note}
          </Text>
        ) : null}
      </Stack>
    </div>
  );
}
