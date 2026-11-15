import { useState } from "react";
import { useTranslation } from "@simplix-react/i18n/react";
import { ProcessLanes } from "@simplix-react/process";
import { Button, Flex, Stack, Text } from "@simplix-react/ui";
import { slotAttributes } from "@simplix-react/ui/design";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

import { ConsolePhoneShell, PhoneEmptyState, PhoneScreenBody, PhoneScreenColumn, PhoneScrollArea, type ConsolePhoneShellProps } from "../shell/phone-shell";
import { PACKAGE_NAMESPACE } from "./locales";
import type { WorkProcedure } from "./work-progress";
import { WorkTurnCard, type WorkTurn } from "./work-turn";
import { workKindStyle, workTitleStyle } from "./work-window.style";

/** One piece of work at the reader's turn, as a phone shows it. */
export interface PhoneTurnItem {
  readonly key: string;
  /** The kind of work, such as the name of its procedure. */
  readonly kind: string;
  /** The name of this piece of work. */
  readonly title: string;
  /** Whose turn it is and what is done next; its `action` opens the screen the act is done on. */
  readonly turn: WorkTurn;
  /** The procedure and how far the work has come, drawn in one column under the turn. */
  readonly procedure: WorkProcedure;
}

/** Props for {@link PhoneTurns}. */
export interface PhoneTurnsProps {
  /** The phone shell the screen is drawn in: its title, tabs and active tab. */
  readonly shell: Omit<ConsolePhoneShellProps, "children">;
  /** The pieces of work at the reader's turn, in the order they are gone through. */
  readonly items: readonly PhoneTurnItem[];
  /** The item the screen opens on; the first when left out. */
  readonly defaultItem?: string;
  /** What the screen says when nothing is at the reader's turn. */
  readonly empty: { readonly title: string; readonly body?: string };
}

/**
 * The work at the reader's turn on a phone, one piece at a time: what the work is, the act that is
 * the reader's with the button that opens its screen, and the steps of the procedure in one
 * column with the step in hand marked. The reader moves to the piece before or after with the
 * two buttons at the head, which also say which piece of how many is shown.
 */
export function PhoneTurns({ shell, items, defaultItem, empty }: PhoneTurnsProps) {
  const { t } = useTranslation(`${PACKAGE_NAMESPACE}/work`);
  const [key, setKey] = useState(defaultItem ?? items[0]?.key);
  const at = Math.max(0, items.findIndex((item) => item.key === key));
  const item = items[at];
  return (
    <ConsolePhoneShell {...shell}>
      <PhoneScreenColumn>
        <PhoneScrollArea>
          <PhoneScreenBody>
            {item === undefined ? (
              <PhoneEmptyState title={empty.title} body={empty.body} />
            ) : (
              <Stack gap="md" data-phone-turn={item.key}>
                <Flex align="center" justify="between" gap="sm">
                  <Button size="icon" variant="outline" aria-label={t("phone.previous")} disabled={at === 0} onClick={() => setKey(items[at - 1]?.key)} data-phone-turn-previous>
                    <ChevronLeftIcon aria-hidden className="size-5" />
                  </Button>
                  <Text size="sm" tone="muted" data-phone-turn-count>
                    {t("phone.count", { at: at + 1, of: items.length })}
                  </Text>
                  <Button size="icon" variant="outline" aria-label={t("phone.next")} disabled={at === items.length - 1} onClick={() => setKey(items[at + 1]?.key)} data-phone-turn-next>
                    <ChevronRightIcon aria-hidden className="size-5" />
                  </Button>
                </Flex>
                <Stack gap="none" className="min-w-0">
                  <span {...slotAttributes(workKindStyle, {})}>{item.kind}</span>
                  <span {...slotAttributes(workTitleStyle, {})}>{item.title}</span>
                </Stack>
                <WorkTurnCard turn={item.turn} />
                <ProcessLanes key={item.key} {...item.procedure} layout="stack" />
              </Stack>
            )}
          </PhoneScreenBody>
        </PhoneScrollArea>
      </PhoneScreenColumn>
    </ConsolePhoneShell>
  );
}
