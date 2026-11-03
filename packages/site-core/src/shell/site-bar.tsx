import { useEffect, useId, useRef, useState, type KeyboardEvent, type MouseEvent, type ReactNode } from "react";
import { slotAttributes } from "@simplix-react/ui/design";

import { SiteAction, type SiteActionSpec } from "../action/site-action";
import { SiteLink } from "../link/site-link";
import {
  siteAvatarStyle,
  siteBarAccountNameStyle,
  siteBarAccountStyle,
  siteBarBrandStyle,
  siteBarLinkStyle,
  siteBarMenuItemStyle,
  siteBarMenuStyle,
  siteBarMoreGlyphStyle,
  siteBarMoreStyle,
  siteBarNavStyle,
  siteSpacerStyle,
  siteBarStyle,
} from "./site-shell.style";

/** One page the bar links to. */
export interface SiteBarLink {
  /** A stable name among the bar's links. */
  readonly key: string;
  readonly label: ReactNode;
  /**
   * The page's address. Absent while the page is not open yet: the link is drawn as plain text in
   * its place, so the bar keeps its shape and no link leads nowhere.
   */
  readonly href?: string;
  /** The page shown is this one, or one under it (checkout under pricing). */
  readonly current?: boolean;
  /** Runs on a press, before the link's own navigation. */
  readonly onSelect?: (event: MouseEvent<HTMLElement>) => void;
}

/** The signed-in account at the bar's end. */
export interface SiteBarAccount {
  /** What the link says ("My account"); a narrow page leaves it to screen readers. */
  readonly label: ReactNode;
  /** The account's display name; its first letter is the avatar. */
  readonly name: string;
  readonly href: string;
  /** The account's own page is the one shown. */
  readonly current?: boolean;
  readonly onSelect?: (event: MouseEvent<HTMLElement>) => void;
}

/** One of the visitor's actions at the bar's end. */
export type SiteBarAction = SiteActionSpec & {
  /**
   * Where the action stands below the narrow tier: in the bar (`bar`, the default, for the one the
   * bar leads with) or in the more menu with the site's pages (`menu`). An action that moves into the
   * menu is drawn there as a menu item, so it needs an address or a press.
   */
  readonly narrow?: "bar" | "menu";
};

/** Props for {@link SiteBar}. */
export interface SiteBarProps {
  /** The product's mark, drawn inside the link home. */
  readonly brand: ReactNode;
  readonly brandHref: string;
  /** The link home's accessible name, since the mark is a picture. */
  readonly brandLabel: string;
  readonly onBrandSelect?: (event: MouseEvent<HTMLElement>) => void;
  /** The site's pages, in reading order. */
  readonly links: readonly SiteBarLink[];
  /** The page links' landmark name. */
  readonly navLabel: string;
  /**
   * The visitor's actions in reading order ("Sign in", then "Start free"); drawn when no account is
   * signed in. An action without a tone is the primary one.
   */
  readonly actions?: readonly SiteBarAction[];
  /** The signed-in account; drawn in place of the visitor's action. */
  readonly account?: SiteBarAccount;
  /** The more menu's accessible name; the menu holds the page links below the narrow tier. */
  readonly moreLabel: string;
  /** `dark` continues a dark band at the top of the page (a hero) into the bar. */
  readonly tone?: "light" | "dark";
}

/**
 * The visitor's actions the more menu lists below the narrow tier: those marked `menu`, and none once
 * an account is signed in, since the bar then draws the account in their place.
 */
export function barMenuActions(actions: readonly SiteBarAction[], signedIn: boolean): readonly SiteBarAction[] {
  return signedIn ? [] : actions.filter((action) => action.narrow === "menu");
}

/** The first letter of a display name, as one grapheme in the reader's case. */
export function avatarInitial(name: string): string {
  const [first = ""] = Array.from(name.trim());
  return first.toLocaleUpperCase();
}

/**
 * The site's bar: the brand linking home, the site's pages with the current one marked, then the
 * visitor's actions or the signed-in account. Below the narrow tier the pages and the visitor's
 * actions marked `menu` move into a more menu at the bar's end, and the account keeps only its
 * avatar.
 */
export function SiteBar({ brand, brandHref, brandLabel, onBrandSelect, links, navLabel, actions = [], account, moreLabel, tone = "light" }: SiteBarProps) {
  const visitor = account ? [] : actions;
  return (
    <header {...slotAttributes(siteBarStyle, { tone })} data-band={tone === "dark" ? "dark" : undefined}>
      <SiteLink {...slotAttributes(siteBarBrandStyle, {})} href={brandHref} aria-label={brandLabel} onClick={onBrandSelect}>
        {brand}
      </SiteLink>
      <nav {...slotAttributes(siteBarNavStyle, {})} aria-label={navLabel}>
        {links.map((link) =>
          link.href === undefined ? (
            <span key={link.key} {...slotAttributes(siteBarLinkStyle, { current: link.current === true, pending: true })}>
              {link.label}
            </span>
          ) : (
            <SiteLink
              key={link.key}
              {...slotAttributes(siteBarLinkStyle, { current: link.current === true })}
              href={link.href}
              aria-current={link.current ? "page" : undefined}
              onClick={link.onSelect}
            >
              {link.label}
            </SiteLink>
          ),
        )}
      </nav>
      <span {...slotAttributes(siteSpacerStyle, {})} aria-hidden="true" />
      {account ? (
        <SiteLink
          {...slotAttributes(siteBarAccountStyle, { current: account.current === true })}
          href={account.href}
          aria-current={account.current ? "page" : undefined}
          onClick={account.onSelect}
        >
          <span {...slotAttributes(siteBarAccountNameStyle, {})}>{account.label}</span>
          <span {...slotAttributes(siteAvatarStyle, {})} aria-hidden="true">
            {avatarInitial(account.name)}
          </span>
        </SiteLink>
      ) : (
        visitor.map(({ narrow, ...action }) => <SiteAction key={action.id} {...action} tone={action.tone ?? "primary"} narrow={narrow === "menu" ? "hidden" : "shown"} />)
      )}
      <SiteBarMore label={moreLabel} links={links} actions={barMenuActions(actions, account !== undefined)} />
    </header>
  );
}

/**
 * The item a key moves the focus to in a menu of `count` items, from the item at `index` (-1 when
 * the trigger holds the focus); `null` when the key closes the menu or is not the menu's.
 */
export function menuKeyTarget(key: string, index: number, count: number): number | "close" | null {
  if (key === "Escape") return "close";
  if (count === 0) return null;
  if (key === "ArrowDown") return index < 0 ? 0 : (index + 1) % count;
  if (key === "ArrowUp") return index < 0 ? count - 1 : (index - 1 + count) % count;
  if (key === "Home") return 0;
  if (key === "End") return count - 1;
  return null;
}

/**
 * The bar's more menu: a disclosure that lists the site's pages below the narrow tier. Escape
 * closes it and returns the focus to its trigger, a press outside closes it, and the arrows walk
 * its items.
 */
function SiteBarMore({ label, links, actions }: { label: string; links: readonly SiteBarLink[]; actions: readonly SiteBarAction[] }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const trigger = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const away = (event: PointerEvent) => {
      const target = event.target as Node | null;
      if (target && !menu.current?.contains(target) && !trigger.current?.contains(target)) setOpen(false);
    };
    document.addEventListener("pointerdown", away);
    return () => document.removeEventListener("pointerdown", away);
  }, [open]);

  const items = () => [...(menu.current?.querySelectorAll<HTMLElement>("a[data-slot=site-bar-menu-item], button[data-slot=site-bar-menu-item]") ?? [])];
  const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    const list = items();
    const index = list.indexOf(document.activeElement as HTMLElement);
    const target = menuKeyTarget(event.key, index, list.length);
    if (target === null) return;
    event.preventDefault();
    if (target === "close") {
      setOpen(false);
      trigger.current?.focus();
      return;
    }
    if (!open) setOpen(true);
    requestAnimationFrame(() => items()[target]?.focus());
  };

  return (
    <>
      <button
        {...slotAttributes(siteBarMoreStyle, {})}
        ref={trigger}
        type="button"
        aria-label={label}
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((was) => !was)}
        onKeyDown={onKeyDown}
      >
        <svg {...slotAttributes(siteBarMoreGlyphStyle, {})} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <circle cx="5" cy="12" r="1.75" />
          <circle cx="12" cy="12" r="1.75" />
          <circle cx="19" cy="12" r="1.75" />
        </svg>
      </button>
      {open ? (
        <div {...slotAttributes(siteBarMenuStyle, {})} ref={menu} id={id} onKeyDown={onKeyDown}>
          <SiteBarMenuItems links={links} actions={actions} onClose={() => setOpen(false)} />
        </div>
      ) : null}
    </>
  );
}

/**
 * What the open more menu holds: the site's pages (one not open yet as plain text the arrows skip),
 * then the visitor's actions that leave the bar below the narrow tier. A press closes the menu.
 */
export function SiteBarMenuItems({ links, actions, onClose }: { links: readonly SiteBarLink[]; actions: readonly SiteBarAction[]; onClose: () => void }) {
  return (
    <>
      {links.map((link) =>
        link.href === undefined ? (
          // Not a menu item: the arrows walk only the pages that open.
          <span key={link.key} {...slotAttributes(siteBarMenuItemStyle, { current: link.current === true, pending: true })}>
            {link.label}
          </span>
        ) : (
          <SiteLink
            key={link.key}
            {...slotAttributes(siteBarMenuItemStyle, { current: link.current === true })}
            href={link.href}
            aria-current={link.current ? "page" : undefined}
            onClick={(event) => {
              link.onSelect?.(event);
              onClose();
            }}
          >
            {link.label}
          </SiteLink>
        ),
      )}
      {actions.map((action) =>
        action.href === undefined || action.disabled ? (
          <button
            key={action.id}
            {...slotAttributes(siteBarMenuItemStyle, {})}
            data-action={action.id}
            type="button"
            disabled={action.disabled}
            aria-label={action.name}
            onClick={(event) => {
              action.onSelect?.(event);
              onClose();
            }}
          >
            {action.label}
          </button>
        ) : (
          <SiteLink
            key={action.id}
            {...slotAttributes(siteBarMenuItemStyle, {})}
            data-action={action.id}
            href={action.href}
            aria-label={action.name}
            onClick={(event) => {
              action.onSelect?.(event);
              onClose();
            }}
          >
            {action.label}
          </SiteLink>
        ),
      )}
    </>
  );
}
