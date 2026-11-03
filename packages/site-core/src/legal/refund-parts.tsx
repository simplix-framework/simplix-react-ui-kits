import type { MouseEvent, ReactNode } from "react";
import { slotAttributes } from "@simplix-react/ui/design";

import { SiteAction, type SiteActionSpec } from "../action/site-action";
import { SiteLive } from "../page/site-bits";
import { siteCaptionStyle } from "../page/site-page.style";
import {
  siteRangeFillStyle,
  siteRangeInputStyle,
  siteRangeStyle,
  siteRangeTrackStyle,
  siteRefundBarBackStyle,
  siteRefundBarStyle,
  siteRefundBarUsedStyle,
  siteRefundCalcAmountStyle,
  siteRefundCalcBasisStyle,
  siteRefundCalcFootStyle,
  siteRefundCalcFormulaStyle,
  siteRefundCalcHeadStyle,
  siteRefundCalcLabelStyle,
  siteRefundCalcOutputStyle,
  siteRefundCalcRowStyle,
  siteRefundCalcStyle,
  siteRefundCalcSumStyle,
  siteRefundCalcTitleStyle,
  siteRefundDetailStyle,
  siteRefundDotStyle,
  siteRefundHowStyle,
  siteRefundNoteStyle,
  siteRefundProductStyle,
  siteRefundRuleStyle,
  siteRefundVerdictStyle,
  siteStepPickBodyStyle,
  siteStepPickDiscStyle,
  siteStepPickerStyle,
  siteStepPickItemStyle,
  siteStepPickStyle,
  siteStepPickTextStyle,
  siteStepPickTitleStyle,
  siteWalkthroughFootStyle,
  siteWalkthroughHeadStyle,
  siteWalkthroughLineStyle,
  siteWalkthroughLinesStyle,
  siteWalkthroughMenuEmailStyle,
  siteWalkthroughMenuItemStyle,
  siteWalkthroughMenuStyle,
  siteWalkthroughNavItemStyle,
  siteWalkthroughNavStyle,
  siteWalkthroughNextStyle,
  siteWalkthroughStageStyle,
  siteWalkthroughStyle,
} from "./refund.style";

/** Props for {@link RefundProduct}. */
export interface RefundProductProps {
  readonly product: ReactNode;
  /** Its price and terms. */
  readonly detail: ReactNode;
}

/** A product as the refund table's first value: its name, then its price and terms. */
export function RefundProduct({ product, detail }: RefundProductProps) {
  return (
    <span {...slotAttributes(siteRefundProductStyle, {})}>
      {product}
      <small {...slotAttributes(siteRefundDetailStyle, {})}>{detail}</small>
    </span>
  );
}

/** How much of a payment comes back: all of it, part of it, or none. */
export type SiteRefundKind = "full" | "part" | "none";

/** Props for {@link RefundRule}. */
export interface RefundRuleProps {
  readonly kind: SiteRefundKind;
  readonly label: ReactNode;
  /** What else holds in that case; left out when nothing does. */
  readonly note?: ReactNode;
}

/** What comes back in one case: the verdict in its tone with a dot, then a note. */
export function RefundRule({ kind, label, note }: RefundRuleProps) {
  return (
    <span {...slotAttributes(siteRefundRuleStyle, {})}>
      <span {...slotAttributes(siteRefundVerdictStyle, { kind })}>
        <i {...slotAttributes(siteRefundDotStyle, { kind })} />
        {label}
      </span>
      {note !== undefined ? <small {...slotAttributes(siteRefundNoteStyle, {})}>{note}</small> : null}
    </span>
  );
}

/** Props for {@link SiteRange}. */
export interface SiteRangeProps {
  /** The range's name for a screen reader. */
  readonly label: string;
  /** How a screen reader reads a value ("3 months"). */
  readonly valueText?: (value: number) => string;
  readonly min: number;
  readonly max: number;
  readonly step?: number;
  readonly value: number;
  readonly onValueChange: (value: number) => void;
  readonly disabled?: boolean;
}

/** The share of the track a value fills, from 0 to 1. */
export function rangeShare(value: number, min: number, max: number): number {
  if (max <= min) return 0;
  return Math.min(1, Math.max(0, (value - min) / (max - min)));
}

/**
 * A value on a track: a sunken track filled in the accent up to the value, and the browser's range over
 * it, which draws the thumb, takes the arrow keys and shows the focus ring.
 */
export function SiteRange({ label, valueText, min, max, step = 1, value, onValueChange, disabled = false }: SiteRangeProps) {
  return (
    <span {...slotAttributes(siteRangeStyle, { disabled })}>
      <span {...slotAttributes(siteRangeTrackStyle, {})}>
        <i {...slotAttributes(siteRangeFillStyle, {})} style={{ width: `${String(rangeShare(value, min, max) * 100)}%` }} />
      </span>
      <input
        {...slotAttributes(siteRangeInputStyle, {})}
        type="range"
        aria-label={label}
        aria-valuetext={valueText?.(value)}
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={(event) => onValueChange(Number(event.currentTarget.value))}
      />
    </span>
  );
}

/** Props for {@link RefundCalculator}. */
export interface RefundCalculatorProps {
  /** The question the card answers; it also names the card. */
  readonly title: string;
  /** The product's switch between the plans. */
  readonly choice: ReactNode;
  /** The time used's words. */
  readonly usedLabel: ReactNode;
  readonly range: SiteRangeProps;
  /** The months chosen, in words. */
  readonly output: ReactNode;
  /** The share of the year used, from 0 to 1, which the bar splits at. */
  readonly usedShare: number;
  /** The bar's words for the share used and the share that comes back; the latter empty when none does. */
  readonly usedBar: ReactNode;
  readonly backBar: ReactNode;
  /** The sum the amount comes from, and what it counts. */
  readonly formula: ReactNode;
  readonly basis: ReactNode;
  readonly amount: ReactNode;
  /** The amount as a screen reader speaks it once the reader moved something; null says nothing. */
  readonly announce: string | null;
  /** What the amount means: no penalty, or why nothing comes back. */
  readonly note: ReactNode;
}

/** What cancelling a yearly plan now gives back: the plan, the months used, the year split, the sum and the amount. */
export function RefundCalculator({ title, choice, usedLabel, range, output, usedShare, usedBar, backBar, formula, basis, amount, announce, note }: RefundCalculatorProps) {
  return (
    <section {...slotAttributes(siteRefundCalcStyle, {})} aria-label={title}>
      <div {...slotAttributes(siteRefundCalcHeadStyle, {})}>
        <b {...slotAttributes(siteRefundCalcTitleStyle, {})}>{title}</b>
        {choice}
      </div>
      <div {...slotAttributes(siteRefundCalcRowStyle, {})}>
        <span {...slotAttributes(siteRefundCalcLabelStyle, {})}>{usedLabel}</span>
        <SiteRange {...range} />
        <output {...slotAttributes(siteRefundCalcOutputStyle, {})}>{output}</output>
      </div>
      <div {...slotAttributes(siteRefundBarStyle, {})} aria-hidden="true">
        <i {...slotAttributes(siteRefundBarUsedStyle, {})} style={{ flexBasis: `${String(Math.min(1, Math.max(0, usedShare)) * 100)}%` }}>
          {usedBar}
        </i>
        <i {...slotAttributes(siteRefundBarBackStyle, {})}>{backBar}</i>
      </div>
      <div {...slotAttributes(siteRefundCalcFootStyle, {})}>
        <span {...slotAttributes(siteRefundCalcSumStyle, {})}>
          <span {...slotAttributes(siteRefundCalcFormulaStyle, {})}>{formula}</span>
          <span {...slotAttributes(siteRefundCalcBasisStyle, {})}>{basis}</span>
        </span>
        <span {...slotAttributes(siteRefundCalcAmountStyle, {})}>{amount}</span>
        <SiteLive>{announce}</SiteLive>
      </div>
      <p {...slotAttributes(siteCaptionStyle, {})}>{note}</p>
    </section>
  );
}

/** One step of a walkthrough. */
export interface SiteStepPick {
  readonly key: string;
  readonly title: ReactNode;
  readonly text: ReactNode;
  /** The step shown now. */
  readonly current?: boolean;
  /** A step already passed, ticked. */
  readonly done?: boolean;
  /** A step that cannot be shown yet; it is described by the picker's reason. */
  readonly disabled?: boolean;
  readonly onSelect: (event: MouseEvent<HTMLElement>) => void;
}

/** Props for {@link RefundHow}. */
export interface RefundHowProps {
  readonly steps: readonly SiteStepPick[];
  /** The tick a passed step shows, a glyph the product draws. */
  readonly doneMark?: ReactNode;
  /** What a screen reader says when the step changes. */
  readonly status: ReactNode;
  /** Why a disabled step cannot be shown yet: its id is what the disabled steps are described by. */
  readonly reason?: { readonly id: string; readonly text: ReactNode };
  /** The picture of the step shown, a {@link Walkthrough}. */
  readonly children: ReactNode;
}

/** The steps to ask for something, each a button, beside a small picture of the site that shows the step chosen. */
export function RefundHow({ steps, doneMark, status, reason, children }: RefundHowProps) {
  return (
    <div {...slotAttributes(siteRefundHowStyle, {})}>
      <ol {...slotAttributes(siteStepPickerStyle, {})}>
        {steps.map((step, index) => (
          <li key={step.key} {...slotAttributes(siteStepPickItemStyle, {})}>
            <button
              {...slotAttributes(siteStepPickStyle, { current: step.current === true })}
              type="button"
              aria-current={step.current === true ? "step" : undefined}
              aria-describedby={step.disabled === true ? reason?.id : undefined}
              disabled={step.disabled === true}
              onClick={step.onSelect}
            >
              <span {...slotAttributes(siteStepPickDiscStyle, { done: step.done === true })}>{step.done === true ? doneMark : index + 1}</span>
              <span {...slotAttributes(siteStepPickBodyStyle, {})}>
                <b {...slotAttributes(siteStepPickTitleStyle, {})}>{step.title}</b>
                <span {...slotAttributes(siteStepPickTextStyle, {})}>{step.text}</span>
              </span>
            </button>
          </li>
        ))}
        {reason !== undefined ? (
          <li {...slotAttributes(siteStepPickItemStyle, {})}>
            <p {...slotAttributes(siteCaptionStyle, {})} id={reason.id}>
              {reason.text}
            </p>
          </li>
        ) : null}
      </ol>
      <SiteLive>{status}</SiteLive>
      {children}
    </div>
  );
}

/** Props for {@link Walkthrough}. */
export interface WalkthroughProps {
  /** Where the picture is: the site's address, a page of the account. */
  readonly head: ReactNode;
  /** The next step's words and the button that shows it. */
  readonly foot?: { readonly text: ReactNode; readonly action: SiteActionSpec };
  /** The picture, a {@link WalkthroughMenu} or {@link WalkthroughPages}. */
  readonly children: ReactNode;
}

/** A small floating picture of the site at one step: its head, what it shows and the way to the next step. */
export function Walkthrough({ head, foot, children }: WalkthroughProps) {
  return (
    <div {...slotAttributes(siteWalkthroughStyle, {})}>
      <div {...slotAttributes(siteWalkthroughHeadStyle, {})}>{head}</div>
      {children}
      {foot !== undefined ? (
        <div {...slotAttributes(siteWalkthroughFootStyle, {})}>
          <span {...slotAttributes(siteWalkthroughNextStyle, {})}>{foot.text}</span>
          <SiteAction {...foot.action} tone={foot.action.tone ?? "primary"} size="sm" />
        </div>
      ) : null}
    </div>
  );
}

/** One entry of a pictured menu or page list; the one to press is marked. */
export interface SiteWalkthroughEntry {
  readonly key: string;
  readonly label: ReactNode;
  readonly current?: boolean;
}

/** Props for {@link WalkthroughMenu}. */
export interface WalkthroughMenuProps {
  /** The account's address at the top of the menu; left out for a reader who is not signed in. */
  readonly email?: ReactNode;
  readonly items: readonly SiteWalkthroughEntry[];
}

/** The account menu as it opens from the bar, at the picture's end, the entry to press marked. */
export function WalkthroughMenu({ email, items }: WalkthroughMenuProps) {
  return (
    <div {...slotAttributes(siteWalkthroughStageStyle, { align: "end" })}>
      <div {...slotAttributes(siteWalkthroughMenuStyle, {})}>
        {email !== undefined ? <span {...slotAttributes(siteWalkthroughMenuEmailStyle, {})}>{email}</span> : null}
        {items.map((item) => (
          <span key={item.key} {...slotAttributes(siteWalkthroughMenuItemStyle, { current: item.current === true })}>
            {item.label}
          </span>
        ))}
      </div>
    </div>
  );
}

/** Props for {@link WalkthroughPages}. */
export interface WalkthroughPagesProps {
  readonly items: readonly SiteWalkthroughEntry[];
}

/** The account's pages down the side, the one to open marked, beside lines that stand for its content. */
export function WalkthroughPages({ items }: WalkthroughPagesProps) {
  return (
    <div {...slotAttributes(siteWalkthroughStageStyle, { align: "start" })}>
      <div {...slotAttributes(siteWalkthroughNavStyle, {})}>
        {items.map((item) => (
          <span key={item.key} {...slotAttributes(siteWalkthroughNavItemStyle, { current: item.current === true })}>
            {item.label}
          </span>
        ))}
      </div>
      <div {...slotAttributes(siteWalkthroughLinesStyle, {})} aria-hidden="true">
        <i {...slotAttributes(siteWalkthroughLineStyle, { size: "title" })} />
        <i {...slotAttributes(siteWalkthroughLineStyle, { size: "long" })} />
        <i {...slotAttributes(siteWalkthroughLineStyle, { size: "short" })} />
      </div>
    </div>
  );
}
