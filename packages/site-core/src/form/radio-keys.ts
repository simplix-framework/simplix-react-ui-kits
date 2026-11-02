/** A choice a radio group can move to: its value and whether it can be chosen. */
export interface RadioKeyOption<T extends string> {
  readonly value: T;
  readonly disabled?: boolean;
}

/**
 * The option an arrow, Home or End key moves a radio group's choice to, skipping disabled options
 * and wrapping at the ends; `null` for any other key or when no other option can be chosen. Every
 * radio group the site draws (a segmented switch, choice cards, radio cards) walks with this.
 */
export function radioKeyTarget<T extends string>(options: readonly RadioKeyOption<T>[], value: T | null, key: string): T | null {
  const open = options.filter((option) => option.disabled !== true);
  if (open.length === 0) return null;
  const at = open.findIndex((option) => option.value === value);
  const next = (step: number) => open[(((at < 0 ? 0 : at) + step) % open.length + open.length) % open.length];
  const target =
    key === "ArrowRight" || key === "ArrowDown"
      ? next(1)
      : key === "ArrowLeft" || key === "ArrowUp"
        ? next(-1)
        : key === "Home"
          ? open[0]
          : key === "End"
            ? open[open.length - 1]
            : undefined;
  return target === undefined || target.value === value ? null : target.value;
}

/**
 * The tab stop of a radio group: the chosen option, or the first option that can be chosen when
 * none is, so the group is always one Tab stop.
 */
export function radioTabStop<T extends string>(options: readonly RadioKeyOption<T>[], value: T | null): T | null {
  const chosen = options.find((option) => option.value === value && option.disabled !== true);
  return (chosen ?? options.find((option) => option.disabled !== true))?.value ?? null;
}
