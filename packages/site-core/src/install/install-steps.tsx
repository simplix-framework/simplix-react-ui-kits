import type { ReactNode } from "react";
import { slotAttributes } from "@simplix-react/ui/design";

import {
  siteInstallStepBodyStyle,
  siteInstallStepHeadStyle,
  siteInstallStepsStyle,
  siteInstallStepStyle,
  siteInstallStepTagStyle,
  siteInstallStepTextStyle,
  siteInstallStepTitleStyle,
  siteSketchBarStyle,
  siteSketchFillStyle,
  siteSketchLabelStyle,
  siteSketchLineStyle,
  siteSketchPillStyle,
  siteSketchStyle,
  siteSketchTrackStyle,
  siteStepDiscStyle,
} from "./install.style";

/** One step of {@link InstallSteps}. */
export interface SiteInstallStep {
  readonly key: string;
  readonly title: ReactNode;
  /** A tag under the title saying who the step is for, such as a `SiteChip`. */
  readonly tag?: ReactNode;
  readonly body: ReactNode;
  /** What the screen shows at this step, such as a {@link ScreenSketch}. */
  readonly media?: ReactNode;
}

/** Props for {@link InstallSteps}. */
export interface InstallStepsProps {
  readonly steps: readonly SiteInstallStep[];
}

/** Install steps, one card each: the numbered words beside what the screen shows; stacked below the narrow tier. */
export function InstallSteps({ steps }: InstallStepsProps) {
  return (
    <ol {...slotAttributes(siteInstallStepsStyle, {})}>
      {steps.map((step, index) => (
        <li key={step.key} {...slotAttributes(siteInstallStepStyle, {})}>
          <div {...slotAttributes(siteInstallStepHeadStyle, {})}>
            <span {...slotAttributes(siteStepDiscStyle, {})} aria-hidden="true">
              {index + 1}
            </span>
            <div {...slotAttributes(siteInstallStepTextStyle, {})}>
              <b {...slotAttributes(siteInstallStepTitleStyle, {})}>{step.title}</b>
              {step.tag !== undefined ? <span {...slotAttributes(siteInstallStepTagStyle, {})}>{step.tag}</span> : null}
              <span {...slotAttributes(siteInstallStepBodyStyle, {})}>{step.body}</span>
            </div>
          </div>
          {step.media}
        </li>
      ))}
    </ol>
  );
}

/** What a {@link ScreenSketch} shows on its window, besides its words. */
export type ScreenSketchContent =
  | { readonly kind: "progress"; readonly label: ReactNode; readonly share: number }
  | { readonly kind: "pill"; readonly label: ReactNode; readonly pill: ReactNode }
  | { readonly kind: "code"; readonly code: ReactNode };

/** Props for {@link ScreenSketch}. */
export interface ScreenSketchProps {
  readonly content: ScreenSketchContent;
  /** Marks the title bar's long bar in the accent, where the step points at the window itself. */
  readonly accentBar?: boolean;
}

/**
 * A drawn stand-in for the screen a step shows: a window with a title bar and one thing on it (a
 * label over a progress bar, a label beside the button to press, or a code to type). Hidden from
 * screen readers: the step's words say the same.
 */
export function ScreenSketch({ content, accentBar = false }: ScreenSketchProps) {
  return (
    <div {...slotAttributes(siteSketchStyle, {})} aria-hidden="true">
      <div {...slotAttributes(siteSketchBarStyle, {})}>
        <i {...slotAttributes(siteSketchLineStyle, { span: "short" })} />
        <i {...slotAttributes(siteSketchLineStyle, { span: accentBar ? "accent" : "long" })} />
      </div>
      {content.kind === "progress" ? (
        <>
          <span {...slotAttributes(siteSketchLabelStyle, { kind: "progress" })}>{content.label}</span>
          <span {...slotAttributes(siteSketchTrackStyle, {})}>
            <i {...slotAttributes(siteSketchFillStyle, {})} style={{ width: `${String(Math.round(Math.min(1, Math.max(0, content.share)) * 100))}%` }} />
          </span>
        </>
      ) : content.kind === "pill" ? (
        <>
          <span {...slotAttributes(siteSketchLabelStyle, { kind: "pill" })}>{content.label}</span>
          <span {...slotAttributes(siteSketchPillStyle, {})}>{content.pill}</span>
        </>
      ) : (
        <span {...slotAttributes(siteSketchLabelStyle, { kind: "code" })}>{content.code}</span>
      )}
    </div>
  );
}
