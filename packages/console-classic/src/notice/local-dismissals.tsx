import { useMemo, useState, type ReactNode } from "react";

import { NoticeDismissalsProvider, type NoticeDismissals } from "./dismissal-source";

/**
 * Notice dismissals kept for as long as the page is open, with no server behind them.
 *
 * <p>For a page drawn outside an installation (a mockup, a story): a card the reader puts away goes
 * into the header's list and comes back from there, exactly as it does against an installation's
 * settings API, and the set is gone when the page reloads.
 */
export function LocalNoticeDismissalsProvider({ children }: { readonly children: ReactNode }) {
  const [hiddenKeys, setHiddenKeys] = useState<readonly string[]>([]);
  const value = useMemo<NoticeDismissals>(
    () => ({
      ready: true,
      hiddenKeys,
      isHidden: (noticeKey) => hiddenKeys.includes(noticeKey),
      hide: (noticeKey) => setHiddenKeys((keys) => (keys.includes(noticeKey) ? keys : [...keys, noticeKey])),
      show: (noticeKey) => setHiddenKeys((keys) => keys.filter((key) => key !== noticeKey)),
    }),
    [hiddenKeys],
  );
  return <NoticeDismissalsProvider value={value}>{children}</NoticeDismissalsProvider>;
}
