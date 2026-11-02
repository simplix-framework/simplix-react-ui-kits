import type { MouseEvent, ReactNode } from "react";
import { slotAttributes } from "@simplix-react/ui/design";

import { SiteAction, type SiteActionSpec } from "../action/site-action";
import { SiteProgress } from "../install/video-card";
import { siteCardTextStyle, siteStepDiscStyle } from "../install/install.style";
import { SiteLink } from "../link/site-link";
import { SiteLive } from "../page/site-bits";
import {
  siteArticleFactsStyle,
  siteArticleFactStyle,
  siteArticleIntroStyle,
  siteArticleLeadStyle,
  siteArticleStepBodyStyle,
  siteArticleStepStyle,
  siteArticleWhereStyle,
  siteDocActionStyle,
  siteDocHeadingStyle,
  siteDocProgressStyle,
  siteDocSectionStyle,
  siteDocTextStyle,
  siteFeedbackAskStyle,
  siteFeedbackChoicesStyle,
  siteFeedbackMoreStyle,
  siteFeedbackRowStyle,
  siteFeedbackStyle,
  siteFeedbackThanksStyle,
  siteFigureCaptionStyle,
  siteFigureStyle,
  siteQuickAskStyle,
  siteQuickBoxStyle,
  siteQuickItemStyle,
  siteQuickListStyle,
  siteQuickTitleStyle,
  siteRelatedGridStyle,
  siteRelatedLinkStyle,
  siteRelatedStyle,
  siteArticleListTitleStyle,
  siteArticleNameStyle,
  siteArticleMetaStyle,
  siteTipMarkStyle,
  siteTipStyle,
} from "./help.style";

/** Props for {@link ArticleIntro}. */
export interface ArticleIntroProps {
  /** The article's category, reading time and date. */
  readonly facts?: readonly { readonly key: string; readonly label: ReactNode }[];
  /** Where the article applies, as chips. */
  readonly where?: ReactNode;
  readonly lead?: ReactNode;
}

/** An article's meta, where it applies and its lead, under its title. */
export function ArticleIntro({ facts = [], where, lead }: ArticleIntroProps) {
  return (
    <div {...slotAttributes(siteArticleIntroStyle, {})}>
      {facts.length > 0 ? (
        <div {...slotAttributes(siteArticleFactsStyle, {})}>
          {facts.map((fact) => (
            <span key={fact.key} {...slotAttributes(siteArticleFactStyle, {})}>
              {fact.label}
            </span>
          ))}
        </div>
      ) : null}
      {where !== undefined ? <div {...slotAttributes(siteArticleWhereStyle, {})}>{where}</div> : null}
      {lead !== undefined ? <p {...slotAttributes(siteArticleLeadStyle, {})}>{lead}</p> : null}
    </div>
  );
}

/** Props for {@link QuickBox}. */
export interface QuickBoxProps {
  /** The section's id, which the contents jump to. */
  readonly id: string;
  readonly title: ReactNode;
  readonly items: readonly { readonly key: string; readonly ask: ReactNode; readonly answer: ReactNode }[];
  /** What follows the checks, such as the product's table of costs. */
  readonly children?: ReactNode;
}

/** The checks to do first, each a question and its answer, on the accent's soft ground. */
export function QuickBox({ id, title, items, children }: QuickBoxProps) {
  return (
    <section {...slotAttributes(siteQuickBoxStyle, {})} id={id}>
      <b {...slotAttributes(siteQuickTitleStyle, {})}>{title}</b>
      <ul {...slotAttributes(siteQuickListStyle, {})}>
        {items.map((item) => (
          <li key={item.key} {...slotAttributes(siteQuickItemStyle, {})}>
            <strong {...slotAttributes(siteQuickAskStyle, {})}>{item.ask}</strong> {item.answer}
          </li>
        ))}
      </ul>
      {children}
    </section>
  );
}

/** The toggle a step carries for having tried it. */
export interface SiteTriedToggle {
  /** The words on the toggle, which follow `done` ("Mark as tried", "Tried"). */
  readonly label: ReactNode;
  /** The accessible name, naming the step ("Mark step 2 as tried"). */
  readonly name: string;
  readonly onToggle?: (event: MouseEvent<HTMLElement>) => void;
  readonly icon?: ReactNode;
}

/** Props for {@link ArticleStep}. */
export interface ArticleStepProps {
  /** The step's id, which the contents jump to. */
  readonly id: string;
  /** The step's place, from 0; its disc shows the number from 1. */
  readonly index: number;
  /** The reader marked it as tried: the disc turns good and shows the tick. */
  readonly done?: boolean;
  /** The tick on a done step's disc, a glyph the product draws. */
  readonly doneMark?: ReactNode;
  readonly title: ReactNode;
  readonly body: ReactNode;
  /** What the step shows: a figure, a table, a tip, a note. */
  readonly children?: ReactNode;
  readonly tried?: SiteTriedToggle;
}

/** A step of an article: its disc (numbered, or ticked once tried), title, words, what it shows and the toggle for having tried it. */
export function ArticleStep({ id, index, done = false, doneMark, title, body, children, tried }: ArticleStepProps) {
  return (
    <section {...slotAttributes(siteArticleStepStyle, {})} id={id}>
      <span {...slotAttributes(siteStepDiscStyle, { done })} aria-hidden="true">
        {done ? doneMark : index + 1}
      </span>
      <div {...slotAttributes(siteArticleStepBodyStyle, {})}>
        <h2 {...slotAttributes(siteDocHeadingStyle, {})}>{title}</h2>
        <p {...slotAttributes(siteDocTextStyle, {})}>{body}</p>
        {children}
        {tried !== undefined ? (
          <span {...slotAttributes(siteDocActionStyle, {})}>
            <SiteAction id="tried" label={tried.label} name={tried.name} pressed={done} tone={done ? "secondary" : "quiet"} size="sm" icon={tried.icon} onSelect={tried.onToggle} />
          </span>
        ) : null}
      </div>
    </section>
  );
}

/** Props for {@link ArticleFigure}. */
export interface ArticleFigureProps {
  /** The product's picture of the screen. */
  readonly children: ReactNode;
  readonly caption?: ReactNode;
}

/** A picture of what the screen shows, on the sunken ground, with its caption. */
export function ArticleFigure({ children, caption }: ArticleFigureProps) {
  return (
    <figure {...slotAttributes(siteFigureStyle, {})}>
      {children}
      {caption !== undefined ? <figcaption {...slotAttributes(siteFigureCaptionStyle, {})}>{caption}</figcaption> : null}
    </figure>
  );
}

/** Props for {@link TipNote}. */
export interface TipNoteProps {
  /** The glyph before the tip, which the product draws. */
  readonly mark?: ReactNode;
  readonly children: ReactNode;
}

/** A tip on the warning's soft ground. */
export function TipNote({ mark, children }: TipNoteProps) {
  return (
    <p {...slotAttributes(siteTipStyle, {})}>
      {mark !== undefined ? (
        <span {...slotAttributes(siteTipMarkStyle, {})} aria-hidden="true">
          {mark}
        </span>
      ) : null}
      {children}
    </p>
  );
}

/** Props for {@link DocSection}. */
export interface DocSectionProps {
  readonly id?: string;
  readonly heading: ReactNode;
  readonly text?: ReactNode;
  /** The section's action, the strongest on the page at that point. */
  readonly action?: SiteActionSpec;
  readonly children?: ReactNode;
}

/** A section of a document after its steps: its heading, its words and its action. */
export function DocSection({ id, heading, text, action, children }: DocSectionProps) {
  return (
    <section {...slotAttributes(siteDocSectionStyle, {})} id={id}>
      <h2 {...slotAttributes(siteDocHeadingStyle, {})}>{heading}</h2>
      {text !== undefined ? <p {...slotAttributes(siteDocTextStyle, {})}>{text}</p> : null}
      {children}
      {action !== undefined ? (
        <span {...slotAttributes(siteDocActionStyle, {})}>
          <SiteAction {...action} tone={action.tone ?? "primary"} />
        </span>
      ) : null}
    </section>
  );
}

/** Props for {@link FeedbackPanel}. */
export interface FeedbackPanelProps {
  /** The panel's name for a screen reader ("Was this helpful?"). */
  readonly label: string;
  /** What a screen reader hears once the feedback is sent. */
  readonly status?: ReactNode;
  /** The question and its answers, before the feedback is sent. */
  readonly ask?: { readonly question: ReactNode; readonly answers: readonly SiteActionSpec[] };
  /** What was missing, after a no: the reasons as toggles, then the actions. */
  readonly more?: { readonly label: ReactNode; readonly reasons: readonly SiteActionSpec[]; readonly actions: readonly SiteActionSpec[] };
  /** The thanks once it is sent, with an action to go on. */
  readonly thanks?: { readonly mark?: ReactNode; readonly title: ReactNode; readonly text: ReactNode; readonly action?: SiteActionSpec };
}

/** Whether an article helped: the question with its answers, what was missing after a no, then the thanks. */
export function FeedbackPanel({ label, status, ask, more, thanks }: FeedbackPanelProps) {
  return (
    <section {...slotAttributes(siteFeedbackStyle, {})} aria-label={label}>
      <SiteLive>{status}</SiteLive>
      {thanks !== undefined ? (
        <div {...slotAttributes(siteFeedbackMoreStyle, {})}>
          <p {...slotAttributes(siteFeedbackThanksStyle, {})}>
            {thanks.mark}
            <b {...slotAttributes(siteFeedbackAskStyle, {})}>{thanks.title}</b>
            {thanks.text}
          </p>
          {thanks.action !== undefined ? (
            <span {...slotAttributes(siteDocActionStyle, {})}>
              <SiteAction {...thanks.action} size="sm" />
            </span>
          ) : null}
        </div>
      ) : (
        <>
          {ask !== undefined ? (
            <div {...slotAttributes(siteFeedbackRowStyle, {})}>
              <b {...slotAttributes(siteFeedbackAskStyle, {})}>{ask.question}</b>
              {ask.answers.map((answer) => (
                <SiteAction key={answer.id} {...answer} size="sm" />
              ))}
            </div>
          ) : null}
          {more !== undefined ? (
            <div {...slotAttributes(siteFeedbackMoreStyle, {})}>
              <span {...slotAttributes(siteCardTextStyle, {})}>{more.label}</span>
              <div {...slotAttributes(siteFeedbackChoicesStyle, { gap: "tight" })}>
                {more.reasons.map((reason) => (
                  <SiteAction key={reason.id} {...reason} tone={reason.pressed === true ? "primary" : "secondary"} size="sm" />
                ))}
              </div>
              <div {...slotAttributes(siteFeedbackChoicesStyle, {})}>
                {more.actions.map((action) => (
                  <SiteAction key={action.id} {...action} size="sm" />
                ))}
              </div>
            </div>
          ) : null}
        </>
      )}
    </section>
  );
}

/** Props for {@link RelatedLinks}. */
export interface RelatedLinksProps {
  readonly title: ReactNode;
  readonly items: readonly { readonly key: string; readonly title: ReactNode; readonly meta?: ReactNode; readonly href: string; readonly onSelect?: (event: MouseEvent<HTMLElement>) => void }[];
}

/** Articles that continue this one, as small card links two to a row (one below the narrow tier). */
export function RelatedLinks({ title, items }: RelatedLinksProps) {
  return (
    <section {...slotAttributes(siteRelatedStyle, {})}>
      <h2 {...slotAttributes(siteArticleListTitleStyle, {})}>{title}</h2>
      <div {...slotAttributes(siteRelatedGridStyle, {})}>
        {items.map((item) => (
          <SiteLink key={item.key} {...slotAttributes(siteRelatedLinkStyle, {})} href={item.href} onClick={item.onSelect}>
            <b {...slotAttributes(siteArticleNameStyle, {})}>{item.title}</b>
            {item.meta !== undefined ? <span {...slotAttributes(siteArticleMetaStyle, {})}>{item.meta}</span> : null}
          </SiteLink>
        ))}
      </div>
    </section>
  );
}

/** Props for {@link DocProgress}. */
export interface DocProgressProps {
  /** How far the reader got, in words ("3 of 5 steps tried"); a document without steps to try has none. */
  readonly text?: ReactNode;
  /** What a screen reader hears when it changes; empty when the page opens. */
  readonly status?: ReactNode;
  /** 0 to 1; the bar is drawn only with a share. */
  readonly share?: number;
  readonly action?: SiteActionSpec;
}

/** How far the reader got through a document's steps, under the contents, with a way on (to ask support). */
export function DocProgress({ text, status, share, action }: DocProgressProps) {
  return (
    <div {...slotAttributes(siteDocProgressStyle, {})}>
      {text !== undefined ? <span {...slotAttributes(siteCardTextStyle, {})}>{text}</span> : null}
      {text !== undefined ? <SiteLive>{status}</SiteLive> : null}
      {share !== undefined ? <SiteProgress share={share} /> : null}
      {action !== undefined ? (
        <span {...slotAttributes(siteDocActionStyle, {})}>
          <SiteAction {...action} size="sm" />
        </span>
      ) : null}
    </div>
  );
}
