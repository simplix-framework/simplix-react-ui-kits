// A pricing page composed from the site parts, with the words and figures of the reference the kit's
// measurements were taken from (measure.json). It is the page `scripts/site-demo.mjs` renders for
// the rendered checks, and it names no product: the brand is a box the size of a mark.
import { SitePage, SitePageHead, SiteSection } from "@simplix-react-ui-kits/site-core/page";
import { OfferRow, PlanCard, PlanGrid, PriceTable, QuestionList, SegmentedSwitch, SwitchRow } from "@simplix-react-ui-kits/site-core/pricing";
import { SiteBar, SiteFooter, SiteWindow } from "@simplix-react-ui-kits/site-core/shell";

/** Which reader the page is drawn for. */
export interface PricingFixtureProps {
  /** A signed-in reader on the Pro plan; a visitor otherwise. */
  readonly signedIn?: boolean;
  /** The bar's tone: `dark` continues a dark band, as the bar over a hero does. */
  readonly barTone?: "light" | "dark";
}

const noop = () => {};

export function PricingFixture({ signedIn = false, barTone = "light" }: PricingFixtureProps) {
  const download = <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true"><path d="M12 15V3m0 12-4-4m4 4 4-4M4 21h16" /></svg>;
  return (
    <SiteWindow
      page="pricing"
      bar={
        <SiteBar
          brand={<svg width="103" height="20" viewBox="0 0 103 20" aria-hidden="true"><rect width="103" height="20" rx="4" fill="currentColor" opacity="0.15" /></svg>}
          brandHref="/"
          brandLabel="Home"
          navLabel="Site"
          moreLabel="More pages"
          tone={barTone}
          links={[
            { key: "intro", label: "Product", href: "/" },
            { key: "pricing", label: "Pricing", href: "/pricing", current: true },
            { key: "download", label: "Download", href: "/download" },
            { key: "help", label: "Help", href: "/help" },
          ]}
          action={signedIn ? undefined : { id: "start", label: "Start free", href: "/signup" }}
          account={signedIn ? { label: "My account", name: "Taylor", href: "/account" } : undefined}
        />
      }
      footer={
        <SiteFooter
          owner="© Example Inc."
          linksLabel="Legal"
          links={[
            { key: "terms", label: "Terms of use", href: "/terms" },
            { key: "privacy", label: "Privacy policy", href: "/privacy", emphasis: true },
            { key: "business", label: "Business information and refunds", href: "/business" },
          ]}
        />
      }
    >
      <SitePage>
        <SitePageHead
          title="Pick the plan that fits your talks"
          lede="Free voices have no limit on any plan, made on your computer or, on a tablet, on our server. Premium voices are paid for with character credits."
        />
        <SwitchRow>
          <SegmentedSwitch
            label="Billing cycle"
            value="monthly"
            onValueChange={noop}
            options={[
              { value: "monthly", label: "Monthly" },
              { value: "yearly", label: "Yearly · 2 months free" },
            ]}
          />
          <SegmentedSwitch
            label="Currency"
            value="USD"
            onValueChange={noop}
            options={[
              { value: "KRW", label: "₩ KRW" },
              { value: "USD", label: "$ USD" },
            ]}
          />
        </SwitchRow>
        <PlanGrid>
          <PlanCard
            name="Free"
            price="$0"
            unit=""
            note="No card needed"
            pitch="Install and go, right on your computer"
            detail="Free voices only · premium voices come with a paid plan"
            features={[
              { key: "free", label: "Free voices without a limit · on your computer" },
              { key: "notes", label: "Notes and chat with a helper on your computer (Claude Code or Codex)" },
              { key: "prompter", label: "Teleprompter · open decks without PowerPoint" },
              { key: "previews", label: "3 premium previews a month · never charged" },
              { key: "720", label: "720p video" },
              { key: "fit", label: "Fit to presentation time · 2 times a month" },
            ]}
            actions={[{ id: "download", label: "Download the app", href: "/download", icon: download }]}
          />
          <PlanCard
            name="Presentation pack"
            price="$11"
            unit="once"
            note="Usable for 12 months · never charged again"
            pitch="For getting one presentation ready"
            detail="Pay once · about 10 five-minute talks"
            features={[
              { key: "chars", label: "50,000 premium voice characters · for 12 months" },
              { key: "1080", label: "1080p video · captions" },
              { key: "auto", label: "No automatic payment" },
              { key: "free", label: "Everything in Free" },
            ]}
            actions={[{ id: "start", label: "Start Presentation pack", href: "/checkout?offer=pack" }]}
          />
          <PlanCard
            name="Pro"
            price="$12"
            unit="/mo"
            note="Plus sales tax or VAT"
            pitch="For people who present often on their own"
            detail="Every month · about 10 five-minute talks a month"
            highlight="Most chosen"
            current={signedIn ? "Your plan" : undefined}
            features={[
              { key: "chars", label: "50,000 premium characters a month · about 50 min of English" },
              { key: "voice", label: "1 own voice" },
              { key: "1080", label: "1080p video · captions" },
              { key: "fit", label: "Fit to presentation time · no limit" },
              { key: "cloud", label: "Cloud mode on computers without the app" },
            ]}
            actions={[
              { id: "start", label: "Start Pro", href: "/checkout?offer=pro", tone: "primary" },
              { id: "trial", label: "Try 7 days without a card", href: "/signup", tone: "quiet" },
            ]}
          />
          <PlanCard
            name="Pro+"
            price="$24"
            unit="/mo"
            note="Plus sales tax or VAT"
            pitch="For lecturers and heavy content makers"
            detail="Every month · about 24 five-minute talks a month"
            features={[
              { key: "chars", label: "120,000 premium characters a month · about 120 min of English" },
              { key: "voices", label: "3 own voices" },
              { key: "pro", label: "Everything in Pro" },
              { key: "captions", label: "Captions in several languages" },
              { key: "4k", label: "4K video" },
            ]}
            actions={[{ id: "start", label: "Start Pro+", href: "/checkout?offer=pro-plus" }]}
          />
        </PlanGrid>
        <OfferRow
          title="Team"
          about="Seat management, a team brand voice, tax invoices · opening next year"
          action={{ id: "notify", label: "Tell me when it opens", onSelect: noop }}
        />
        <OfferRow
          title="Extra credits"
          about="For Pro and up · added to this month's credits · used after your monthly credits · 60,000 characters $11 · Usable for 12 months"
          action={{ id: "top-up", label: "Top up credits", href: "/checkout?offer=top-up", disabled: !signedIn }}
          note={signedIn ? undefined : "Extra credits need Pro or Pro+"}
        />
        <PriceTable
          caption="What each voice costs"
          columns={["Where you make voice", "Free voices", "Premium voices and your own voice"]}
          rows={[
            { key: "app", head: "PC with the desktop app", cells: ["Made on this computer · no credits", "Made on the server · uses credits"] },
            { key: "cloud", head: "Cloud mode · PC without the app", cells: ["Not available", "Made on the server · uses credits"] },
            { key: "tablet", head: "Tablet", cells: ["Made on the server · no credits · needs the internet", "Made on the server · uses credits"] },
          ]}
        />
        <SiteSection heading="Questions">
          <QuestionList
            items={[
              { key: "trial", question: "Am I charged when the trial ends?", answer: "No. The 7-day trial takes no card and returns to Free when it ends." },
              { key: "carry", question: "Do unused credits carry over?", answer: "Monthly credits last until the end of their month; extra credits and the presentation pack last 12 months from the day you buy them." },
              { key: "refund", question: "How do refunds work?", answer: "Within 7 days of payment, if you have not used premium voices or your own voice, we refund everything. Yearly plans refund the months you have not used. Ask from My account → Receipts." },
            ]}
          />
        </SiteSection>
      </SitePage>
    </SiteWindow>
  );
}
