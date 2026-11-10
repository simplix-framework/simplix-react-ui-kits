import { SearchIcon } from "lucide-react";
import { useTranslation } from "@simplix-react/i18n/react";
import { slotAttributes } from "@simplix-react/ui/design";

import { ConsoleKeyCap } from "./command-palette";
import { menuSearchLabelStyle, menuSearchStyle } from "./menu-search.style";
import { ConsoleMenuRailButton } from "./menu-tree";
import { PACKAGE_NAMESPACE } from "./locales";

/** Props for {@link ConsoleMenuSearch}. */
export interface ConsoleMenuSearchProps {
  /** Opens the palette. */
  readonly onOpen: () => void;
  /** `column` is the field across the expanded column; `rail` is the glyph on the collapsed rail. */
  readonly layout?: "column" | "rail";
}

/**
 * The console's search, held at the foot of the menu: a field across the expanded column and a
 * glyph on the rail. It opens the same command palette the top bar's field does (a button and not
 * an input, since what the reader types belongs to the palette, which searches screens, menus and
 * actions together). Pass it to the column's or the rail's `search`.
 */
export function ConsoleMenuSearch({ onOpen, layout = "column" }: ConsoleMenuSearchProps) {
  const { t } = useTranslation(`${PACKAGE_NAMESPACE}/chrome`);
  if (layout === "rail") {
    return (
      <ConsoleMenuRailButton active={false} label={t("palette.search")} aria-haspopup="dialog" onClick={onOpen}>
        <SearchIcon aria-hidden />
      </ConsoleMenuRailButton>
    );
  }
  return (
    <button type="button" onClick={onOpen} aria-label={t("palette.search")} aria-haspopup="dialog" title={t("palette.placeholder")} {...slotAttributes(menuSearchStyle, {})}>
      <SearchIcon aria-hidden size={16} className="shrink-0" />
      <span {...slotAttributes(menuSearchLabelStyle, {})}>{t("palette.search")}</span>
      <ConsoleKeyCap>⌘K</ConsoleKeyCap>
    </button>
  );
}
