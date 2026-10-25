import { AppWindowIcon, Columns2Icon, Maximize2Icon, PanelRightIcon, Settings2Icon, type LucideIcon } from "lucide-react";
import { useTranslation } from "@simplix-react/i18n/react";
import { Button, Popover, PopoverContent, PopoverTrigger, SettingSwitch, Tooltip, TooltipContent, TooltipTrigger } from "@simplix-react/ui";
import { slotAttributes } from "@simplix-react/ui/design";

import { PACKAGE_NAMESPACE as LAYOUT_NAMESPACE } from "../layout/locales";
import type { CrudPagePresentation } from "./crud-page";
import { presentationChoiceIconStyle, presentationChoiceStyle, presentationGroupStyle, presentationHintStyle, presentationPanelStyle, presentationTitleStyle } from "./detail-presentation-switch.style";
import { DETAIL_PRESENTATIONS } from "./presentation-memory";

// The buttons use icon-sm because the record detail header resizes every icon-xs button to its
// close-button metrics; the group sets its own 24px height and 14px icons.
const ICONS: Readonly<Record<CrudPagePresentation, LucideIcon>> = {
  panel: Columns2Icon,
  drawer: PanelRightIcon,
  dialog: AppWindowIcon,
  page: Maximize2Icon,
};

/** Props for {@link DetailPresentationSwitch}. */
export interface DetailPresentationSwitchProps {
  /** The presentation in use. */
  readonly value: CrudPagePresentation;
  /** Called with the presentation the reader picked; the switch keeps no choice of its own. */
  readonly onChange: (value: CrudPagePresentation) => void;
  /** Whether the choice is saved for the next visit (see {@link useDetailPresentationMemory}). */
  readonly remember: boolean;
  readonly onRememberChange: (remember: boolean) => void;
  /** Opens the view settings on the first render, for a story that shows them. */
  readonly defaultSettingsOpen?: boolean;
}

/**
 * The record's presentation, switched from the record's own head: one small group of icon buttons,
 * one per presentation, the one in use pressed, and a settings button at its end whose popover
 * says when each suits and whether this browser remembers the choice. It holds no state: the value
 * and the memory come from the caller, so a toolbar and this switch can share one setting.
 */
export function DetailPresentationSwitch({ value, onChange, remember, onRememberChange, defaultSettingsOpen }: DetailPresentationSwitchProps) {
  const { t } = useTranslation(`${LAYOUT_NAMESPACE}/presentation`);
  return (
    <div role="group" aria-label={t("group")} className="inline-flex shrink-0 items-center" {...slotAttributes(presentationGroupStyle, {})}>
      {DETAIL_PRESENTATIONS.map((choice) => {
        const Icon = ICONS[choice];
        const label = t(`choice.${choice}.label`);
        return (
          <Tooltip key={choice}>
            <TooltipTrigger asChild>
              <Button type="button" variant="outline" size="icon-sm" aria-label={label} aria-pressed={value === choice} onClick={() => onChange(choice)}>
                <Icon className="size-3.5" aria-hidden />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{label}</TooltipContent>
          </Tooltip>
        );
      })}
      <Popover defaultOpen={defaultSettingsOpen}>
        <Tooltip>
          <TooltipTrigger asChild>
            <PopoverTrigger asChild>
              <Button type="button" variant="outline" size="icon-sm" aria-label={t("settings")}>
                <Settings2Icon className="size-3.5" aria-hidden />
              </Button>
            </PopoverTrigger>
          </TooltipTrigger>
          <TooltipContent>{t("settings")}</TooltipContent>
        </Tooltip>
        <PopoverContent align="end" className="flex flex-col" {...slotAttributes(presentationPanelStyle, {})}>
          <span {...slotAttributes(presentationTitleStyle, {})}>{t("group")}</span>
          <div role="radiogroup" aria-label={t("group")} className="flex flex-col">
            {DETAIL_PRESENTATIONS.map((choice) => {
              const Icon = ICONS[choice];
              return (
                <button
                  key={choice}
                  type="button"
                  role="radio"
                  aria-checked={value === choice}
                  onClick={() => onChange(choice)}
                  className="flex items-start"
                  {...slotAttributes(presentationChoiceStyle, { checked: value === choice })}
                >
                  <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden {...slotAttributes(presentationChoiceIconStyle, {})} />
                  <span className="flex flex-col">
                    <span>{t(`choice.${choice}.label`)}</span>
                    <span {...slotAttributes(presentationHintStyle, {})}>{t(`choice.${choice}.hint`)}</span>
                  </span>
                </button>
              );
            })}
          </div>
          <SettingSwitch label={t("remember")} description={t("rememberHint")} checked={remember} onCheckedChange={onRememberChange} />
        </PopoverContent>
      </Popover>
    </div>
  );
}
