import { describe, expect, it } from "vitest";

import { recordSublistStyle } from "../entity/record-detail.style";
import { contentColumnStyle } from "./content-column.style";

/**
 * A list frame flattens the cards of the stacked view into ruled rows and takes the padding off the
 * view. The cards of the grid view are separate boxes with the view's own padding, so every
 * selector that reaches a card or the list view names the view that is not a grid
 * (`data-grid="false"`, set by the framework's list view).
 */
interface Declared {
  base?: string;
  variants?: Record<string, Record<string, string>>;
}

function classesOf(style: Declared): string[] {
  const texts = [style.base ?? "", ...Object.values(style.variants ?? {}).flatMap((group) => Object.values(group))];
  return texts.flatMap((text) => text.split(/\s+/)).filter(Boolean);
}

const reachesCardOrView = (cls: string) => /\[data-slot=crud-card\]|\[data-slot=crud-list-view\]/.test(cls);

describe("the frames that rule the stacked cards", () => {
  const frames: [string, Declared][] = [
    ["the content column", contentColumnStyle as Declared],
    ["the compact record list", recordSublistStyle as Declared],
  ];

  it.each(frames)("%s reaches cards and the list view at all", (_name, style) => {
    expect(classesOf(style).some(reachesCardOrView)).toBe(true);
  });

  it.each(frames)("%s leaves the cards and the padding of a grid view alone", (_name, style) => {
    for (const cls of classesOf(style).filter(reachesCardOrView)) {
      expect(cls, cls).toContain("[data-slot=crud-list-view][data-grid=false]");
    }
  });
});
