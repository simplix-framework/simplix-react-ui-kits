import { useState, type KeyboardEvent, type MouseEvent, type ReactNode } from "react";
import { slotAttributes } from "@simplix-react/ui/design";

import { SiteAction, type SiteActionSpec } from "../action/site-action";
import {
  siteLinkMarkStyle,
  siteLinkTextStyle,
} from "./help.style";
import { siteSearchStyle, siteSuggestionsStyle, siteSearchHeroInnerStyle, siteSearchOptionStyle, siteSearchFoundStyle, siteSearchKeysStyle, siteSearchOptionTitleStyle, siteSearchHeadStyle, siteSearchEmptyStyle, siteSearchHeroTitleStyle, siteStatusLineStyle, siteSearchHeroLedeStyle, siteSuggestionsLabelStyle, siteSearchInputStyle, siteStatusDotStyle, siteSearchResultsStyle, siteSearchHeroStyle, siteSearchOptionMetaStyle } from "./search-hero.style";

/** Props for {@link StatusLine}. */
export interface StatusLineProps {
  /** How the service runs: `good` when everything runs, `warn` or `bad` otherwise. */
  readonly tone?: "good" | "warn" | "bad";
  readonly children: ReactNode;
}

/** How the service is running, in one line in the state's colour with its dot. */
export function StatusLine({ tone, children }: StatusLineProps) {
  return (
    <span {...slotAttributes(siteStatusLineStyle, { tone })}>
      <i {...slotAttributes(siteStatusDotStyle, {})} aria-hidden="true" />
      {children}
    </span>
  );
}

/** Props for {@link SearchHero}. */
export interface SearchHeroProps {
  /** The line above the title, such as a {@link StatusLine}. */
  readonly status?: ReactNode;
  readonly title: ReactNode;
  readonly lede?: ReactNode;
  /** What the suggestions are ("Try searching"). */
  readonly suggestionsLabel?: ReactNode;
  /** Searches to try, each filling the search when pressed. */
  readonly suggestions?: readonly SiteActionSpec[];
  /** The search, a {@link SiteSearch}. */
  readonly search: ReactNode;
}

/** The help centre's head: a band with the status line, the one h1, the lede, searches to try and the search. */
export function SearchHero({ status, title, lede, suggestionsLabel, suggestions = [], search }: SearchHeroProps) {
  return (
    <section {...slotAttributes(siteSearchHeroStyle, {})}>
      <div {...slotAttributes(siteSearchHeroInnerStyle, {})}>
        {status}
        <h1 {...slotAttributes(siteSearchHeroTitleStyle, {})}>{title}</h1>
        {lede !== undefined ? <p {...slotAttributes(siteSearchHeroLedeStyle, {})}>{lede}</p> : null}
        {suggestions.length > 0 ? (
          <div {...slotAttributes(siteSuggestionsStyle, {})}>
            {suggestionsLabel !== undefined ? <span {...slotAttributes(siteSuggestionsLabelStyle, {})}>{suggestionsLabel}</span> : null}
            {suggestions.map((suggestion) => (
              <SiteAction key={suggestion.id} {...suggestion} size="sm" />
            ))}
          </div>
        ) : null}
        {search}
      </div>
    </section>
  );
}

/** One match of a {@link SiteSearch}. */
export interface SiteSearchMatch {
  readonly key: string;
  readonly title: ReactNode;
  /** Where it is: its category and what it answers. */
  readonly meta?: ReactNode;
}

/** Props for {@link SiteSearch}. */
export interface SiteSearchProps {
  /** The field's accessible name, also the results list's. */
  readonly label: string;
  readonly placeholder?: string;
  readonly value: string;
  readonly onValueChange: (value: string) => void;
  /** What matches what is typed; the list shows only while something is typed. */
  readonly matches: readonly SiteSearchMatch[];
  /** Opens a match, from a press or from Enter on the active one. */
  readonly onPick: (key: string) => void;
  /** How many matched ("6 results"). */
  readonly foundLabel?: ReactNode;
  /** How to pick with the keyboard; a narrow page leaves it out. */
  readonly keysLabel?: ReactNode;
  /** What the list says when nothing matches. */
  readonly emptyLabel?: ReactNode;
  /** The id the field points its list at. */
  readonly listId: string;
  /** The chevron at the end of each match, a glyph the product draws. */
  readonly mark?: ReactNode;
  /** The match active at first, by its place. */
  readonly initialActive?: number;
}

/** The match the arrow keys move to from `active`, held to the list's ends; `null` for any other key. */
export function searchKeyTarget(active: number, count: number, key: string): number | null {
  if (count === 0) return null;
  if (key === "ArrowDown") return Math.min(count - 1, active + 1);
  if (key === "ArrowUp") return Math.max(0, active - 1);
  return null;
}

/**
 * A search field whose matches open under it as a list: the arrows move the active match, Enter
 * opens it, and a press opens any. The product finds the matches; the part draws and walks them.
 */
export function SiteSearch({ label, placeholder, value, onValueChange, matches, onPick, foundLabel, keysLabel, emptyLabel, listId, mark, initialActive = 0 }: SiteSearchProps) {
  const [active, setActive] = useState(initialActive);
  const open = value.trim() !== "";
  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    const target = searchKeyTarget(active, matches.length, event.key);
    if (target !== null) {
      event.preventDefault();
      setActive(target);
      return;
    }
    const match = matches[active];
    if (event.key === "Enter" && match !== undefined) onPick(match.key);
  };
  return (
    <div {...slotAttributes(siteSearchStyle, {})}>
      <input
        {...slotAttributes(siteSearchInputStyle, {})}
        type="search"
        role="combobox"
        aria-label={label}
        aria-expanded={open && matches.length > 0}
        aria-controls={listId}
        aria-autocomplete="list"
        autoComplete="off"
        placeholder={placeholder}
        value={value}
        onChange={(event) => {
          onValueChange(event.target.value);
          setActive(0);
        }}
        onKeyDown={onKeyDown}
      />
      {open ? (
        <div {...slotAttributes(siteSearchResultsStyle, {})} id={listId} role="listbox" aria-label={label}>
          {matches.length === 0 ? (
            <div {...slotAttributes(siteSearchEmptyStyle, {})}>{emptyLabel}</div>
          ) : (
            <>
              <div {...slotAttributes(siteSearchHeadStyle, {})}>
                <span {...slotAttributes(siteSearchFoundStyle, {})}>{foundLabel}</span>
                {keysLabel !== undefined ? <span {...slotAttributes(siteSearchKeysStyle, {})}>{keysLabel}</span> : null}
              </div>
              {matches.map((match, index) => (
                <button
                  key={match.key}
                  {...slotAttributes(siteSearchOptionStyle, { active: index === active })}
                  type="button"
                  role="option"
                  aria-selected={index === active}
                  onClick={(event: MouseEvent<HTMLButtonElement>) => {
                    event.preventDefault();
                    onPick(match.key);
                  }}
                >
                  <span {...slotAttributes(siteLinkTextStyle, {})}>
                    <b {...slotAttributes(siteSearchOptionTitleStyle, {})}>{match.title}</b>
                    {match.meta !== undefined ? <span {...slotAttributes(siteSearchOptionMetaStyle, {})}>{match.meta}</span> : null}
                  </span>
                  {mark !== undefined ? (
                    <span {...slotAttributes(siteLinkMarkStyle, {})} aria-hidden="true">
                      {mark}
                    </span>
                  ) : null}
                </button>
              ))}
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}
