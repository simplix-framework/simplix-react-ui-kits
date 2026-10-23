import { Fragment } from "react";
import { slotAttributes } from "@simplix-react/ui/design";

import { pageMetaItemStyle, pageMetaRuleStyle, pageMetaStyle } from "./page-meta.style";

/**
 * Several facts about a page (a workplace, a date, a shift) as the line under its title.
 *
 * <p>Each fact is its own element and the mark between two of them is drawn by the design: classic
 * writes it as a middle dot, so the line reads as the sentence it always was; a design may set the
 * facts apart with a short rule instead.
 *
 * @param props the facts, in reading order
 * @returns the line
 */
export function PageMeta({ items }: { readonly items: readonly string[] }) {
  return (
    <span {...slotAttributes(pageMetaStyle, {})}>
      {items.map((item, index) => (
        <Fragment key={`${index}-${item}`}>
          {index > 0 && (
            <span aria-hidden {...slotAttributes(pageMetaRuleStyle, {})}>
              {" · "}
            </span>
          )}
          <span {...slotAttributes(pageMetaItemStyle, {})}>{item}</span>
        </Fragment>
      ))}
    </span>
  );
}
