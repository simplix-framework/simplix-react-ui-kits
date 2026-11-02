import { useId, type ReactNode } from "react";
import { slotAttributes } from "@simplix-react/ui/design";

import {
  siteDisplayHeadingStyle,
  siteNoteListStyle,
  siteNoteMarkStyle,
  siteNoteStyle,
  siteStepBodyStyle,
  siteStepMediaStyle,
  siteStepNumberStyle,
  siteStepsListStyle,
  siteStepsStyle,
  siteStepStyle,
  siteStepTitleStyle,
} from "./marketing.style";

/** One step of {@link NumberedSteps}. */
export interface SiteStep {
  readonly key: string;
  readonly title: ReactNode;
  readonly body: ReactNode;
  /** A picture of the step, such as a `SiteBars` or a `SiteWave`. */
  readonly media?: ReactNode;
}

/** One short promise under the steps. */
export interface SiteNote {
  readonly key: string;
  readonly label: ReactNode;
}

/** Props for {@link NumberedSteps}. */
export interface NumberedStepsProps {
  readonly heading: ReactNode;
  readonly steps: readonly SiteStep[];
  /** Short promises under the steps ("Your presentation never leaves your computer"). */
  readonly notes?: readonly SiteNote[];
  /** The mark before each promise, a glyph the product draws. */
  readonly noteMark?: ReactNode;
}

/** A step's number as two digits: `01`, `02`. */
export const stepNumber = (index: number) => String(index + 1).padStart(2, "0");

/**
 * Numbered steps in a display section: a card per step with its number, its picture, its title
 * and what it does, three to a row (one below the medium tier), then a line of short promises.
 */
export function NumberedSteps({ heading, steps, notes = [], noteMark }: NumberedStepsProps) {
  const headingId = useId();
  return (
    <section {...slotAttributes(siteStepsStyle, {})} aria-labelledby={headingId}>
      <h2 {...slotAttributes(siteDisplayHeadingStyle, {})} id={headingId}>
        {heading}
      </h2>
      <ol {...slotAttributes(siteStepsListStyle, {})}>
        {steps.map((step, index) => (
          <li key={step.key} {...slotAttributes(siteStepStyle, {})}>
            <span {...slotAttributes(siteStepNumberStyle, {})} aria-hidden="true">
              {stepNumber(index)}
            </span>
            {step.media !== undefined ? <span {...slotAttributes(siteStepMediaStyle, {})}>{step.media}</span> : null}
            <b {...slotAttributes(siteStepTitleStyle, {})}>{step.title}</b>
            <p {...slotAttributes(siteStepBodyStyle, {})}>{step.body}</p>
          </li>
        ))}
      </ol>
      {notes.length > 0 ? (
        <ul {...slotAttributes(siteNoteListStyle, {})}>
          {notes.map((note) => (
            <li key={note.key} {...slotAttributes(siteNoteStyle, {})}>
              {noteMark !== undefined ? (
                <span {...slotAttributes(siteNoteMarkStyle, {})} aria-hidden="true">
                  {noteMark}
                </span>
              ) : null}
              {note.label}
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
