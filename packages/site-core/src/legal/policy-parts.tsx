import { type MouseEvent, type ReactNode, useId } from "react";
import { slotAttributes } from "@simplix-react/ui/design";

import { SiteAction, type SiteActionSpec } from "../action/site-action";
import { siteDocActionStyle, siteDocHeadingStyle } from "../help/help.style";
import { siteCaptionStyle } from "../page/site-page.style";
import {
  siteAgencyGridStyle,
  siteAgencyNameStyle,
  siteAgencyPhoneStyle,
  siteAgencySiteStyle,
  siteAgencyStyle,
  siteGlanceGridStyle,
  siteGlanceStyle,
  siteGlanceTextStyle,
  siteGlanceTitleStyle,
  siteLegalSectionHeadStyle,
  siteLegalSectionStyle,
  siteRightsCardStyle,
  siteRightsGridStyle,
  siteRightsTextStyle,
  siteRightsTitleStyle,
} from "./policy.style";

/** Props for {@link LegalSection}. */
export interface LegalSectionProps {
  /** The section's id, which the contents rail and the glance cards jump to. */
  readonly id: string;
  readonly heading: ReactNode;
  /** A chip before the heading that names the kind of data, such as a `SiteChip` in the voice tone. */
  readonly chip?: ReactNode;
  /** `voice` sets the section about the reader's own voice apart on the voice's ground. */
  readonly tone?: "plain" | "voice";
  /** A small action at the section's foot, such as a jump to the section it refers to. */
  readonly action?: SiteActionSpec;
  /** The section's words, tables, cards and notices, in reading order. */
  readonly children?: ReactNode;
}

/** A numbered section of a policy or of the refund rules: its heading, then what it says. */
export function LegalSection({ id, heading, chip, tone = "plain", action, children }: LegalSectionProps) {
  const title = <h2 {...slotAttributes(siteDocHeadingStyle, {})}>{heading}</h2>;
  return (
    <section {...slotAttributes(siteLegalSectionStyle, { tone })} id={id}>
      {chip !== undefined ? (
        <div {...slotAttributes(siteLegalSectionHeadStyle, {})}>
          {chip}
          {title}
        </div>
      ) : (
        title
      )}
      {children}
      {action !== undefined ? (
        <span {...slotAttributes(siteDocActionStyle, {})}>
          <SiteAction {...action} size="sm" />
        </span>
      ) : null}
    </section>
  );
}

/** One card of a policy at a glance. */
export interface SiteGlance {
  readonly key: string;
  readonly title: ReactNode;
  readonly text: ReactNode;
  /** The card about the reader's own voice, outlined in the voice. */
  readonly voice?: boolean;
  /** Jumps to the section the card sums up. */
  readonly onSelect: (event: MouseEvent<HTMLElement>) => void;
}

/** Props for {@link GlanceGrid}. */
export interface GlanceGridProps {
  readonly items: readonly SiteGlance[];
}

/** A policy at a glance: a card per subject, each a button that jumps to its section. */
export function GlanceGrid({ items }: GlanceGridProps) {
  return (
    <div {...slotAttributes(siteGlanceGridStyle, {})}>
      {items.map((item) => (
        <button key={item.key} {...slotAttributes(siteGlanceStyle, { tone: item.voice === true ? "voice" : "plain" })} type="button" onClick={item.onSelect}>
          <b {...slotAttributes(siteGlanceTitleStyle, {})}>{item.title}</b>
          <span {...slotAttributes(siteGlanceTextStyle, {})}>{item.text}</span>
        </button>
      ))}
    </div>
  );
}

/** One of the reader's rights. */
export interface SiteRight {
  readonly key: string;
  readonly title: ReactNode;
  readonly text: ReactNode;
  /** Where the right is used, a small action; a disabled one is described by the grid's reason. */
  readonly action: SiteActionSpec;
}

/** Props for {@link RightsGrid}. */
export interface RightsGridProps {
  readonly items: readonly SiteRight[];
  /** Why a disabled right cannot be used here yet, a line under the cards that it is described by. */
  readonly reason?: ReactNode;
}

/** The reader's rights as cards: what each is, how it is used, and where. */
export function RightsGrid({ items, reason }: RightsGridProps) {
  const reasonId = useId();
  const hasReason = reason !== undefined && items.some((item) => item.action.disabled === true);
  return (
    <>
      <div {...slotAttributes(siteRightsGridStyle, {})}>
        {items.map((item) => (
          <section key={item.key} {...slotAttributes(siteRightsCardStyle, {})}>
            <b {...slotAttributes(siteRightsTitleStyle, {})}>{item.title}</b>
            <span {...slotAttributes(siteRightsTextStyle, {})}>{item.text}</span>
            <span {...slotAttributes(siteDocActionStyle, {})}>
              <SiteAction {...item.action} describedBy={item.action.describedBy ?? (item.action.disabled === true && hasReason ? reasonId : undefined)} size="sm" />
            </span>
          </section>
        ))}
      </div>
      {hasReason ? (
        <p {...slotAttributes(siteCaptionStyle, {})} id={reasonId}>
          {reason}
        </p>
      ) : null}
    </>
  );
}

/** An agency to turn to: its name, its number and its site. */
export interface SiteAgency {
  readonly key: string;
  readonly name: ReactNode;
  readonly phone: ReactNode;
  readonly site: ReactNode;
}

/** Props for {@link AgencyGrid}. */
export interface AgencyGridProps {
  readonly items: readonly SiteAgency[];
}

/** Where else to report or ask: a tile per agency on the sunken ground. */
export function AgencyGrid({ items }: AgencyGridProps) {
  return (
    <div {...slotAttributes(siteAgencyGridStyle, {})}>
      {items.map((item) => (
        <div key={item.key} {...slotAttributes(siteAgencyStyle, {})}>
          <b {...slotAttributes(siteAgencyNameStyle, {})}>{item.name}</b>
          <span {...slotAttributes(siteAgencyPhoneStyle, {})}>{item.phone}</span>
          <span {...slotAttributes(siteAgencySiteStyle, {})}>{item.site}</span>
        </div>
      ))}
    </div>
  );
}
