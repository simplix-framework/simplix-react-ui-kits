import { ChevronDownIcon, ChevronRightIcon } from "lucide-react";
import { forwardRef, type ComponentPropsWithoutRef, type ReactNode, type RefObject } from "react";
import { Flex, MenuLink, PopoverContent, Separator, Stack, Text, cn } from "@simplix-react/ui";

import { EllipsisText } from "../layout";

/**
 * The measure the expanded column and the rail's flyout are both drawn at.
 *
 * <p>One value, because the flyout exists to show the rail's rows at the width the column would
 * have shown them at: a reader who collapses the column and opens a cluster is looking at the same
 * list, and two measures make it a different list. Written per call site it was the same class in
 * two files, which is a pair that can drift and nothing compares.
 */
const MENU_MEASURE = "w-56";

/**
 * The band a navigation column is drawn on — a rule on the edge facing the content, and a ground
 * that sets the chrome apart from the screen beside it.
 *
 * <p><b>That ground is the console's chrome tint and the status strip draws the same one.</b> The
 * column is the larger surface, so it is what a reader calibrates the chrome against; a second
 * tint on the strip would read as a second kind of chrome, and there is only one. The top bar is
 * the exception and says so where it is written: it carries the product mark and the reader's own
 * controls rather than the frame around a screen, so it takes the app's own ground.
 */
const MENU_BAND = "border-r bg-muted/30";

/**
 * The shape a row of the menu tree has, in the three states the tree draws it in.
 *
 * <p><b>A constant rather than a primitive, because none of the three is a `div`.</b> `Flex` and
 * `Stack` render one and take no element override, and a menu row is a button that folds a branch,
 * a link that leaves the page, or a span that explains why it cannot — so the row's own
 * measurements live here once. Written out three times they drifted: one had `justify-between` and
 * one did not, and only a reader holding all three could see it.
 */
const MENU_ROW = "flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm";

/**
 * The slot the row's label grows into.
 *
 * <p>The floor is released as well as the truncation set: a flex child's minimum size is its
 * content, so a long destination name widens the row and pushes the caret out of the column
 * instead of shortening.
 */
const MENU_LABEL = "min-w-0 flex-1 truncate text-left";

/** How far the rows of a branch stand in from the branch above, and where the rule down them sits. */
const MENU_INDENT = "ml-4 border-l pl-1.5";

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
    <span aria-hidden className="flex w-4 shrink-0 items-center justify-center opacity-70">
      {children}
    </span>
  );
}

/**
 * Whether a branch is open, said at the end of its row.
 *
 * <p><b>The chevrons are imported rather than named.</b> The framework's `Icon` resolves a name
 * through two async hops, and a caret that arrives late or not at all is how a branch comes to look
 * like a leaf — one menu drew a caret on the branch that was open and none on the five beside it,
 * so five sets of destinations read as five screens nobody could reach.
 */
function MenuCaret({ open }: { readonly open: boolean }) {
  return (
    <span aria-hidden className="flex w-3.5 shrink-0 items-center justify-center opacity-60">
      {open ? <ChevronDownIcon size={14} /> : <ChevronRightIcon size={14} />}
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
}

/**
 * The navigation column collapsed to one mark per cluster.
 *
 * <p><b>A rail with no flyout is unusable</b>, which is why {@link ConsoleMenuFlyout} sits beside
 * this: one mark stands for ten or more screens, and without somewhere to show them the reader has
 * to expand the column to read a name and collapse it again.
 */
export function ConsoleMenuRail({ label, lead, children }: ConsoleMenuRailProps) {
  return (
    <Flex
      direction="column"
      gap="xs"
      align="center"
      shrink={false}
      className={`w-14 ${MENU_BAND} py-2`}
      aria-label={label}
    >
      {lead}
      {/* Shorter than the rail is wide, so it reads as a division inside the band rather than as
          a second edge across it. `Separator` publishes neither a length nor a margin. */}
      {lead != null && <Separator className="my-1 w-8" />}
      {children}
    </Flex>
  );
}

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
}

/**
 * The navigation column expanded — its area's name, and the destinations under it.
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
}: ConsoleMenuColumnProps) {
  return (
    <Flex
      direction="column"
      gap="none"
      shrink={false}
      className={`${MENU_MEASURE} ${MENU_BAND}`}
      aria-label={label}
    >
      {/* The rule under the heading and its inset, neither of which `Stack` names. */}
      <Flex justify="between" align="center" className="border-b px-3 py-2">
        <EllipsisText size="sm" weight="medium">
          {title}
        </EllipsisText>
        {action}
      </Flex>
      {/* The first level stands a little in from the column's edge, so the rows read as a list
          inside a panel rather than as text run up against its border. */}
      <Stack ref={bodyRef} flex minSize overflow="auto" gap="xs" padded className="pl-1">
        {children}
      </Stack>
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
      className={`${MENU_MEASURE} p-2`}
      onMouseLeave={onMouseLeave}
    >
      <Stack gap="xs">
        {/* Inset to the rows' own inset, so the title lines up with them rather than with the
            flyout's edge. */}
        <Text size="caption" tone="muted" className="px-2">
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
   * branch row — a tab holding one cluster — there is nothing for them to hang off and the rule
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
    <Stack gap="xs" className={ruled ? MENU_INDENT : undefined}>
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
      className={`${MENU_ROW} w-full justify-between hover:bg-accent${
        weight === "cluster" ? " font-medium" : ""
      }`}
    >
      <ConsoleMenuGlyph>{icon}</ConsoleMenuGlyph>
      <span className={MENU_LABEL}>{label}</span>
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
}

/** A row that leaves for the screen it names. */
export function ConsoleMenuLinkRow({ icon, label, href, current }: ConsoleMenuLinkRowProps) {
  return (
    <MenuLink
      href={href}
      className={`${MENU_ROW} hover:bg-accent${current ? " bg-accent font-medium" : ""}`}
    >
      <ConsoleMenuGlyph>{icon}</ConsoleMenuGlyph>
      <span className={MENU_LABEL}>{label}</span>
    </MenuLink>
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
 * swallows the events the trigger reads.
 */
export const ConsoleMenuInactiveRow = forwardRef<HTMLSpanElement, ConsoleMenuInactiveRowProps>(
  ({ icon, label, mark, className, ...rest }, ref) => (
    <span
      ref={ref}
      aria-disabled="true"
      {...rest}
      // Merged rather than overwritten. `TooltipTrigger asChild` clones this element with props of
      // its own, and a class written after the spread takes the last value for the attribute — so
      // whatever the trigger passed is accepted, typed and thrown away with nothing saying so.
      className={cn(MENU_ROW, "justify-between text-muted-foreground/70 cursor-default", className)}
    >
      <ConsoleMenuGlyph>{icon}</ConsoleMenuGlyph>
      <span className={MENU_LABEL}>{label}</span>
      <ConsoleMenuGlyph>{mark}</ConsoleMenuGlyph>
    </span>
  ),
);
ConsoleMenuInactiveRow.displayName = "ConsoleMenuInactiveRow";
