import { useEffect, useRef, useState, type ReactNode } from "react";
import { Heading, Text } from "@simplix-react/ui";
import { partAttributes, slotAttributes } from "@simplix-react/ui/design";

import { HistoryRail, type HistoryNode } from "../screen/history-rail";
import { historyAsideLeadStyle, historyAsideStyle, historyLayoutStyle, historyMainStyle } from "./record-history-layout.style";

/** A record's progress through its stages, drawn beside the record while there is room and inside it otherwise. */
export interface RecordHistory {
  /** The history's heading (「진행 이력」). */
  readonly title: string;
  /** What each node says, under the heading (「처리 일시 · 담당자 · 결과」). */
  readonly description?: string;
  readonly nodes: readonly HistoryNode[];
}

/**
 * The width, in pixels, from which a record draws its history beside it. The history takes the
 * aside's width, and the record keeps what is left, which two columns of fields still need.
 */
export const HISTORY_ASIDE_FROM = 800;

/**
 * Whether the element the ref is given is wide enough for the history to stand beside the record.
 * The width is the element's own and not the window's, since a record in a drawer is as narrow as
 * its drawer on a wide screen, and it is read again whenever the element is resized.
 *
 * @param active whether the record has a history at all; nothing is observed without one
 */
export function useHistoryAside(active: boolean) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [wide, setWide] = useState(false);
  useEffect(() => {
    const element = ref.current;
    if (!active || !element) {
      setWide(false);
      return;
    }
    const measure = () => setWide(element.getBoundingClientRect().width >= HISTORY_ASIDE_FROM);
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [active]);
  return { ref, wide };
}

/** The record and, while it is wide, its history beside it. */
export function RecordHistoryLayout({
  layout,
  history,
  children,
}: {
  readonly layout: ReturnType<typeof useHistoryAside>;
  readonly history: RecordHistory;
  readonly children: ReactNode;
}) {
  return (
    <div ref={layout.ref} {...partAttributes(historyLayoutStyle, {})}>
      <div {...partAttributes(historyMainStyle, {})}>{children}</div>
      {layout.wide ? (
        <aside aria-label={history.title} {...slotAttributes(historyAsideStyle, {})}>
          <div {...partAttributes(historyAsideLeadStyle, {})}>
            <Heading level={5}>{history.title}</Heading>
            {history.description ? (
              <Text size="caption" tone="muted">
                {history.description}
              </Text>
            ) : null}
          </div>
          <HistoryRail nodes={history.nodes} />
        </aside>
      ) : null}
    </div>
  );
}
