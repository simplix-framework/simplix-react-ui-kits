import type { ReactNode } from "react";
import { EmptyState, Icon, type IconName } from "@simplix-react/ui";

interface StatePanelProps {
  /** What the reader is being told, in one line. */
  readonly title: string;
  /** Why, and what would change it. */
  readonly description: string;
  /** The icon of the subject, not of the mood. */
  readonly icon?: IconName;
  /** The one way forward, where there is one — a retry, a cleared filter. */
  readonly action?: ReactNode;
  /** `sm` for a panel inside a tab; the default fills a whole region. */
  readonly size?: "sm" | "md";
}

/**
 * What a region draws instead of its content — nothing found, nothing loaded, nothing counted.
 *
 * <p><b>The three are different facts and each needs its own words.</b> A list narrowed to nothing
 * is not a register with nothing in it, and neither is a read that failed. The framework's list
 * table already draws all three; a tree, a matrix and a tab body have no such slot, and every
 * screen that needed one was building the same padded card around an `EmptyState`.
 *
 * <p>An `action` is offered only where there is one thing to do. A card that says a read failed and
 * offers no retry sends the reader to reload the whole page.
 */
export function StatePanel({ title, description, icon, action, size = "md" }: StatePanelProps) {
  // **No card around it — `EmptyState` already is one.** It draws `rounded-lg border` over its own
  // padding, so a `Card` outside it put a second rounded border 24px out from the first and the
  // reader saw a box inside a box with nothing between them. The card was adding a background and
  // a shadow the empty state does not need: what is inside it is a sentence, not a surface.
  return (
    <EmptyState
      size={size === "sm" ? "sm" : undefined}
      icon={icon ? <Icon name={icon} /> : undefined}
      title={title}
      description={description}
      action={action}
    />
  );
}
