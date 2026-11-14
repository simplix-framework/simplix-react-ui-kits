import { dismissAllErrors, dismissError, useErrorStore } from "@simplix-react/ui";
import { slotAttributes } from "@simplix-react/ui/design";

import { SiteAction } from "../action/site-action";
import { SiteDialog } from "./dialog";

import { siteErrorReasonStyle, siteErrorReasonsStyle } from "./errors.style";

/** One failure the framework's error store holds. */
export type SiteErrorEvent = ReturnType<typeof useErrorStore>[number];

/** The kind of failure the dialog is titled by: the store's category, or `gateway` for a server not answering. */
export type SiteErrorKind = SiteErrorEvent["category"] | "gateway";

/** The statuses of a server that is not answering (a proxy while it restarts, a balancer), told calmly. */
const GATEWAY_STATUSES = new Set([502, 503, 504]);

/** The kind a failure is titled by. */
export function siteErrorKind(event: SiteErrorEvent): SiteErrorKind {
  return event.status !== undefined && GATEWAY_STATUSES.has(event.status) ? "gateway" : event.category;
}

/** The words of the error dialog, from the product's catalog. */
export interface SiteErrorsCopy {
  /** The dialog's title for each kind of failure. */
  readonly titles: Readonly<Record<SiteErrorKind, string>>;
  /** What a server not answering means for the reader (try again in a moment). */
  readonly unavailable: string;
  /** What is said when the failure carries no sentence of its own. */
  readonly fallback: string;
  /** Closes the failure shown. */
  readonly close: string;
  /** Closes every failure waiting, with how many there are. */
  readonly closeAll: (count: number) => string;
}

/** What the error dialog says about the first waiting failure. */
export interface SiteErrorView {
  readonly title: string;
  readonly description: string;
  /** Each field's reason a rejected request names. */
  readonly fields: readonly string[];
  /** The label of the action closing every waiting failure, when more than one waits. */
  readonly closeAll?: string;
}

/**
 * What the dialog says about the first waiting failure, or undefined when none waits: titled by its
 * kind, the server's own sentence (which names the rule that refused the request, so it leads), then
 * each field's reason. A server not answering is told calmly, without the bare status it sent.
 */
export function siteErrorView(errors: readonly SiteErrorEvent[], copy: SiteErrorsCopy): SiteErrorView | undefined {
  const current = errors[0];
  if (current === undefined) return undefined;
  const kind = siteErrorKind(current);
  return {
    title: copy.titles[kind],
    description: kind === "gateway" ? copy.unavailable : current.message || copy.fallback,
    fields: kind === "gateway" ? [] : (current.validationErrors ?? []).map((field) => field.message),
    ...(errors.length > 1 ? { closeAll: copy.closeAll(errors.length) } : {}),
  };
}

/** Props for {@link SiteErrorList}. */
export interface SiteErrorListProps {
  readonly errors: readonly SiteErrorEvent[];
  readonly copy: SiteErrorsCopy;
  readonly onClose?: () => void;
  readonly onCloseAll?: () => void;
}

/** The first waiting failure in a site dialog ({@link siteErrorView}), with its close and, when more wait, a close for all. */
export function SiteErrorList({ errors, copy, onClose = dismissError, onCloseAll = dismissAllErrors }: SiteErrorListProps) {
  const view = siteErrorView(errors, copy);
  if (view === undefined) return null;
  return (
    <SiteDialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      title={view.title}
      description={view.description}
      footer={
        <>
          {view.closeAll !== undefined ? <SiteAction id="closeAll" label={view.closeAll} tone="secondary" onSelect={onCloseAll} /> : null}
          <SiteAction id="close" label={copy.close} tone="primary" onSelect={onClose} />
        </>
      }
    >
      {view.fields.length > 0 ? (
        <ul {...slotAttributes(siteErrorReasonsStyle, {})}>
          {view.fields.map((field) => (
            <li key={field} {...slotAttributes(siteErrorReasonStyle, {})}>
              {field}
            </li>
          ))}
        </ul>
      ) : null}
    </SiteDialog>
  );
}

/** Props for {@link SiteErrors}. */
export interface SiteErrorsProps {
  readonly copy: SiteErrorsCopy;
}

/**
 * The failures of the framework's error store (`dispatchError`, which a query client feeds), drawn
 * by the site. A site window mounts this once, in place of a console's own error dialog, so each
 * failure is told once and in the site's look.
 */
export function SiteErrors({ copy }: SiteErrorsProps) {
  const errors = useErrorStore();
  return <SiteErrorList errors={errors} copy={copy} />;
}
