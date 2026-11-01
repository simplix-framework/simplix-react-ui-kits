import type { ComponentType, ReactNode } from "react";
import { AlertBanner, Card, Flex, Heading, Separator, Stack, Text } from "@simplix-react/ui";
import { partAttributes } from "@simplix-react/ui/design";

import { authCardBodyStyle, authCardFootStyle, authCardNoticesStyle, authCardTitleStyle } from "./auth-card.style";

/** One message a screen before a session opens with, as data; the panel draws it as a banner. */
export interface AuthCardNotice {
  readonly key: string;
  readonly tone: "info" | "warning" | "danger";
  readonly title: string;
  readonly subtitle?: string;
  /** The banner's glyph, where the tone's own does not say what happened. */
  readonly icon?: ComponentType<{ className?: string }>;
}

/** Props for {@link AuthCard}. */
export interface AuthCardProps {
  /** What the screen is, on the panel's own heading. */
  readonly title: string;
  /** The line under it: the product, the site, whoever sent the link. */
  readonly description?: ReactNode;
  /** The messages the screen opens with (why the last session ended), drawn above the content. */
  readonly notices?: readonly AuthCardNotice[];
  /** The panel's content. */
  readonly children?: ReactNode;
  /** The row under the rule: the links off this screen. */
  readonly foot?: ReactNode;
}

/**
 * The panel every screen reached before there is a session is drawn in, inside {@link AuthLayout}.
 *
 * <p>The heading is the panel's own rather than the page header's: these screens are outside the
 * console shell, so there is no page header to register a title with.
 */
export function AuthCard({ title, description, notices, children, foot }: AuthCardProps) {
  return (
    <Card padding="md">
      <Stack gap="md">
        <Stack gap="xs">
          <Heading level={2} {...partAttributes(authCardTitleStyle, {})}>
            {title}
          </Heading>
          {description ? (
            <Text tone="muted" size="sm">
              {description}
            </Text>
          ) : null}
        </Stack>
        {notices && notices.length > 0 ? (
          <Stack gap="sm" {...partAttributes(authCardNoticesStyle, {})}>
            {notices.map((one) => (
              <AlertBanner key={one.key} tone={one.tone} icon={one.icon} title={one.title} subtitle={one.subtitle} />
            ))}
          </Stack>
        ) : null}
        {children ? <Stack gap="md" {...partAttributes(authCardBodyStyle, {})}>{children}</Stack> : null}
        {foot ? (
          <>
            <Separator />
            <Flex align="center" justify="between" gap="sm" wrap {...partAttributes(authCardFootStyle, {})}>
              {foot}
            </Flex>
          </>
        ) : null}
      </Stack>
    </Card>
  );
}
