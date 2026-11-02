import { Flex, Heading, Stack, Text, usePageHeaderState } from "@simplix-react/ui";

import { NoticeMenu, useNoticeEntries } from "../notice";
import { useConsoleOnAPhone } from "./phone-shell";
import { pageHeaderActionsStyle, pageHeaderDescriptionStyle, pageHeaderMetadataStyle, pageHeaderStyle } from "./page-header.style";
import { partAttributes } from "@simplix-react/ui/design";

/**
 * Whether the phone's header row has anything to draw: a way back, verbs, or a card to bring back.
 * A record shown as the page publishes the list's title for the bar and nothing else, and a row
 * with none of the three would only push the record down.
 */
export function phoneRowHasContent({ back, actions, noticeCount }: { readonly back: unknown; readonly actions: unknown; readonly noticeCount: number }): boolean {
  return Boolean(back) || Boolean(actions) || noticeCount > 0;
}

/**
 * The band at the top of every routed screen — its title, what it is for, and what it offers.
 *
 * <p>Rendered from what the screen published through `usePageHeader`, so a screen states its title
 * once and never draws a heading of its own.
 *
 * <p><b>The actions are one child, not several.</b> As siblings of the title they are distributed
 * by `justify="between"` — three links spread evenly across the row and the primary pushed to the
 * far edge, which is what a header with four actions looked like. Grouped, any number of them sits
 * together at the right whatever the count.
 *
 * <p><b>The notice controls lead that group and are drawn here rather than registered per screen.</b>
 * A card can be put away from any route, and the way back has to be in the same place on all of
 * them. `NoticeMenu` draws nothing where the screen holds no cards, which is why every app can
 * carry it — written per app it reached one of three, and the other two had no way back to a card
 * an operator had put away.
 *
 * <p><b>The way back is a breadcrumb above the title, not a verb beside the others.</b> A screen
 * with no menu entry of its own is reached from another screen's explanation, so it owes the
 * reader the way back — but drawn as an outline button under the description it reads as
 * something this screen does, and it is the one control on the row that leaves. Above the title,
 * quiet and small, it says where the reader is instead.
 *
 * <p><b>On a phone the title and the sentence under it are not drawn here.</b> The phone's own bar
 * carries the title, and drawn in both places the screen opens with its name twice — once in the
 * chrome and once again at the top of the content, with the description pushing the first row of
 * the screen off the fold. What stays is the action group: a screen's verbs have to be reachable
 * at every width, and a screen that draws its own at a phone's width registers none.
 */
export function ConsolePageHeader() {
  const { title, back, description, metadata, center, actions } = usePageHeaderState();
  const onAPhone = useConsoleOnAPhone();
  const notices = useNoticeEntries();
  if (!title) return null;
  if (onAPhone) {
    if (!phoneRowHasContent({ back, actions, noticeCount: notices.length })) return null;
    // **The notice controls do not depend on the screen having actions.** This path drew nothing at
    // all where a screen passed none — and a screen passes none exactly when its verbs moved into
    // the phone's own action bar, which is the case for the one screen that does it. A card put
    // away there had no control to come back from, on the width where a card costs the most. The
    // paragraph above already says why `NoticeMenu` is safe unconditionally: it draws nothing where
    // the screen holds no cards.
    // The way back stays too: a screen with no menu entry of its own has no tab to return through,
    // so dropping it here leaves the browser's back as the only way out. The verbs are a thumb's
    // size, since this is the one row of them the phone draws.
    return (
      <Flex justify="between" align="center" gap="sm" wrap {...partAttributes(pageHeaderStyle, {})}>
        <Flex align="center" className="min-w-0">{back}</Flex>
        <Flex
          align="center"
          gap="sm"
          className="[&_button]:min-h-11 [&_button]:min-w-11"
          {...partAttributes(pageHeaderActionsStyle, {})}
        >
          <NoticeMenu />
          {actions}
        </Flex>
      </Flex>
    );
  }
  return (
    // The rule and the short shadow it casts over the folded figure row are the declaration's
    // (`pageHeaderStyle`), so a design that draws no rule draws no shadow either.
    <Flex justify="between" align="end" className="relative" {...partAttributes(pageHeaderStyle, {})}>
      <Stack gap="none">
        {back}
        <Heading level={1}>{title}</Heading>
        {description && (
          <Text size="sm" tone="muted" {...partAttributes(pageHeaderDescriptionStyle, {})}>
            {description}
          </Text>
        )}
        {metadata && <Stack {...partAttributes(pageHeaderMetadataStyle, {})}>{metadata}</Stack>}
      </Stack>
      {center && <Stack className="absolute left-1/2 -translate-x-1/2 bottom-2">{center}</Stack>}
      <Flex align="center" gap="sm" shrink={false} {...partAttributes(pageHeaderActionsStyle, {})}>
        <NoticeMenu />
        {actions}
      </Flex>
    </Flex>
  );
}
