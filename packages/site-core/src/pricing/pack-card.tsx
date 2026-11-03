import { useId, type ReactNode } from "react";
import { slotAttributes } from "@simplix-react/ui/design";

import { QuotaMeter } from "../account/figures";
import { SiteAction, type SiteActionSpec } from "../action/site-action";
import { siteSectionHeadingStyle, siteSectionLedeStyle } from "../page/site-page.style";
import {
  sitePackCardAboutStyle,
  sitePackCardActionsStyle,
  sitePackCardAmountStyle,
  sitePackCardHeadStyle,
  sitePackCardNameStyle,
  sitePackCardPriceStyle,
  sitePackCardReasonStyle,
  sitePackCardStyle,
  sitePackCardTermsStyle,
  sitePackCardUnitStyle,
  sitePackGridStyle,
  sitePackHeadStyle,
  sitePackNoteStyle,
  sitePackSectionStyle,
} from "./packs.style";

/** Props for {@link PackSection}. */
export interface PackSectionProps {
  /** The view's heading, in the display family; the section is named by it. */
  readonly heading: ReactNode;
  readonly lede?: ReactNode;
  /** A line under the packs, such as how a plan compares for someone who buys often. */
  readonly note?: ReactNode;
  /** The packs, each a {@link PackCard}. */
  readonly children: ReactNode;
}

/**
 * One-off packs offered beside the plans (a pack for one presentation, extra credits on a paid plan):
 * the heading and lede, the packs side by side (one under the other below the medium tier), then
 * the closing line.
 */
export function PackSection({ heading, lede, note, children }: PackSectionProps) {
  const id = useId();
  return (
    <section {...slotAttributes(sitePackSectionStyle, {})} aria-labelledby={id}>
      <div {...slotAttributes(sitePackHeadStyle, {})}>
        <h2 {...slotAttributes(siteSectionHeadingStyle, { size: "lg" })} id={id}>
          {heading}
        </h2>
        {lede !== undefined ? <p {...slotAttributes(siteSectionLedeStyle, {})}>{lede}</p> : null}
      </div>
      <div {...slotAttributes(sitePackGridStyle, {})}>{children}</div>
      {note !== undefined ? <p {...slotAttributes(sitePackNoteStyle, {})}>{note}</p> : null}
    </section>
  );
}

/** What a pack gives, drawn as a meter against the largest allowance offered. */
export interface PackMeter {
  /** The pack's characters as a share of the largest allowance, from 0 to 1. */
  readonly share: number;
  /** The meter's accessible description ("50,000 characters"). */
  readonly label: string;
  /** The characters, at the meter's start ("50,000 characters"). */
  readonly amount: ReactNode;
  /** What they come to, at its end ("about 50 min of English · 2 twenty-minute talks"). */
  readonly talk: ReactNode;
}

/** Props for {@link PackCard}. */
export interface PackCardProps {
  readonly name: ReactNode;
  /** The price as the reader's currency writes it. */
  readonly price: ReactNode;
  /** What the price is per (" once"), drawn small after it. */
  readonly unit?: ReactNode;
  /** Who the pack is for. */
  readonly about?: ReactNode;
  readonly meter: PackMeter;
  /** How long it lasts and that it never renews. */
  readonly terms?: ReactNode;
  /** The way to buy it. */
  readonly action: SiteActionSpec;
  /**
   * Why the action cannot run now (extra credits before a paid plan), drawn under it. A disabled
   * action is described by this line instead of its own visually hidden reason.
   */
  readonly reason?: ReactNode;
}

/** One pack: its name and price, who it is for, what it gives on a meter, its terms and its action. */
export function PackCard({ name, price, unit, about, meter, terms, action, reason }: PackCardProps) {
  const nameId = useId();
  const reasonId = useId();
  const described = action.describedBy ?? (action.disabled === true && reason !== undefined ? reasonId : undefined);
  return (
    <section {...slotAttributes(sitePackCardStyle, {})} aria-labelledby={nameId}>
      <div {...slotAttributes(sitePackCardHeadStyle, {})}>
        <h2 {...slotAttributes(sitePackCardNameStyle, {})} id={nameId}>
          {name}
        </h2>
        <span {...slotAttributes(sitePackCardPriceStyle, {})}>
          {price}
          {unit !== undefined ? <small {...slotAttributes(sitePackCardUnitStyle, {})}>{unit}</small> : null}
        </span>
      </div>
      {about !== undefined ? <p {...slotAttributes(sitePackCardAboutStyle, {})}>{about}</p> : null}
      <QuotaMeter share={meter.share} label={meter.label} start={<b {...slotAttributes(sitePackCardAmountStyle, {})}>{meter.amount}</b>} end={meter.talk} />
      {terms !== undefined ? <p {...slotAttributes(sitePackCardTermsStyle, {})}>{terms}</p> : null}
      <div {...slotAttributes(sitePackCardActionsStyle, {})}>
        <SiteAction {...action} tone={action.tone ?? "primary"} describedBy={described} />
      </div>
      {reason !== undefined ? (
        <p {...slotAttributes(sitePackCardReasonStyle, {})} id={reasonId}>
          {reason}
        </p>
      ) : null}
    </section>
  );
}
