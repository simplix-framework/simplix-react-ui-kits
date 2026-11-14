import { forwardRef, type ComponentPropsWithoutRef, type ReactNode, type RefObject } from "react";
import { Button, PopoverContent, Separator, Stack, Text, Flex } from "@simplix-react/ui";
import { partAttributes } from "@simplix-react/ui/design";

import { EllipsisText } from "../layout";
import { menuSearchBoxStyle } from "./menu-search.style";
import {
  menuColumnBodyStyle,
  menuColumnHeadStyle,
  menuColumnStyle,
  menuFlyoutStyle,
  menuFlyoutTitleStyle,
  menuRailButtonStyle,
  menuRailFootStyle,
  menuRailRuleStyle,
  menuRailStyle,
} from "./menu-tree.style";
import { ConsoleMenuGlyph, MENU_MEASURE } from "./menu-tree-marks";
import { MenuInk } from "./menu-tree-fold";

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

export * from "./menu-tree-marks";
export * from "./menu-tree-rows";
export * from "./menu-tree-fold";
