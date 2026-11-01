import { Fragment, useMemo, type ReactNode } from "react";
import { Stack, usePageHeader } from "@simplix-react/ui";

import {
  CountedTab,
  PageTabPanel,
  PageTabStrip,
  PageTabs,
  SettingsTabs,
  SettingsTiles,
} from "../layout";
import { Badge, Button, Flex } from "@simplix-react/ui";
import { Container, Heading, TabsTrigger } from "@simplix-react/ui";
import { NoticeCard, UnbuiltTab } from "../notice";
import { PhoneScreenColumn, useConsoleOnAPhone } from "../shell";
import { usePageBackLink } from "./page-back";
import { PageMeta } from "./page-meta";
import type {
  ConsoleSearch,
  PageBlocks,
  PageHelpSpec,
  PageNarrowingSpec,
  PageSeam,
  PageSlot,
  PageSpec,
} from "./types";

interface ConsolePageProps {
  /** What this page is, declared. Generated code writes this and nothing else. */
  readonly spec: PageSpec;
  /** What this page departs from the pattern in. Hand-written, and usually absent. */
  readonly blocks?: PageBlocks;
  /**
   * The address this page is open at, and how to change it.
   *
   * <p>The whole address rather than one field of it: the tab and the explanation are both things
   * a reader can be looking at, and a pattern that owns where they are drawn has to own where they
   * are kept too. A page hands this over once and writes no navigation of its own.
   */
  readonly search?: ConsoleSearch;
  readonly onNavigate?: (search: ConsoleSearch) => void;
}

/**
 * The shape every console list screen takes: a header, figures, status cards, a notice, a window, tabs, a body.
 *
 * <p><b>The order is the pattern.</b> Sixty screens of this console drew these same parts and
 * seven of them drew two in the other order, which no reviewer catches by eye and no reader can
 * make sense of. Declared here once, the order is not a thing a screen can get wrong.
 *
 * <p><b>An absent part is not drawn.</b> A page with no figures passes no `tiles` and the row is
 * not there — it is never an empty row, and never a row of zeroes.
 *
 * <p><b>What a page does differently is named, not inlined.</b> `blocks.override` replaces one
 * part, `blocks.insert` adds one at a named seam, and both live in the page's own
 * `page.blocks.tsx`. That file is the whole of what a page departs from this pattern in, which is
 * what makes the departures countable: a slot many pages override belongs in the pattern, and one
 * a single page overrides is a genuine one-off.
 */
export function ConsolePage({
  spec,
  blocks,
  // A screen whose whole state is its route — a preview of one wording, a printable report — has
  // no tab, no explanation and no narrowing, so it has no address to hand over either.
  search = {},
  onNavigate = () => {},
}: ConsolePageProps) {
  const onAPhone = useConsoleOnAPhone();
  const at = (slot: PageSlot, drawn: ReactNode): ReactNode =>
    slot in (blocks?.override ?? {}) ? blocks?.override?.[slot] : drawn;
  const seam = (name: PageSeam): ReactNode => blocks?.insert?.[name];

  // A list of facts is drawn as one element per fact. Keyed by its words, so the header sees the
  // same description on every render that does not change them.
  const metaKey = Array.isArray(spec.description) ? spec.description.join("\u0000") : undefined;
  const metaLine = useMemo(
    () => (metaKey === undefined ? undefined : <PageMeta items={metaKey.split("\u0000")} />),
    [metaKey],
  );
  const description = metaLine ?? (typeof spec.description === "string" ? spec.description : undefined);

  usePageHeader({
    title: spec.title,
    // Read off the menu tree rather than off the page: a screen with a row of its own is returned
    // to by pressing that row, and only a screen without one owes the reader a breadcrumb.
    back: usePageBackLink(spec.backParams),
    description,
    actions: at("actions", spec.actions),
  });

  const tabs = [...(spec.tabs ?? []), ...(blocks?.tabs ?? [])].filter((one) => one.when !== false);
  // One tab is a body: a strip that offers a single choice is a row saying nothing.
  const stripped = tabs.length > 1;
  // An unbuilt tab is drawn inert, so the strip cannot put a reader inside it — and the address
  // must not either. Its pane holds whatever the page draws for a tab that IS built, so a reader
  // who typed or bookmarked one lands on a disabled tab over somebody else's rows, or over the
  // refusal the server answers a narrowing nothing supports yet. Named in the address, it falls
  // back to the tab the page opens on; `tabs[0]` is never itself unbuilt, because a screen whose
  // first tab is unbuilt would open on a pane nobody can leave.
  const addressed = tabs.find((one) => one.key === search.tab);
  const current = addressed && !addressed.unbuilt ? addressed.key : tabs[0]?.key;

  const tiles = at(
    "tiles",
    spec.tiles && spec.tiles.length > 0 ? (
      <SettingsTiles
        tiles={spec.tiles}
        columns={spec.tilesColumns ?? 4}
        reorderKey={spec.tilesReorderKey}
        title={spec.tilesTitle}
        loading={spec.tilesLoading}
        folded={search.id !== undefined}
      />
    ) : null,
  );
  const helps = (Array.isArray(spec.help) ? spec.help : [spec.help]).filter(
    (one): one is PageHelpSpec => Boolean(one),
  );
  const narrowings = (spec.narrowing ?? []).filter(
    (one): one is PageNarrowingSpec => Boolean(one),
  );
  const notices = (Array.isArray(spec.notice) ? spec.notice : [spec.notice]).filter(
    (one): one is NonNullable<typeof one> => Boolean(one),
  );
  const notice = at(
    "notice",
    notices.length === 0
      ? null
      : notices.map((one) => (
          <NoticeCard
            key={one.key}
            noticeKey={one.key}
            kind={one.kind}
            title={one.title}
            hint={one.hint}
            trailing={one.trailing}
            actionLabel={one.actionLabel}
            onAction={one.onAction}
            actions={one.actions}
          >
            {one.children}
          </NoticeCard>
        )),
  );

  // A settings body is as tall as it is and the page scrolls; a list body takes what height is
  // left and scrolls inside. Only the container differs — the strip and the panel are the same
  // two components either way, which is what the twelve settings screens of this console already
  // do with their strip and what eight of them stopped doing with their panel.
  // `record` fills only while a record is open: the list-detail owns the height then, and the
  // page owns it while the list stands alone.
  const flowing =
    spec.layout === "flow" || (spec.layout === "record" && search.id === undefined);
  const TabSet = flowing ? SettingsTabs : PageTabs;

  const body = at(
    "body",
    tabs.length === 0 ? (
      spec.body
    ) : stripped ? (
      <TabSet
        value={current ?? ""}
        onValueChange={(next) =>
          // Another tab is another set of rows, so a record standing open belongs to the set the
          // reader just left. `id` and `mode` go with it unless the page says its tabs show one
          // record from several sides.
          onNavigate(
            spec.tabClosesRecord === false
              ? { ...search, tab: next }
              : { ...search, tab: next, id: undefined, mode: undefined },
          )
        }
      >
        {at(
          "tabStrip",
          <PageTabStrip>
            {tabs.map((one) =>
              one.link ? (
                <TabsTrigger key={one.key} value={one.key} asChild>
                  {one.link}
                </TabsTrigger>
              ) : one.unbuilt ? (
                <UnbuiltTab key={one.key} value={one.key} label={one.label} count={one.count} />
              ) : (
                <CountedTab key={one.key} value={one.key} label={one.label} count={one.count} />
              ),
            )}
          </PageTabStrip>,
        )}
        {tabs.map((one) => (
          <PageTabPanel key={one.key} value={one.key}>
            {one.body ?? spec.body}
          </PageTabPanel>
        ))}
      </TabSet>
    ) : (
      tabs[0]?.body
    ),
  );

  // A phone is a different screen rather than a narrower one, so the page hands over its own.
  if (onAPhone && spec.phone !== undefined) {
    return <PhoneScreenColumn>{spec.phone}</PhoneScreenColumn>;
  }

  // Nothing to show: the record is not there, or the reader may not read it. The header is already
  // set — a page saying a record's name over an empty column is what this replaces.
  // The cap holds over every state this page can be in: a state panel at full width beside a
  // capped body is the same screen drawn two ways.
  const capped = (drawn: ReactNode): ReactNode =>
    spec.width ? <Container size={spec.width}>{drawn}</Container> : drawn;

  if (spec.fallback !== undefined) {
    return capped(
      <Stack flex={!flowing} gap="md">
        {spec.fallback}
      </Stack>,
    );
  }

  return capped(
    <Stack flex={!flowing} gap="md">
      {spec.steps}
      {seam("beforeTiles")}
      {tiles}
      {seam("afterTiles")}
      {/* The status cards lead, and the notices they raise sit directly under them: a notice reads as
          being about the figures it follows, never as a banner the figures hang under. */}
      {at("cards", spec.cards)}
      {notice}
      {seam("afterNotice")}
      {at("timeRange", spec.timeRange)}
      {helps.map((one) => {
        const field = one.field ?? "help";
        return (
          <Fragment key={`${field}:${one.key}`}>
            {one.render({
              open: (search as Record<string, string | undefined>)[field] === one.key,
              onOpenChange: (open) =>
                onNavigate({ ...search, [field]: open ? one.key : undefined }),
            })}
          </Fragment>
        );
      })}
      {narrowings.length > 0 ? (
        <Flex align="center" gap="xs" wrap>
          {narrowings.map((one) => (
            <Flex key={one.label} align="center" gap="xs">
              <Badge variant="outline">{one.label}</Badge>
              {one.onClear && one.clearLabel ? (
                <Button variant="outline" size="sm" onClick={one.onClear}>
                  {one.clearLabel}
                </Button>
              ) : null}
            </Flex>
          ))}
        </Flex>
      ) : null}
      {seam("beforeTabs")}
      {spec.bodyTitle ? <Heading level={3}>{spec.bodyTitle}</Heading> : null}
      {body}
      {seam("afterBody")}
      {spec.dialogs}
    </Stack>,
  );
}
