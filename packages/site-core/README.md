# @simplix-react-ui-kits/site-core

The parts every web site design shares: behaviour and markup, each element that carries a look marked with `data-slot`. A design kit (`@simplix-react-ui-kits/site-clarity`) re-exports these segments and draws the slots; an app imports the design kit, never this package.

| Segment | Exports |
| --- | --- |
| `/link` | `SiteLinkProvider`, `SiteLink`, `useSiteLink`, `PlainSiteLink`: every site link is drawn with the router link the provider names, a plain anchor otherwise |
| `/action` | `SiteAction` (`SiteActionSpec`): a link when it opens an address, a button otherwise, and always a disabled button when disabled; `tone` primary, secondary or quiet, `size` md, sm or lg (a hero's), `block` |
| `/shell` | `SiteWindow` (the `page` container, bar, main, footer; moves focus to the page when `page` changes), `SiteBar` (brand, page links with the current one, visitor action or signed-in account with its avatar, more menu below the narrow tier, `tone="dark"`), `SiteFooter` (owner, legal links, language picker place), `SiteBand` (a dark band), `avatarInitial`, `menuKeyTarget` |
| `/marketing` | `HeroBand` (a band with the one h1, its accent line, lede, large actions, facts line and a media slot; `tone="dark"`), `PlayerCard` (choice, sentence, wave, play row), `PlayToggle`, `ReadAlong` (`readWordState`, `readWordAt`), `SiteWave` (bars from the product's levels, the share played), `SiteBars` (a picture of bars), `SampleRow` (a sample as one toggle: disc, name, meta, text or the product's wave while playing), `SampleList`, `SplitSection` (display heading and lede beside content), `NumberedSteps` (numbered cards with a media slot and a line of promises, `stepNumber`). The kit plays no audio: the product's player hands the parts its state |
| `/page` | `SitePage` (the column; `rhythm="open"` spaces a marketing page), `SitePageHead` (eyebrow, the one h1, lede), `SiteSection` (named by its h2, `size` md or lg), `SiteBreadcrumb` |
| `/pricing` | `SwitchRow`, `SegmentedSwitch` (a radio group walked with the arrows; `switchKeyTarget`), `PlanGrid`, `PlanCard` (name, price, unit, note, pitch, detail, features, highlight, current, actions), `FeatureList`, `OfferRow`, `PriceTable`, `QuestionList` |

The parts take plain props and name no product, endpoint or router: labels, addresses and handlers come from the product. A part writes no class; its look lives in its `.style.ts` declaration (`defineSlotStyle`), which the design kit's `design:css` turns into the stylesheet. `pnpm lint` runs `simplix-design-classes` (no look class on an element), `simplix-slot-spread` and the design literal check.
