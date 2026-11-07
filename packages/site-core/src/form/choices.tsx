import { useRef, type KeyboardEvent, type ReactNode } from "react";
import { Checkbox, Switch } from "@simplix-react/ui";
import { partAttributes, slotAttributes } from "@simplix-react/ui/design";

import { radioKeyTarget, radioTabStop } from "./radio-keys";
import {
  siteCheckBadgeStyle,
  siteCheckboxStyle,
  siteCheckLabelStyle,
  siteCheckStyle,
  siteRadioBodyStyle,
  siteRadioCardsStyle,
  siteRadioCardStyle,
  siteRadioDotStyle,
  siteRadioMarkStyle,
  siteRadioTextStyle,
  siteRadioTitleStyle,
  siteToggleRowStyle,
  siteToggleStyle,
} from "./form.style";

/** Props for {@link SiteCheckbox}. */
export interface SiteCheckboxProps {
  readonly checked: boolean | "indeterminate";
  readonly onCheckedChange: (checked: boolean) => void;
  /** The words beside the box; the whole line presses it. Without them, pass `name`. */
  readonly label?: ReactNode;
  /** The box's accessible name where it has no words beside it. */
  readonly name?: string;
  readonly disabled?: boolean;
  /** The id of the line that says why the box cannot be changed now; give it with `disabled`. */
  readonly describedBy?: string;
  /**
   * The step cannot go ahead without it: the box reports `aria-required`, and `badge` is drawn
   * before the words for the eye only ("Required"), so a screen reader never hears it glued to the
   * first word.
   */
  readonly required?: boolean;
  readonly badge?: ReactNode;
  /**
   * What a plain form posts for the box while it is checked, as a native checkbox would
   * (`rememberMe=on`): a page posted without script reads it, and an unchecked box posts nothing.
   */
  readonly field?: { readonly name: string; readonly value: string };
}

/**
 * A box that is checked, unchecked or mixed, with its words beside it. The box is the framework's
 * checkbox (its keyboard and state), drawn in the site design.
 */
export function SiteCheckbox({ checked, onCheckedChange, label, name, disabled = false, describedBy, required = false, badge, field }: SiteCheckboxProps) {
  // The framework box is a button, which a form does not post; the field travels in a hidden input
  // for exactly as long as the box is checked.
  const posted = field && checked === true ? <input type="hidden" name={field.name} value={field.value} /> : null;
  const box = (
    <Checkbox
      {...partAttributes(siteCheckboxStyle, {})}
      checked={checked}
      onCheckedChange={(next) => onCheckedChange(next === true)}
      disabled={disabled}
      required={required}
      aria-required={required || undefined}
      aria-label={label === undefined ? name : undefined}
      aria-describedby={describedBy}
    />
  );
  if (label === undefined)
    return posted ? (
      <>
        {box}
        {posted}
      </>
    ) : (
      box
    );
  return (
    <label {...slotAttributes(siteCheckStyle, {})}>
      {box}
      {posted}
      <span {...slotAttributes(siteCheckLabelStyle, {})}>
        {badge !== undefined ? (
          <em {...slotAttributes(siteCheckBadgeStyle, {})} aria-hidden="true">
            {badge}
          </em>
        ) : null}
        {badge !== undefined ? " " : null}
        {label}
      </span>
    </label>
  );
}

/** Props for {@link SiteSwitch}. */
export interface SiteSwitchProps {
  readonly checked: boolean;
  readonly onCheckedChange: (checked: boolean) => void;
  /** The words beside the switch; without them, pass `name`. */
  readonly label?: ReactNode;
  readonly name?: string;
  readonly disabled?: boolean;
  /** The id of the line that describes the switch, such as the reason it is disabled. */
  readonly describedBy?: string;
}

/** On and off for something that takes effect at once (marketing mail). The framework switch in the site design. */
export function SiteSwitch({ checked, onCheckedChange, label, name, disabled = false, describedBy }: SiteSwitchProps) {
  const control = (
    <Switch
      {...partAttributes(siteToggleStyle, {})}
      checked={checked}
      onCheckedChange={onCheckedChange}
      disabled={disabled}
      aria-label={label === undefined ? name : undefined}
      aria-describedby={describedBy}
    />
  );
  if (label === undefined) return control;
  return (
    <label {...slotAttributes(siteToggleRowStyle, {})}>
      {control}
      <span {...slotAttributes(siteCheckLabelStyle, {})}>{label}</span>
    </label>
  );
}

/** One choice of {@link RadioCards}. */
export interface RadioCardOption<T extends string> {
  readonly value: T;
  readonly title: ReactNode;
  readonly body?: ReactNode;
  /** Beside the title, such as a `SiteChip` saying it is the default. */
  readonly badge?: ReactNode;
  readonly disabled?: boolean;
}

/** Props for {@link RadioCards}. */
export interface RadioCardsProps<T extends string> {
  /** The group's accessible name. */
  readonly label: string;
  readonly value: T | null;
  readonly options: readonly RadioCardOption<T>[];
  readonly onValueChange: (value: T) => void;
}

/**
 * One choice among a few, each a card with a radio mark, a title and a line of body. The group is
 * one Tab stop; the arrows move between the cards and choose the one they land on.
 */
export function RadioCards<T extends string>({ label, value, options, onValueChange }: RadioCardsProps<T>) {
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
    <div {...slotAttributes(siteRadioCardsStyle, {})} ref={group} role="radiogroup" aria-label={label} onKeyDown={onKeyDown}>
      {options.map((option) => {
        const checked = option.value === value;
        return (
          <button
            key={option.value}
            {...slotAttributes(siteRadioCardStyle, { checked })}
            type="button"
            role="radio"
            aria-checked={checked}
            data-value={option.value}
            tabIndex={option.value === stop ? 0 : -1}
            disabled={option.disabled === true}
            onClick={() => onValueChange(option.value)}
          >
            <span {...slotAttributes(siteRadioMarkStyle, { checked })} aria-hidden="true">
              {checked ? <span {...slotAttributes(siteRadioDotStyle, {})} /> : null}
            </span>
            <span {...slotAttributes(siteRadioTextStyle, {})}>
              <span {...slotAttributes(siteRadioTitleStyle, {})}>
                {option.title}
                {option.badge}
              </span>
              {option.body !== undefined ? <span {...slotAttributes(siteRadioBodyStyle, {})}>{option.body}</span> : null}
            </span>
          </button>
        );
      })}
    </div>
  );
}
