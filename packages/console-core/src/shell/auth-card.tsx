import type { ReactNode } from "react";
import { Card, Flex, Heading, Separator, Stack, Text } from "@simplix-react/ui";
import { partAttributes } from "@simplix-react/ui/design";

import { authCardTitleStyle } from "./auth-card.style";

/** Props for {@link AuthCard}. */
export interface AuthCardProps {
  /** What the screen is, on the panel's own heading. */
  readonly title: string;
  /** The line under it: the product, the site, whoever sent the link. */
  readonly description?: ReactNode;
  /** The messages the screen opens with (why the last session ended), drawn above the content. */
  readonly notices?: ReactNode;
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
        {notices}
        {children ? <Stack gap="md">{children}</Stack> : null}
        {foot ? (
          <>
            <Separator />
            <Flex align="center" justify="between" gap="sm" wrap>
              {foot}
            </Flex>
          </>
        ) : null}
      </Stack>
    </Card>
  );
}
