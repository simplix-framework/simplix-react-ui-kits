import { useRef, type KeyboardEvent, type ReactNode } from "react";
import { slotAttributes } from "@simplix-react/ui/design";

import { radioKeyTarget } from "../form/radio-keys";
import { siteSwitchOptionStyle, siteSwitchRowStyle, siteSwitchStyle } from "./pricing.style";

/** One option of a {@link SegmentedSwitch}. */
export interface SegmentedOption<T extends string> {
  readonly value: T;
  readonly label: ReactNode;
  /** The option's accessible name when its label alone would repeat elsewhere on the page. */
  readonly name?: string;
  readonly disabled?: boolean;
}

/** Props for {@link SegmentedSwitch}. */
export interface SegmentedSwitchProps<T extends string> {
  readonly options: readonly SegmentedOption<T>[];
  readonly value: T;
  readonly onValueChange: (value: T) => void;
  /** The group's accessible name ("Billing cycle"). */
  readonly label: string;
  /** `sm` sits in a line of small text (a footer); `md` stands above a set of offers. */
  readonly size?: "md" | "sm";
  /** The whole switch cannot be changed now (the cycle once payment has begun); every option is dimmed. */
  readonly disabled?: boolean;
}

/**
 * The option an arrow, Home or End key moves the choice to, skipping disabled options and wrapping
 * at the ends; `null` for any other key or when no other option can be chosen.
 */
export function switchKeyTarget<T extends string>(options: readonly SegmentedOption<T>[], value: T, key: string): T | null {
  return radioKeyTarget(options, value, key);
}

/**
 * One choice of a few, drawn as segments on a track (monthly or yearly, one currency or another).
 * It is a radio group: Tab reaches the chosen option, the arrows move the choice, and one option is
 * always chosen.
 */
export function SegmentedSwitch<T extends string>({ options, value, onValueChange, label, size, disabled = false }: SegmentedSwitchProps<T>) {
  const group = useRef<HTMLDivElement>(null);
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return;
    const target = switchKeyTarget(options, value, event.key);
    if (target === null) return;
    event.preventDefault();
    onValueChange(target);
    group.current?.querySelector<HTMLElement>(`[data-value="${CSS.escape(target)}"]`)?.focus();
  };
  return (
    <div {...slotAttributes(siteSwitchStyle, {})} ref={group} role="radiogroup" aria-label={label} onKeyDown={onKeyDown}>
      {options.map((option) => {
        const checked = option.value === value;
        return (
          <button
            key={option.value}
            {...slotAttributes(siteSwitchOptionStyle, { checked, size, locked: disabled })}
            type="button"
            role="radio"
            aria-checked={checked}
            aria-label={option.name}
            data-value={option.value}
            tabIndex={checked ? 0 : -1}
            disabled={disabled || option.disabled === true}
            onClick={() => {
              if (!checked) onValueChange(option.value);
            }}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

/** Props for {@link SwitchRow}. */
export interface SwitchRowProps {
  readonly children: ReactNode;
}

/** The row of switches above a set of offers; it wraps on a narrow page. */
export function SwitchRow({ children }: SwitchRowProps) {
  return <div {...slotAttributes(siteSwitchRowStyle, {})}>{children}</div>;
}
