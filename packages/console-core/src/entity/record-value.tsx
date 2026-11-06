import type { MouseEvent, ReactNode } from "react";
import { Button, EmptyValue, Flex, StatusBadge, Text, type StatusTone } from "@simplix-react/ui";
import { EyeOffIcon, Trash2Icon } from "lucide-react";

import { slotAttributes } from "@simplix-react/ui/design";

import { InitialsAvatar } from "../identity/initials-avatar";
import { MonoBlock } from "../notice/mono-block";

import { RecordExcerpt } from "./record-excerpt";
import { useReferenceState } from "./reference-state";
import { RecordMeter, type RecordMeterValue } from "./record-meter";
import { recordFigureStyle } from "./record-excerpt.style";
import type { FigureSign } from "./record-figure";

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
      /**
       * The text is a machine value of several lines (a stored payload as indented JSON), drawn as
       * a scrolling monospaced block that keeps its line breaks.
       */
      readonly block?: boolean;
    }
  | { readonly badge: RecordBadge }
  | { readonly badges: readonly RecordBadge[] }
  /**
   * An amount compared down a column: drawn in figures that line up, tinted by its sign where it
   * is a ledger amount (a credit green, a debit red), the sign also written out.
   */
  | { readonly figure: string; readonly sign?: FigureSign }
  /**
   * A machine message (an error, an error code): its first line in the monospaced face, with a
   * copy control and a control that shows it whole.
   */
  | { readonly excerpt: string }
  /** A spent-of-limit reading, drawn as a bar coloured by how near the limit it stands. */
  | { readonly meter: RecordMeterValue }
  /**
   * The name of another record. It is drawn in body colour: a name that carries no way to open its
   * record must not look pressable, and inside a clickable row it would compete with the row press.
   * With `onClick` or `href` it is drawn as a link that opens that record; the press does not reach
   * the row beneath it.
   */
  | {
      readonly link: string;
      readonly onClick?: () => void;
      readonly href?: string;
      readonly badge?: RecordBadge;
      /** Draws the person the name names beside it, tinted by this seed (their id). */
      readonly avatar?: string;
      /** A quieter second line under the name, such as the kind of record. */
      readonly sub?: string;
      /**
       * Asks whether the record still exists before anybody presses it: while the answer is on its
       * way the name stays the link it is, and a record that is gone or unreadable is drawn as `gone`.
       */
      readonly check?: RecordReferenceCheck;
    }
  /**
   * The name of another record that can no longer be opened: it was deleted, or the reader may not
   * see it. The name stays as plain text in the muted ink (never a link: no pointer, no hover, no
   * focus stop) followed by a small muted icon saying why (a bin for deleted, a closed eye for
   * unavailable), and `title` explains it on hover.
   */
  | { readonly gone: RecordGone };

/**
 * A reference whose record cannot be opened; `badge` and `title` are written by the caller in the
 * reader's language. `badge` is the accessible name of the icon drawn after the name (no badge is drawn).
 */
export interface RecordGone {
  /** The name the record had, kept as it was recorded. */
  readonly name: string;
  /** Why it cannot be opened: the record no longer exists, or the reader has no access to it. */
  readonly reason: "deleted" | "unavailable";
  readonly badge: string;
  readonly title: string;
  /** Draws a muted avatar of the name beside it, seeded by this (the record's id). */
  readonly avatar?: string;
  /** A quieter second line under the name, such as the kind of record. */
  readonly sub?: string;
}

/** What a reference asks before it is drawn as a link: its kind, its id, and how it reads when gone. */
export interface RecordReferenceCheck {
  /** The referenced entity's name, whose registered lookup answers (`registerReferenceLookup`). */
  readonly kind: string;
  readonly id: string;
  readonly gone: { readonly deleted: RecordGone; readonly unavailable: RecordGone };
}

/** A reference drawn once its record's existence is known: gone when it is, the link otherwise. */
function CheckedReference({ value }: { readonly value: Extract<RecordValue, { link: string }> }): ReactNode {
  const { check, ...link } = value;
  const state = useReferenceState(check?.kind, check?.id);
  if (check && (state === "deleted" || state === "unavailable")) return <RecordValueView value={{ gone: check.gone[state] }} />;
  return <RecordValueView value={link} />;
}

/** Draws a {@link RecordValue}. */
export function RecordValueView({ value }: { readonly value: RecordValue }): ReactNode {
  if (value === null || value === undefined || value === "") return <EmptyValue />;
  if (typeof value === "string" || typeof value === "number") return <>{value}</>;
  if ("figure" in value) {
    return <span {...slotAttributes(recordFigureStyle, { sign: value.sign ?? "none" })}>{value.figure}</span>;
  }
  if ("meter" in value) return <RecordMeter meter={value.meter} />;
  if ("excerpt" in value) return value.excerpt === "" ? <EmptyValue /> : <RecordExcerpt text={value.excerpt} />;
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
  if ("gone" in value) {
    const { name, reason, badge, title, avatar, sub } = value.gone;
    const GoneIcon = reason === "deleted" ? Trash2Icon : EyeOffIcon;
    const lines = (
      <Flex direction="column" gap="none" minSize>
        {/* The name ellipsizes in a narrow column; the icon saying why keeps its width and is no focus stop. */}
        <Flex align="center" gap="xs" minSize>
          <Text as="span" tone="muted" className="min-w-0 cursor-default truncate">
            {name}
          </Text>
          <Text as="span" tone="muted" className="inline-flex shrink-0 cursor-default">
            <GoneIcon className="size-3.5" role="img" aria-label={badge} data-record-gone-icon={reason} />
          </Text>
        </Flex>
        {sub ? (
          <Text size="caption" tone="muted">
            {sub}
          </Text>
        ) : null}
      </Flex>
    );
    return (
      <Flex align="center" gap="sm" minSize title={title} data-record-gone={reason}>
        {avatar === undefined ? null : <InitialsAvatar name={name} seed={avatar} muted />}
        {lines}
      </Flex>
    );
  }
  if ("link" in value) {
    if (value.check) return <CheckedReference value={value} />;
    // A person is the avatar, the name and the line naming what they are, as a gone person is.
    if (value.avatar !== undefined || value.sub !== undefined) {
      const { avatar, sub, ...name } = value;
      const lines = (
        <Flex direction="column" gap="none" minSize>
          <RecordValueView value={name} />
          {sub ? (
            <Text size="caption" tone="muted">
              {sub}
            </Text>
          ) : null}
        </Flex>
      );
      if (avatar === undefined) return lines;
      return (
        <Flex align="center" gap="sm" minSize>
          <InitialsAvatar name={value.link} seed={avatar} />
          {lines}
        </Flex>
      );
    }
    // A badge beside the name says something about that record (out of use), not about this one.
    if (value.badge) {
      const { badge, ...name } = value;
      return (
        <Flex align="center" gap="xs" minSize>
          <RecordValueView value={name} />
          <span className="shrink-0">
            <StatusBadge tone={badge.tone ?? "neutral"} label={badge.label} />
          </span>
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
    // An address on another origin (a public page of another app) opens beside the console, so the
    // record the reader came from stays where it was.
    const elsewhere = href !== undefined && isOtherOrigin(href);
    return (
      <Button variant="link" size="link" asChild={href !== undefined} onClick={press}>
        {href !== undefined ? (
          <a href={href} {...(elsewhere ? { target: "_blank", rel: "noreferrer" } : {})}>
            {name}
          </a>
        ) : (
          name
        )}
      </Button>
    );
  }
  if ("text" in value && value.block) return <MonoBlock className="w-full">{value.text}</MonoBlock>;
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

/** Whether an address leaves the page's own origin; a relative address never does. */
export function isOtherOrigin(href: string, here: string = typeof window === "undefined" ? "" : window.location.origin): boolean {
  if (!/^[a-z][a-z0-9+.-]*:\/\//i.test(href)) return false;
  try {
    return new URL(href).origin !== here;
  } catch (error) {
    // A malformed address is read as the page's own; any other failure is not this function's to hide.
    if (error instanceof TypeError) return false;
    throw error;
  }
}
