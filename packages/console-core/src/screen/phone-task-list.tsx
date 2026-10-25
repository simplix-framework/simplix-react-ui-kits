import { ChevronRightIcon } from "lucide-react";
import { useTranslation } from "@simplix-react/i18n/react";
import { AlertBanner, Flex, Stack, StatusBadge, Text } from "@simplix-react/ui";
import { slotAttributes } from "@simplix-react/ui/design";

import { RemainingText } from "../datetime/remaining-text";
import type { RecordBadge } from "../entity/record-value";
import {
  ConsolePhoneShell,
  PhoneEmptyState,
  PhoneRowButton,
  PhoneScreenBody,
  PhoneScreenColumn,
  PhoneScrollArea,
  type ConsolePhoneShellProps,
} from "../shell/phone-shell";
import { PACKAGE_NAMESPACE } from "./locales";
import { orderTasksByDue } from "./phone-step-model";
import { phoneTaskKindStyle } from "./phone-step.style";

/** One task of the day. */
export interface PhoneTask {
  readonly key: string;
  /** What kind of work it is, as the caller words it (a signature, a measurement, a report). */
  readonly kind: string;
  readonly title: string;
  /** A quieter second line: the place, the record it belongs to. */
  readonly subtitle?: string;
  /** When it is due (an RFC 3339 instant); drawn as the time left, and the list is ordered by it. */
  readonly due?: string;
  /** Where the task stands. */
  readonly badge?: RecordBadge;
  /** Whether it is finished; a row not finished is accented. */
  readonly done?: boolean;
  /**
   * The name of the screen the row opens, such as 「서명」. Absent for a row that only states a fact
   * (a qualification and its expiry on a profile): it is drawn read-only, with its due date only
   * when it has one.
   */
  readonly opens?: string;
  readonly onOpen?: () => void;
}

/** Props for {@link PhoneTaskList}. */
export interface PhoneTaskListProps {
  /** The phone shell the list is drawn in: its title, tabs and active tab. */
  readonly shell: Omit<ConsolePhoneShellProps, "children">;
  /** Today's tasks, in any order; the list draws them earliest due first. */
  readonly tasks: readonly PhoneTask[];
  /** How many submissions made offline are still waiting to be sent; drawn at the top when above zero. */
  readonly syncPending: number;
  /** What the empty list says, in place of the generic line. */
  readonly emptyTitle?: string;
  readonly emptyBody?: string;
  /** The site's clock the time left counts from (RFC 3339 or a Date); the wall clock when absent. */
  readonly now?: string | Date;
}

/**
 * A field worker's tasks for the day on a phone, earliest due first.
 *
 * <p>Each row is one control at least 44px tall: its kind, its title, the time left until it is
 * due, where it stands and the screen it opens. Work submitted offline and not yet sent is counted
 * at the top, so a worker does not leave the site believing it was delivered.
 */
export function PhoneTaskList({ shell, tasks, syncPending, emptyTitle, emptyBody, now }: PhoneTaskListProps) {
  const { t } = useTranslation(PACKAGE_NAMESPACE + "/features");
  const ordered = orderTasksByDue(tasks);
  return (
    <ConsolePhoneShell {...shell}>
      <PhoneScreenColumn>
        <PhoneScrollArea>
          <PhoneScreenBody>
            {syncPending > 0 && (
              <AlertBanner tone="warning" bordered title={t("phoneTask.syncPending", { count: syncPending })} subtitle={t("phoneTask.syncPendingBody")} />
            )}
            {ordered.length === 0 ? (
              <PhoneEmptyState title={emptyTitle ?? t("phoneTask.empty")} body={emptyBody} />
            ) : (
              ordered.map((task) => {
                const facts = (
                  <Stack gap="none" className="min-w-0 flex-1">
                    <span {...slotAttributes(phoneTaskKindStyle, {})}>{task.kind}</span>
                    <Text weight="medium" className="truncate">
                      {task.title}
                    </Text>
                    {task.subtitle && (
                      <Text size="caption" tone="muted" className="truncate">
                        {task.subtitle}
                      </Text>
                    )}
                    <Flex align="center" gap="xs" wrap>
                      {/* Time left only for a row that has a deadline; a notice or a fact has none to show. */}
                      {task.due ? <RemainingText value={task.due} now={now} passedLabel={<Text as="span" size="sm" tone="destructive">{t("phoneTask.overdue")}</Text>} /> : null}
                      {task.badge && <StatusBadge tone={task.badge.tone ?? "neutral"} label={task.badge.label} />}
                    </Flex>
                  </Stack>
                );
                if (!task.opens || !task.onOpen) {
                  // A fact, not a task: no action, no accent.
                  return (
                    <PhoneScreenBody key={task.key}>
                      <Flex align="center" gap="sm">
                        {facts}
                      </Flex>
                    </PhoneScreenBody>
                  );
                }
                return (
                  <PhoneRowButton key={task.key} accent={!task.done} onPress={task.onOpen}>
                    <Flex align="center" gap="sm">
                      {facts}
                      <Flex align="center" gap="none" shrink={false}>
                        <Text as="span" size="caption" tone="primary">
                          {t("phoneTask.opens", { screen: task.opens })}
                        </Text>
                        <ChevronRightIcon className="size-4" aria-hidden />
                      </Flex>
                    </Flex>
                  </PhoneRowButton>
                );
              })
            )}
          </PhoneScreenBody>
        </PhoneScrollArea>
      </PhoneScreenColumn>
    </ConsolePhoneShell>
  );
}
