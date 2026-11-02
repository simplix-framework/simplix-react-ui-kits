import type { ReactNode } from "react";
import { Badge, Card, Flex, Heading, Stack, Text } from "@simplix-react/ui";
import { historyDotStyle, historyLaneStyle, historyLineStyle, historyNodeStyle } from "./history-rail.style";
import { partAttributes, slotAttributes } from "@simplix-react/ui/design";

/**
 * Where a node stands. The four are different facts and are never collapsed into two.
 *
 * <p>`skip` is the one that earns its place: a step that will never happen drawn as `pending`
 * leaves the reader waiting for something that is not coming.
 */
export type HistoryNodeState = "done" | "active" | "pending" | "skip";

/** A process that runs inside one node, drawn as a branch off the rail. */
export interface HistoryLane {
  /** What the branch is — 결재선, 보고 경로, 검사 앞의 자체 점검. */
  readonly title: string;
  /** Its body, already laid out by the caller. */
  readonly body: ReactNode;
}

/** One stop on the rail. */
export interface HistoryNode {
  /** Stable key within the rail. */
  readonly key: string;
  /** What happened, or what has to. */
  readonly label: string;
  readonly state: HistoryNodeState;
  /**
   * How the step ended, where reaching it is not the whole story: a payment that failed, a run held
   * up, a generation that finished. Drawn on the dot; the label says it in words.
   */
  readonly tone?: "danger" | "warning" | "success";
  /** When, or how long is left — drawn beside the label rather than under it. */
  readonly trail?: ReactNode;
  /** Who did it and what it says, including the photographs and the reasoning. */
  readonly body?: ReactNode;
  /** A process inside this node. */
  readonly lane?: HistoryLane;
  /**
   * The set this node belongs to, where the rail holds more than one.
   *
   * <p><b>Some rails are one run and some are several kinds of event on one record.</b> An
   * import's 올림 · 매핑 · 검증 are always the same three and always in that order — they are the
   * run — while a 되돌리기 or a 재시도 that attaches later is a different kind of thing that
   * happened to the same record. Drawn as six loose dots the reader cannot see where the run ends,
   * so the two read as one process that grew two more steps.
   *
   * <p>Consecutive nodes carrying the same group are drawn under one heading; the heading appears
   * only where a rail actually has more than one group, so a single-run rail is unchanged. A rail
   * whose nodes carry none is drawn exactly as it was before this existed.
   */
  readonly group?: string;
}

/**
 * The dot each state is drawn with.
 *
 * <p><b>Not `StatusDot`, and not `Stepline`.</b> The framework's dot carries a tone, a size and an
 * animated ring; it draws neither the hollow circle a `pending` step needs nor the dashed one a
 * `skip` needs, and those two are the distinction this rail exists to make — a step that will never
 * happen drawn as a step that has not happened yet leaves the reader waiting. `Stepline` is the
 * other near-miss: its item is a key and a label, so a node's body, its trail and its branch have
 * nowhere to go. Where these four belong is a `variant` on `StatusDot`; until it has one, the four
 * strings live here and no screen writes them again.
 */
/**
 * The tone each state's heading takes — the same three the dot separates.
 *
 * <p><b>The dot alone was carrying it.</b> Every live state drew its heading in the default tone,
 * so a reader scanning the rail met headings of identical weight and had to find the dot to know
 * where the record is — which is the one thing a rail exists to say, and the one thing a reader
 * scanning rather than studying will not do. `active` takes the primary tone the dot already
 * takes, so the two agree; what is done stays plain because it happened; what has not happened is
 * muted.
 */
const HEADING_TONE: Readonly<Record<HistoryNodeState, "default" | "muted" | "primary">> = {
  done: "default",
  active: "primary",
  pending: "muted",
  skip: "muted",
};

export interface HistoryRailProps {
  readonly nodes: readonly HistoryNode[];
}

/**
 * 히스토리 레일 (P-22) — a record's whole life as one line.
 *
 * <p><b>The line between two dots is the claim.</b> It says one thing followed another, which a
 * stack of cards cannot say — the reader learns how far this has come and what is left without
 * counting anything.
 *
 * <p><b>What has not happened yet is drawn too.</b> A rail that stops at the present tells nobody
 * what to do next, and a node with a deadline carries the time left on it.
 *
 * <p><b>A process inside a step branches sideways.</b> An approval chain flattened into the main
 * rail makes a rejected approval look like a lifecycle running backwards; hung off the node it
 * belongs to, it reads as part of that step.
 *
 * <p><b>Photographs, signatures and the reasoning behind a judgement sit in their node.</b> Moved
 * into a table below or a dialog beside, the reason nobody reads is exactly the one that mattered.
 */
export function HistoryRail({ nodes }: HistoryRailProps) {
  // Only where there is something to separate. One group, or none at all, is one run — and a
  // heading over a rail with nothing to distinguish it from is a label for the obvious.
  const groups = new Set(nodes.map((node) => node.group).filter((name) => name !== undefined));
  const grouped = groups.size > 1;

  return (
    <Stack gap="none">
      {nodes.map((node, index) => (
        <Flex key={node.key} gap="md" align="stretch">
          {/* The rail itself: a dot for this node and the line down to the next one. The line is
              left off the last node so the rail ends rather than trailing into nothing.

              The class names from here down are the rail's geometry — a column one dot wide, a
              hairline that stretches to the next dot, and the padding that keeps that line
              unbroken between nodes. A `gap` on the outer stack would cut the line into segments,
              which is the one thing the rail cannot do, so the space is inside the row. */}
          <Flex direction="column" align="center" className="w-4 shrink-0 self-stretch">
            <span className="size-3 shrink-0" {...slotAttributes(historyDotStyle, { state: node.state, tone: node.tone ?? "none" })} />
            {/* The line runs from just under this dot to the top edge of the next one: it starts a
                hair below the dot and is pulled down by the next dot's top margin, so no gap is left
                where the eye expects the two to join. */}
            {index < nodes.length - 1 && (
              <span
                className="min-h-4 w-0.5 flex-1"
                {...slotAttributes(historyLineStyle, { skipped: node.state === "skip" })}
              />
            )}
          </Flex>

          <Stack
            gap="xs"
            className="min-w-0 flex-1"
            {...partAttributes(historyNodeStyle, { open: index < nodes.length - 1 })}
          >
            {/* The set's name, over the first node of each run of it. Drawn inside the node's own
                column rather than across the rail, so the line down the left stays unbroken —
                cutting it to make room for a heading would take away the one thing the rail
                says. */}
            {grouped && node.group !== undefined && node.group !== nodes[index - 1]?.group && (
              <Text size="caption" tone="muted" weight="medium">
                {node.group}
              </Text>
            )}
            <Flex gap="sm" align="center" wrap>
              {/* **The heading carries the state too, not only the dot.** Drawn one way for all
                  three live states, a reader scanning the rail meets four headings of identical
                  weight and has to find the dot to know where the record is — which is the one
                  thing the rail exists to say. `active` is the step the reader is looking for, so
                  it is the one that is emphasised; `pending` and `skip` are quieter because
                  nothing has happened at them yet. */}
              <Heading level={6} tone={HEADING_TONE[node.state]}>
                {node.label}
              </Heading>
              {node.trail}
            </Flex>
            {node.body}
            {node.lane && (
              <Card padding="sm" {...partAttributes(historyLaneStyle, {})}>
                <Stack gap="xs">
                  <Badge variant="outline">{node.lane.title}</Badge>
                  {node.lane.body}
                </Stack>
              </Card>
            )}
          </Stack>
        </Flex>
      ))}
    </Stack>
  );
}
