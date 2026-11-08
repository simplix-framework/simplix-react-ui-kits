import type { MouseEvent, ReactNode } from "react";

/**
 * Whether a click is the plain primary press an app handles itself. A press with a modifier, the
 * middle button or one another handler already took is left to the browser, so a link opens in a
 * new tab or window.
 *
 * @param event the click
 * @returns true for a plain left click
 */
export function isPlainPrimaryClick(event: Pick<MouseEvent, "defaultPrevented" | "button" | "metaKey" | "ctrlKey" | "shiftKey" | "altKey">): boolean {
  return !(event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey);
}

/** Props for {@link HeadLink}. */
export interface HeadLinkProps {
  /** The address the control leads to; a control with none is a button that only runs `onClick`. */
  readonly href?: string;
  /** Runs on a plain press, in place of the browser's own navigation (the app's router moves the page). */
  readonly onClick: () => void;
  /** The slot attributes of the control's design declaration. */
  readonly attributes: Record<string, string>;
  readonly className?: string;
  /** Words a screen reader hears, when the visible text alone does not name where the control leads. */
  readonly label?: string;
  readonly children: ReactNode;
}

/**
 * The control in a dashboard card's or figure's head that leads to the list it reads.
 *
 * <p>With an address it is a link: the keyboard reaches it, a middle click or a modified click opens
 * the address in a new tab, and the address is readable before the press. A plain press still runs
 * `onClick`, so the app's router moves the page without a reload. Without an address it is a button.
 */
export function HeadLink({ href, onClick, attributes, className, label, children }: HeadLinkProps) {
  if (href === undefined) {
    return (
      <button type="button" onClick={onClick} aria-label={label} className={className} {...attributes}>
        {children}
      </button>
    );
  }
  return (
    <a
      href={href}
      aria-label={label}
      className={className}
      onClick={(event) => {
        if (!isPlainPrimaryClick(event)) return;
        event.preventDefault();
        onClick();
      }}
      {...attributes}
    >
      {children}
    </a>
  );
}
