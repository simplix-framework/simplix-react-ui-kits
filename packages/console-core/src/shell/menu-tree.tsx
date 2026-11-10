import { ChevronRightIcon, ExternalLinkIcon } from "lucide-react";
import { useTranslation } from "@simplix-react/i18n/react";
import {
  forwardRef,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type ReactNode,
  type RefObject,
} from "react";
import {
  Button,
  MenuLink,
  PopoverContent,
  Separator,
  Stack,
  Text,
  cn,
  Flex,
} from "@simplix-react/ui";

import { EllipsisText } from "../layout";
import { PACKAGE_NAMESPACE } from "./locales";
import { menuSearchBoxStyle } from "./menu-search.style";
import {
  menuBranchStyle,
  menuCaretStyle,
  menuColumnBodyStyle,
  menuColumnHeadStyle,
  menuColumnStyle,
  menuFlyoutStyle,
  menuFlyoutTitleStyle,
  menuGlyphStyle,
  menuLabelStyle,
  menuRailButtonStyle,
  menuRailFootStyle,
  menuRailRuleStyle,
  menuRailStyle,
  menuRowStyle,
  menuInkStyle,
  menuSlotStyle,
} from "./menu-tree.style";
import { partAttributes, slotAttributes } from "@simplix-react/ui/design";

/**
 * The measure the rail's flyout is drawn at: the classic column's own width, so a reader who
 * collapses the column and opens a cluster sees the same rows at the same width. The column's
 * measure is its declaration's, where a design may set its own.
 */
const MENU_MEASURE = "w-56";

/**
 * The slot the row's label grows into.
 *
 * <p>The floor is released as well as the truncation set: a flex child's minimum size is its
 * content, so a long destination name widens the row and pushes the caret out of the column
 * instead of shortening.
 */
const MENU_LABEL = "min-w-0 flex-1 truncate";

/** What every row lays out as; its measurements are {@link menuRowStyle}. */
const MENU_ROW_LAYOUT = "flex items-center";

/** Props for {@link ConsoleMenuGlyph}. */
export interface ConsoleMenuGlyphProps {
  /** The mark, drawn at 16px. Absent, the slot is empty and still holds its width. */
  readonly children?: ReactNode;
}

/**
 * The mark that stands for a destination, or for the branch holding a set of them.
 *
 * <p><b>The slot holds its width whether or not there is a mark in it</b>, so the labels line up
 * down the column rather than starting wherever each row's own icon happens to leave off.
 *
 * <p>Which mark belongs to which destination is the product's to know; this draws the slot.
 */
export function ConsoleMenuGlyph({ children }: ConsoleMenuGlyphProps) {
  return (
    <span
      aria-hidden
      className="flex w-4 shrink-0 items-center justify-center [&>svg]:size-4"
      {...slotAttributes(menuGlyphStyle, {})}
    >
      {children}
    </span>
  );
}

/**
 * Whether a branch is open, said at the end of its row.
 *
 * <p><b>The chevrons are imported rather than named.</b> The framework's `Icon` resolves a name
 * through two async hops, and a caret that arrives late or not at all is how a branch comes to look
 * like a leaf: one menu drew a caret on the branch that was open and none on the five beside it,
 * so five sets of destinations read as five screens nobody could reach.
 */
function MenuCaret({ open }: { readonly open: boolean }) {
  return (
    <span
      aria-hidden
      className="flex w-3.5 shrink-0 items-center justify-center"
      {...slotAttributes(menuCaretStyle, { open })}
    >
      <ChevronRightIcon size={14} />
    </span>
  );
}

/** Props for {@link ConsoleMenuRail}. */
export interface ConsoleMenuRailProps {
  /** What the rail is called, for a reader who is not looking at it. */
  readonly label: string;
  /**
   * The control that expands the column again.
   *
   * <p>A rule is drawn under it, because a control that acts on the column is not one of the
   * destinations under it and a rail with nothing between them reads as a list whose first item
   * does something else.
   */
  readonly lead?: ReactNode;
  /** One mark per cluster, each opening a flyout of what it stands for. */
  readonly children: ReactNode;
  /**
   * What the rail holds under its marks (the services beside the console), pushed to its foot. It
   * draws its own rule; absent or drawing nothing, the rail ends with its last mark.
   */
  readonly foot?: ReactNode;
  /** The search, held above the foot at the end of the rail ({@link ConsoleMenuSearch} with `layout="rail"`). */
  readonly search?: ReactNode;
}

/**
 * The navigation column collapsed to one mark per cluster.
 *
 * <p>The foot is held at the rail's end by a box with no look of its own, so a foot that draws
 * nothing (no service configured) leaves no rule and no gap a reader could see.
 *
 * <p><b>A rail with no flyout is unusable</b>, which is why {@link ConsoleMenuFlyout} sits beside
 * this: one mark stands for ten or more screens, and without somewhere to show them the reader has
 * to expand the column to read a name and collapse it again.
 */
export function ConsoleMenuRail({ label, lead, children, foot, search }: ConsoleMenuRailProps) {
  return (
    <Flex
      direction="column"
      gap="xs"
      align="center"
      shrink={false}
      aria-label={label}
      {...partAttributes(menuRailStyle, {})}
    >
      {lead}
      {lead != null && <Separator className="w-8" {...partAttributes(menuRailRuleStyle, {})} />}
      {children}
      {(foot != null || search != null) && (
        <Stack gap="xs" align="center" {...partAttributes(menuRailFootStyle, {})}>
          {search}
          {foot}
        </Stack>
      )}
    </Flex>
  );
}

/** Props for {@link ConsoleMenuRailButton}. */
export interface ConsoleMenuRailButtonProps extends Omit<ComponentPropsWithoutRef<"button">, "children"> {
  /** Whether the cluster holds the screen the reader is on. */
  readonly active: boolean;
  /** The cluster's name, for a reader who is not looking at the mark. */
  readonly label?: string;
  /** The cluster's mark. */
  readonly children?: ReactNode;
}

/**
 * One mark on the rail, standing for a cluster and opening its flyout.
 *
 * <p>It forwards its ref and its props because a `PopoverTrigger asChild` clones it with the
 * handlers and the state the popover reads.
 */
export const ConsoleMenuRailButton = forwardRef<HTMLButtonElement, ConsoleMenuRailButtonProps>(
  ({ active, label, children, ...rest }, ref) => (
    <Button
      ref={ref}
      variant={active ? "secondary" : "outline"}
      size="icon-sm"
      aria-label={label}
      title={label}
      {...rest}
      {...partAttributes(menuRailButtonStyle, { active })}
    >
      <ConsoleMenuGlyph>{children}</ConsoleMenuGlyph>
    </Button>
  ),
);
ConsoleMenuRailButton.displayName = "ConsoleMenuRailButton";

/** Props for {@link ConsoleMenuColumn}. */
export interface ConsoleMenuColumnProps {
  /** What the column is called, for a reader who is not looking at it. */
  readonly label: string;
  /**
   * What this column is the menu of.
   *
   * <p>Not the word 「메뉴」: a reader who followed a link into a screen arrives with the column
   * already changed under them, and the area's own name is what says which area that is.
   */
  readonly title: ReactNode;
  /** The control that collapses the column, drawn at the end of the title's row. */
  readonly action?: ReactNode;
  /**
   * The scrolling body, for a caller that scrolls it to the row the reader is standing on.
   *
   * <p>A tab holds up to forty-eight destinations, so that row is usually below the fold and a
   * menu opened at the top says nothing about where the reader is.
   *
   * <p>An object ref rather than the wider `Ref`, because the framework's UI package resolves its
   * own copy of the React types through a linked checkout: a callback ref's return type is then
   * two unrelated declarations of the same name and the assignment is refused. An object ref is
   * structural and crosses that boundary, and it is what a caller reading the element holds anyway.
   */
  readonly bodyRef?: RefObject<HTMLDivElement | null>;
  /** The clusters, each a branch row and the destinations under it. */
  readonly children: ReactNode;
  /**
   * What the column holds under its destinations (the services beside the console), drawn after the
   * scrolling body so it stays at the column's foot however long the menu is. It draws its own rule
   * and inset, so a foot that draws nothing leaves the column as it was.
   */
  readonly foot?: ReactNode;
  /**
   * The search, held between the destinations and the foot so it stays at the column's end however
   * long the menu is ({@link ConsoleMenuSearch}). It sits in a box with its own rule and inset.
   */
  readonly search?: ReactNode;
}

/**
 * The navigation column expanded: its area's name, and the destinations under it.
 *
 * <p><b>The body owns its own scroll rather than being a bounded read-through box.</b> `ScrollBox`
 * caps at 288px and draws a border, so a tab holding forty-eight destinations ended two-thirds of
 * the way down a frame nobody could reach.
 */
export function ConsoleMenuColumn({
  label,
  title,
  action,
  bodyRef,
  children,
  foot,
  search,
}: ConsoleMenuColumnProps) {
  return (
    <Flex
      direction="column"
      gap="none"
      shrink={false}
      aria-label={label}
      // The search's own rule stands over it and the services' rule under it is left off, so the two
      // do not stack into a double line.
      className={search != null ? "[&_[data-part=console-service-links]]:border-t-0!" : undefined}
      {...partAttributes(menuColumnStyle, {})}
    >
      {/* The rule under the heading and its inset, neither of which `Stack` names. */}
      <Flex justify="between" align="center" {...partAttributes(menuColumnHeadStyle, {})}>
        <EllipsisText size="sm" weight="medium">
          {title}
        </EllipsisText>
        {action}
      </Flex>
      <Stack
        ref={bodyRef}
        flex
        minSize
        overflow="auto"
        gap="xs"
        padded
        className="relative"
        {...partAttributes(menuColumnBodyStyle, {})}
      >
        {children}
        <MenuInk />
      </Stack>
      {search != null && <div {...partAttributes(menuSearchBoxStyle, {})}>{search}</div>}
      {foot}
    </Flex>
  );
}

/** Props for {@link ConsoleMenuFlyout}. */
export interface ConsoleMenuFlyoutProps {
  /** The cluster's name, drawn over the rows it gathers. */
  readonly title: ReactNode;
  /** Closes the flyout when the pointer leaves it. */
  readonly onMouseLeave?: () => void;
  /** The destinations. */
  readonly children: ReactNode;
}

/**
 * What one mark on the rail stands for, opened beside it.
 *
 * <p>Drawn at the expanded column's measure so the rail and the column show the same rows at the
 * same width, and inset tighter than a popover's default because it holds menu rows rather than
 * prose. `PopoverContent` publishes neither.
 */
export function ConsoleMenuFlyout({ title, onMouseLeave, children }: ConsoleMenuFlyoutProps) {
  return (
    <PopoverContent
      side="right"
      align="start"
      className={MENU_MEASURE}
      onMouseLeave={onMouseLeave}
      {...partAttributes(menuFlyoutStyle, {})}
    >
      <Stack gap="xs">
        <Text size="caption" tone="muted" {...partAttributes(menuFlyoutTitleStyle, {})}>
          {title}
        </Text>
        {children}
      </Stack>
    </PopoverContent>
  );
}

/** Props for {@link ConsoleMenuBranch}. */
export interface ConsoleMenuBranchProps {
  /**
   * Whether these rows hang off a branch row above them.
   *
   * <p>The rule down the left is what says so: with several branches open at once the indent alone
   * is a column of rows at two x positions and nothing joining them. Where the column draws no
   * branch row (a tab holding one cluster) there is nothing for them to hang off and the rule
   * would be a border of its own.
   */
  readonly ruled?: boolean;
  /** The rows. */
  readonly children: ReactNode;
}

/**
 * The rows under one branch, indented and gathered by the rule down their left.
 *
 * <p><b>One indent at every depth.</b> The two levels this replaces stood at 22px and 24px, which
 * nothing decided and nothing compared; the step is now icon-plus-gap at both, which is the
 * distance a child row's label sits from its parent's.
 */
export function ConsoleMenuBranch({ ruled, children }: ConsoleMenuBranchProps) {
  return (
    <Stack gap="xs" {...partAttributes(menuBranchStyle, { ruled })}>
      {children}
    </Stack>
  );
}

/** Props for {@link ConsoleMenuBranchRow}. */
export interface ConsoleMenuBranchRowProps {
  /** The mark at the head of the row. */
  readonly icon?: ReactNode;
  /** What the branch is called. */
  readonly label: ReactNode;
  /** Whether the rows under it are showing. */
  readonly open: boolean;
  /** Folds the branch, and unfolds it again. */
  readonly onToggle: () => void;
  /**
   * How prominent the row is.
   *
   * <p>A cluster heads the column's top level and is set in medium; an entry that happens to hold
   * children is one of the rows under one, and setting it apart would say it is a different kind
   * of thing.
   */
  readonly weight?: "cluster" | "entry";
}

/** A row that folds the set of destinations under it. */
export function ConsoleMenuBranchRow({
  icon,
  label,
  open,
  onToggle,
  weight = "entry",
}: ConsoleMenuBranchRowProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={open}
      className={`${MENU_ROW_LAYOUT} w-full justify-between`}
      {...slotAttributes(menuRowStyle, { kind: "branch", strong: weight === "cluster" })}
    >
      <ConsoleMenuGlyph>{icon}</ConsoleMenuGlyph>
      <span className={MENU_LABEL} {...slotAttributes(menuLabelStyle, {})}>
        {label}
      </span>
      <MenuCaret open={open} />
    </button>
  );
}

/** Props for {@link ConsoleMenuLinkRow}. */
export interface ConsoleMenuLinkRowProps {
  /** The mark at the head of the row. */
  readonly icon?: ReactNode;
  /** What the destination is called. */
  readonly label: ReactNode;
  /** Where it goes. */
  readonly href: string;
  /** Whether the reader is standing on it. */
  readonly current?: boolean;
  /**
   * Whether it opens another service rather than a screen of this console. The row opens it in a new
   * tab with no opener and no referrer, marks its end with the external-link glyph and tells a screen
   * reader the tab is new, so the console the reader leaves stays where it was.
   */
  readonly external?: boolean;
}

/** A row that leaves for the screen it names, or opens the service it names in a new tab. */
export function ConsoleMenuLinkRow({ icon, label, href, current, external }: ConsoleMenuLinkRowProps) {
  return (
    <MenuLink
      href={href}
      linkTarget={external ? "BLANK" : undefined}
      className={MENU_ROW_LAYOUT}
      attributes={{
        ...slotAttributes(menuRowStyle, {
          kind: "link",
          strong: Boolean(current),
          current: Boolean(current),
        }),
        // The ground marks the row for the eye; a screen reader hears the same from aria-current.
        ...(current ? { "aria-current": "page" } : {}),
      }}
    >
      <ConsoleMenuGlyph>{icon}</ConsoleMenuGlyph>
      <span className={MENU_LABEL} {...slotAttributes(menuLabelStyle, {})}>
        {label}
      </span>
      {external && <NewTabMark />}
    </MenuLink>
  );
}

/**
 * The end of a row that opens a new tab: the external-link glyph for the eye, and the same said in
 * words for a screen reader, which hears it as the end of the link's name.
 */
function NewTabMark() {
  const { t } = useTranslation(`${PACKAGE_NAMESPACE}/chrome`);
  return (
    <>
      <ConsoleMenuGlyph>
        <ExternalLinkIcon />
      </ConsoleMenuGlyph>
      <span className="sr-only">{` ${t("link.newTab")}`}</span>
    </>
  );
}

/** Props for {@link ConsoleMenuInactiveRow}. */
export interface ConsoleMenuInactiveRowProps extends ComponentPropsWithoutRef<"span"> {
  /** The mark at the head of the row. */
  readonly icon?: ReactNode;
  /** What the destination is called. */
  readonly label: ReactNode;
  /** The mark at the end, which says which kind of 「열 수 없다」 this row is. */
  readonly mark?: ReactNode;
}

/**
 * A row that is drawn and cannot be opened.
 *
 * <p>The destination is drawn because the tree is the shape of the product, and it is not a link
 * because pressing it would land on a not-found page that says nothing about why.
 *
 * <p><b>It forwards its ref and its props</b> so a tooltip can hang the reason off it: a
 * `TooltipTrigger asChild` needs a single element that takes the pointer, and a disabled control
 * swallows the events the trigger reads. <b>It is focusable</b>: the reason it cannot be opened is
 * read on focus as well as on hover, so a keyboard reader is told as a pointer reader is.
 */
export const ConsoleMenuInactiveRow = forwardRef<HTMLSpanElement, ConsoleMenuInactiveRowProps>(
  ({ icon, label, mark, className, ...rest }, ref) => (
    <span
      ref={ref}
      aria-disabled="true"
      // A tab stop, so the reason a destination cannot be opened (a tooltip on focus, the row's
      // description to a screen reader) reaches a reader who has no pointer; a disabled item keeps
      // its place in the keyboard's path.
      tabIndex={0}
      {...rest}
      // Merged rather than overwritten. `TooltipTrigger asChild` clones this element with props of
      // its own, and a class written after the spread takes the last value for the attribute, so
      // whatever the trigger passed is accepted, typed and thrown away with nothing saying so.
      className={cn(MENU_ROW_LAYOUT, "justify-between cursor-default", className)}
      {...slotAttributes(menuRowStyle, { kind: "inactive" })}
    >
      <ConsoleMenuGlyph>{icon}</ConsoleMenuGlyph>
      <span className={MENU_LABEL} {...slotAttributes(menuLabelStyle, {})}>
        {label}
      </span>
      <ConsoleMenuGlyph>{mark}</ConsoleMenuGlyph>
    </span>
  ),
);
ConsoleMenuInactiveRow.displayName = "ConsoleMenuInactiveRow";

/**
 * Holds the navigation column or its rail and animates the width between them.
 *
 * <p>The two are different elements, so neither can transition into the other. After every render
 * the box measures what it holds; when that differs from the last measure, it pins its own width to
 * the old figure and releases it to the new one on the next style pass, which the slot's width
 * transition carries. Whatever caused the change (the collapse button, a shortcut, the window
 * crossing the narrow breakpoint) animates the same way. With motion reduced the transition is
 * zero-length and the width lands at once.
 *
 * @param props the column or the rail
 * @returns the box
 */
export function ConsoleMenuSlot({ children }: { readonly children: ReactNode }) {
  const box = useRef<HTMLDivElement>(null);
  const last = useRef<number | null>(null);

  useLayoutEffect(() => {
    const element = box.current;
    if (!element) return;
    // Released before measuring, so a change that lands mid-animation measures the content rather
    // than the pinned width.
    element.style.width = "";
    const held = element.firstElementChild;
    const next = held instanceof HTMLElement ? held.getBoundingClientRect().width : 0;
    const from = last.current;
    last.current = next;
    if (from === null || Math.abs(from - next) < 1) return;

    element.style.width = `${from}px`;
    // Reading layout here commits the start width before the end width is set.
    void element.offsetWidth;
    element.style.width = `${next}px`;
    const release = () => {
      element.style.width = "";
    };
    element.addEventListener("transitionend", release, { once: true });
    // A zero-length transition fires no end event.
    const fallback = window.setTimeout(release, 1000);
    return () => {
      window.clearTimeout(fallback);
      element.removeEventListener("transitionend", release);
    };
  });

  return (
    <div ref={box} {...slotAttributes(menuSlotStyle, {})}>
      {children}
    </div>
  );
}

/**
 * The rows under a branch, growing out of the row above as it opens and folding back as it closes.
 *
 * <p>Closed and at rest, nothing is mounted, exactly as a conditional render leaves it, so a closed
 * branch costs neither layout nor the column's gap. While it moves it is mounted as a fold whose
 * single grid row runs between 0fr and 1fr, and it takes back the gap its parent puts above it
 * with a negative margin on the same curve, so the rows below glide rather than jump by a gap at
 * either end. With motion reduced it mounts and unmounts at once.
 *
 * @param props whether the branch is open, and its rows
 * @returns the fold, or nothing
 */
export function ConsoleMenuFold({ open, children }: { readonly open: boolean; readonly children: ReactNode }) {
  const [mounted, setMounted] = useState(open);
  const [shown, setShown] = useState(open);
  const [gap, setGap] = useState(0);
  const box = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setMounted(open);
      setShown(open);
      return;
    }
    if (open) setMounted(true);
    else setShown(false);
  }, [open]);

  // Mounted closed first, measured, then opened on the next frame so the rows have a start to grow
  // from.
  useLayoutEffect(() => {
    const parent = box.current?.parentElement;
    if (parent) setGap(Number.parseFloat(getComputedStyle(parent).rowGap) || 0);
  }, [mounted]);
  useEffect(() => {
    if (!open || !mounted || shown) return;
    const frame = requestAnimationFrame(() => setShown(true));
    return () => cancelAnimationFrame(frame);
  }, [open, mounted, shown]);

  useEffect(() => {
    if (open || !mounted || shown) return;
    const element = box.current;
    const done = () => setMounted(false);
    const onEnd = (event: TransitionEvent) => {
      if (event.target === element && event.propertyName === "grid-template-rows") done();
    };
    element?.addEventListener("transitionend", onEnd);
    // A design with no fold duration fires no end event.
    const fallback = window.setTimeout(done, 800);
    return () => {
      window.clearTimeout(fallback);
      element?.removeEventListener("transitionend", onEnd);
    };
  }, [open, mounted, shown]);

  if (!mounted) return null;
  return (
    <div
      ref={box}
      className="tiles-fold"
      data-open={shown ? "true" : "false"}
      inert={!open}
      style={{
        marginTop: shown ? 0 : -gap,
        transition:
          "grid-template-rows var(--fold-dur, 240ms) var(--fold-ease, ease), margin-top var(--fold-dur, 240ms) var(--fold-ease, ease)",
      }}
    >
      <div>{children}</div>
    </div>
  );
}

interface InkBox {
  readonly top: number;
  readonly height: number;
}

/**
 * The current row's mark, measured against the column body it scrolls with.
 *
 * <p>Remeasured whenever anything in the body changes size (a branch folding above the row moves
 * it) or the current row changes, so the mark slides on the selected-indicator curve rather than
 * jumping. Nothing is drawn while the current row is folded away.
 */
function MenuInk() {
  const self = useRef<HTMLSpanElement>(null);
  const [box, setBox] = useState<InkBox | null>(null);

  useEffect(() => {
    const body = self.current?.parentElement;
    if (!body) return;
    const measure = () => {
      const row = body.querySelector<HTMLElement>('[data-slot="console-menu-row"][data-current="true"]');
      if (!row || row.closest('[data-open="false"]')) return setBox(null);
      const rowBox = row.getBoundingClientRect();
      const origin = body.getBoundingClientRect();
      setBox({ top: rowBox.top - origin.top + body.scrollTop, height: rowBox.height });
    };
    measure();
    const sizes = new ResizeObserver(measure);
    const watch = () => {
      sizes.disconnect();
      sizes.observe(body);
      for (const child of Array.from(body.querySelectorAll("*"))) {
        if (child instanceof HTMLElement && child.dataset.slot !== "console-menu-ink") sizes.observe(child);
      }
    };
    watch();
    const changes = new MutationObserver(() => {
      watch();
      measure();
    });
    changes.observe(body, { subtree: true, childList: true, attributes: true, attributeFilter: ["data-current", "data-open"] });
    return () => {
      sizes.disconnect();
      changes.disconnect();
    };
  }, []);

  return (
    <span
      ref={self}
      aria-hidden
      className="pointer-events-none absolute"
      style={box ? { top: box.top, height: box.height } : { opacity: 0 }}
      {...slotAttributes(menuInkStyle, {})}
    />
  );
}
