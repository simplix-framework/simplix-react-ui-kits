import { TriangleAlertIcon } from "lucide-react";
import { useTranslation } from "@simplix-react/i18n/react";
import { AlertBanner, Flex } from "@simplix-react/ui";

import { NumericText } from "../layout";

/** Why the installation is read-only, as the dashboard answers it. */
export interface ReadOnlyMode {
  /** What closed writing — 「구독 만료」 today. */
  readonly reason?: string;
  /** The day the subscription ran out. */
  readonly expiredOn?: string;
  /** The day its grace period ended. */
  readonly graceEndedOn?: string;
}

interface ReadOnlyBannerProps {
  /** The state, or undefined while the installation is writable. */
  readonly mode: ReadOnlyMode | undefined;
}

/**
 * 읽기 전용 모드 (P-12) — the banner every screen carries once writing is closed.
 *
 * <p><b>The create and edit controls go inactive rather than disappearing.</b> A control that
 * vanishes teaches the reader the product cannot do the thing; one that is present and refuses
 * teaches that this installation currently may not.
 *
 * <p><b>Reading evidence and exporting it never close.</b> Records the statute requires be kept
 * have to stay reachable whatever the subscription says — refusing an inspector the material
 * because a bill is unpaid makes the non-payment the employer's violation (design 12.5 · 13.1).
 *
 * <p><b>Nothing is deleted.</b> A record inside its retention term stays whatever the subscription
 * does.
 *
 * <p><b>Drawn only when something says so.</b> The dashboard leaves the block out while nobody has
 * put the installation into this state, and the licence chapter is what fills it — so an absent
 * block means nobody has looked rather than 「만료되지 않았다」, and neither draws a banner.
 */
export function ReadOnlyBanner({ mode }: ReadOnlyBannerProps) {
  const { t } = useTranslation("common");
  if (!mode) return null;

  return (
    <AlertBanner
      tone="warning"
      icon={TriangleAlertIcon}
      density="sm"
      title={t("readOnly.title")}
      subtitle={t("readOnly.body")}
      trailing={
        <Flex gap="xs" align="center">
          <NumericText size="caption" tone="muted">
            {[
              mode.expiredOn ? t("readOnly.expiredOn", { day: mode.expiredOn }) : "",
              mode.graceEndedOn ? t("readOnly.graceEndedOn", { day: mode.graceEndedOn }) : "",
            ]
              .filter(Boolean)
              .join(" · ")}
          </NumericText>
        </Flex>
      }
    />
  );
}
