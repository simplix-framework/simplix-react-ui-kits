import type { ReactNode } from "react";
import { ChevronDownIcon } from "lucide-react";
import { Button, DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@simplix-react/ui";

/** One choice of a {@link PageMenuAction}. */
export interface PageMenuOption {
  readonly value: string;
  readonly label: string;
}

/** Props for {@link PageMenuAction}. */
export interface PageMenuActionProps {
  /** What the control chooses, said to assistive technology and as the menu's heading. */
  readonly label: string;
  /** The choices, in the order they are offered. */
  readonly options: readonly PageMenuOption[];
  /** The chosen option's value; the button names it. */
  readonly value: string;
  readonly onChange: (value: string) => void;
  /** A mark before the name of the choice. */
  readonly icon?: ReactNode;
}

/**
 * A header action that opens a choice: a button that names the current one and a caret, and a menu
 * of radio items under it. A page keeps what it is read over (a period, how a trend is cut) in the
 * header with it, so the choice stays beside the figures it decides.
 */
export function PageMenuAction({ label, options, value, onChange, icon }: PageMenuActionProps) {
  const chosen = options.find((option) => option.value === value);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="sm" variant="outline" aria-label={label}>
          {icon}
          {chosen?.label ?? value}
          <ChevronDownIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>{label}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup value={value} onValueChange={onChange}>
          {options.map((option) => (
            <DropdownMenuRadioItem key={option.value} value={option.value}>
              {option.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
