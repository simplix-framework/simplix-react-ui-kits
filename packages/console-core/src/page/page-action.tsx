import { PlusIcon } from "lucide-react";
import { Button } from "@simplix-react/ui";

/** What a header action does, which decides how it looks. */
export type PageActionKind = "add" | "plain";

/** Props for {@link PageAction}. */
export interface PageActionProps {
  readonly label: string;
  readonly onClick?: () => void;
  /** `add` creates a record and carries the plus mark; `plain` is any other action. */
  readonly kind?: PageActionKind;
  readonly disabled?: boolean;
}

/** An action in the page header, the size and mark every console page gives it. */
export function PageAction({ label, onClick, kind = "plain", disabled }: PageActionProps) {
  return (
    <Button size="sm" onClick={onClick} disabled={disabled}>
      {kind === "add" ? <PlusIcon /> : null}
      {label}
    </Button>
  );
}
