import { InfoIcon } from "lucide-react";
import { useTranslation } from "@simplix-react/i18n/react";
import {
  AlertBanner,
  Badge,
  Button,
  Card,
  Flex,
  Heading,
  Stack,
  Text,
} from "@simplix-react/ui";

interface FeatureLockProps {
  /** What the locked thing is called, in the words the menu uses for it. */
  readonly title: string;
  /** What it does, so a reader can decide whether they want it. */
  readonly description: string;
  /** The licence key that opens it — the same string the pricing catalogue names. */
  readonly featureKey: string;
  /** Drawn small enough to sit inside a panel rather than filling a page. */
  readonly compact?: boolean;
}

/**
 * 기능 잠금 (P-11) — what this deployment did not buy stays on screen and says how to open it.
 *
 * <p><b>Three reasons a screen does not open, and they are told apart.</b> A permission the reader
 * lacks takes the entry out of the menu entirely — there is nothing to promise. An edition not held
 * stays in the menu marked 라이선스, and opening it explains what the feature does and how it
 * opens; that is this component. An environment constraint — an air-gapped network with no machine
 * translation — is a badge rather than a lock, because it cannot be bought.
 *
 * <p><b>Hiding it would make an upgradeable product look like a smaller one</b>, and would leave an
 * operator hunting the manual for a screen their console does not draw.
 *
 * <p>The same principle covers a limit: a warning at eighty per cent, no new records at a hundred,
 * and reading and exporting what already exists never closed.
 */
export function FeatureLock({ title, description, featureKey, compact }: FeatureLockProps) {
  const { t } = useTranslation("common");

  return (
    <Card padding={compact ? "sm" : "md"}>
      <Stack gap="sm">
        <Flex gap="xs" align="center" wrap>
          <Badge variant="outline">{featureKey}</Badge>
          <Badge variant="warning">{t("featureLock.notHeld")}</Badge>
        </Flex>

        <Heading level={compact ? 5 : 4}>{title}</Heading>

        <Text size="sm">{t("featureLock.title")}</Text>

        <Text size="sm" tone="muted">
          {description}
        </Text>

        <Flex gap="xs" wrap>
          <Button variant="primary" size="sm" disabled>
            {t("featureLock.contact")}
          </Button>
        </Flex>

        <AlertBanner tone="info" icon={InfoIcon} density="sm" title={t("featureLock.note")} />
      </Stack>
    </Card>
  );
}
