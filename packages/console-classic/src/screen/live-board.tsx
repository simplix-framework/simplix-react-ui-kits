import { InfoIcon, TriangleAlertIcon } from "lucide-react";
import type { ReactNode } from "react";
import { useTranslation } from "@simplix-react/i18n/react";
import { AlertBanner, Badge, Button, Flex, Stack, Text } from "@simplix-react/ui";

import { KOREAN_PARTICLES, localeParticle } from "../i18n";
import { ActionButton, type ActionOrUnbuilt } from "../notice";

/** Whether the board is still being fed. */
export type FeedState = "connected" | "stale" | "disconnected";

interface LiveBoardStatusProps {
  readonly feed: FeedState;
  /**
   * The instant the values on screen are true as of, already formatted by the caller against the
   * site's own clock. To the second: a board watched for a change is read by how old it is.
   */
  readonly asOf: ReactNode;
  /** How often it refreshes, when it is refreshing. */
  readonly everySeconds?: number;
  /** Whether automatic refresh is running right now. */
  readonly refreshing: boolean;
  /** Turns automatic refresh off and on. */
  readonly onToggleRefresh: () => void;
  /** What is not answering, when something is not — 「KIOSK-02」. */
  readonly stalledSource?: string;
  /**
   * Opens the screen that says why it stopped answering.
   *
   * <p>The banner names the terminal, and naming it is where the reader's next question starts —
   * a notice with no way through to the thing it names makes them go and find it by hand.
   */
  readonly onOpenStalledSource?: ActionOrUnbuilt;
  /** What that screen is called here — 「단말 현황 보기」. */
  readonly openStalledSourceLabel?: string;
  /** When it last answered, already formatted by the caller against the site's own clock. */
  readonly stalledSince?: string;
}

/**
 * 라이브 현황 보드 (P-35) — the line that says whether what is on screen is now.
 *
 * <p><b>This is the pattern's first requirement, not its chrome.</b> Without a stated as-of time
 * and connection state, a board that has stopped updating and a site where nothing is happening
 * are the same picture — and the reader will believe the second one.
 *
 * <p><b>A dropped feed keeps its last values and says they are old.</b> Blanking them reads as
 * 「아무 일 없음」, which is the most dangerous sentence this screen can accidentally say; leaving
 * them unlabelled reads as current, which is the second.
 *
 * <p><b>Automatic refresh has an off switch.</b> A list that shifts under a reader mid-line is a
 * list nobody can read, and the operator who most needs to read one row carefully is the one
 * looking at an alarm.
 */
export function LiveBoardStatus({
  feed,
  asOf,
  everySeconds,
  refreshing,
  onToggleRefresh,
  stalledSource,
  onOpenStalledSource,
  openStalledSourceLabel,
  stalledSince,
}: LiveBoardStatusProps) {
  const { t, locale } = useTranslation("common");

  return (
    <Stack gap="sm">
      <AlertBanner
        tone={feed === "connected" ? "info" : "warning"}
        icon={feed === "connected" ? InfoIcon : TriangleAlertIcon}
        density="hint"
        trailing={
          <Button variant="outline" size="xs" onClick={onToggleRefresh}>
            {refreshing ? t("liveBoard.pause") : t("liveBoard.resume")}
          </Button>
        }
      >
        <Flex align="center" gap="sm" wrap>
          <Text>{asOf}</Text>
          <Text size="caption" tone="muted">
            {t("liveBoard.asOfLabel")}
          </Text>
          <Badge variant={feed === "connected" ? "outline" : "default"}>{t(`liveBoard.feed.${feed}`)}</Badge>
          <Text size="caption" tone="muted">
            {refreshing && everySeconds !== undefined
              ? t("liveBoard.every", { seconds: everySeconds })
              : t("liveBoard.paused")}
          </Text>
        </Flex>
      </AlertBanner>

      {/* Drawn from the source rather than from the feed: a board can be connected and still have
          one terminal that stopped answering, which is exactly the state an operator has to see —
          gating it on the feed hides the common case behind the rare one. */}
      {stalledSource && (
        <AlertBanner
          tone="danger"
          icon={TriangleAlertIcon}
          title={t("liveBoard.lostTitle", {
            source: stalledSource,
            particle: localeParticle(locale, stalledSource, KOREAN_PARTICLES.with),
          })}
          subtitle={
            stalledSince ? t("liveBoard.lostBodySince", { at: stalledSince }) : t("liveBoard.lostBody")
          }
          trailing={
            onOpenStalledSource && (
              <ActionButton
                behaviour={onOpenStalledSource}
                size="sm"
                label={openStalledSourceLabel ?? t("liveBoard.openSource")}
              />
            )
          }
        />
      )}
    </Stack>
  );
}

/** How a row of the board stands against the reader's last look at it. */
export type LiveRowChange = "new" | "changed" | "unchanged";

interface LiveRowMarkProps {
  readonly change: LiveRowChange;
}

/**
 * 라이브 현황 보드 (P-35) — the mark that says this row was not here a moment ago.
 *
 * <p><b>A board is watched, not re-read.</b> Somebody standing in front of it has to see what
 * moved without comparing the whole list to the list they remember, so what is new and what has
 * changed carry a mark of their own and everything else carries none.
 *
 * <p>Renders nothing for an unchanged row — a mark on every row is a mark on none.
 */
export function LiveRowMark({ change }: LiveRowMarkProps) {
  const { t } = useTranslation("common");
  if (change === "unchanged") return null;
  return <Badge variant={change === "new" ? "default" : "outline"}>{t(`liveBoard.change.${change}`)}</Badge>;
}

/** How loudly one line of the ticker is drawn. */
export type LiveNoticeWeight = "action" | "information";

/** One thing that happened, as the ticker lists it. */
export interface LiveNotice {
  readonly key: string;
  /** When, already formatted against the site's clock. */
  readonly at: ReactNode;
  /** What happened. */
  readonly body: ReactNode;
  readonly weight: LiveNoticeWeight;
  /** Whether the reader has seen it. */
  readonly unread?: boolean;
  /** What to do about it, for the ones that need doing something about. */
  readonly action?: ReactNode;
}

/**
 * 라이브 현황 보드 (P-35) — the ticker under the board.
 *
 * <p><b>Something that needs doing is drawn differently from something that merely happened.</b>
 * A ticker where every line has the same weight is a ticker nobody reads, and the line that needed
 * a person goes past with the rest.
 */
export function LiveTicker({ notices }: { readonly notices: readonly LiveNotice[] }) {
  const { t } = useTranslation("common");

  return (
    <Stack gap="xs">
      {notices.map((notice) => (
        <Flex
          key={notice.key}
          align="center"
          gap="sm"
          wrap
          className={notice.weight === "action" ? "rounded-md border border-warning/50 px-2 py-1" : "px-2 py-1"}
        >
          <Text size="caption" tone="muted">
            {notice.at}
          </Text>
          <Text className={notice.weight === "action" ? "font-medium" : undefined}>{notice.body}</Text>
          {notice.unread && <Badge variant="outline">{t("liveBoard.unread")}</Badge>}
          {notice.action && <span className="ml-auto">{notice.action}</span>}
        </Flex>
      ))}
    </Stack>
  );
}
