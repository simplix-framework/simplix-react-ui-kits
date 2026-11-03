import { Fragment, type MouseEvent, type ReactNode, useId } from "react";
import { slotAttributes } from "@simplix-react/ui/design";

import { SiteAction, type SiteActionSpec, type SiteReason, useRefusal } from "../action/site-action";
import { siteDocActionStyle } from "../help/help.style";
import { siteCaptionStyle } from "../page/site-page.style";
import {
  siteBannerActionsStyle,
  siteBannerBodyStyle,
  siteBannerMarkStyle,
  siteBannerStyle,
  siteBannerTextStyle,
  siteBannerTitleStyle,
  siteChangeItemStyle,
  siteChangeItemsStyle,
  siteChangeLegendStyle,
  siteChangeLinkStyle,
  siteChangeListHeadStyle,
  siteChangeListStyle,
  siteChangeListTitleStyle,
  siteChangeNoStyle,
  siteChangeWhatStyle,
  siteClauseListStyle,
  siteClauseMarkStyle,
  siteClauseStyle,
  siteClauseTextStyle,
  siteDiffAddedStyle,
  siteDiffRemovedStyle,
  siteFieldGapStyle,
  siteInfoCardStyle,
  siteInfoCardTitleStyle,
  siteInfoGridStyle,
  siteKeyStyle,
  siteKeyValueStyle,
  siteKeyValuesStyle,
  siteLegalArticleHeadingStyle,
  siteLegalArticleNoStyle,
  siteLegalArticleStyle,
  siteLegalArticleWasStyle,
  sitePlainSummaryLabelStyle,
  sitePlainSummaryStyle,
  sitePlainSummaryTextStyle,
  siteToggleFieldStyle,
  siteValueStyle,
} from "./legal.style";

/** Which text a legal clause is drawn as: this version, the previous one, or both with the changes marked. */
export type SiteDiffMode = "current" | "previous" | "diff";

/** The fields a draft text still has to fill, by the key written in it (`{company}`). */
export type SitePlaceholders = Readonly<Record<string, string>>;

const CHANGE = /(\{\+[\s\S]*?\+\}|\{-[\s\S]*?-\})/g;
const FIELD = /(\{[a-zA-Z0-9]+\})/g;

/** A text with its unfilled fields (`{key}`) drawn as dashed fields, so a draft is not read as final. */
export function FilledText({ text, placeholders = {} }: { readonly text: string; readonly placeholders?: SitePlaceholders }) {
  return (
    <>
      {text.split(FIELD).map((part, index) => {
        const key = /^\{([a-zA-Z0-9]+)\}$/.exec(part)?.[1];
        const value = key === undefined ? undefined : placeholders[key];
        // Fragments of one sentence; their place is their identity.
        if (value === undefined) return <Fragment key={`t-${String(index)}`}>{part}</Fragment>;
        return (
          <span key={`f-${String(index)}`} {...slotAttributes(siteFieldGapStyle, {})}>
            {value}
          </span>
        );
      })}
    </>
  );
}

/** Props for {@link DiffText}. */
export interface DiffTextProps {
  /** A clause written with change marks: `{+added+}` and `{-removed-}`. */
  readonly text: string;
  readonly mode: SiteDiffMode;
  readonly placeholders?: SitePlaceholders;
}

/**
 * A clause written with change marks. The current version drops the removed text, the previous one
 * drops the added text, and the comparison shows both, the additions marked good and the removals
 * struck through.
 */
export function DiffText({ text, mode, placeholders }: DiffTextProps) {
  return (
    <>
      {text.split(CHANGE).map((part, index) => {
        const key = `d-${String(index)}`;
        if (part.startsWith("{+") && part.endsWith("+}")) {
          if (mode === "previous") return null;
          const body = <FilledText text={part.slice(2, -2)} placeholders={placeholders} />;
          return mode === "diff" ? (
            <ins key={key} {...slotAttributes(siteDiffAddedStyle, {})}>
              {body}
            </ins>
          ) : (
            <Fragment key={key}>{body}</Fragment>
          );
        }
        if (part.startsWith("{-") && part.endsWith("-}")) {
          if (mode === "current") return null;
          const body = <FilledText text={part.slice(2, -2)} placeholders={placeholders} />;
          return mode === "diff" ? (
            <del key={key} {...slotAttributes(siteDiffRemovedStyle, {})}>
              {body}
            </del>
          ) : (
            <Fragment key={key}>{body}</Fragment>
          );
        }
        return <FilledText key={key} text={part} placeholders={placeholders} />;
      })}
    </>
  );
}

/** Whether a clause still says anything in `mode` once its marks are applied. */
export function diffVisible(text: string, mode: SiteDiffMode): boolean {
  const kept = mode === "current" ? text.replace(/\{-[\s\S]*?-\}/g, "") : mode === "previous" ? text.replace(/\{\+[\s\S]*?\+\}/g, "") : text;
  return kept.replace(/\{[+-]|[+-]\}/g, "").trim().length > 0;
}

/** Whether a text carries a change mark. */
export const diffChanged = (text: string) => /\{[+-]/.test(text);

/** Props for {@link NoticeBanner}. */
export interface NoticeBannerProps {
  readonly tone?: "info" | "good" | "warn" | "bad";
  /** The glyph that says the tone, which the product draws. */
  readonly mark?: ReactNode;
  /** The line a screen reader speaks: as a status for info and good, as an alert for warn and bad. */
  readonly title: ReactNode;
  readonly children?: ReactNode;
  readonly actions?: readonly SiteActionSpec[];
}

/** A notice across the column on its tone's soft ground: the glyph, the title, the words and its actions. */
export function NoticeBanner({ tone = "info", mark, title, children, actions = [] }: NoticeBannerProps) {
  const urgent = tone === "warn" || tone === "bad";
  return (
    <div {...slotAttributes(siteBannerStyle, { tone })}>
      {mark !== undefined ? (
        <span {...slotAttributes(siteBannerMarkStyle, { tone })} aria-hidden="true">
          {mark}
        </span>
      ) : null}
      <div {...slotAttributes(siteBannerBodyStyle, {})}>
        <p {...slotAttributes(siteBannerTitleStyle, {})} role={urgent ? "alert" : "status"}>
          {title}
        </p>
        {children !== undefined ? <div {...slotAttributes(siteBannerTextStyle, {})}>{children}</div> : null}
        {actions.length > 0 ? (
          <div {...slotAttributes(siteBannerActionsStyle, {})}>
            {actions.map((action) => (
              <SiteAction key={action.id} {...action} size="sm" />
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

/** The comparison switch of {@link VersionPicker}: its words, the product's switch, and whether it can be used now. */
export type VersionCompare = {
  readonly label: ReactNode;
  /**
   * The product's switch, handed the id of the line that describes it: the reason it cannot be used
   * while it is disabled, read by a screen reader with the switch (`aria-describedby`).
   */
  readonly control: (describedBy: string | undefined) => ReactNode;
} & ({ readonly disabled?: false } | { readonly disabled: true; readonly reason: SiteReason });

/** Props for {@link VersionPicker}. */
export interface VersionPickerProps {
  /** The product's select over the versions. */
  readonly select: ReactNode;
  /** The comparison with the previous version; a disabled one carries the reason it cannot be used. */
  readonly compare?: VersionCompare;
}

/**
 * The version a legal text is read in, and the switch that marks its changes against the previous
 * one; the switch is dimmed while the previous version is shown, where there is nothing to compare,
 * and says why to a screen reader and, on hover, to the pointer.
 */
export function VersionPicker({ select, compare }: VersionPickerProps) {
  return (
    <>
      {select}
      {compare !== undefined ? <CompareToggle compare={compare} /> : null}
    </>
  );
}

function CompareToggle({ compare }: { readonly compare: VersionCompare }) {
  const disabled = compare.disabled === true;
  const reason = compare.disabled === true ? compare.reason : undefined;
  const refusal = useRefusal(disabled, reason, undefined);
  return (
    <label {...slotAttributes(siteToggleFieldStyle, { disabled })} title={typeof reason === "string" ? reason : undefined}>
      {compare.control(refusal.describedBy)}
      {compare.label}
      {refusal.hidden}
    </label>
  );
}

/** Props for {@link PrintButton}. */
export interface PrintButtonProps {
  readonly label: ReactNode;
  /** Opens the browser's print, which saves the page as a PDF; the product says what is happening. */
  readonly onPrint: (event: MouseEvent<HTMLElement>) => void;
  readonly icon?: ReactNode;
}

/** "Save as PDF": a small action that prints the page. */
export function PrintButton({ label, onPrint, icon }: PrintButtonProps) {
  return <SiteAction id="print" label={label} icon={icon} size="sm" onSelect={onPrint} />;
}

/** Props for {@link ChangeList}. */
export interface ChangeListProps {
  /** How many articles changed, in words. */
  readonly title: ReactNode;
  /** The legend's words for an addition and a removal. */
  readonly added: ReactNode;
  readonly removed: ReactNode;
  readonly changes: readonly { readonly key: string; readonly no: ReactNode; readonly what: ReactNode; readonly onSelect?: (event: MouseEvent<HTMLElement>) => void }[];
}

/** What changed against the previous version: the count with the legend of the marks, then each change, which jumps to its article. */
export function ChangeList({ title, added, removed, changes }: ChangeListProps) {
  return (
    <section {...slotAttributes(siteChangeListStyle, {})}>
      <div {...slotAttributes(siteChangeListHeadStyle, {})}>
        <b {...slotAttributes(siteChangeListTitleStyle, {})}>{title}</b>
        <ins {...slotAttributes(siteChangeLegendStyle, { kind: "added" })}>{added}</ins>
        <del {...slotAttributes(siteChangeLegendStyle, { kind: "removed" })}>{removed}</del>
      </div>
      <ol {...slotAttributes(siteChangeItemsStyle, {})}>
        {changes.map((change) => (
          <li key={change.key} {...slotAttributes(siteChangeItemStyle, {})}>
            <button {...slotAttributes(siteChangeLinkStyle, {})} type="button" onClick={change.onSelect}>
              <span {...slotAttributes(siteChangeNoStyle, {})}>{change.no}</span>
              <span {...slotAttributes(siteChangeWhatStyle, {})}>{change.what}</span>
            </button>
          </li>
        ))}
      </ol>
    </section>
  );
}

/** Props for {@link LegalArticle}. */
export interface LegalArticleProps {
  readonly id: string;
  /** The article's number ("Article 3"). */
  readonly no: ReactNode;
  readonly title: ReactNode;
  /** Its number in the previous version, where it moved. */
  readonly was?: ReactNode;
  /** A tag after the title (new, changed), such as a `SiteChip`. */
  readonly tag?: ReactNode;
  /** An article new in this version, on the good tone's soft ground. */
  readonly added?: boolean;
  /** `addendum` for the closing provisions, which sit closer together. */
  readonly kind?: "article" | "addendum";
  /** Its summary in plain words, a {@link PlainSummary}. */
  readonly summary?: ReactNode;
  /** Its clauses, a {@link ClauseList}. */
  readonly children?: ReactNode;
}

/** An article of a legal text: its numbered heading, its summary in plain words and its clauses. */
export function LegalArticle({ id, no, title, was, tag, added = false, kind, summary, children }: LegalArticleProps) {
  return (
    <section {...slotAttributes(siteLegalArticleStyle, { kind, added })} id={id}>
      <h2 {...slotAttributes(siteLegalArticleHeadingStyle, {})}>
        <span {...slotAttributes(siteLegalArticleNoStyle, {})}>{no}</span>
        {title}
        {was !== undefined ? <small {...slotAttributes(siteLegalArticleWasStyle, {})}>{was}</small> : null}
        {tag}
      </h2>
      {summary}
      {children}
    </section>
  );
}

/** Props for {@link PlainSummary}. */
export interface PlainSummaryProps {
  /** What the summary is ("In short"). */
  readonly label: ReactNode;
  /** The glyph before the label, which the product draws. */
  readonly mark?: ReactNode;
  readonly children: ReactNode;
}

/** An article's summary in plain words, on the accent's soft ground. */
export function PlainSummary({ label, mark, children }: PlainSummaryProps) {
  return (
    <div {...slotAttributes(sitePlainSummaryStyle, {})}>
      <span {...slotAttributes(sitePlainSummaryLabelStyle, {})}>
        {mark}
        {label}
      </span>
      <p {...slotAttributes(sitePlainSummaryTextStyle, {})}>{children}</p>
    </div>
  );
}

/** Marks for clauses, circled numbers. */
export const CLAUSE_MARKS = ["①", "②", "③", "④", "⑤", "⑥", "⑦", "⑧", "⑨", "⑩"] as const;

/** Props for {@link ClauseList}. */
export interface ClauseListProps {
  readonly items: readonly { readonly key: string; readonly content: ReactNode }[];
}

/** An article's clauses, each marked with its circled number. */
export function ClauseList({ items }: ClauseListProps) {
  return (
    <ol {...slotAttributes(siteClauseListStyle, {})}>
      {items.map((item, index) => (
        <li key={item.key} {...slotAttributes(siteClauseStyle, {})}>
          <span {...slotAttributes(siteClauseMarkStyle, {})}>{CLAUSE_MARKS[index] ?? String(index + 1)}</span>
          <span {...slotAttributes(siteClauseTextStyle, {})}>{item.content}</span>
        </li>
      ))}
    </ol>
  );
}

/** Props for {@link KeyValues}. */
export interface KeyValuesProps {
  readonly rows: readonly { readonly key: string; readonly label: ReactNode; readonly value: ReactNode }[];
}

/** Labels and their values, the label in one column and the value in two; stacked below the narrow tier. */
export function KeyValues({ rows }: KeyValuesProps) {
  return (
    <dl {...slotAttributes(siteKeyValuesStyle, {})}>
      {rows.map((row) => (
        <div key={row.key} {...slotAttributes(siteKeyValueStyle, {})}>
          <dt {...slotAttributes(siteKeyStyle, {})}>{row.label}</dt>
          <dd {...slotAttributes(siteValueStyle, {})}>{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}

/** Props for {@link InfoCard}. */
export interface InfoCardProps {
  /** The card's heading; a card that only holds a contact's values (a privacy officer) has none. */
  readonly title?: ReactNode;
  /** The card's facts, a {@link KeyValues}. */
  readonly children: ReactNode;
  readonly action?: SiteActionSpec;
  /** Why the action cannot run yet, a line under it that a disabled action is described by. */
  readonly reason?: ReactNode;
}

/** A card of facts (business details, support): its heading, its labelled values and an action. */
export function InfoCard({ title, children, action, reason }: InfoCardProps) {
  const reasonId = useId();
  const hasReason = reason !== undefined && action?.disabled === true;
  return (
    <section {...slotAttributes(siteInfoCardStyle, {})}>
      {title !== undefined ? <h2 {...slotAttributes(siteInfoCardTitleStyle, {})}>{title}</h2> : null}
      {children}
      {action !== undefined ? (
        <span {...slotAttributes(siteDocActionStyle, {})}>
          <SiteAction {...action} describedBy={action.describedBy ?? (hasReason ? reasonId : undefined)} size="sm" />
        </span>
      ) : null}
      {hasReason ? (
        <p {...slotAttributes(siteCaptionStyle, {})} id={reasonId}>
          {reason}
        </p>
      ) : null}
    </section>
  );
}

/** Props for {@link InfoGrid}. */
export interface InfoGridProps {
  readonly id?: string;
  readonly children: ReactNode;
}

/** Cards of facts side by side, one below the narrow tier. */
export function InfoGrid({ id, children }: InfoGridProps) {
  return (
    <div {...slotAttributes(siteInfoGridStyle, {})} id={id}>
      {children}
    </div>
  );
}
