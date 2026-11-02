import { useId, type ReactNode } from "react";
import { slotAttributes } from "@simplix-react/ui/design";

import { SiteAction, type SiteActionSpec } from "../action/site-action";
import {
  siteCardTextStyle,
  siteCardTitleStyle,
  siteDownloadActionStyle,
  siteDownloadFileStyle,
  siteDownloadGridStyle,
  siteDownloadStyle,
  siteNoticeStyle,
  siteNoticeTitleStyle,
} from "./install.style";

/** Props for {@link DownloadGrid}. */
export interface DownloadGridProps {
  readonly children: ReactNode;
}

/** Downloads side by side, one below the narrow tier. */
export function DownloadGrid({ children }: DownloadGridProps) {
  return <div {...slotAttributes(siteDownloadGridStyle, {})}>{children}</div>;
}

/** Props for {@link DownloadCard}. */
export interface DownloadCardProps {
  /** What the download is for ("Windows"). */
  readonly title: ReactNode;
  /** What it needs and what it installs. */
  readonly body: ReactNode;
  /**
   * The file it gives, its size and what it runs on; while there is no file to give, the line saying
   * so, which describes the disabled action.
   */
  readonly file?: ReactNode;
  /** The download itself; the highlighted card's is the primary action. */
  readonly action?: SiteActionSpec;
  /** The download to take first, outlined in the accent. */
  readonly highlight?: boolean;
}

/** One download: its title, what it needs, its file and its action. A phone draws it without file or action. */
export function DownloadCard({ title, body, file, action, highlight = false }: DownloadCardProps) {
  const fileId = useId();
  return (
    <section {...slotAttributes(siteDownloadStyle, { highlight })}>
      <b {...slotAttributes(siteCardTitleStyle, {})}>{title}</b>
      <p {...slotAttributes(siteCardTextStyle, {})}>{body}</p>
      {file !== undefined ? (
        <span {...slotAttributes(siteDownloadFileStyle, {})} id={fileId}>
          {file}
        </span>
      ) : null}
      {action !== undefined ? (
        <span {...slotAttributes(siteDownloadActionStyle, {})}>
          <SiteAction
            {...action}
            describedBy={action.describedBy ?? (action.disabled === true && file !== undefined ? fileId : undefined)}
            tone={action.tone ?? (highlight ? "primary" : "secondary")}
          />
        </span>
      ) : null}
    </section>
  );
}

/** Props for {@link NoticeCard}. */
export interface NoticeCardProps {
  readonly title: ReactNode;
  readonly body: ReactNode;
}

/** A notice above a page's parts, outlined in the accent ("Open this page on your computer"). */
export function NoticeCard({ title, body }: NoticeCardProps) {
  return (
    <section {...slotAttributes(siteNoticeStyle, {})}>
      <b {...slotAttributes(siteNoticeTitleStyle, {})}>{title}</b>
      <p {...slotAttributes(siteCardTextStyle, {})}>{body}</p>
    </section>
  );
}
