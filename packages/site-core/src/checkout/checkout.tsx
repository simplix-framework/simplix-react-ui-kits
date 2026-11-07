import type { ReactNode } from "react";
import { slotAttributes } from "@simplix-react/ui/design";

import { SiteAction, type SiteActionSpec } from "../action/site-action";
import { SiteCheckbox } from "../form/choices";
import {
  siteChainDiscStyle,
  siteChainLabelStyle,
  siteChainNoteStyle,
  siteChainReadyStyle,
  siteChainStepsStyle,
  siteChainStepStyle,
  siteCheckoutActionsStyle,
  siteCheckoutHeadStyle,
  siteCheckoutLedeStyle,
  siteCheckoutMainStyle,
  siteCheckoutRowNoteStyle,
  siteCheckoutRowStyle,
  siteCheckoutStyle,
  siteCheckoutTitleStyle,
  siteConsentAgainNoteStyle,
  siteConsentAgainStyle,
  siteConsentAllStyle,
  siteConsentItemStyle,
  siteConsentListStyle,
  siteConsentViewStyle,
  siteDoneMarkStyle,
  siteDoneTextStyle,
  siteDoneTitleStyle,
  siteMethodAboutStyle,
  siteMethodGridStyle,
  siteMethodMarkStyle,
  siteMethodNameStyle,
  siteMethodStyle,
  siteMethodTextStyle,
  siteOrderAmountStyle,
  siteOrderHeadStyle,
  siteOrderLabelStyle,
  siteOrderLinesStyle,
  siteOrderLineStyle,
  siteOrderLiveDotStyle,
  siteOrderLiveStyle,
  siteOrderNoteStyle,
  siteOrderSummaryStyle,
  siteOrderTitleStyle,
  siteProgressChainStyle,
  siteProviderBodyStyle,
  siteProviderFrameStyle,
  siteProviderLabelStyle,
  siteProviderMarkStyle,
  siteProviderNameStyle,
  siteProviderOwnerStyle,
  siteProviderTargetStyle,
  siteProviderWaitingStyle,
  siteProviderWaitingTextStyle,
  siteSavingStyle,
  siteStepCaptionStyle,
  siteStepHeadingStyle,
  siteStepDiscStyle,
  siteStepLineStyle,
  siteStepperStyle,
  siteStepStyle,
} from "./checkout.style";

/** Props for {@link Stepper}. */
export interface StepperProps {
  /** The list's accessible name ("Checkout steps"). */
  readonly label: string;
  /** The steps' names in order. */
  readonly steps: readonly { readonly key: string; readonly label: ReactNode }[];
  /** The index of the current step; the ones before it are done. */
  readonly current: number;
  /** The check a done step's disc shows, a glyph the product draws. */
  readonly doneMark?: ReactNode;
  /** The line under the steps saying what this step asks for; the line keeps its height when empty. */
  readonly caption?: ReactNode;
  /**
   * The page's title, drawn for a screen reader and the tab only: the steps are the page's visible
   * heading, and a purchase page that names its step (「Details」) gives the page the h1 it would
   * otherwise lack.
   */
  readonly heading?: ReactNode;
}

/** The steps of a purchase: numbered discs joined by lines, the current one marked as the step. */
export function Stepper({ label, steps, current, doneMark, caption, heading }: StepperProps) {
  return (
    <>
      {heading !== undefined ? <h1 {...slotAttributes(siteStepHeadingStyle, {})}>{heading}</h1> : null}
      <ol {...slotAttributes(siteStepperStyle, {})} aria-label={label}>
        {steps.map((step, index) => {
          const state = index < current ? "done" : index === current ? "current" : "next";
          return (
            <li key={step.key} {...slotAttributes(siteStepStyle, { state })} aria-current={index === current ? "step" : undefined}>
              {index > 0 ? <span {...slotAttributes(siteStepLineStyle, { reached: index <= current })} aria-hidden="true" /> : null}
              <b {...slotAttributes(siteStepDiscStyle, { state })}>{state === "done" ? doneMark ?? index + 1 : index + 1}</b>
              {step.label}
            </li>
          );
        })}
      </ol>
      {caption !== undefined ? <p {...slotAttributes(siteStepCaptionStyle, {})}>{caption}</p> : null}
    </>
  );
}

/** Props for {@link CheckoutLayout}. */
export interface CheckoutLayoutProps {
  /** Our side: the order, what it gives, the receipt and the consents. */
  readonly main: ReactNode;
  /** The payment side: a {@link ProviderFrame}. */
  readonly summary: ReactNode;
}

/** Our side beside the payment side: two columns above the medium tier, one below. */
export function CheckoutLayout({ main, summary }: CheckoutLayoutProps) {
  return (
    <div {...slotAttributes(siteCheckoutStyle, {})}>
      <div {...slotAttributes(siteCheckoutMainStyle, {})}>{main}</div>
      {summary}
    </div>
  );
}

/** Props for {@link CheckoutHead}. */
export interface CheckoutHeadProps {
  readonly title: ReactNode;
  readonly lede?: ReactNode;
}

/** A side's head: its title in the display family and the sentence under it. */
export function CheckoutHead({ title, lede }: CheckoutHeadProps) {
  return (
    <div {...slotAttributes(siteCheckoutHeadStyle, {})}>
      <h2 {...slotAttributes(siteCheckoutTitleStyle, {})}>{title}</h2>
      {lede !== undefined ? <p {...slotAttributes(siteCheckoutLedeStyle, {})}>{lede}</p> : null}
    </div>
  );
}

/** Props for {@link CheckoutRow}. */
export interface CheckoutRowProps {
  /** A switch (the cycle) and what it saves. */
  readonly children?: ReactNode;
  /** A muted note in the row, such as how long a one-off purchase lasts. */
  readonly note?: ReactNode;
}

/** A row of the order's switches and what they say. */
export function CheckoutRow({ children, note }: CheckoutRowProps) {
  return (
    <div {...slotAttributes(siteCheckoutRowStyle, {})}>
      {children}
      {note !== undefined ? <span {...slotAttributes(siteCheckoutRowNoteStyle, {})}>{note}</span> : null}
    </div>
  );
}

/** Props for {@link SavingTag}. */
export interface SavingTagProps {
  readonly children: ReactNode;
}

/** What a choice saves, on the good colour's soft ground. */
export function SavingTag({ children }: SavingTagProps) {
  return <span {...slotAttributes(siteSavingStyle, {})}>{children}</span>;
}

/** One line of {@link OrderSummary}. */
export interface OrderLine {
  readonly key: string;
  readonly label: ReactNode;
  readonly amount: ReactNode;
}

/** Props for {@link OrderSummary}. */
export interface OrderSummaryProps {
  readonly title: ReactNode;
  /** At the head's end, with a good dot: that the receipt follows the payment side. */
  readonly live?: ReactNode;
  /** The order's lines before the tax. */
  readonly lines: readonly OrderLine[];
  /** The tax line, ruled dashed from the lines. */
  readonly tax?: OrderLine;
  readonly total: OrderLine;
  /** When it renews and who sells it. */
  readonly note?: ReactNode;
  /** A status only a screen reader hears, such as the total as it changes: a `SiteLive`. */
  readonly status?: ReactNode;
}

/** The receipt as it will read: the head, the lines, the tax, the total in the display family, and the note. */
export function OrderSummary({ title, live, lines, tax, total, note, status }: OrderSummaryProps) {
  const line = (entry: OrderLine, kind: "line" | "tax" | "total") => (
    <div key={entry.key} {...slotAttributes(siteOrderLineStyle, { kind })}>
      <dt {...slotAttributes(siteOrderLabelStyle, { total: kind === "total" })}>{entry.label}</dt>
      <dd {...slotAttributes(siteOrderAmountStyle, { total: kind === "total" })}>{entry.amount}</dd>
    </div>
  );
  return (
    <section {...slotAttributes(siteOrderSummaryStyle, {})} aria-label={typeof title === "string" ? title : undefined}>
      <div {...slotAttributes(siteOrderHeadStyle, {})}>
        <b {...slotAttributes(siteOrderTitleStyle, {})}>{title}</b>
        {live !== undefined ? (
          <span {...slotAttributes(siteOrderLiveStyle, {})}>
            <i {...slotAttributes(siteOrderLiveDotStyle, {})} aria-hidden="true" />
            {live}
          </span>
        ) : null}
      </div>
      {status}
      <dl {...slotAttributes(siteOrderLinesStyle, {})}>
        {lines.map((entry) => line(entry, "line"))}
        {tax !== undefined ? line(tax, "tax") : null}
        {line(total, "total")}
      </dl>
      {note !== undefined ? <p {...slotAttributes(siteOrderNoteStyle, {})}>{note}</p> : null}
    </section>
  );
}

/** One consent of {@link ConsentChecklist}. */
export interface ConsentItem {
  readonly key: string;
  readonly label: ReactNode;
  readonly checked: boolean;
  /** The document the consent names, opened beside it ("View"). */
  readonly view?: ReactNode;
}

/** Props for {@link ConsentChecklist}. */
export interface ConsentChecklistProps {
  /** Agreeing to every consent at once. */
  readonly all: { readonly label: ReactNode; readonly checked: boolean | "indeterminate" };
  readonly items: readonly ConsentItem[];
  /** The word before each consent ("Required"), for the eye only. */
  readonly badge: ReactNode;
  readonly onAllChange: (checked: boolean) => void;
  readonly onItemChange: (key: string, checked: boolean) => void;
}

/** The consents a payment needs, each required, with agreeing to all of them first. */
export function ConsentChecklist({ all, items, badge, onAllChange, onItemChange }: ConsentChecklistProps) {
  return (
    <div {...slotAttributes(siteConsentListStyle, {})}>
      <div {...slotAttributes(siteConsentAllStyle, {})}>
        <SiteCheckbox checked={all.checked} onCheckedChange={onAllChange} label={all.label} />
      </div>
      {items.map((item) => (
        <div key={item.key} {...slotAttributes(siteConsentItemStyle, {})}>
          <SiteCheckbox checked={item.checked} onCheckedChange={(on) => onItemChange(item.key, on)} label={item.label} required badge={badge} />
          {item.view !== undefined ? <span {...slotAttributes(siteConsentViewStyle, {})}>{item.view}</span> : null}
        </div>
      ))}
    </div>
  );
}

/** Props for {@link ConsentAgain}. */
export interface ConsentAgainProps {
  /** What changed since the consent was given (the amount, the currency), in the warn colour. */
  readonly note?: ReactNode;
  /** The consent itself, a required `SiteCheckbox`. */
  readonly children: ReactNode;
}

/** A consent asked again where the amount it named changed. */
export function ConsentAgain({ note, children }: ConsentAgainProps) {
  return (
    <div {...slotAttributes(siteConsentAgainStyle, {})}>
      {note !== undefined ? <b {...slotAttributes(siteConsentAgainNoteStyle, {})}>{note}</b> : null}
      {children}
    </div>
  );
}

/** Props for {@link ProviderFrame}. */
export interface ProviderFrameProps {
  /** Whose frame it is ("Paddle checkout"), also its accessible name. */
  readonly label: string;
  /** Who owns what is drawn in it. */
  readonly owner?: ReactNode;
  /** The provider's frame: an iframe, or what stands for it. */
  readonly children: ReactNode;
}

/** The payment side: the provider's frame raised on a dashed sunken ground with its name over it. */
export function ProviderFrame({ label, owner, children }: ProviderFrameProps) {
  return (
    <section {...slotAttributes(siteProviderFrameStyle, {})} aria-label={label}>
      <div {...slotAttributes(siteProviderLabelStyle, {})}>
        <i {...slotAttributes(siteProviderMarkStyle, {})} aria-hidden="true" />
        <span {...slotAttributes(siteProviderNameStyle, {})}>{label}</span>
        {owner !== undefined ? <span {...slotAttributes(siteProviderOwnerStyle, {})}>{owner}</span> : null}
      </div>
      <div {...slotAttributes(siteProviderBodyStyle, {})}>{children}</div>
    </section>
  );
}

/** Props for {@link ProviderWaiting}. */
export interface ProviderWaitingProps {
  /** A glyph over the sentence, which the product draws. */
  readonly mark?: ReactNode;
  /** What happens in this place, or why nothing can yet. */
  readonly children: ReactNode;
}

/** What our page says in the provider's frame before the provider draws there. */
export function ProviderWaiting({ mark, children }: ProviderWaitingProps) {
  return (
    <div {...slotAttributes(siteProviderWaitingStyle, {})}>
      {mark}
      <p {...slotAttributes(siteProviderWaitingTextStyle, {})}>{children}</p>
    </div>
  );
}

/** Props for {@link ProviderTarget}. */
export interface ProviderTargetProps {
  /** The class name the provider's script finds the element by and draws its frame into. */
  readonly targetClass: string;
}

/**
 * The element a provider's script draws its own frame into, found by a class name the provider is
 * told. It carries no look of its own: what is drawn in it is the provider's.
 */
export function ProviderTarget({ targetClass }: ProviderTargetProps) {
  return <div {...slotAttributes(siteProviderTargetStyle, {})} className={targetClass} />;
}

/** One way to pay of {@link MethodGrid}. */
export interface PaymentMethod {
  readonly key: string;
  readonly name: ReactNode;
  /** Its first letters on the ink tile. */
  readonly mark: ReactNode;
  readonly about?: ReactNode;
  readonly pressed?: boolean;
  /** It cannot be used for this order (a one-off method for a subscription). */
  readonly disabled?: boolean;
  /** It spans both columns. */
  readonly wide?: boolean;
  readonly onSelect?: () => void;
}

/** Props for {@link MethodGrid}. */
export interface MethodGridProps {
  readonly methods: readonly PaymentMethod[];
}

/** Ways to pay in two columns, each a toggle that says whether it is the chosen one. */
export function MethodGrid({ methods }: MethodGridProps) {
  return (
    <div {...slotAttributes(siteMethodGridStyle, {})}>
      {methods.map((method) => (
        <button
          key={method.key}
          {...slotAttributes(siteMethodStyle, { pressed: method.pressed === true, wide: method.wide === true })}
          type="button"
          aria-pressed={method.pressed === true}
          disabled={method.disabled === true}
          onClick={method.onSelect}
        >
          <span {...slotAttributes(siteMethodMarkStyle, {})} aria-hidden="true">
            {method.mark}
          </span>
          <span {...slotAttributes(siteMethodTextStyle, {})}>
            <b {...slotAttributes(siteMethodNameStyle, {})}>{method.name}</b>
            {method.about !== undefined ? <small {...slotAttributes(siteMethodAboutStyle, {})}>{method.about}</small> : null}
          </span>
        </button>
      ))}
    </div>
  );
}

/** One step of {@link ProgressChain}. */
export interface ChainStep {
  readonly key: string;
  readonly label: ReactNode;
}

/** Props for {@link ProgressChain}. */
export interface ProgressChainProps {
  readonly title: ReactNode;
  readonly steps: readonly ChainStep[];
  /** How many steps are done; the next one is running. */
  readonly done: number;
  /** A done step's check and a running step's spinner, which the product draws. */
  readonly doneMark?: ReactNode;
  readonly runningMark?: ReactNode;
  /** What is ready now, once every step is done. */
  readonly ready?: ReactNode;
  readonly actions?: readonly SiteActionSpec[];
  /** The line at the end. */
  readonly note?: ReactNode;
}

/** After payment: the chain of steps from paid to switched over, then what is ready and the way on. */
export function ProgressChain({ title, steps, done, doneMark, runningMark, ready, actions = [], note }: ProgressChainProps) {
  return (
    <section {...slotAttributes(siteProgressChainStyle, {})}>
      <h2 {...slotAttributes(siteCheckoutTitleStyle, {})}>{title}</h2>
      <ol {...slotAttributes(siteChainStepsStyle, {})}>
        {steps.map((step, index) => {
          const state = index < done ? "done" : index === done ? "running" : "waiting";
          return (
            <li key={step.key} {...slotAttributes(siteChainStepStyle, { state })}>
              <span {...slotAttributes(siteChainDiscStyle, { state })}>{state === "done" ? doneMark : state === "running" ? runningMark : null}</span>
              <span {...slotAttributes(siteChainLabelStyle, {})}>{step.label}</span>
            </li>
          );
        })}
      </ol>
      {ready !== undefined ? <p {...slotAttributes(siteChainReadyStyle, {})}>{ready}</p> : null}
      {actions.length > 0 ? (
        <div {...slotAttributes(siteCheckoutActionsStyle, { align: "start" })}>
          {actions.map((action) => (
            <SiteAction key={action.id} {...action} />
          ))}
        </div>
      ) : null}
      {note !== undefined ? <p {...slotAttributes(siteChainNoteStyle, {})}>{note}</p> : null}
    </section>
  );
}

/** Props for {@link DonePanel}. */
export interface DonePanelProps {
  /** The check in the round mark, a glyph the product draws. */
  readonly mark: ReactNode;
  readonly title: ReactNode;
  readonly body?: ReactNode;
  readonly actions?: readonly SiteActionSpec[];
  /** Where the receipt went, in small print. */
  readonly notice?: ReactNode;
}

/**
 * The page after a payment or a trial start: the round mark, the one h1, what is ready, the way back
 * and where the receipt went. It stands directly in a `SitePage` with `rhythm="done"`, which centres
 * the column's content.
 */
export function DonePanel({ mark, title, body, actions = [], notice }: DonePanelProps) {
  return (
    <>
      <span {...slotAttributes(siteDoneMarkStyle, {})} aria-hidden="true">
        {mark}
      </span>
      <h1 {...slotAttributes(siteDoneTitleStyle, {})}>{title}</h1>
      {body !== undefined ? <p {...slotAttributes(siteDoneTextStyle, { size: "body" })}>{body}</p> : null}
      {actions.length > 0 ? (
        <div {...slotAttributes(siteCheckoutActionsStyle, { align: "center" })}>
          {actions.map((action) => (
            <SiteAction key={action.id} {...action} size="lg" />
          ))}
        </div>
      ) : null}
      {notice !== undefined ? <p {...slotAttributes(siteDoneTextStyle, { size: "caption" })}>{notice}</p> : null}
    </>
  );
}
