import { useId, type ReactNode } from "react";
import { slotAttributes } from "@simplix-react/ui/design";

import { SiteAction, type SiteActionSpec, type SiteReason } from "../action/site-action";
import { siteSpacerStyle } from "../shell/site-shell.style";
import {
  siteFeatureLabelStyle,
  siteFeatureListStyle,
  siteFeatureMarkStyle,
  siteFeatureStyle,
  sitePlanCardActionsStyle,
  sitePlanCardBadgeStyle,
  sitePlanCardNameStyle,
  sitePlanCardNoteStyle,
  sitePlanCardPitchStyle,
  sitePlanCardPriceStyle,
  sitePlanCardReasonStyle,
  sitePlanCardStyle,
  sitePlanCardUnitStyle,
  sitePlanGridStyle,
} from "./pricing.style";

/** One line of what an offer includes. */
export interface SiteFeature {
  readonly key: string;
  readonly label: ReactNode;
  /** `false` for a line the offer leaves out, drawn faint with a dash. */
  readonly included?: boolean;
}

/** Props for {@link FeatureList}. */
export interface FeatureListProps {
  readonly items: readonly SiteFeature[];
  /** Two columns on a wide card; one below the narrow tier whatever this says. */
  readonly columns?: 1 | 2;
}

/** What an offer includes, a check before each line it includes and a dash before each it leaves out. */
export function FeatureList({ items, columns = 1 }: FeatureListProps) {
  return (
    <ul {...slotAttributes(siteFeatureListStyle, { columns: String(columns) })}>
      {items.map((item) => {
        const included = item.included !== false;
        return (
          <li key={item.key} {...slotAttributes(siteFeatureStyle, { included })}>
            <svg {...slotAttributes(siteFeatureMarkStyle, { included })} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d={included ? "M20 6 9 17l-5-5" : "M5 12h14"} />
            </svg>
            <span {...slotAttributes(siteFeatureLabelStyle, {})}>{item.label}</span>
          </li>
        );
      })}
    </ul>
  );
}

/** Props for {@link PlanGrid}. */
export interface PlanGridProps {
  /** How many offers stand side by side on a wide page. */
  readonly columns?: 3 | 4;
  readonly children: ReactNode;
}

/** The offers side by side: as many as `columns` on a wide page, two below the medium tier, one below the narrow tier. */
export function PlanGrid({ columns = 4, children }: PlanGridProps) {
  return <div {...slotAttributes(sitePlanGridStyle, { columns: String(columns) })}>{children}</div>;
}

/** Props for {@link PlanCard}. */
export interface PlanCardProps {
  readonly name: ReactNode;
  /** The price as the reader's currency writes it. */
  readonly price: ReactNode;
  /** What the price is per ("/mo", "once"). */
  readonly unit?: ReactNode;
  /** The price's terms ("VAT included", "No card needed"). */
  readonly note?: ReactNode;
  /** Who the offer is for. */
  readonly pitch?: ReactNode;
  /** What the offer comes to, as a muted line under the pitch. */
  readonly detail?: ReactNode;
  readonly features?: readonly SiteFeature[];
  /** The mark on the offer most people choose ("Most chosen"); the card is drawn in the accent. */
  readonly highlight?: ReactNode;
  /**
   * The signed-in account's offer: what the card says in place of its actions (`label`, "Your plan"),
   * drawn as a disabled action across the card, and why it cannot be chosen (`reason`, "This is the
   * plan you are on"), read after it.
   */
  readonly current?: { readonly label: ReactNode; readonly reason: SiteReason };
  /** The card's actions, the strongest first; ignored on the current offer. */
  readonly actions?: readonly SiteActionSpec[];
  /**
   * Why the card's actions cannot run now, drawn under them, such as an offer that cannot be bought
   * before the checkout opens. Give it with every disabled action, so no action is refused in silence:
   * each disabled action is described by it.
   */
  readonly reason?: ReactNode;
}

/**
 * One offer: its name, price, terms and what it includes, with its actions at the card's foot so
 * the actions of every card in a row line up.
 */
export function PlanCard({ name, price, unit, note, pitch, detail, features, highlight, current, actions = [], reason }: PlanCardProps) {
  const id = useId();
  const reasonId = useId();
  const isCurrent = current !== undefined;
  const hasReason = reason !== undefined && !isCurrent;
  return (
    <section {...slotAttributes(sitePlanCardStyle, { highlight: highlight !== undefined })} aria-labelledby={id} data-current={isCurrent ? "true" : undefined}>
      {highlight !== undefined ? <span {...slotAttributes(sitePlanCardBadgeStyle, {})}>{highlight}</span> : null}
      <h2 {...slotAttributes(sitePlanCardNameStyle, {})} id={id}>
        {name}
      </h2>
      <p {...slotAttributes(sitePlanCardPriceStyle, {})}>
        {price}
        {unit !== undefined ? <small {...slotAttributes(sitePlanCardUnitStyle, {})}>{unit}</small> : null}
      </p>
      {note !== undefined ? <p {...slotAttributes(sitePlanCardNoteStyle, {})}>{note}</p> : null}
      {pitch !== undefined ? <p {...slotAttributes(sitePlanCardPitchStyle, {})}>{pitch}</p> : null}
      {detail !== undefined ? <p {...slotAttributes(sitePlanCardNoteStyle, {})}>{detail}</p> : null}
      {features !== undefined && features.length > 0 ? <FeatureList items={features} /> : null}
      <span {...slotAttributes(siteSpacerStyle, {})} aria-hidden="true" />
      <div {...slotAttributes(sitePlanCardActionsStyle, {})}>
        {isCurrent ? (
          <SiteAction id="current" label={current.label} disabled reason={current.reason} block />
        ) : (
          actions.map((action) => <SiteAction key={action.id} {...action} describedBy={action.describedBy ?? (action.disabled === true && hasReason ? reasonId : undefined)} block />)
        )}
      </div>
      {hasReason ? (
        <p {...slotAttributes(sitePlanCardReasonStyle, {})} id={reasonId}>
          {reason}
        </p>
      ) : null}
    </section>
  );
}
