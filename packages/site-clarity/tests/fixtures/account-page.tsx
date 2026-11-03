// My account composed from the site parts, with the words of the reference the kit's measurements
// were taken from. The reference's sections were read off the rendered reference into blocks
// (account-copy.json: per story and language, the section list, the standing notice and the
// section's blocks in drawing order), and this page draws each block with the part that draws it.
// The words are the reference product's own, kept as written because where a line wraps is part of
// what is measured. It is the page `scripts/site-demo.mjs` renders for the rendered checks.
import type { ReactNode } from "react";
import type { SiteActionSpec, SiteActionTone } from "@simplix-react-ui-kits/site-core/action";
import { AccountLayout, DaySeries, IdentityRow, PanelLine, QuotaMeter, SectionHead, SectionNav, SettingsActions, SettingsBox, SettingsRow, SettingsRows, SettingsText, SitePanel, TableActions, TableCard } from "@simplix-react-ui-kits/site-core/account";
import { ChoiceCards } from "@simplix-react-ui-kits/site-core/checkout";
import { ConfirmByTyping, FormField, SiteInput, SiteSelect, SiteTextarea } from "@simplix-react-ui-kits/site-core/form";
import { NoticeBanner } from "@simplix-react-ui-kits/site-core/legal";
import { SiteCaption, SiteChip, type SiteChipTone, SitePage, SiteTextAction } from "@simplix-react-ui-kits/site-core/page";
import { SiteBar, SiteFooter, SiteWindow } from "@simplix-react-ui-kits/site-core/shell";

import copyFile from "./account-copy.json";
import { glyph, languagePlace, type Locale, shellCopy, themePlace, visitorActions } from "./shell-copy";

/** What My account is drawn with: a reference story's section, in a language. */
export interface AccountFixtureProps {
  readonly locale?: Locale;
  /** The reference story whose section is drawn (its id without the group). */
  readonly story?: string;
  /** Read by the measuring runner only: whether the reference's bar holds an account. */
  readonly signedIn?: boolean;
}

interface Action {
  readonly label: string;
  readonly tone: string;
  readonly size: string;
  readonly href?: string;
  readonly disabled: boolean;
  readonly icon: boolean;
  readonly name?: string;
}
interface Chip {
  readonly tone: string;
  readonly text: string;
  readonly dot: boolean;
}
type Cell = { text: string } | { chip: Chip } | { actions: Action[]; lone?: boolean };
interface Block {
  readonly kind: string;
  readonly [key: string]: unknown;
}
interface Story {
  readonly signedIn: boolean;
  readonly nav: readonly { readonly label: string; readonly current: boolean; readonly danger: boolean }[];
  readonly standing: Block | null;
  readonly blocks: readonly Block[];
}

const SECTION_KEYS = ["sub", "credits", "receipts", "security", "voice", "data", "leave"];
const noop = () => {};

// The reference's copy names no reason for a disabled action, so the action's own words stand in for
// it: the reason is read by a screen reader only and draws nothing a reading measures.
const spec = (action: Action, index: number): SiteActionSpec & { readonly reason: string } => ({
  id: `${index}-${action.label}`,
  label: action.label,
  tone: action.tone as SiteActionTone,
  href: action.href,
  disabled: action.disabled,
  reason: action.label,
  name: action.name,
  icon: action.icon ? glyph.chevron : undefined,
});
const chipOf = (chip: Chip | undefined): ReactNode =>
  chip === undefined ? undefined : (
    <SiteChip tone={chip.tone as SiteChipTone} dot={chip.dot}>
      {chip.text}
    </SiteChip>
  );
const cellOf = (cell: Cell): ReactNode => ("text" in cell ? cell.text : "chip" in cell ? chipOf(cell.chip) : <TableActions actions={cell.actions.map(spec)} />);

function BlockView({ block }: { block: Block }): ReactNode {
  const b = block as Record<string, unknown>;
  switch (block.kind) {
    case "head":
      return <SectionHead level={b.level as 2 | 3}>{b.text as string}</SectionHead>;
    case "rows":
      return (
        <SettingsRows>
          {(b.rows as { title: string; badge?: Chip; meta?: string; actions: Action[] }[]).map((row) => (
            <SettingsRow key={row.title} title={row.title} badge={chipOf(row.badge)} meta={row.meta} actions={row.actions.map(spec)} />
          ))}
        </SettingsRows>
      );
    case "banner":
      return (
        <NoticeBanner tone={b.tone as "info" | "good" | "warn" | "bad"} mark={glyph.check} title={b.title as string} actions={(b.actions as Action[]).map(spec)}>
          {b.body as string | undefined}
        </NoticeBanner>
      );
    case "table": {
      const columns = (b.columns as string[]).map((label, index) => ({ key: `c${index}`, label }));
      return (
        <TableCard
          label={b.label as string}
          columns={columns}
          rows={(b.rows as Cell[][]).map((cells, row) => ({ key: String(row), cells: Object.fromEntries(cells.map((cell, index) => [`c${index}`, cellOf(cell)])) }))}
        />
      );
    }
    case "panel": {
      const [first, ...rest] = b.blocks as Block[];
      const titled = first?.kind === "head";
      return (
        <SitePanel label={b.label as string | undefined} title={titled ? ((first as Record<string, unknown>).text as string) : undefined}>
          {(titled ? rest : (b.blocks as Block[])).map((child, index) => (
            <BlockView key={index} block={child} />
          ))}
        </SitePanel>
      );
    }
    case "meter":
      return <QuotaMeter share={b.share as number} label={b.label as string} start={b.startBold ? <b>{b.start as string}</b> : (b.start as string)} end={b.endBold ? <b>{b.end as string}</b> : (b.end as string)} />;
    case "line":
      return <PanelLine action={spec(b.action as Action, 0)}>{b.text as string}</PanelLine>;
    case "series": {
      const days = b.days as { label: string; share: number }[];
      return <DaySeries days={days.map((day, index) => ({ key: String(index), value: day.share, label: day.label }))} from={b.from as string} to={b.to as string} />;
    }
    case "text": {
      const inline = b.inline as { before: string; label: string; after: string } | undefined;
      if (b.style === "caption")
        return (
          <SiteCaption>
            {inline ? (
              <>
                {inline.before}
                <SiteTextAction kind="inline" onSelect={noop}>
                  {inline.label}
                </SiteTextAction>
                {inline.after}
              </>
            ) : (
              (b.text as string)
            )}
          </SiteCaption>
        );
      return <SettingsText tone={b.style as "plain" | "muted" | "strong"}>{b.text as string}</SettingsText>;
    }
    case "actions": {
      const actions = b.actions as Action[];
      return <SettingsActions size={actions[0]?.size === "md" ? "md" : "sm"} actions={actions.map(spec)} />;
    }
    case "box": {
      const children = b.blocks as Block[];
      // The account's own deletion is a typed confirmation on a plain card; what it asks besides the
      // typed word (a note, an optional reason) sits between the points and the typed field.
      if (children.some((child) => child.kind === "points")) {
        const [title, points, ...rest] = children as Record<string, unknown>[];
        const input = rest.at(-2);
        const actions = rest.at(-1);
        const asked = rest.slice(0, -2) as Block[];
        const [confirm, cancel] = (actions?.actions as Action[]).map(spec);
        return (
          <ConfirmByTyping
            tone="plain"
            title={title?.text as string}
            points={(points?.points as string[]).map((text) => ({ key: text, text }))}
            label={input?.label as string}
            word="t@example.com"
            value={input?.value as string}
            placeholder={input?.placeholder as string}
            onValueChange={noop}
            confirm={confirm as SiteActionSpec & { readonly reason: string }}
            cancel={cancel as SiteActionSpec}
          >
            {asked.map((child, index) => (
              <BlockView key={index} block={child} />
            ))}
          </ConfirmByTyping>
        );
      }
      return (
        <SettingsBox tone={b.tone as "plain" | "danger"}>
          {children.map((child, index) => (
            <BlockView key={index} block={child} />
          ))}
        </SettingsBox>
      );
    }
    case "identity":
      return <IdentityRow tone="voice" mark={glyph.check} markLabel={b.mark as string} name={b.name as string} meta={b.meta as string} badge={chipOf(b.badge as Chip | undefined)} />;
    case "confirm": {
      const [confirm, cancel] = (b.actions as Action[]).map(spec);
      return (
        <ConfirmByTyping
          title={b.title as string}
          body={b.body as string}
          label={b.label as string}
          word="delete"
          value={b.value as string}
          placeholder={(b.placeholder as string) || undefined}
          onValueChange={noop}
          confirm={confirm as SiteActionSpec & { readonly reason: string }}
          cancel={cancel as SiteActionSpec}
        />
      );
    }
    case "choices": {
      const options = b.options as { title: string; meta: string; checked: boolean; disabled: boolean }[];
      return (
        <ChoiceCards
          size="sm"
          label={b.label as string}
          value={String(options.findIndex((option) => option.checked))}
          options={options.map((option, index) => ({ value: String(index), title: option.title, meta: option.meta, disabled: option.disabled }))}
          onValueChange={noop}
        />
      );
    }
    case "select":
      return (
        <FormField as="group" muted label={b.label as string}>
          <SiteSelect label={b.label as string} options={[]} value={null} placeholder={b.value as string} onValueChange={noop} />
        </FormField>
      );
    case "input":
      return (
        <FormField muted={b.muted as boolean} label={b.label as string}>
          <SiteInput value={b.value as string} placeholder={(b.placeholder as string) || undefined} readOnly />
        </FormField>
      );
    case "textarea":
      return (
        <FormField muted={b.muted as boolean} label={b.label as string}>
          <SiteTextarea value={b.value as string} placeholder={(b.placeholder as string) || undefined} rows={b.rows as number} readOnly />
        </FormField>
      );
    default:
      throw new Error(`account fixture: no part draws a ${block.kind} block`);
  }
}

export function AccountFixture({ locale = "en", story = "subscription--desktop" }: AccountFixtureProps) {
  const shell = shellCopy[locale];
  const data = (copyFile as unknown as Record<string, Story>)[`web-account-${story}|${locale}`];
  if (data === undefined) throw new Error(`account fixture: no copy for ${story} in ${locale}`);
  return (
    <SiteWindow
      page="account"
      bar={
        <SiteBar
          brand={glyph.brand}
          brandHref="/"
          brandLabel={shell.home}
          navLabel={shell.navLabel}
          moreLabel={shell.menu}
          links={[
            { key: "intro", label: shell.intro, href: "/" },
            { key: "pricing", label: shell.pricing, href: "/pricing" },
            { key: "download", label: shell.download, href: "/download" },
            { key: "help", label: shell.help, href: "/help" },
          ]}
          actions={data.signedIn ? undefined : visitorActions(shell)}
          account={data.signedIn ? { label: shell.myAccount, name: "Taylor", href: "/account", current: true } : undefined}
        />
      }
      footer={<SiteFooter owner={shell.company} linksLabel={shell.legal} links={shell.footerLinks} language={languagePlace} theme={themePlace(locale)} />}
    >
      <SitePage>
        <AccountLayout
          nav={<SectionNav label={shell.myAccount} items={data.nav.map((item, index) => ({ key: SECTION_KEYS[index] ?? String(index), label: item.label, href: `/account/${SECTION_KEYS[index] ?? index}`, current: item.current, danger: index === SECTION_KEYS.length - 1 }))} />}
          standing={data.standing !== null ? <BlockView block={data.standing} /> : undefined}
        >
          {data.blocks.map((block, index) => (
            <BlockView key={index} block={block} />
          ))}
        </AccountLayout>
      </SitePage>
    </SiteWindow>
  );
}

export default AccountFixture;
