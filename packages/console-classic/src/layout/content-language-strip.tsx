import { useRef } from "react";
import { useLocale } from "@simplix-react/i18n/react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Tabs,
  TabsList,
  TabsTrigger,
  useContainerWidth,
  useMediaQuery,
} from "@simplix-react/ui";

import { contentLanguageDualName } from "../i18n";
import type { I18nEditLanguage } from "../i18n";

/**
 * About how much of the header row one pill takes — a language's own name with the reader's name
 * for it in brackets, at this console's caption size.
 */
const PILL_WIDTH = 150;

/**
 * What the rest of the header row takes beside the strip: the screen's title, the sentence under
 * it, and the notice controls that lead the action group.
 */
const HEADER_CHROME_WIDTH = 460;

/** Where the strip is standing, which decides what its width is measured against. */
export type ContentLanguageStripPlacement = "page-header" | "panel";

/** {@link ContentLanguageStrip}'s own props, beside the language state it is given. */
export interface ContentLanguageStripProps extends I18nEditLanguage {
  /**
   * Where the strip is standing. `page-header` by default.
   *
   * <p><b>The two are measured against different numbers, and neither answers for the other.</b>
   * The page header's action group does not shrink, so an element inside it is exactly as wide as
   * its own content and measuring it says nothing — what decides there is how much of the row the
   * title and the notice controls leave, which follows the window. A panel is the opposite: its
   * width is set by the screen that opened it and a 1600px window can hold a 600px panel, so the
   * window's width is the one number that cannot answer and the container's is the only one that
   * can.
   */
  readonly within?: ContentLanguageStripPlacement;
}

/**
 * The language a screen reads its multilingual values in.
 *
 * <p><b>At the right of the page header, where a screen-wide choice belongs.</b> It narrows
 * nothing — every row is still listed — so it is not a cut of the set the way the page tabs and
 * the chips below them are, and put in their column it reads as a third one (frontend invariant
 * #63). The header is also where it stays put while the reader moves between tabs.
 *
 * <p><b>Pills while the row can hold them, a select where it cannot.</b> Both say the same thing
 * and the pills say it in one glance, so they are what is drawn wherever there is room. How much
 * room that takes is a deployment's decision rather than a constant — a pack of four languages and
 * a pack of ten do not fit the same header — so the threshold follows the language count.
 *
 * <p><b>Every language the deployment publishes in is offered, including one the framework cannot
 * name.</b> A code with no display name is labelled with the code rather than dropped: a shortened
 * strip says the deployment does not publish in that language, which is a different claim.
 *
 * @param props the language the screen is on and the way to change it
 * @returns the strip, or the select where the row cannot hold it
 */
export function ContentLanguageStrip({
  languages,
  selectedLanguage,
  onLanguageChange,
  within = "page-header",
}: ContentLanguageStripProps) {
  const uiLocale = useLocale();
  const label = (code: string, name: string) => contentLanguageDualName(code, name, uiLocale);

  const needed = languages.length * PILL_WIDTH;
  const box = useRef<HTMLDivElement>(null);
  const measured = useContainerWidth(box);
  const windowHoldsPills = useMediaQuery(`(min-width: ${HEADER_CHROME_WIDTH + needed}px)`);
  // Unmeasured counts as room, so the first frame draws the pills rather than showing a select and
  // replacing it a moment later with a control of a different shape in a different place.
  const roomForPills =
    within === "panel" ? measured === 0 || measured >= needed : windowHoldsPills;

  return (
    <div ref={box} className="min-w-0">
      {roomForPills ? (
        <Tabs value={selectedLanguage} onValueChange={(next) => onLanguageChange(next)}>
          <TabsList>
            {languages.map((language) => (
              <TabsTrigger key={language.code} value={language.code}>
                {label(language.code, language.name)}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      ) : (
        <Select value={selectedLanguage} onValueChange={(next) => onLanguageChange(next)}>
          <SelectTrigger size="sm" className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {languages.map((language) => (
              <SelectItem key={language.code} value={language.code}>
                {label(language.code, language.name)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}
