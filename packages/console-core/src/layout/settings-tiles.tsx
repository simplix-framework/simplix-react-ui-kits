import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useTranslation } from "@simplix-react/i18n/react";
import { useMediaQuery, usePageHeaderState } from "@simplix-react/ui";
import { ChevronDownIcon } from "lucide-react";
import { slotAttributes } from "@simplix-react/ui/design";

import { PACKAGE_NAMESPACE } from "./locales";
import {
  tileGutterStyle,
  tileHandleChevronStyle,
  tileHandleLabelStyle,
  tileHandleStyle,
  tileHeadStyle,
  tileReachStyle,
  tileRowStyle,
  tileStripInsetStyle,
  tileStripChipsStyle,
  tileTickerStyle,
  tileTitleStyle,
} from "./settings-tiles.style";
import { MAX_TILE_COLUMNS } from "./tile-columns";
import { useTilesCollapse } from "./tiles-collapse";
import { PHONE_WINDOW, REDUCED_MOTION } from "./window-size";
import { FLIP_EVERY_MS } from "./settings-tiles-figure";
import type { SettingsTilesProps } from "./settings-tiles-types";
import { TileChips, TileGrid, TileStrip } from "./settings-tiles-rows";

export function SettingsTiles({ tiles, columns = MAX_TILE_COLUMNS, reorderKey, title, loading = false, folded = false, filters, collapsible = true }: SettingsTilesProps) {
  const { t } = useTranslation(PACKAGE_NAMESPACE + "/tiles");
  const shared = useTilesCollapse();
  const [unfolded, setUnfolded] = useState(false);
  useEffect(() => setUnfolded(false), [folded]);
  const collapsed = folded ? !unfolded : shared.collapsed;
  const toggle = folded ? () => setUnfolded((was) => !was) : shared.toggle;
  const header = usePageHeaderState();
  const onAPhone = useMediaQuery(PHONE_WINDOW);
  const stillness = useMediaQuery(REDUCED_MOTION);
  const [at, setAt] = useState(0);
  const [held, setHeld] = useState(false);
  const anchor = useRef<HTMLDivElement>(null);
  const [leads, setLeads] = useState<"rule" | "lead" | "content">("rule");

  // What this row folds up behind. Measured from the DOM because it cannot be known any other way:
  // a screen puts a load-failure panel above its figures on the one render where the read failed
  // and nowhere else, and a component cannot be told by its props what its own siblings are.
  // Before paint, so the row never lands in the wrong place and jumps.
  //
  // Three answers, and a `data-page-lead` sibling is the middle one. A back link is the one thing
  // that legitimately stands above the figures - it cannot go in the header, where
  // `headerHoldsNoWayToAnotherScreen` refuses a trip out of the screen - so the row folds up under
  // it instead of under the header's rule, which is the same fold one step lower down.
  useLayoutEffect(() => {
    const previous = anchor.current?.previousElementSibling ?? null;
    if (anchor.current) {
      setLeads(previous === null ? "rule" : previous.hasAttribute("data-page-lead") ? "lead" : "content");
    }
  });

  // Whether a rule is actually drawn above this row. `ConsolePageHeader` draws the title band on a
  // wide window and, on a phone, only the action row - and it draws nothing at all when the screen
  // registered no actions there. Folding against a rule that is not on the screen would lift the
  // row 32px into whatever is above it.
  const underARule = Boolean(onAPhone ? header.actions : header.title);
  const folding = collapsible && underARule && leads !== "content";
  // A titled row folds into chips in its own head and has no strip to turn.
  const turningFolded = !title && folding && collapsed;

  // How far up the row has to reach to sit against whatever is above it, and the same distance paid
  // back so the tiles stand exactly where they stood. Under the header it is two gaps: the
  // header's own bottom margin AND the page column's `gap="md"`, which add in a flex column. Under
  // a back link it is the one gap between two siblings. Both are the design's, since the header's
  // margin is (`tileReachStyle`, `tileRowStyle`).
  const reachFrom: "rule" | "lead" = leads === "rule" ? "rule" : "lead";

  // Nothing turns while the row is open, while a pointer is on the strip, or where there is only
  // one figure to show - a lone tile flipping to itself is movement that says nothing.
  const turning = turningFolded && !held && !stillness && tiles.length > 1;

  useEffect(() => {
    if (!turning) return;
    const timer = setInterval(() => setAt((was) => was + 1), FLIP_EVERY_MS);
    return () => clearInterval(timer);
  }, [turning]);

  if (tiles.length === 0) return null;

  // Modulo at the point of use rather than in the setter: the count changes when a screen's figures
  // arrive, and an index wrapped against the old count would land on a different tile than the one
  // that was about to be shown.
  const showing = at % tiles.length;

  // A row that does not fold draws its heading, when it has one, over the tiles with no control.
  if (title && !collapsible) {
    return (
      <section ref={anchor} aria-label={title}>
        <div className="flex items-center" {...slotAttributes(tileHeadStyle, { folded: false })}>
          <h2 className="shrink-0" {...slotAttributes(tileTitleStyle, {})}>
            {title}
          </h2>
        </div>
        <div {...slotAttributes(tileRowStyle, {})}>
          <TileGrid tiles={tiles} columns={columns} reorderKey={reorderKey} loading={loading} filters={filters} />
        </div>
      </section>
    );
  }

  if (title) {
    return (
      <section ref={anchor} aria-label={title}>
        {/* The head: the heading, the folded strip in the room between it and the control, and the
            control at the right. */}
        <div className="flex items-center" {...slotAttributes(tileHeadStyle, { folded: collapsed })}>
          <h2 className="shrink-0" {...slotAttributes(tileTitleStyle, {})}>
            {title}
          </h2>
          <div className="min-w-0 flex-1">
            <div className="tiles-fold" data-open={collapsed ? "true" : "false"} aria-hidden={!collapsed} inert={!collapsed}>
              {/* Folded, every figure as a chip that does what its card does. The fold clips its
                  child, so the chips sit in a wrapper of their own. */}
              <div>
                <TileChips tiles={tiles} active={collapsed} filters={filters} />
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={toggle}
            aria-expanded={!collapsed}
            aria-label={collapsed ? t("expand") : t("collapse")}
            className="group flex shrink-0 items-center"
            {...slotAttributes(tileHandleStyle, { placement: "head" })}
          >
            <ChevronDownIcon
              className="size-3.5"
              aria-hidden
              {...slotAttributes(tileHandleChevronStyle, { folded: collapsed })}
            />
            <span aria-hidden {...slotAttributes(tileHandleLabelStyle, { placement: "head" })}>
              {collapsed ? t("expand") : t("collapse")}
            </span>
          </button>
        </div>
        <div className="tiles-fold" data-open={collapsed ? "false" : "true"} aria-hidden={collapsed} inert={collapsed}>
          <div {...slotAttributes(tileGutterStyle, {})}>
            <div {...slotAttributes(tileRowStyle, {})}>
              <TileGrid tiles={tiles} columns={columns} reorderKey={reorderKey} loading={loading} filters={filters} className="tiles-cascade" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  // The wrapper is drawn either way, so there is always an element to ask about its siblings - and
  // so switching between the two shapes never adds or removes a node the measurement depends on.
  if (!folding) {
    return (
      <div ref={anchor}>
        <TileGrid tiles={tiles} columns={columns} reorderKey={reorderKey} loading={loading} filters={filters} />
      </div>
    );
  }

  return (
    <div ref={anchor} className="relative" {...slotAttributes(tileReachStyle, { leads: reachFrom })}>
      {/* The strip. Its own fold rather than a `collapsed &&`, so it slides away under the rule as
          the tiles come down instead of vanishing on the frame the press landed on. */}
      <div className="tiles-fold" data-open={collapsed ? "true" : "false"} aria-hidden={!collapsed} inert={!collapsed}>
        {/* Inset from both ends by a hair, so the rule still reads as the wider thing the strip
            came out from under. */}
        <div {...slotAttributes(tileStripInsetStyle, {})}>
          <div {...slotAttributes(tileTickerStyle, {})}>
            <TileStrip
              tiles={tiles}
              showing={showing}
              label={t("expand")}
              onPress={toggle}
              onHold={setHeld}
            />
          </div>
          <div {...slotAttributes(tileStripChipsStyle, {})}>
            <TileChips tiles={tiles} active={collapsed} filters={filters} />
          </div>
        </div>
      </div>

      {/* The tiles. */}
      <div className="tiles-fold" data-open={collapsed ? "false" : "true"} aria-hidden={collapsed} inert={collapsed}>
        {/* The fold clips on both axes, so the row is given a gutter its cards' focus rings can
            live in - without it the leftmost and rightmost rings are shaved off while every other
            card on the screen draws a whole one (frontend invariant #58: the arithmetic is fixed
            here rather than the clipping hidden). */}
        <div {...slotAttributes(tileGutterStyle, {})}>
          {/* Paying back exactly what the wrapper reached up by, so the tiles stand where they
              stood before this wrapper existed and no screen moved by adopting it. */}
          <div {...slotAttributes(tileRowStyle, { leads: reachFrom })}>
            <TileGrid tiles={tiles} columns={columns} reorderKey={reorderKey} loading={loading} filters={filters} className="tiles-cascade" />
          </div>
        </div>
      </div>

      {/* The handle - one shape in one place through both states, hanging off the rule at its
          right-hand end. Positioned against this wrapper rather than against either fold, so it
          lies over the strip when the row is folded and over the 32px the tiles reserve above
          themselves when it is open. It never reaches the cards. */}
      <button
        type="button"
        onClick={toggle}
        aria-expanded={!collapsed}
        aria-label={collapsed ? t("expand") : t("collapse")}
        className="group absolute z-10 flex items-center justify-center"
        {...slotAttributes(tileHandleStyle, { placement: "rule" })}
      >
        <ChevronDownIcon
          className="size-3.5"
          aria-hidden
          {...slotAttributes(tileHandleChevronStyle, { folded: collapsed })}
        />
        {/* The control's name in words, for a design that draws the handle as a labelled button
            rather than as a tab hanging off the rule. The button's own label already names it. */}
        <span aria-hidden {...slotAttributes(tileHandleLabelStyle, { placement: "rule" })}>
          {collapsed ? t("expand") : t("collapse")}
        </span>
      </button>
    </div>
  );
}

export * from "./settings-tiles-types";
export * from "./settings-tiles-figure";
export * from "./settings-tiles-rows";
