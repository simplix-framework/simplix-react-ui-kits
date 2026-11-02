import { ArrowRightIcon, HistoryIcon, SearchIcon, TriangleAlertIcon } from "lucide-react";
import { Fragment, useLayoutEffect, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { useTranslation } from "@simplix-react/i18n/react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  Dialog,
  DialogContent,
  DialogTitle,
} from "@simplix-react/ui";
import { partAttributes, slotAttributes } from "@simplix-react/ui/design";

import { summarizeSearch, useFederatedSearch, type FederatedSearchSource } from "./federated-search";
import { PACKAGE_NAMESPACE } from "./locales";
import type { ConsoleRecent } from "./palette-recents";
import {
  barSearchLabelStyle,
  barSearchStyle,
  keyCapStyle,
  paletteFootStyle,
  paletteHintStyle,
  paletteKeysStyle,
  paletteListStyle,
  paletteEscStyle,
  paletteFieldStyle,
  paletteMatchStyle,
  paletteMoreStyle,
  paletteStatusStyle,
  paletteStyle,
  paletteSubStyle,
  shortcutKeysStyle,
  shortcutListStyle,
} from "./command-palette.style";

/**
 * Which list a command is drawn in: go-to and menu destinations first, then the records the
 * product's sources find, then the actions.
 */
export type ConsoleCommandGroup = "go" | "action" | "menu";

/** One entry of the command palette. */
export interface ConsoleCommand {
  /** What identifies it among the palette's entries. */
  readonly key: string;
  readonly group: ConsoleCommandGroup;
  /** What the row prints and what a query is matched against. */
  readonly label: string;
  /** The second line: where a destination lives, or what an action acts on. Also matched. */
  readonly sub?: string;
  readonly icon?: ReactNode;
  /** The keys that reach this entry without the palette, drawn at the end of the row. */
  readonly keys?: readonly string[];
  /** What choosing it does. The palette closes first. */
  readonly run: () => void;
  /**
   * The address it opens, for a destination: ⌘ or Ctrl with Enter opens it in a new tab, and the
   * palette keeps it among the recents.
   */
  readonly href?: string;
}

/** The initial consonants of the Hangul syllables, in code-point order. */
const CHOSEONG = "ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ";

/** A label with every Hangul syllable replaced by its initial consonant, so 「ㅅㅇㅈ」 finds 「사용자」. */
function choseong(text: string): string {
  return Array.from(text)
    .map((ch) => {
      const offset = ch.charCodeAt(0) - 0xac00;
      return offset >= 0 && offset < 11172 ? CHOSEONG[Math.floor(offset / 588)] : ch;
    })
    .join("");
}

const isChoseongQuery = (query: string) => /^[ㄱ-ㅎ\s]+$/.test(query);

/**
 * How well a command answers the query: a label that starts with it first, then one that holds it
 * anywhere in the label or the second line, then one whose initial consonants hold it.
 * Zero or less is not shown. With no query only the go-to and action entries are shown.
 */
function score(command: ConsoleCommand, query: string): number {
  if (!query) return command.group === "menu" ? 0 : 1;
  const q = query.toLowerCase();
  const label = command.label.toLowerCase();
  if (label.startsWith(q)) return 3;
  if (`${label} ${command.sub ?? ""}`.toLowerCase().includes(q)) return 2;
  if (isChoseongQuery(query) && choseong(command.label).includes(query.replace(/\s/g, ""))) return 1.5;
  return 0;
}

/** How many of each list are shown, so a broad query does not bury the actions under destinations. */
const GROUP_LIMIT: Readonly<Record<ConsoleCommandGroup, number>> = { go: 6, action: 6, menu: 8 };
/** The destinations first, the records the product's sources find next, the actions last. */
const GROUP_ORDER: readonly ConsoleCommandGroup[] = ["go", "menu", "action"];

/** The label with the part the query matched marked. */
function Highlighted({ label, query }: { readonly label: string; readonly query: string }) {
  if (!query) return <>{label}</>;
  let at = label.toLowerCase().indexOf(query.toLowerCase());
  let length = query.length;
  if (at < 0 && isChoseongQuery(query)) {
    const compact = query.replace(/\s/g, "");
    at = choseong(label).indexOf(compact);
    length = compact.length;
  }
  if (at < 0) return <>{label}</>;
  return (
    <>
      {label.slice(0, at)}
      <mark {...slotAttributes(paletteMatchStyle, {})}>{label.slice(at, at + length)}</mark>
      {label.slice(at + length)}
    </>
  );
}

/** Props for {@link ConsoleKeyCap}. */
export interface ConsoleKeyCapProps {
  readonly children: ReactNode;
  /** Drawn on the top bar's ground rather than on a card. */
  readonly onBar?: boolean;
}

/** A key the reader presses, drawn as a keycap. */
export function ConsoleKeyCap({ children, onBar = false }: ConsoleKeyCapProps) {
  return (
    <kbd className="inline-grid shrink-0 place-items-center" {...slotAttributes(keyCapStyle, { onbar: onBar })}>
      {children}
    </kbd>
  );
}

/** Props for {@link ConsoleBarSearch}. */
export interface ConsoleBarSearchProps {
  /** Opens the palette. */
  readonly onOpen: () => void;
}

/**
 * The top bar's search, drawn as a field and opening the command palette.
 *
 * <p>A button rather than an input: what the reader types goes into the palette, which searches
 * screens, menus and actions together, and a second field in the bar would be a second search with
 * different answers.
 */
export function ConsoleBarSearch({ onOpen }: ConsoleBarSearchProps) {
  const { t } = useTranslation(`${PACKAGE_NAMESPACE}/chrome`);
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={t("palette.search")}
      aria-haspopup="dialog"
      title={t("palette.placeholder")}
      className="flex shrink-0 items-center"
      {...slotAttributes(barSearchStyle, {})}
    >
      <SearchIcon aria-hidden size={16} className="shrink-0" />
      <span className="min-w-0 flex-1 truncate" {...slotAttributes(barSearchLabelStyle, {})}>
        {t("palette.search")}
      </span>
      <ConsoleKeyCap onBar>⌘K</ConsoleKeyCap>
    </button>
  );
}

/** Props for {@link ConsoleCommandPalette}. */
export interface ConsoleCommandPaletteProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly commands: readonly ConsoleCommand[];
  /**
   * The places the palette looks for records once two or more characters are typed, each a group
   * of its own between the destinations and the actions. Absent, the palette finds commands only.
   */
  readonly records?: readonly FederatedSearchSource[];
  /** What the reader opened last, offered before anything is typed. */
  readonly recents?: readonly ConsoleRecent[];
  /** Opens an address inside the console: a record, a recent, a list searched for the text. */
  readonly navigate?: (href: string) => void;
  /** Told of every record and destination opened from the palette, for the recents. */
  readonly onOpened?: (opened: ConsoleRecent) => void;
}

/** A Hangul-initials-only text matches commands locally; no server search can match it. */
const asksRecords = (query: string) => !isChoseongQuery(query);

/** The key a reader holds with Enter to open a row in a new tab, as their keyboard prints it. */
function modifierKey(): string {
  return typeof navigator !== "undefined" && /Mac|iP(hone|ad|od)/.test(navigator.platform) ? "⌘" : "Ctrl";
}

/** One row the palette can open, whatever kind it is: its value is cmdk's selection. */
interface PaletteRow {
  readonly run: () => void;
  readonly href?: string;
}

/**
 * The command palette: one field that finds a screen, a record, a menu destination or an action and
 * opens it.
 *
 * <p>Built on the framework's `Command`, which moves the selection with the arrow keys and runs the
 * selected row on Enter; the ranking is the palette's own, because it groups and caps the results and
 * matches Hangul initial consonants, and `cmdk`'s fuzzy filter does neither. Records come from the
 * product's sources through {@link useFederatedSearch}, one group per source, each with its own
 * waiting and failure line, so a source that fails never empties the rest. ⌘ or Ctrl with Enter
 * opens the selected record or destination in a new tab.
 */
export function ConsoleCommandPalette({ open, onOpenChange, commands, records, recents, navigate, onOpened }: ConsoleCommandPaletteProps) {
  const { t } = useTranslation(`${PACKAGE_NAMESPACE}/chrome`);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState("");
  const trimmed = query.trim();
  const searching = records !== undefined && records.length > 0;
  const found = useFederatedSearch(records ?? [], trimmed, open && searching, { accepts: asksRecords });

  const shown = useMemo(
    () =>
      GROUP_ORDER.map((group) => ({
        group,
        rows: commands
          .map((command) => ({ command, score: score(command, trimmed) }))
          .filter((row) => row.command.group === group && row.score > 0)
          .sort((a, b) => b.score - a.score)
          .slice(0, GROUP_LIMIT[group])
          .map((row) => row.command),
      })).filter((section) => section.rows.length > 0),
    [commands, trimmed],
  );
  const before = shown.filter((section) => section.group !== "action");
  const after = shown.filter((section) => section.group === "action");
  const recentRows = trimmed === "" ? (recents ?? []) : [];
  // The groups answering the current text: an older text's answer stays until the new one is asked.
  const groups = found.groups.filter((group) => group.status !== "done" || group.results.length > 0);
  const { looking: stillLooking, noRecords } = summarizeSearch(found, trimmed);
  const tooShort = searching && trimmed.length === 1 && asksRecords(trimmed);

  const change = (next: boolean) => {
    if (!next) setQuery("");
    onOpenChange(next);
  };

  // The control that opened the palette, read before the dialog moves the focus into its field, so
  // closing it puts the reader back where they were (the bar's field, the phone's glyph, a row).
  const opener = useRef<HTMLElement | null>(null);
  useLayoutEffect(() => {
    if (!open) return;
    const active = document.activeElement;
    opener.current = active instanceof HTMLElement && active !== document.body ? active : null;
  }, [open]);
  const returnFocus = (event: Event) => {
    const control = opener.current;
    if (!control?.isConnected) return;
    event.preventDefault();
    control.focus();
  };

  const go = (href: string) => (navigate ? navigate(href) : window.location.assign(href));
  const rows = new Map<string, PaletteRow>();
  const row = (value: string, entry: PaletteRow) => {
    rows.set(value, entry);
    return {
      value,
      onSelect: () => {
        change(false);
        entry.run();
      },
    };
  };

  const commandRow = (command: ConsoleCommand) => (
    <CommandItem
      key={command.key}
      {...row(command.key, {
        href: command.href,
        run: () => {
          if (command.href) onOpened?.({ key: `page:${command.href}`, kind: "page", label: command.label, sub: command.sub, href: command.href });
          command.run();
        },
      })}
    >
      {command.icon}
      <span className="truncate">
        <Highlighted label={command.label} query={trimmed} />
      </span>
      {command.sub && (
        <span className="min-w-0 truncate" {...slotAttributes(paletteSubStyle, {})}>
          {command.sub}
        </span>
      )}
      {command.keys && command.keys.length > 0 && (
        <span className="flex shrink-0 items-center" {...slotAttributes(paletteKeysStyle, {})}>
          {command.keys.map((key) => (
            <ConsoleKeyCap key={key}>{key}</ConsoleKeyCap>
          ))}
        </span>
      )}
    </CommandItem>
  );

  const commandGroups = (sections: typeof shown) =>
    sections.map((section) => (
      <CommandGroup key={section.group} heading={t(`palette.groups.${section.group}`)}>
        {section.rows.map(commandRow)}
      </CommandGroup>
    ));

  // Nothing at all answers the text: no command, no record, nothing still asked or failed to say so.
  const nothing = trimmed !== "" && shown.length === 0 && groups.length === 0 && !stillLooking && !tooShort;

  // ⌘ or Ctrl with Enter: the selected row in a new tab, where it has an address. The palette stays
  // open, so several records can be opened one after another.
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Enter" || !(event.metaKey || event.ctrlKey)) return;
    const href = rows.get(selected)?.href;
    if (!href) return;
    event.preventDefault();
    window.open(href, "_blank", "noopener");
  };

  return (
    <Dialog open={open} onOpenChange={change}>
      <DialogContent
        flush
        showCloseButton={false}
        onCloseAutoFocus={returnFocus}
        className="top-[12vh] w-[min(640px,92vw)] translate-y-0 sm:max-w-[640px]"
        {...partAttributes(paletteStyle, {})}
      >
        <DialogTitle className="sr-only">{t("palette.title")}</DialogTitle>
        <Command shouldFilter={false} loop value={selected} onValueChange={setSelected} onKeyDown={onKeyDown}>
          <div className="flex items-center" {...slotAttributes(paletteFieldStyle, {})}>
            <CommandInput
              value={query}
              onValueChange={setQuery}
              placeholder={t(searching ? "palette.placeholderRecords" : "palette.placeholder")}
              aria-label={t(searching ? "palette.placeholderRecords" : "palette.placeholder")}
            />
            <span aria-hidden className="flex shrink-0 items-center" {...slotAttributes(paletteEscStyle, {})}>
              <ConsoleKeyCap>Esc</ConsoleKeyCap>
            </span>
          </div>
          <CommandList className="max-h-[52vh]" {...partAttributes(paletteListStyle, {})}>
            {nothing && <CommandEmpty>{t("palette.empty", { query: trimmed })}</CommandEmpty>}
            {recentRows.length > 0 && (
              <CommandGroup heading={t("palette.groups.recent")}>
                {recentRows.map((recent) => (
                  <CommandItem key={recent.key} {...row(`recent:${recent.key}`, { href: recent.href, run: () => { onOpened?.(recent); go(recent.href); } })}>
                    <HistoryIcon aria-hidden />
                    <span className="truncate">{recent.label}</span>
                    {recent.sub && (
                      <span className="min-w-0 truncate" {...slotAttributes(paletteSubStyle, {})}>
                        {recent.sub}
                      </span>
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
            {commandGroups(before)}
            {tooShort && (
              <CommandGroup heading={t("palette.records.heading")}>
                <CommandItem disabled value="records:too-short">
                  <span {...slotAttributes(paletteStatusStyle, {})}>{t("palette.records.tooShort")}</span>
                </CommandItem>
              </CommandGroup>
            )}
            {groups.map((group) => (
              <CommandGroup key={`records:${group.key}`} heading={group.label}>
                {group.status === "loading" && (
                  <CommandItem disabled value={`records:${group.key}:loading`}>
                    <span {...slotAttributes(paletteStatusStyle, {})}>{t("palette.records.loading", { name: group.label })}</span>
                  </CommandItem>
                )}
                {group.status === "failed" && (
                  <CommandItem disabled value={`records:${group.key}:failed`}>
                    <TriangleAlertIcon aria-hidden />
                    <span {...slotAttributes(paletteStatusStyle, { tone: "failed" })}>{t("palette.records.failed", { name: group.label })}</span>
                  </CommandItem>
                )}
                {group.results.map((result) => {
                  const recent: ConsoleRecent = { key: `record:${group.key}:${result.id}`, kind: "record", label: result.title, sub: group.label, href: result.href };
                  return (
                    <CommandItem key={result.id} {...row(recent.key, { href: result.href, run: () => { onOpened?.(recent); go(result.href); } })}>
                      {group.icon}
                      <span className="truncate">
                        <Highlighted label={result.title} query={found.query} />
                      </span>
                      {result.sub && (
                        <span className="min-w-0 truncate" {...slotAttributes(paletteSubStyle, {})}>
                          {result.sub}
                        </span>
                      )}
                    </CommandItem>
                  );
                })}
                {group.status === "done" && group.listHref && (
                  <CommandItem {...row(`records:${group.key}:all`, { href: group.listHref, run: () => go(group.listHref ?? "") })}>
                    <ArrowRightIcon aria-hidden />
                    <span className="truncate" {...slotAttributes(paletteMoreStyle, {})}>
                      {t("palette.records.showAll", { name: group.label })}
                    </span>
                  </CommandItem>
                )}
              </CommandGroup>
            ))}
            {/* The text found no record: said once under the destinations it did find, or, beside a
                failed source, said for the sources that answered. */}
            {noRecords && (shown.length > 0 || groups.length > 0) && (
              <CommandGroup heading={t("palette.records.heading")}>
                <CommandItem disabled value="records:none">
                  <span {...slotAttributes(paletteStatusStyle, {})}>{t("palette.records.none", { query: found.query })}</span>
                </CommandItem>
              </CommandGroup>
            )}
            {commandGroups(after)}
          </CommandList>
        </Command>
        <div className="flex flex-wrap items-center" {...slotAttributes(paletteFootStyle, {})}>
          <span className="inline-flex items-center" {...slotAttributes(paletteHintStyle, {})}>
            <ConsoleKeyCap>↑</ConsoleKeyCap>
            <ConsoleKeyCap>↓</ConsoleKeyCap>
            {t("palette.move")}
          </span>
          <span className="inline-flex items-center" {...slotAttributes(paletteHintStyle, {})}>
            <ConsoleKeyCap>Enter</ConsoleKeyCap>
            {t("palette.run")}
          </span>
          {searching && (
            <span className="inline-flex items-center" {...slotAttributes(paletteHintStyle, {})}>
              <ConsoleKeyCap>{modifierKey()}</ConsoleKeyCap>
              <ConsoleKeyCap>Enter</ConsoleKeyCap>
              {t("palette.newTab")}
            </span>
          )}
          <span>{t("palette.choseong")}</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/** One row of the shortcut list: what it does and the keys, pressed in order. */
export interface ConsoleShortcut {
  readonly label: string;
  /** Each inner list is one chord; several chords are alternatives. */
  readonly keys: readonly (readonly string[])[];
}

/** Props for {@link ConsoleShortcutList}. */
export interface ConsoleShortcutListProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly shortcuts: readonly ConsoleShortcut[];
}

/** The list of keyboard shortcuts the console binds, opened with 「?」 or from the palette. */
export function ConsoleShortcutList({ open, onOpenChange, shortcuts }: ConsoleShortcutListProps) {
  const { t } = useTranslation(`${PACKAGE_NAMESPACE}/chrome`);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogTitle>{t("shortcuts.title")}</DialogTitle>
        <div className="grid grid-cols-[1fr_auto] items-center" {...slotAttributes(shortcutListStyle, {})}>
          {shortcuts.map((shortcut) => (
            <Fragment key={shortcut.label}>
              <span>{shortcut.label}</span>
              <span className="flex items-center justify-end" {...slotAttributes(shortcutKeysStyle, {})}>
                {shortcut.keys.map((chord, index) => (
                  <Fragment key={chord.join("+")}>
                    {index > 0 && " "}
                    {chord.map((key) => (
                      <ConsoleKeyCap key={key}>{key}</ConsoleKeyCap>
                    ))}
                  </Fragment>
                ))}
              </span>
            </Fragment>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
