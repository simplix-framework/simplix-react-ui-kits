import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@simplix-react/ui";
import { partAttributes, slotAttributes } from "@simplix-react/ui/design";

import { siteSelectMenuStyle, siteSelectOptionStyle, siteSelectStyle, siteSelectValueStyle } from "./form.style";

/** One option of a {@link SiteSelect}. */
export interface SiteSelectOption<T extends string> {
  readonly value: T;
  /** The option's words, in the list and on the trigger once chosen. */
  readonly label: string;
  readonly disabled?: boolean;
}

/** Props for {@link SiteSelect}. */
export interface SiteSelectProps<T extends string> {
  readonly options: readonly SiteSelectOption<T>[];
  readonly value: T | null;
  readonly onValueChange: (value: T) => void;
  /** The control's accessible name; the field's visible name stands over it in a `FormField as="group"`. */
  readonly label: string;
  /** What the trigger says while nothing is chosen. */
  readonly placeholder?: string;
  readonly size?: "md" | "sm";
  /** Stretches the trigger over its column. */
  readonly block?: boolean;
  readonly disabled?: boolean;
}

/**
 * One choice from a list that opens under the trigger (a country, a reason). The list, its keyboard
 * and its focus are the framework select's; the kit draws the trigger, the list and the options.
 * The trigger shows the chosen option's words itself, so it reads the same before and after the
 * page hydrates.
 */
export function SiteSelect<T extends string>({ options, value, onValueChange, label, placeholder, size, block = false, disabled = false }: SiteSelectProps<T>) {
  const chosen = options.find((option) => option.value === value);
  return (
    <Select
      value={chosen?.value}
      disabled={disabled}
      onValueChange={(next) => {
        const picked = options.find((option) => option.value === next);
        if (picked !== undefined) onValueChange(picked.value);
      }}
    >
      <SelectTrigger {...partAttributes(siteSelectStyle, { size, block })} aria-label={label}>
        <SelectValue {...slotAttributes(siteSelectValueStyle, { placeholder: chosen === undefined })} placeholder={placeholder}>
          {chosen?.label}
        </SelectValue>
      </SelectTrigger>
      <SelectContent {...partAttributes(siteSelectMenuStyle, {})}>
        {options.map((option) => (
          <SelectItem key={option.value} {...partAttributes(siteSelectOptionStyle, {})} value={option.value} disabled={option.disabled === true}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
