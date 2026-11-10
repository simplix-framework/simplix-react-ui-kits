import { SlidersHorizontal } from "lucide-react";
import type { CSSProperties } from "react";
import { useTranslation } from "@simplix-react/i18n/react";
import { Button, Popover, PopoverContent, PopoverTrigger, THEMES } from "@simplix-react/ui";
import { partAttributes, slotAttributes } from "@simplix-react/ui/design";

import { PACKAGE_NAMESPACE } from "./locales";
import { type CardFill, type Density, resolveFill, useDisplayPreferences } from "./display-preferences";
import {
  displaySettingsChoicesStyle,
  displaySettingsGroupStyle,
  displaySettingsStyle,
  displaySettingsSwatchStyle,
  displaySettingsThemeStyle,
  displaySettingsThemesStyle,
} from "./display-settings.style";
import { useConsoleDesign, useConsoleDesigns } from "./console-design";
import { useTheme } from "./use-theme";

const FILLS: readonly CardFill[] = ["plain", "outline", "raised", "tint", "lead"];
const DENSITIES: readonly Density[] = ["compact", "default", "comfortable"];

/** A row of choices drawn as pressed and unpressed buttons. */
function Choices<T extends string>({ value, options, label, onChange }: {
  value: T;
  options: readonly T[];
  label: (option: T) => string;
  onChange: (option: T) => void;
}) {
  return (
    <div role="group" className="flex flex-wrap" {...slotAttributes(displaySettingsChoicesStyle, {})}>
      {options.map((option) => (
        <Button
          key={option}
          size="xs"
          variant={option === value ? "secondary" : "ghost"}
          aria-pressed={option === value}
          onClick={() => onChange(option)}
        >
          {label(option)}
        </Button>
      ))}
    </div>
  );
}

/**
 * The reader's display settings: colour theme, design, card fill, row density and dark mode.
 *
 * <p>Every choice applies at once and is kept in this browser. A theme brings its own radius,
 * typeface and card fill; choosing a fill here overrides the theme's until the theme is chosen
 * again, which clears the override so the new theme's own fill shows.
 */
export function DisplaySettings() {
  const defaultDesign = useConsoleDesign().id;
  const designs = useConsoleDesigns();
  const { t } = useTranslation(PACKAGE_NAMESPACE + "/chrome");
  const { colorTheme, setColorTheme, isDark, setDarkMode } = useTheme();
  const { prefs, update } = useDisplayPreferences();
  const fill = resolveFill(prefs, colorTheme);
  const design = prefs.design ?? defaultDesign;
  const density = prefs.density ?? "default";

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8" aria-label={t("display.title")}>
          <SlidersHorizontal className="size-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="flex flex-col" {...partAttributes(displaySettingsStyle, {})}>
        <section className="flex flex-col" {...slotAttributes(displaySettingsGroupStyle, {})}>
          <h3>{t("theme.colorTheme")}</h3>
          <div className="grid grid-cols-2" {...slotAttributes(displaySettingsThemesStyle, {})}>
            {THEMES.map((theme) => (
              <button
                key={theme.value}
                type="button"
                aria-pressed={theme.value === colorTheme}
                onClick={() => {
                  setColorTheme(theme.value);
                  update({ fill: null });
                }}
                className="flex items-center"
                {...slotAttributes(displaySettingsThemeStyle, { selected: theme.value === colorTheme })}
              >
                <span
                  aria-hidden="true"
                  className="inline-block size-3 shrink-0"
                  style={{ "--swatch": theme.primaryColor } as CSSProperties}
                  {...slotAttributes(displaySettingsSwatchStyle, {})}
                />
                {t(`display.themes.${theme.value}`, { defaultValue: theme.label })}
              </button>
            ))}
          </div>
        </section>
        {designs.length > 1 ? (
          <section className="flex flex-col" {...slotAttributes(displaySettingsGroupStyle, {})}>
            <h3>{t("display.design")}</h3>
            <Choices
              value={design}
              options={designs.map((d) => d.id)}
              label={(id) => t(`display.designs.${id}`, { defaultValue: id })}
              onChange={(id) => update({ design: id === defaultDesign ? null : id })}
            />
          </section>
        ) : null}
        <section className="flex flex-col" {...slotAttributes(displaySettingsGroupStyle, {})}>
          <h3>{t("display.fill")}</h3>
          <Choices value={fill} options={FILLS} label={(f) => t(`display.fills.${f}`)} onChange={(f) => update({ fill: f })} />
        </section>
        <section className="flex flex-col" {...slotAttributes(displaySettingsGroupStyle, {})}>
          <h3>{t("display.density")}</h3>
          <Choices
            value={density}
            options={DENSITIES}
            label={(d) => t(`display.densities.${d}`)}
            onChange={(d) => update({ density: d === "default" ? null : d })}
          />
        </section>
        <section className="flex flex-col" {...slotAttributes(displaySettingsGroupStyle, {})}>
          <h3>{t("theme.darkMode")}</h3>
          <Choices
            value={isDark ? "dark" : "light"}
            options={["light", "dark"] as const}
            label={(m) => t(`display.modes.${m}`)}
            onChange={(m) => setDarkMode(m === "dark")}
          />
        </section>
      </PopoverContent>
    </Popover>
  );
}
