import { forwardRef, type ComponentPropsWithoutRef, type ReactNode } from "react";
import { ExternalLinkIcon } from "lucide-react";
import { useTranslation } from "@simplix-react/i18n/react";
import { MenuLink, Stack, cn } from "@simplix-react/ui";
import { partAttributes, slotAttributes } from "@simplix-react/ui/design";

import { PACKAGE_NAMESPACE } from "./locales";
import { menuBranchStyle, menuLabelStyle, menuRowStyle } from "./menu-tree.style";
import { ConsoleMenuGlyph, MENU_LABEL, MENU_ROW_LAYOUT, MenuCaret } from "./menu-tree-marks";

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
