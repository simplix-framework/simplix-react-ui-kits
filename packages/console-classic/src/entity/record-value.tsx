import type { ReactNode } from "react";
import { EmptyValue, Flex, StatusBadge, Text, type StatusTone } from "@simplix-react/ui";

/** A badge a value is drawn as: a standing, a role, a period. */
export interface RecordBadge {
  readonly label: string;
  readonly tone?: StatusTone;
}

/**
 * What one cell or one detail field shows, declared rather than drawn.
 *
 * <p>Text; text over a quieter second line; one or more badges; text that opens the record it
 * names. Nothing is the kit's empty mark, so a screen never draws its own placeholder.
 */
export type RecordValue =
  | string
  | number
  | null
  | undefined
  | { readonly text: string; readonly sub?: string; readonly badge?: RecordBadge }
  | { readonly badge: RecordBadge }
  | { readonly badges: readonly RecordBadge[] }
  | { readonly link: string };

/** Draws a {@link RecordValue}. */
export function RecordValueView({ value }: { readonly value: RecordValue }): ReactNode {
  if (value === null || value === undefined || value === "") return <EmptyValue />;
  if (typeof value === "string" || typeof value === "number") return <>{value}</>;
  if ("badges" in value) {
    return (
      <Flex gap="xs" wrap>
        {value.badges.map((badge) => (
          <StatusBadge key={badge.label} tone={badge.tone ?? "neutral"} label={badge.label} />
        ))}
      </Flex>
    );
  }
  if ("link" in value) return <Text tone="primary">{value.link}</Text>;
  if ("text" in value) {
    return (
      <Flex direction="column" gap="none" minSize>
        <Flex align="center" gap="xs">
          <span>{value.text}</span>
          {value.badge ? <StatusBadge tone={value.badge.tone ?? "neutral"} label={value.badge.label} /> : null}
        </Flex>
        {value.sub ? (
          <Text size="caption" tone="muted">
            {value.sub}
          </Text>
        ) : null}
      </Flex>
    );
  }
  return <StatusBadge tone={value.badge.tone ?? "neutral"} label={value.badge.label} />;
}
