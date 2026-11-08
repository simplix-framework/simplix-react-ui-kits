import type { ReactNode } from "react";
import { slotAttributes } from "@simplix-react/ui/design";

import { SiteAction, type SiteActionSpec } from "../action/site-action";
import {
  siteHeroAccentStyle,
  siteHeroActionsStyle,
  siteHeroCopyStyle,
  siteHeroEyebrowStyle,
  siteHeroFactsStyle,
  siteHeroInnerStyle,
  siteHeroLedeStyle,
  siteHeroMediaStyle,
  siteHeroStyle,
  siteHeroTitleStyle,
} from "./marketing.style";

/** Props for {@link HeroBand}. */
export interface HeroBandProps {
  /** The ground the band is drawn on; `dark` continues a dark bar above it. */
  readonly tone?: "light" | "dark";
  /** A short line above the title. */
  readonly eyebrow?: ReactNode;
  /** The title's first line. */
  readonly title: ReactNode;
  /** The title's second line, drawn in the voice colour. */
  readonly accent?: ReactNode;
  readonly lede?: ReactNode;
  /** The hero's actions, the strongest first; drawn large. */
  readonly actions?: readonly SiteActionSpec[];
  /** What the product needs, in one small line under the actions. */
  readonly facts?: ReactNode;
  /** What stands beside the pitch: a {@link PlayerCard}, a picture. */
  readonly media?: ReactNode;
}

/**
 * The hero: a band across the window with the page's one `h1`, its accent line, the lede, the
 * actions and the facts line, and the product's media beside them. Below the medium tier the media
 * moves under the pitch.
 */
export function HeroBand({ tone = "light", eyebrow, title, accent, lede, actions = [], facts, media }: HeroBandProps) {
  return (
    <section {...slotAttributes(siteHeroStyle, {})} data-band={tone === "dark" ? "dark" : undefined}>
      <div {...slotAttributes(siteHeroInnerStyle, {})}>
        <div {...slotAttributes(siteHeroCopyStyle, {})}>
          {eyebrow !== undefined ? <span {...slotAttributes(siteHeroEyebrowStyle, {})}>{eyebrow}</span> : null}
          <h1 {...slotAttributes(siteHeroTitleStyle, {})}>
            {title}
            {accent !== undefined ? (
              <>
                {/* The break is no space to a reader of the text: the space folds away on screen. */}
                {" "}
                <br />
                <em {...slotAttributes(siteHeroAccentStyle, {})}>{accent}</em>
              </>
            ) : null}
          </h1>
          {lede !== undefined ? <p {...slotAttributes(siteHeroLedeStyle, {})}>{lede}</p> : null}
          {actions.length > 0 ? (
            <div {...slotAttributes(siteHeroActionsStyle, {})}>
              {actions.map((action) => (
                <SiteAction key={action.id} {...action} size="lg" />
              ))}
            </div>
          ) : null}
          {facts !== undefined ? <small {...slotAttributes(siteHeroFactsStyle, {})}>{facts}</small> : null}
        </div>
        {media !== undefined ? <div {...slotAttributes(siteHeroMediaStyle, {})}>{media}</div> : null}
      </div>
    </section>
  );
}
