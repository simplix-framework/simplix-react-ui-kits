import { useTranslation } from "@simplix-react/i18n/react";

import { recordIsAbsent, recordIsOutOfScope } from "../api";
import { KOREAN_PARTICLES, koreanParticle } from "../i18n";
import { PACKAGE_NAMESPACE } from "./locales";
import { StatePanel } from "./state-panel";

/** Props for {@link UnreadableRecord}. */
export interface UnreadableRecordProps {
  /**
   * What the record is called on this screen, so the sentence names the thing the reader asked
   * for — 「작업」, 「회차」, 「짝」. The particle after it is worked out rather than written in.
   */
  readonly record: string;
  /** Whatever the read handed back, which is what decides which of the three answers this is. */
  readonly error: unknown;
  /** Drawn smaller inside a panel beside a list; the default suits a page. */
  readonly size?: "sm" | "md";
}

/**
 * What a screen says when the record its address named did not come back.
 *
 * <p><b>A silent no-op is the defect this replaces.</b> Three screens reached by an `?id=` answered
 * the same refusal three ways: one raised the console's dialog and drew its comparison with both
 * columns empty, two drew a panel each had written for itself. A reader who followed a colleague's
 * link cannot tell a range boundary from a mistyped id from a deleted record, and a screen that
 * answers with the base list has not mentioned the question they asked.
 *
 * <p><b>The three answers are separated because the server separates them.</b> A record outside
 * the reader's range answers 403 and one that is not there answers 404, so 「범위를 요청하세요」 and
 * 「주소를 확인하세요」 go to the reader they are true of. `isError` alone conflates them, and
 * telling somebody with a mistyped identifier to ask for a range is the original confusion told
 * with more confidence.
 *
 * <p><b>The refusal says what happened and never why.</b> The record exists and this account may
 * not read it; naming the workplace or the owner would leak across the boundary the refusal exists
 * to hold. What it offers instead is the two things the reader can act on — pick another from the
 * list, or ask for the range.
 *
 * <p><b>Not the console's error dialog, and not instead of it.</b> The dialog is the answer to the
 * request that failed and it closes; this is the answer to the question the address asked, and it
 * stays until the reader picks something else.
 *
 * @param props the record's noun on this screen and the error the read handed back
 * @returns the panel
 */
export function UnreadableRecord({ record, error, size = "md" }: UnreadableRecordProps) {
  const { t } = useTranslation(`${PACKAGE_NAMESPACE}/tiles`);
  const kind = recordIsOutOfScope(error) ? "denied" : recordIsAbsent(error) ? "absent" : "failed";
  const object = record + koreanParticle(record, KOREAN_PARTICLES.object);
  return (
    <StatePanel
      icon={kind === "denied" ? "lock" : kind === "absent" ? "search-x" : "unplug"}
      size={size}
      title={t(`unreadable.${kind}Title`, { record: object })}
      description={t(`unreadable.${kind}Body`, { record })}
    />
  );
}
