// The checkout composed from the site parts, with the words of the reference the kit's measurements
// were taken from. Each reference story was read off the rendered reference (checkout-copy.json: the
// steps, our side's blocks in drawing order, the payment provider's frame, or the page after
// payment), and this page draws each with the part that draws it. The provider's own frame is the
// provider's: the ways to pay are drawn with MethodGrid, everything else in it stands in as a box of
// its measured height. The words are the reference product's own, kept as written because where a
// line wraps is part of what is measured.
import type { CSSProperties, ReactNode } from "react";
import type { SiteActionSpec, SiteActionTone } from "@simplix-react-ui-kits/site-core/action";
import { SiteAction } from "@simplix-react-ui-kits/site-core/action";
import { QuotaMeter, SitePanel } from "@simplix-react-ui-kits/site-core/account";
import { CheckoutHead, CheckoutLayout, CheckoutRow, ChoiceCards, ConsentAgain, ConsentChecklist, DonePanel, MethodGrid, OrderSummary, ProgressChain, ProviderFrame, SavingTag, Stepper } from "@simplix-react-ui-kits/site-core/checkout";
import { SiteCheckbox } from "@simplix-react-ui-kits/site-core/form";
import { SitePage, SiteSpinner, SiteTextAction } from "@simplix-react-ui-kits/site-core/page";
import { FeatureList, SegmentedSwitch } from "@simplix-react-ui-kits/site-core/pricing";
import { SiteBar, SiteFooter, SiteWindow } from "@simplix-react-ui-kits/site-core/shell";

import copyFile from "./checkout-copy.json";
import { glyph, languagePlace, type Locale, shellCopy, themePlace, visitorActions } from "./shell-copy";

/** What the checkout is drawn with: a reference story, in a language. */
export interface CheckoutFixtureProps {
  readonly locale?: Locale;
  /** The reference story drawn (its id without the group). */
  readonly story?: string;
}

interface Action {
  readonly label: string;
  readonly tone: string;
  readonly size: string;
  readonly href?: string;
  readonly disabled: boolean;
  readonly block: boolean;
  readonly icon: boolean;
}
type Block = { readonly kind: string } & Record<string, unknown>;
interface Method {
  readonly mark: string;
  readonly name: string;
  readonly about?: string;
  readonly pressed: boolean;
  readonly disabled: boolean;
  readonly wide: boolean;
}
interface Story {
  readonly signedIn: boolean;
  readonly language: boolean;
  readonly steps?: readonly { readonly label: string }[];
  readonly current?: number;
  readonly caption?: string;
  readonly main?: readonly Block[];
  readonly frame?: { readonly label: string; readonly owner: string; readonly inner: number; readonly grids: readonly { readonly height: number; readonly methods: readonly Method[] }[] };
  readonly done?: { readonly title: string; readonly body: string; readonly actions: readonly Action[]; readonly notice: string };
}

const noop = () => {};
const box = (height: number, extra: CSSProperties = {}): ReactNode => <span style={{ display: "block", height, flexShrink: 0, ...extra }} />;
const spec = (action: Action, index: number): SiteActionSpec => ({ id: `${index}-${action.label}`, label: action.label, tone: action.tone as SiteActionTone, href: action.href, disabled: action.disabled, icon: action.icon ? glyph.check : undefined });

function MainBlock({ block }: { block: Block }): ReactNode {
  const b = block as Record<string, unknown>;
  switch (block.kind) {
    case "head":
      return <CheckoutHead title={b.title as string} lede={b.lede as string} />;
    case "choices": {
      const options = b.options as { title: string; price: string; unit: string; body: string; badge?: string; checked: boolean; disabled: boolean }[];
      return (
        <ChoiceCards
          label={b.label as string}
          value={String(options.findIndex((option) => option.checked))}
          options={options.map((option, index) => ({ value: String(index), title: option.title, price: option.price, unit: option.unit, body: option.body, badge: option.badge, disabled: option.disabled }))}
          mark={glyph.check}
          onValueChange={noop}
        />
      );
    }
    case "row": {
      const control = b.switch as { label: string; options: { label: string; pressed: boolean; disabled: boolean }[] } | undefined;
      const locked = control !== undefined && control.options.every((option) => option.disabled);
      return (
        <CheckoutRow note={b.note as string | undefined}>
          {control !== undefined ? (
            <SegmentedSwitch
              label={control.label}
              value={String(control.options.findIndex((option) => option.pressed))}
              options={control.options.map((option, index) => ({ value: String(index), label: option.label, disabled: !locked && option.disabled }))}
              disabled={locked}
              onValueChange={noop}
            />
          ) : null}
          {b.saving !== undefined ? <SavingTag>{b.saving as string}</SavingTag> : null}
        </CheckoutRow>
      );
    }
    case "panel": {
      const meter = b.meter as { share: number; label: string; start: string; startBold: boolean; end: string } | undefined;
      const features = b.features as { text: string; included: boolean }[];
      return (
        <SitePanel title={b.title as string}>
          {meter !== undefined ? <QuotaMeter share={meter.share} label={meter.label} start={meter.startBold ? <b>{meter.start}</b> : meter.start} end={meter.end} /> : null}
          {features.length > 0 ? <FeatureList columns={b.columns as 1 | 2} items={features.map((feature) => ({ key: feature.text, label: feature.text, included: feature.included }))} /> : null}
        </SitePanel>
      );
    }
    case "order": {
      const line = (entry: { label: string; amount: string } | undefined, key: string) => (entry === undefined ? undefined : { key, label: entry.label, amount: entry.amount });
      const lines = b.lines as { label: string; amount: string }[];
      return (
        <OrderSummary
          title={b.title as string}
          live={b.live as string}
          lines={lines.map((entry, index) => ({ key: String(index), label: entry.label, amount: entry.amount }))}
          tax={line(b.tax as { label: string; amount: string } | undefined, "tax")}
          total={line(b.total as { label: string; amount: string }, "total") as { key: string; label: string; amount: string }}
          note={b.note as string}
        />
      );
    }
    case "consents": {
      const all = b.all as { label: string; checked: boolean };
      const items = b.items as { label: string; badge: string; checked: boolean; view?: string }[];
      return (
        <ConsentChecklist
          all={all}
          badge={items[0]?.badge ?? ""}
          items={items.map((item) => ({ key: item.label, label: item.label, checked: item.checked, view: item.view !== undefined ? <SiteTextAction kind="muted" href="/terms">{item.view}</SiteTextAction> : undefined }))}
          onAllChange={noop}
          onItemChange={noop}
        />
      );
    }
    case "again":
      return (
        <ConsentAgain note={b.note as string | undefined}>
          <SiteCheckbox checked={b.checked as boolean} disabled={b.disabled as boolean} onCheckedChange={noop} label={b.label as string} required badge={b.badge as string} />
        </ConsentAgain>
      );
    case "cta": {
      const action = b.action as Action;
      return <SiteAction {...spec(action, 0)} size="lg" block={action.block} />;
    }
    case "chain":
      return (
        <ProgressChain
          title={b.title as string}
          steps={(b.steps as string[]).map((label) => ({ key: label, label }))}
          done={b.done as number}
          doneMark={glyph.check}
          runningMark={<SiteSpinner />}
          ready={b.ready as string | undefined}
          actions={(b.actions as Action[]).map(spec)}
          note={b.note as string | undefined}
        />
      );
    default:
      throw new Error(`checkout fixture: no part draws a ${block.kind} block`);
  }
}

export function CheckoutFixture({ locale = "en", story = "interactive" }: CheckoutFixtureProps) {
  const shell = shellCopy[locale];
  const data = (copyFile as unknown as Record<string, Story>)[`web-billing-checkout--${story}|${locale}`];
  if (data === undefined) throw new Error(`checkout fixture: no copy for ${story} in ${locale}`);
  const frame = data.frame;
  const grids = frame?.grids ?? [];
  const methodsHeight = grids.reduce((sum, grid) => sum + grid.height, 0);
  // The provider draws the rest of its frame: one box of the height the methods leave.
  const rest = frame === undefined ? 0 : frame.inner - methodsHeight;
  return (
    <SiteWindow
      page="checkout"
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
          actions={data.signedIn ? undefined : visitorActions(shell)}
          account={data.signedIn ? { label: shell.myAccount, name: "Taylor", href: "/account" } : undefined}
        />
      }
      footer={<SiteFooter owner={shell.company} linksLabel={shell.legal} links={shell.footerLinks} language={data.language ? languagePlace : undefined} theme={data.language ? themePlace(locale) : undefined} />}
    >
      {data.done !== undefined ? (
        <SitePage rhythm="done">
          <DonePanel mark={glyph.check} title={data.done.title} body={data.done.body} actions={data.done.actions.map(spec)} notice={data.done.notice} />
        </SitePage>
      ) : (
        <SitePage rhythm="steps">
          <Stepper label="Checkout steps" steps={(data.steps ?? []).map((step) => ({ key: step.label, label: step.label }))} current={data.current ?? 0} doneMark={glyph.check} caption={data.caption ?? ""} />
          <CheckoutLayout
            main={(data.main ?? []).map((block, index) => (
              <MainBlock key={index} block={block} />
            ))}
            summary={
              <ProviderFrame label={frame?.label ?? ""} owner={frame?.owner}>
                {grids.map((grid, index) => (
                  <MethodGrid key={index} methods={grid.methods.map((method) => ({ key: method.name, name: method.name, mark: method.mark, about: method.about, pressed: method.pressed, disabled: method.disabled, wide: method.wide }))} />
                ))}
                {rest > 0 ? box(rest) : null}
              </ProviderFrame>
            }
          />
        </SitePage>
      )}
    </SiteWindow>
  );
}

export default CheckoutFixture;
