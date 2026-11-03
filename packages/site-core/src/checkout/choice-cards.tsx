import { useRef, type KeyboardEvent, type ReactNode } from "react";
import { slotAttributes } from "@simplix-react/ui/design";

import { radioKeyTarget, radioTabStop } from "../form/radio-keys";
import {
  siteChoiceBadgeStyle,
  siteChoiceBodyStyle,
  siteChoiceCardsStyle,
  siteChoiceCardStyle,
  siteChoiceMetaStyle,
  siteChoicePriceStyle,
  siteChoiceTitleStyle,
  siteChoiceUnitStyle,
} from "./checkout.style";

/** One choice of {@link ChoiceCards}. */
export interface ChoiceCardOption<T extends string> {
  readonly value: T;
  readonly title: ReactNode;
  /** A short line under the title (a plan's price in a plan change). */
  readonly meta?: ReactNode;
  /** A price in the display family, with its unit beside it in small type. */
  readonly price?: ReactNode;
  readonly unit?: ReactNode;
  /** What the choice is for, muted. */
  readonly body?: ReactNode;
  /** A badge over the card's top edge ("Most chosen"). */
  readonly badge?: ReactNode;
  readonly disabled?: boolean;
}

/** Props for {@link ChoiceCards}. */
export interface ChoiceCardsProps<T extends string> {
  /** The group's accessible name. */
  readonly label: string;
  readonly value: T | null;
  readonly options: readonly ChoiceCardOption<T>[];
  readonly onValueChange: (value: T) => void;
  /** The glyph beside the chosen card's title, which the product draws. */
  readonly mark?: ReactNode;
  /**
   * `md`: offers to buy, each lifting under the pointer; `sm`: a choice inside a section (a plan
   * change), each taking the control line under the pointer.
   */
  readonly size?: "md" | "sm";
}

/**
 * One choice among a few, each a card outlined twice as heavy as a hairline and filled with the
 * accent's soft ground when chosen; three in a row, one under the other below the narrow tier. The
 * group is one Tab stop; the arrows move the choice.
 */
export function ChoiceCards<T extends string>({ label, value, options, onValueChange, mark, size = "md" }: ChoiceCardsProps<T>) {
  const group = useRef<HTMLDivElement>(null);
  const stop = radioTabStop(options, value);
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const target = radioKeyTarget(options, value, event.key);
    if (target === null) return;
    event.preventDefault();
    onValueChange(target);
    group.current?.querySelector<HTMLElement>(`[data-value="${CSS.escape(target)}"]`)?.focus();
  };
  return (
    <div {...slotAttributes(siteChoiceCardsStyle, { single: options.length === 1, size })} ref={group} role="radiogroup" aria-label={label} onKeyDown={onKeyDown}>
      {options.map((option) => {
        const checked = option.value === value;
        return (
          <button
            key={option.value}
            {...slotAttributes(siteChoiceCardStyle, { size, checked, hover: checked ? "none" : size === "md" ? "lift" : "line" })}
            type="button"
            role="radio"
            aria-checked={checked}
            data-value={option.value}
            tabIndex={option.value === stop ? 0 : -1}
            disabled={option.disabled === true}
            onClick={() => onValueChange(option.value)}
          >
            {option.badge !== undefined ? <span {...slotAttributes(siteChoiceBadgeStyle, {})}>{option.badge}</span> : null}
            <span {...slotAttributes(siteChoiceTitleStyle, { size })}>
              {option.title}
              {checked ? mark : null}
            </span>
            {option.meta !== undefined ? <span {...slotAttributes(siteChoiceMetaStyle, {})}>{option.meta}</span> : null}
            {option.price !== undefined ? (
              <span {...slotAttributes(siteChoicePriceStyle, {})}>
                {option.price}
                {option.unit !== undefined ? <small {...slotAttributes(siteChoiceUnitStyle, {})}>{option.unit}</small> : null}
              </span>
            ) : null}
            {option.body !== undefined ? <span {...slotAttributes(siteChoiceBodyStyle, {})}>{option.body}</span> : null}
          </button>
        );
      })}
    </div>
  );
}
