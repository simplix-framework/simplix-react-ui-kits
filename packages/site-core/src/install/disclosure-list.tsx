import type { ReactNode } from "react";
import { useId } from "react";
import { slotAttributes } from "@simplix-react/ui/design";

import { SiteAction, type SiteActionSpec } from "../action/site-action";
import {
  siteActionLineStyle,
  siteCopyStyle,
  siteCopyTextStyle,
  siteDisclosureButtonStyle,
  siteDisclosureLabelStyle,
  siteDisclosureLeadStyle,
  siteDisclosureListStyle,
  siteDisclosureMarkStyle,
  siteDisclosurePanelStyle,
  siteDisclosureStyle,
  siteDisclosureTextStyle,
  siteNumberedItemStyle,
  siteNumberedListStyle,
} from "./install.style";

/** One question of a {@link DisclosureList} and its answer. */
export interface SiteDisclosure {
  readonly key: string;
  readonly title: ReactNode;
  /** The cause, in the strong weight before the answer's words. */
  readonly lead?: ReactNode;
  readonly body: ReactNode;
  /** Numbered things to do. */
  readonly steps?: readonly ReactNode[];
  /** A message to copy as it is, under the steps: a {@link CopyBlock}. */
  readonly copy?: ReactNode;
}

/** Props for {@link DisclosureList}. */
export interface DisclosureListProps {
  readonly items: readonly SiteDisclosure[];
  /** The key of the open item, or `null` when every item is closed. */
  readonly open: string | null;
  /** Called with the item to open, or `null` when the open one is closed again. */
  readonly onOpenChange: (key: string | null) => void;
  /** The glyph that turns over on an open item, a chevron the product draws. */
  readonly mark?: ReactNode;
}

/** Questions ruled apart on one card, one open at a time; a question is a button that opens its answer. */
export function DisclosureList({ items, open, onOpenChange, mark }: DisclosureListProps) {
  const base = useId();
  return (
    <div {...slotAttributes(siteDisclosureListStyle, {})}>
      {items.map((item, index) => {
        const isOpen = item.key === open;
        const panelId = `${base}-${String(index)}`;
        return (
          <div key={item.key} {...slotAttributes(siteDisclosureStyle, {})}>
            <button
              {...slotAttributes(siteDisclosureButtonStyle, {})}
              type="button"
              aria-expanded={isOpen}
              aria-controls={isOpen ? panelId : undefined}
              onClick={() => onOpenChange(isOpen ? null : item.key)}
            >
              <span {...slotAttributes(siteDisclosureLabelStyle, {})}>{item.title}</span>
              {mark !== undefined ? (
                <span {...slotAttributes(siteDisclosureMarkStyle, { open: isOpen })} aria-hidden="true">
                  {mark}
                </span>
              ) : null}
            </button>
            {isOpen ? (
              <div {...slotAttributes(siteDisclosurePanelStyle, {})} id={panelId}>
                <p {...slotAttributes(siteDisclosureTextStyle, {})}>
                  {item.lead !== undefined ? (
                    <>
                      <b {...slotAttributes(siteDisclosureLeadStyle, {})}>{item.lead}</b>{" "}
                    </>
                  ) : null}
                  {item.body}
                </p>
                {item.steps !== undefined && item.steps.length > 0 ? <NumberedList items={item.steps} /> : null}
                {item.copy}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

/** Props for {@link NumberedList}. */
export interface NumberedListProps {
  readonly items: readonly ReactNode[];
}

/** Numbered things to do, muted. */
export function NumberedList({ items }: NumberedListProps) {
  return (
    <ol {...slotAttributes(siteNumberedListStyle, {})}>
      {items.map((item, index) => (
        // A fixed list of steps; their order is their identity.
        <li key={`s-${String(index)}`} {...slotAttributes(siteNumberedItemStyle, {})}>
          {item}
        </li>
      ))}
    </ol>
  );
}

/** Props for {@link CopyBlock}. */
export interface CopyBlockProps {
  /** The message, kept as written. */
  readonly text: string;
  /** The copy action; the product puts the text on the clipboard and says whether it could. */
  readonly action: SiteActionSpec;
}

/** A message to copy as it is, and the button that copies it. */
export function CopyBlock({ text, action }: CopyBlockProps) {
  return (
    <div {...slotAttributes(siteCopyStyle, {})}>
      <pre {...slotAttributes(siteCopyTextStyle, {})}>{text}</pre>
      <SiteAction {...action} size="sm" />
    </div>
  );
}

/** Props for {@link ActionLine}. */
export interface ActionLineProps {
  readonly text: ReactNode;
  readonly action: SiteActionSpec;
}

/** A muted line that ends in an action ("Not installing?" then the way to troubleshooting). */
export function ActionLine({ text, action }: ActionLineProps) {
  return (
    <p {...slotAttributes(siteActionLineStyle, {})}>
      {text}
      <SiteAction {...action} size="sm" />
    </p>
  );
}
