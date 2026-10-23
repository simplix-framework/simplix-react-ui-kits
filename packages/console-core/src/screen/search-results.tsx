import { SearchXIcon } from "lucide-react";
import type { ReactNode } from "react";
import { useTranslation } from "@simplix-react/i18n/react";
import { Card, EmptyState, Flex, Heading, Icon, Stack, Text } from "@simplix-react/ui";

import { ActionButton, NoticeCard, type ActionOrUnbuilt } from "../notice";
import { searchHitStyle } from "./search-results.style";
import { slotAttributes } from "@simplix-react/ui/design";
import { PushEnd } from "../layout/push-edge";

/** One record the search matched. */
export interface SearchHitEntry {
  /** Stable key, and what opening the hit is addressed to. */
  readonly key: string;
  /** What was found, named the way its own screen names it. */
  readonly title: ReactNode;
  /**
   * The passage the term was found in, with the term itself marked.
   *
   * <p>Handed in as segments rather than as marked-up text: a snippet assembled as HTML and set
   * through `dangerouslySetInnerHTML` takes whatever the record contains, and a record here is
   * something an operator typed.
   */
  readonly snippet: readonly SearchSnippetPart[];
  /** Where it came from — the record number, who wrote it, how long it is kept. */
  readonly source: ReactNode;
  /** Opens the record. */
  readonly onOpen?: ActionOrUnbuilt;
}

/** One run of the snippet, either ordinary text or the term that was searched for. */
export interface SearchSnippetPart {
  readonly text: string;
  readonly hit?: boolean;
}

/** Why a search came back with nothing. The three call for three different next moves. */
export type EmptySearchReason = "noMatch" | "outOfRange" | "tokenization";

interface SearchResultsProps {
  readonly hits: readonly SearchHitEntry[];
  /** Why there is nothing, when there is nothing. */
  readonly emptyReason?: EmptySearchReason;
  /** What to do about it — 「부분 일치로 다시 찾기」, 「기간 넓히기」. */
  readonly emptyAction?: ReactNode;
}

/**
 * 검색 결과 (P-32) — records found by their text, each shown in the sentence it was found in.
 *
 * <p><b>A title list is not a search result.</b> The reader is looking for a passage, so the
 * passage and the words either side of it are what says whether this is the record they meant;
 * a list of names makes them open every one.
 *
 * <p><b>Nothing found is three different facts.</b> The word is not in any record, the word is
 * outside the window being searched, or this installation's tokenizer does not split that word —
 * and only the third one needs the reader to search differently. Reporting all three as
 * 「결과가 없습니다」 sends somebody to look for a record that is sitting right there.
 *
 * <p><b>What the reader may not see is not counted either.</b> A result set narrowed by permission
 * says nothing about how much it dropped: the count alone tells the reader something exists, which
 * is the fact the permission was withholding.
 */
export function SearchResults({ hits, emptyReason, emptyAction }: SearchResultsProps) {
  const { t } = useTranslation("common");

  if (hits.length === 0) {
    const reason = emptyReason ?? "noMatch";
    return (
      <Card padding="md">
        <Stack gap="md" align="center">
          <EmptyState
            size="sm"
            icon={<SearchXIcon />}
            title={t(`search.empty.${reason}Title`)}
            description={t(`search.empty.${reason}Body`)}
          />
          {emptyAction}
        </Stack>
      </Card>
    );
  }

  return (
    <Stack gap="sm">
      {hits.map((hit) => (
        <SearchHit key={hit.key} hit={hit} />
      ))}
    </Stack>
  );
}

/**
 * 검색 결과 (P-32) — one hit: what was found, the passage it was found in, and where it came from.
 *
 * <p>Exported on its own because a hit appears outside a result list too — a panel showing the one
 * match for a reference, a dialog offering what a term resolved to — and a hit drawn two ways is
 * two hits to whoever is reading them.
 */
export function SearchHit({ hit }: { readonly hit: SearchHitEntry }) {
  const { t } = useTranslation("common");

  return (
    <Card padding="sm">
      <Stack gap="xs">
        <Flex align="center" gap="sm" wrap>
          <Heading level={6}>{hit.title}</Heading>
          {hit.onOpen && (
            <PushEnd>
              <ActionButton
                behaviour={hit.onOpen}
                variant="outline"
                size="xs"
                label={t("search.open")}
              />
            </PushEnd>
          )}
        </Flex>

        <Text size="caption">
          {hit.snippet.map((part, index) => (
            // The searched term is marked rather than coloured: a reader scanning six hits finds
            // the word by its ground, and colour alone is the one distinction some readers do not
            // get. Keyed by position because a term can legitimately repeat in one snippet.
            <span
              key={`${index}-${part.text}`}
              {...slotAttributes(searchHitStyle, { hit: part.hit })}
            >
              {part.text}
            </span>
          ))}
        </Text>

        <Text size="caption" tone="muted">
          {hit.source}
        </Text>
      </Stack>
    </Card>
  );
}

interface SearchPrecisionNoticeProps {
  /**
   * The constant this card is known by on the screen that draws it.
   *
   * <p>Taken from the caller rather than fixed here, because the card belongs to the screen it
   * stands on: an operator who has read it on the global search screen has not thereby read it on
   * a register's own search. Namespaced by that screen — `search.results.precision`.
   */
  readonly noticeKey: string;
  /** Which languages this installation splits into words, already named by the caller. */
  readonly segmented: string;
  /** Which languages fall back to n-grams, and therefore return loose matches on short words. */
  readonly ngram: string;
}

/**
 * 검색 결과 (P-32) — what this installation's search can and cannot promise.
 *
 * <p><b>The answer depends on the database somebody bought and the language the record was written
 * in.</b> Korean and Japanese are split into words; Vietnamese and Khmer fall back to n-grams, so a
 * short term drags unrelated records in with it. A reader who is not told this reads a loose match
 * as a wrong record and a missing match as missing data.
 *
 * <p><b>A card, because it stands.</b> The sentence is still there a minute after the reader has
 * done nothing, so it goes through `NoticeCard`: the dismissal is remembered for that operator and
 * the header's 알림 control brings it back, rather than the sentence taking the same band above
 * every result set for ever.
 */
export function SearchPrecisionNotice({ noticeKey, segmented, ngram }: SearchPrecisionNoticeProps) {
  const { t } = useTranslation("common");
  return (
    <NoticeCard
      noticeKey={noticeKey}
      kind="info"
      title={t("search.precisionTitle")}
      hint={t("search.precisionBody", { segmented, ngram })}
    />
  );
}
