import { useEffect, useRef, useState } from "react";
import { SearchIcon } from "lucide-react";
import {
  Flex,
  Input,
  makeFilterKey,
  SearchOperator,
  type CrudListFilters,
} from "@simplix-react/ui";

import { useDebouncedValue } from "@simplix-react/headless";

/**
 * How long typing has to stop before the box asks the server.
 *
 * <p>Long enough that a name typed at speed is one request rather than four, short enough that a
 * reader who stops to look at the rows is not waiting on the box.
 */
const SETTLE_MS = 350;

export interface ListQuickSearchProps {
  /** The list state the box commits into — the same state the badges and the popover read. */
  readonly filters: CrudListFilters;
  /**
   * The searchable field the box narrows by.
   *
   * <p>Give it the field a popover filter already offers, deliberately: the key is built the same
   * way the bar builds it, so the box and that filter are one value — what is typed here shows as
   * that filter's badge, and clearing the badge empties the box.
   */
  readonly field: string;
  /** Which operator the box commits under. @defaultValue `CONTAINS` */
  readonly operator?: SearchOperator;
  /** What the box is for, in the words the frame draws — 「이름으로 찾기」. */
  readonly placeholder: string;
  /** How wide the box is drawn. */
  readonly width?: number;
}

/**
 * The search box a list carries in its own filter bar (P-02 · `filterBar({ search })`).
 *
 * <p><b>Why a list has one at all when the popover already offers the field.</b> Somebody arrives
 * at a queue holding a name — 「박근로가 두 번 들어와 있다는데 어느 짝이냐」 — and the popover costs
 * a press to open, a field to find and a press to apply before the first character is typed. The
 * console's own global search is the other place they could go, and going there loses the tab and
 * the filters they arrived with.
 *
 * <p><b>It is not a second search form.</b> It writes the same committed value a popover field
 * writes, into the same state, so the bar draws one badge for it and clearing that badge empties
 * this box (frontend invariant #41). What it is not is a free-text search across several columns:
 * the searchable grammar this console speaks narrows one field per condition and ANDs them, so a
 * box claiming to look in two places would be looking in neither.
 */
export function ListQuickSearch({
  filters,
  field,
  operator = SearchOperator.CONTAINS,
  placeholder,
  width = 220,
}: ListQuickSearchProps) {
  const key = makeFilterKey(field, operator);
  const committed = filters.committedValues[key];
  const committedText = typeof committed === "string" ? committed : "";
  const [typed, setTyped] = useState(committedText);
  const settled = useDebouncedValue(typed, SETTLE_MS);

  // What this box last committed. Without it the effect below cannot tell 「the reader cleared the
  // badge」 from 「the value I just committed came back to me」, and every commit would be undone on
  // the render that follows it.
  const sent = useRef(committedText);

  // The badge and the box are one value, so the badge's ✖ has to empty the box — and a filter
  // arriving in the address has to fill it. Only a change nothing here caused is followed.
  useEffect(() => {
    if (committedText === sent.current) return;
    sent.current = committedText;
    setTyped(committedText);
  }, [committedText]);

  useEffect(() => {
    if (settled === sent.current) return;
    sent.current = settled;
    // Cleared to nothing means the condition goes, rather than a `contains ""` the server has to
    // decide what to do with.
    filters.commitValue(key, settled.length > 0 ? settled : undefined);
  }, [settled, key, filters]);

  return (
    <Flex align="center" gap="xs" className="relative">
      <SearchIcon
        className="pointer-events-none absolute start-2 size-3.5 text-muted-foreground"
        aria-hidden
      />
      <Input
        type="search"
        value={typed}
        onChange={(event) => setTyped(event.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="h-7 ps-7 text-sm"
        style={{ width }}
      />
    </Flex>
  );
}
