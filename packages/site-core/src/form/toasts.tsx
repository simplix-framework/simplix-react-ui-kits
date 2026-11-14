import { removeToast, useToastStore, type Toast } from "@simplix-react/ui";
import { slotAttributes } from "@simplix-react/ui/design";

import { SiteLink } from "../link/site-link";

import { siteToastsStyle, siteToastStyle, siteToastDotStyle, siteToastActionStyle, siteToastMessageStyle } from "./toasts.style";

/** The dot's tone for a toast's kind: the accent for a command that took effect, else its state. */
const toneOf = (type: Toast["type"]): "good" | "warn" | "bad" => (type === "error" ? "bad" : type === "warning" ? "warn" : "good");

/** Runs a toast's own action (an undo) and closes it, so the action cannot run twice. */
const runAction = (toast: Toast) => {
  if (toast.action !== undefined && "run" in toast.action) toast.action.run();
  removeToast(toast.id);
};

/** Props for {@link SiteToastList}. */
export interface SiteToastListProps {
  readonly toasts: readonly Toast[];
  /** Runs a toast's own action (an undo); by default it runs the action and closes the toast. */
  readonly onAction?: (toast: Toast) => void;
}

/**
 * The toasts as the site draws them: one line each on the ink ground with a dot, at most one action.
 * A live region that speaks each line as it arrives; {@link SiteToasts} feeds it the framework's
 * toast store.
 */
export function SiteToastList({ toasts, onAction = runAction }: SiteToastListProps) {
  return (
    <div {...slotAttributes(siteToastsStyle, {})} role="status" aria-live="polite">
      {toasts.map((toast) => (
        <div key={toast.id} {...slotAttributes(siteToastStyle, { action: toast.action !== undefined })}>
          <span {...slotAttributes(siteToastDotStyle, { tone: toneOf(toast.type) })} aria-hidden="true" />
          <span {...slotAttributes(siteToastMessageStyle, {})}>{toast.message}</span>
          {toast.action === undefined ? null : "href" in toast.action ? (
            <SiteLink {...slotAttributes(siteToastActionStyle, {})} href={toast.action.href} onClick={() => removeToast(toast.id)}>
              {toast.action.label}
            </SiteLink>
          ) : (
            <button {...slotAttributes(siteToastActionStyle, {})} type="button" onClick={() => onAction(toast)}>
              {toast.action.label}
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

/**
 * The toasts of the framework's toast store (`addToast`), drawn by the site. A site window mounts
 * this once, in place of the framework's own `ToastContainer`, so each toast is drawn once.
 */
export function SiteToasts() {
  const toasts = useToastStore();
  return <SiteToastList toasts={toasts} />;
}
