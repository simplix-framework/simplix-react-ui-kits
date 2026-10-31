import type { MouseEvent, ReactNode } from "react";
import { Button, EmptyValue, Flex, StatusBadge, Text, type StatusTone } from "@simplix-react/ui";

import { InitialsAvatar } from "../identity/initials-avatar";

/** A badge a value is drawn as: a standing, a role, a period. */
export interface RecordBadge {
  readonly label: string;
  readonly tone?: StatusTone;
}

/**
 * What one cell or one detail field shows, declared rather than drawn.
 *
 * <p>Text, or an identifier drawn as code; text over a quieter second line; one or more badges; the name of another record. Nothing
 * is the kit's empty mark, so a screen never draws its own placeholder.
 */
export type RecordValue =
  | string
  | number
  | null
  | undefined
  | {
      readonly text: string;
      readonly sub?: string;
      readonly badge?: RecordBadge;
      /** Draws the person the text names beside it, tinted by this seed (their id). */
      readonly avatar?: string;
      /**
       * The text is an identifier the reader may type or compare (a code, a setting key), drawn in
       * the monospaced face so it reads as one rather than as a sentence.
       */
      readonly code?: boolean;
    }
  | { readonly badge: RecordBadge }
  | { readonly badges: readonly RecordBadge[] }
  /**
   * The name of another record. It is drawn in body colour: a name that carries no way to open its
   * record must not look pressable, and inside a clickable row it would compete with the row press.
   * With `onClick` or `href` it is drawn as a link that opens that record; the press does not reach
   * the row beneath it.
   */
  | { readonly link: string; readonly onClick?: () => void; readonly href?: string; readonly badge?: RecordBadge };

/** Draws a {@link RecordValue}. */
export function RecordValueView({ value }: { readonly value: RecordValue }): ReactNode {
  if (value === null || value === undefined || value === "") return <EmptyValue />;
  if (typeof value === "string" || typeof value === "number") return <>{value}</>;
  if ("badges" in value) {
    return (
      // Badges wrap one by one inside the column; a badge's own words never break or ellipsize.
      <Flex gap="xs" wrap className="[&>*]:whitespace-nowrap">
        {value.badges.map((badge) => (
          <StatusBadge key={badge.label} tone={badge.tone ?? "neutral"} label={badge.label} />
        ))}
      </Flex>
    );
  }
  if ("link" in value) {
    // A badge beside the name says something about that record (out of use), not about this one.
    if (value.badge) {
      const { badge, ...name } = value;
      return (
        <Flex align="center" gap="xs">
          <RecordValueView value={name} />
          <StatusBadge tone={badge.tone ?? "neutral"} label={badge.label} />
        </Flex>
      );
    }
    if (!value.onClick && !value.href) return <>{value.link}</>;
    const { onClick, href } = value;
    const press = (event: MouseEvent) => {
      event.stopPropagation();
      if (onClick) {
        event.preventDefault();
        onClick();
      }
    };
    const name = value.link;
    return (
      <Button variant="link" size="link" asChild={href !== undefined} onClick={press}>
        {href !== undefined ? <a href={href}>{name}</a> : name}
      </Button>
    );
  }
  if ("text" in value) {
    const lines = (
      <Flex direction="column" gap="none" minSize>
        <Flex align="center" gap="xs">
          {value.code ? (
            <Text as="code" font="mono">
              {value.text}
            </Text>
          ) : (
            <span>{value.text}</span>
          )}
          {value.badge ? <StatusBadge tone={value.badge.tone ?? "neutral"} label={value.badge.label} /> : null}
        </Flex>
        {value.sub ? (
          <Text size="caption" tone="muted">
            {value.sub}
          </Text>
        ) : null}
      </Flex>
    );
    if (value.avatar === undefined) return lines;
    return (
      <Flex align="center" gap="sm" minSize>
        <InitialsAvatar name={value.text} seed={value.avatar} />
        {lines}
      </Flex>
    );
  }
  return (
    <span className="whitespace-nowrap">
      <StatusBadge tone={value.badge.tone ?? "neutral"} label={value.badge.label} />
    </span>
  );
}
