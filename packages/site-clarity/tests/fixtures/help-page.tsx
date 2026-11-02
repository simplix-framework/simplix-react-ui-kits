// The help centre composed from the site parts, with the words of the reference the kit's
// measurements were taken from (help-copy.json, read off the reference in English and Korean). It is
// the page `scripts/site-demo.mjs` renders for the rendered checks. The words are the reference
// product's own, kept as written because where a line wraps is part of what is measured. The contact
// form's controls are the form segment's, so their looks are measured with the form.
import { ArticleList, AttachBox, CategoryGrid, ContactForm, ContactPanel, ContactSent, FieldRow, FormField, SearchHero, SiteColumns, SiteSearch, StatusLine } from "@simplix-react-ui-kits/site-core/help";
import { SiteCheckbox, SiteInput, SiteSelect, SiteTextarea } from "@simplix-react-ui-kits/site-core/form";
import { SiteChip, SitePage } from "@simplix-react-ui-kits/site-core/page";
import { SiteBar, SiteFooter, SiteWindow } from "@simplix-react-ui-kits/site-core/shell";

import copyFile from "./help-copy.json";
import { glyph, languagePlace, shellCopy, type Locale } from "./shell-copy";

/** What the help centre is drawn with. */
export interface HelpFixtureProps {
  readonly locale?: Locale;
  /** What is typed in the search: nothing, the reference's query, or words nothing matches. */
  readonly search?: "none" | "match" | "empty";
  /** Where the question to support stands. */
  readonly contact?: "closed" | "open" | "sent";
  /** A signed-in reader, whose account stands in the bar. */
  readonly signedIn?: boolean;
}

const send = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
    <path d="M4 12 20 4l-4 16-4-6z" />
  </svg>
);

export function HelpFixture({ locale = "en", search = "none", contact = "closed", signedIn = false }: HelpFixtureProps) {
  const t = copyFile[locale];
  const shell = shellCopy[locale];
  const query = search === "match" ? t.query : search === "empty" ? t.emptyQuery : "";
  const matches = search === "match" ? t.results.map(([title, meta]) => ({ key: title ?? "", title, meta })) : [];
  const f = t.form;
  return (
    <SiteWindow
      page="help"
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
            { key: "help", label: shell.help, href: "/help", current: true },
          ]}
          action={signedIn ? undefined : { id: "start", label: shell.startFree, href: "/signup" }}
          account={signedIn ? { label: shell.myAccount, name: "Taylor", href: "/account" } : undefined}
        />
      }
      footer={<SiteFooter owner={shell.company} linksLabel={shell.legal} links={shell.footerLinks} language={languagePlace} />}
    >
      <SearchHero
        status={<StatusLine>{t.status}</StatusLine>}
        title={t.title}
        lede={t.lede}
        suggestionsLabel={t.tryLabel}
        suggestions={t.tries.map((label) => ({ id: label, label }))}
        search={
          <SiteSearch
            label={t.searchLabel}
            placeholder={t.placeholder}
            value={query}
            onValueChange={() => {}}
            matches={matches}
            onPick={() => {}}
            foundLabel={t.found}
            keysLabel={t.keys}
            emptyLabel={t.empty}
            listId="help-results"
            mark={glyph.chevron}
          />
        }
      />
      <SitePage rhythm="spaced">
        <CategoryGrid
          categories={t.categories.map((category) => ({
            key: category.title,
            title: category.title,
            count: category.count,
            articles: category.articles.map((title) => ({ key: title, title, href: `/help/${encodeURIComponent(title)}` })),
          }))}
        />
        <SiteColumns>
          <ArticleList
            title={t.popular}
            badge={<SiteChip>{t.week}</SiteChip>}
            items={t.mostRead.map(([, title, meta]) => ({ key: title ?? "", title, meta, href: `/help/${encodeURIComponent(title ?? "")}` }))}
            mark={glyph.chevron}
          />
          {contact === "closed" ? (
            <ContactPanel title={t.closed.title} icon={send} body={t.closed.body} action={{ id: "open", label: t.closed.open }} hours={t.closed.hours} />
          ) : contact === "sent" ? (
            <ContactSent title={t.sent.title} ticket={<SiteChip>{t.sent.ticket}</SiteChip>} body={t.sent.body} mark={glyph.check} action={{ id: "another", label: t.sent.another }} />
          ) : (
            <ContactForm title={f.title} icon={send} submit={{ id: "send", label: f.send, disabled: true }} cancel={{ id: "close", label: f.close }} note={f.needFields}>
              <FieldRow>
                <FormField as="group" label={f.category}>
                  <SiteSelect label={f.category} options={[{ value: "voice", label: f.categoryValue }]} value="voice" onValueChange={() => {}} block />
                </FormField>
                <FormField label={f.replyTo}>
                  <SiteInput value={f.email} readOnly />
                </FormField>
              </FieldRow>
              <FormField label={f.subject}>
                <SiteInput value="" readOnly placeholder={f.subjectPlaceholder} />
              </FormField>
              <FormField label={f.body}>
                <SiteTextarea value="" readOnly rows={4} placeholder={f.bodyPlaceholder} />
              </FormField>
              <AttachBox
                control={(label) => <SiteCheckbox checked={false} onCheckedChange={() => {}} label={label} />}
                title={f.attach}
                badge={
                  <SiteChip tone="accent" dot>
                    {f.recommended}
                  </SiteChip>
                }
                about={f.attachAbout}
              />
            </ContactForm>
          )}
        </SiteColumns>
      </SitePage>
    </SiteWindow>
  );
}

export default HelpFixture;
