// The presentation packs view composed from the site parts, with the words of the reference the
// kit's measurements were taken from. Each reference story was read off the rendered reference
// (packs-copy.json: whether the reader is signed in, the heading, each pack's words, figures and
// action, the reason under a disabled action and the closing line). The words are the reference
// product's own, kept as written because where a line wraps is part of what is measured.
import { PackCard, PackSection } from "@simplix-react-ui-kits/site-core/pricing";
import { SitePage } from "@simplix-react-ui-kits/site-core/page";
import { SiteBar, SiteFooter, SiteWindow } from "@simplix-react-ui-kits/site-core/shell";

import copyFile from "./packs-copy.json";
import { glyph, languagePlace, type Locale, shellCopy } from "./shell-copy";

/** What the packs view is drawn with: a reference story, in a language. */
export interface PacksFixtureProps {
  readonly locale?: Locale;
  /** The reference story drawn (its id without the group). */
  readonly story?: string;
}

interface Pack {
  readonly name: string;
  readonly price: string;
  readonly unit?: string;
  readonly about?: string;
  readonly meterLabel: string;
  readonly share: number;
  readonly amount: string;
  readonly talk: string;
  readonly terms?: string;
  readonly action: { readonly label: string; readonly href?: string; readonly disabled: boolean };
  readonly reason?: string;
}
interface Story {
  readonly signedIn: boolean;
  readonly language: boolean;
  readonly title: string;
  readonly lede?: string;
  readonly cards: readonly Pack[];
  readonly note?: string;
}

export function PacksFixture({ locale = "en", story = "visitor" }: PacksFixtureProps) {
  const shell = shellCopy[locale];
  const data = (copyFile as unknown as Record<string, Story>)[`web-billing-presentation-packs--${story}|${locale}`];
  if (data === undefined) throw new Error(`packs fixture: no copy for ${story} in ${locale}`);
  return (
    <SiteWindow
      page="packs"
      bar={
        <SiteBar
          brand={glyph.brand}
          brandHref="/"
          brandLabel={shell.home}
          navLabel={shell.navLabel}
          moreLabel={shell.menu}
          links={[
            { key: "intro", label: shell.intro, href: "/" },
            { key: "pricing", label: shell.pricing, href: "/pricing", current: true },
            { key: "download", label: shell.download, href: "/download" },
            { key: "help", label: shell.help, href: "/help" },
          ]}
          action={data.signedIn ? undefined : { id: "start", label: shell.startFree, href: "/signup" }}
          account={data.signedIn ? { label: shell.myAccount, name: "Taylor", href: "/account" } : undefined}
        />
      }
      footer={<SiteFooter owner={shell.company} linksLabel={shell.legal} links={shell.footerLinks} language={data.language ? languagePlace : undefined} />}
    >
      <SitePage>
        <PackSection heading={data.title} lede={data.lede} note={data.note}>
          {data.cards.map((pack, index) => (
            <PackCard
              key={pack.name}
              name={pack.name}
              price={pack.price}
              unit={pack.unit}
              about={pack.about}
              meter={{ share: pack.share, label: pack.meterLabel, amount: pack.amount, talk: pack.talk }}
              terms={pack.terms}
              action={pack.action.disabled ? { id: `pack-${String(index)}`, label: pack.action.label, disabled: true, reason: pack.reason ?? pack.action.label } : { id: `pack-${String(index)}`, label: pack.action.label, href: pack.action.href }}
              reason={pack.reason}
            />
          ))}
        </PackSection>
      </SitePage>
    </SiteWindow>
  );
}

export default PacksFixture;
