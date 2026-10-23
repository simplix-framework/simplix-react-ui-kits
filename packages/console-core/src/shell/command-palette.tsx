import { SearchIcon } from "lucide-react";
import { Fragment, useMemo, useState, type ReactNode } from "react";
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

import { PACKAGE_NAMESPACE } from "./locales";
import {
  barSearchLabelStyle,
  barSearchStyle,
  keyCapStyle,
  paletteFootStyle,
  paletteHintStyle,
  paletteKeysStyle,
  paletteListStyle,
  paletteEscStyle,
  paletteMatchStyle,
  paletteStyle,
  paletteSubStyle,
  shortcutKeysStyle,
  shortcutListStyle,
} from "./command-palette.style";

/** Which list a command is drawn in. Go-to and action entries come first, menu destinations last. */
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
const GROUP_ORDER: readonly ConsoleCommandGroup[] = ["go", "action", "menu"];

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
    <kbd className="inline-grid shrink-0 place-items-center" {...slotAttributes(keyCapStyle, { onBar })}>
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
}

/**
 * The command palette: one field that finds a screen, a menu destination or an action and runs it.
 *
 * <p>Built on the framework's `Command`, which moves the selection with the arrow keys and runs the
 * selected row on Enter; the ranking is the palette's own, because it groups and caps the results and
 * matches Hangul initial consonants, and `cmdk`'s fuzzy filter does neither.
 */
export function ConsoleCommandPalette({ open, onOpenChange, commands }: ConsoleCommandPaletteProps) {
  const { t } = useTranslation(`${PACKAGE_NAMESPACE}/chrome`);
  const [query, setQuery] = useState("");
  const trimmed = query.trim();

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

  const change = (next: boolean) => {
    if (!next) setQuery("");
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={change}>
      <DialogContent
        flush
        showCloseButton={false}
        className="top-[12vh] w-[min(640px,92vw)] translate-y-0 sm:max-w-[640px]"
        {...partAttributes(paletteStyle, {})}
      >
        <DialogTitle className="sr-only">{t("palette.title")}</DialogTitle>
        <Command shouldFilter={false} loop>
          <div className="relative">
            <CommandInput value={query} onValueChange={setQuery} placeholder={t("palette.placeholder")} aria-label={t("palette.placeholder")} />
            <span aria-hidden className="pointer-events-none absolute flex items-center" {...slotAttributes(paletteEscStyle, {})}>
              <ConsoleKeyCap>Esc</ConsoleKeyCap>
            </span>
          </div>
          <CommandList className="max-h-[52vh]" {...partAttributes(paletteListStyle, {})}>
            <CommandEmpty>{t("palette.empty", { query: trimmed })}</CommandEmpty>
            {shown.map((section) => (
              <CommandGroup key={section.group} heading={t(`palette.groups.${section.group}`)}>
                {section.rows.map((command) => (
                  <CommandItem
                    key={command.key}
                    value={command.key}
                    onSelect={() => {
                      change(false);
                      command.run();
                    }}
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
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
        <div className="flex items-center" {...slotAttributes(paletteFootStyle, {})}>
          <span className="inline-flex items-center" {...slotAttributes(paletteHintStyle, {})}>
            <ConsoleKeyCap>↑</ConsoleKeyCap>
            <ConsoleKeyCap>↓</ConsoleKeyCap>
            {t("palette.move")}
          </span>
          <span className="inline-flex items-center" {...slotAttributes(paletteHintStyle, {})}>
            <ConsoleKeyCap>Enter</ConsoleKeyCap>
            {t("palette.run")}
          </span>
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
