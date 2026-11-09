import { AlertBanner, Button } from "@simplix-react/ui";

/** Props for {@link PageBanner}. */
export interface PageBannerProps {
  /** How loudly the banner asks to be read: a refusal is `danger`. */
  readonly tone: "danger" | "warning" | "info";
  readonly title: string;
  /** What the reader can do next, under the title. */
  readonly hint?: string;
  /** The one action that mends it, beside the text. */
  readonly actionLabel?: string;
  readonly onAction?: () => void;
}

/**
 * A banner inside the page that cannot be put away. A read the page is built on that failed or was
 * refused answers what the reader just chose, and a notice that can be dismissed would leave the
 * page blank; this one stays until the read succeeds. The action, when there is one, mends it.
 */
export function PageBanner({ tone, title, hint, actionLabel, onAction }: PageBannerProps) {
  return (
    <AlertBanner
      tone={tone}
      title={title}
      subtitle={hint}
      trailing={
        actionLabel ? (
          <Button size="sm" variant="outline" onClick={onAction}>
            {actionLabel}
          </Button>
        ) : undefined
      }
    />
  );
}
