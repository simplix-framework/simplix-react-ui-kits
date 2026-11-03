// The sign-in server's pages composed from the site parts, with the words of the reference the kit's
// measurements were taken from. Each reference story's card was read off the rendered reference
// into blocks (auth-copy.json: the step, the scheme, the title and the card's blocks in reading
// order), and this page draws each block with the part that draws it. The words are the reference
// product's own, kept as written because where a line wraps is part of what is measured.
import type { ReactNode } from "react";
import { SiteAction, type SiteActionTone } from "@simplix-react-ui-kits/site-core/action";
import { AuthAlert, AuthCard, AuthDoneMark, AuthFieldHead, AuthForm, AuthLink, AuthLinks, AuthOr, AuthPage, AuthProviders, AuthText, PasswordRules, PasswordStrength } from "@simplix-react-ui-kits/site-core/auth";
import { CodeField, FieldNote, FormField, SiteInput } from "@simplix-react-ui-kits/site-core/form";
import { NoticeBanner } from "@simplix-react-ui-kits/site-core/legal";
import { SiteTextAction } from "@simplix-react-ui-kits/site-core/page";

import copyFile from "./auth-copy.json";
import { glyph, type Locale } from "./shell-copy";

/** What a sign-in step is drawn with: a reference story, in a language. */
export interface AuthFixtureProps {
  readonly locale?: Locale;
  /** The reference story drawn (its id without `web-auth-`). */
  readonly story?: string;
}

interface Action {
  readonly label: string;
  readonly tone: string;
  readonly size: string;
  readonly block: boolean;
  readonly disabled: boolean;
  readonly icon: boolean;
  readonly submit: boolean;
  readonly href?: string;
}
type Block = { readonly kind: string } & Record<string, unknown>;
type Item = { text: string } | { link: string; disabled: boolean; button: boolean };
interface Story {
  readonly step: string;
  readonly dark: boolean;
  readonly title: string;
  readonly mark: number;
  readonly blocks: readonly Block[];
}

const noop = () => {};
const mark = (size: number) => <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true"><rect width="32" height="32" rx="8" fill="currentColor" opacity="0.15" /></svg>;
const linkOf = (item: { link: string; disabled: boolean; button: boolean }) => (item.button || item.disabled ? <SiteTextAction disabled={item.disabled} reason={item.link} onSelect={noop}>{item.link}</SiteTextAction> : <SiteTextAction href="#">{item.link}</SiteTextAction>);

function AuthBlock({ block }: { block: Block }): ReactNode {
  const b = block as Record<string, unknown>;
  switch (block.kind) {
    case "text":
      return b.small ? (
        <FieldNote tone={b.tone === "bad" ? "bad" : "muted"} size={b.smallCaption ? "caption" : "inherit"}>
          {b.text as string}
        </FieldNote>
      ) : (
        <AuthText size={b.size as "body" | "caption"} tone={b.tone === "lead" ? "lead" : b.tone === "bad" ? "bad" : b.tone === "muted" ? "muted" : "plain"}>
          {b.tone === "lead" ? glyph.lock : null}
          {b.text as string}
        </AuthText>
      );
    case "alert":
      return <AuthAlert>{b.text as string}</AuthAlert>;
    case "links":
      if (b.layout === "prose")
        return (
          <AuthText size="caption" tone="muted">
            {(b.items as Item[]).map((item, index) => ("link" in item ? <span key={index}>{linkOf(item)}</span> : <span key={index}>{item.text}</span>))}
          </AuthText>
        );
      return (
        <AuthLinks layout={b.layout as "spread" | "inline"}>
          {(b.items as Item[]).map((item, index) => ("link" in item ? <span key={index}>{linkOf(item)}</span> : <span key={index}>{item.text}</span>))}
        </AuthLinks>
      );
    case "link":
      return <AuthLink>{linkOf(b as unknown as { link: string; disabled: boolean; button: boolean })}</AuthLink>;
    case "or":
      return <AuthOr label={b.label as string} />;
    case "providers":
      return (
        <AuthProviders>
          {(b.actions as Action[]).map((action) => (
            <SiteAction key={action.label} id={action.label} label={action.label} href={action.href} tone={action.tone as SiteActionTone} block />
          ))}
        </AuthProviders>
      );
    case "form":
      return (
        <AuthForm gap={b.gap === "none" ? "none" : "fields"}>
          {(b.blocks as Block[]).map((child, index) => (
            <AuthBlock key={index} block={child} />
          ))}
        </AuthForm>
      );
    case "field": {
      const notes = b.notes as { tone: string; text: string }[];
      const strength = b.strength as { score: number; steps: number; label: string } | undefined;
      const rules = b.rules as { label: string; met: boolean }[] | undefined;
      return (
        <FormField label={b.label as string} muted={b.muted as boolean}>
          <SiteInput type={b.type as string} mono={b.mono as boolean} value={b.value as string} placeholder={(b.placeholder as string) || undefined} invalid={b.invalid as boolean} readOnly />
          {notes.map((note) => (
            <FieldNote key={note.text} tone={note.tone === "bad" ? "bad" : "muted"}>
              {note.text}
            </FieldNote>
          ))}
          {strength !== undefined ? <PasswordStrength score={strength.score} steps={strength.steps} label={strength.label} /> : null}
          {rules !== undefined ? <PasswordRules mark={glyph.check} rules={rules.map((rule) => ({ key: rule.label, label: rule.label, met: rule.met }))} /> : null}
        </FormField>
      );
    }
    case "fieldhead":
      return <AuthFieldHead title={b.title as string} hint={b.hint as string} />;
    case "code":
      return <CodeField label={b.label as string} value={b.value as string} length={b.length as number} invalid={b.invalid as boolean} disabled={b.disabled as boolean} onValueChange={noop} />;
    case "codefield":
      return (
        <FormField as="group" label={<span>{b.title as string}</span>}>
          {(b.blocks as Block[]).map((child, index) => (
            <AuthBlock key={index} block={child} />
          ))}
        </FormField>
      );
    case "banner":
      return (
        <NoticeBanner tone={b.tone as "info" | "good" | "warn" | "bad"} mark={glyph.check} title={b.title as string}>
          {b.body as string | undefined}
        </NoticeBanner>
      );
    case "done":
      return <AuthDoneMark>{glyph.check}</AuthDoneMark>;
    case "action": {
      const action = b.action as Action;
      return <SiteAction id={action.label} label={action.label} tone={action.tone as SiteActionTone} size={action.size as "md" | "lg"} block={action.block} disabled={action.disabled} reason={action.label} submit={action.submit} icon={action.icon ? glyph.check : undefined} />;
    }
    default:
      throw new Error(`auth fixture: no part draws a ${block.kind} block`);
  }
}

export function AuthFixture({ locale = "en", story = "sign-in-and-sign-up--sign-in" }: AuthFixtureProps) {
  const data = (copyFile as unknown as Record<string, Story>)[`web-auth-${story}|${locale}`];
  if (data === undefined) throw new Error(`auth fixture: no copy for ${story} in ${locale}`);
  return (
    <AuthPage step={data.step} scheme={data.dark ? "dark" : "light"}>
      <AuthCard title={data.title} mark={data.mark > 0 ? mark(data.mark) : undefined}>
        {data.blocks.map((block, index) => (
          <AuthBlock key={index} block={block} />
        ))}
      </AuthCard>
    </AuthPage>
  );
}

export default AuthFixture;
