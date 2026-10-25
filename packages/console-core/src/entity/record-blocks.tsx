import { AlertBanner, Button, Flex, Text, type StatusTone } from "@simplix-react/ui";

/** A message inside a panel, a form or a dialog: it stays as long as what it explains is on screen. */
export interface RecordNotice {
  readonly key: string;
  readonly tone: "info" | "warning" | "danger" | "success";
  readonly title: string;
  readonly body?: string;
  /** An action the message offers, such as opening the list it is about. */
  readonly action?: { readonly label: string; readonly onClick?: () => void };
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
  if (!notices || notices.length === 0) return null;
  return (
    <>
      {notices.map((notice) => (
        <AlertBanner
          key={notice.key}
          tone={NOTICE_TONE[notice.tone]}
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

/** A quiet line under a table or a form that says how to read it. */
export function RecordNote({ text }: { readonly text?: string }) {
  if (!text) return null;
  return (
    <Text size="caption" tone="muted">
      {text}
    </Text>
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
    <span data-slot="console-verb-blocked" className="inline-flex max-w-60 flex-col items-stretch gap-0.5" title={verb.disabled}>
      {button}
      <span className="line-clamp-2 text-left text-xs leading-snug text-muted-foreground">{verb.disabled}</span>
    </span>
  );
}
