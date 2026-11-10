import { describe, expect, it } from "vitest";

import { shellSlots } from "../src/styles/designs/clarity/shell";

/**
 * The menu column and the rail stand on a ground of their own, so what is drawn on it reads the
 * colours that pair with that ground and never the page's foreground.
 *
 * <p>A product that gives the column a dark ground while the page text stays dark draws the labels
 * at 1:1, and nothing fails: the ground and the text colour are each a correct token and are never
 * written in the same place. This file holds the two ways the pairing breaks in the kit:
 *
 * <ol>
 *   <li>a menu slot names a page text colour (`text-foreground`, `text-muted-foreground`,
 *       `hover:text-secondary-foreground`) instead of reading the variable the column hands down;
 *   <li>a menu slot reads a variable that neither the column nor the rail defines, so the row
 *       silently falls back to the page's colour.
 * </ol>
 */

/** A class token that paints text in a page colour, whatever variant prefixes stand in front of it. */
const PAGE_TEXT_COLOUR = /(?:^|:)text-(?:foreground|secondary-foreground|muted-foreground|card-foreground)$/;

/** The variables a menu slot reads from the column, as opposed to the geometry tokens named `--menu-branch-*`. */
const SCOPE_READ = /var\((--menu-(?!branch-)[\w-]+)/g;

/** The variables a class string defines as arbitrary properties: `[--menu-fg:var(...)]`. */
const SCOPE_DEFINITION = /\[(--menu-(?!branch-)[\w-]+):/g;

const classesOf = (value: string): string[] => value.split(/\s+/).filter(Boolean);

const pageTextColours = (value: string): string[] => classesOf(value).filter((c) => PAGE_TEXT_COLOUR.test(c));

const matches = (value: string, pattern: RegExp): string[] => [...value.matchAll(pattern)].map((m) => m[1] as string);

const menuSlots = Object.entries(shellSlots).filter(([key]) => key.startsWith("console-menu-"));

describe("the page text colour matcher", () => {
  it.each([
    "text-foreground",
    "text-muted-foreground",
    "hover:text-secondary-foreground",
    "[:hover>&]:text-secondary-foreground",
    "[[data-current=true]>&]:text-muted-foreground",
  ])("finds %s", (value) => {
    expect(pageTextColours(value)).toEqual([value]);
  });

  it.each([
    "text-[var(--primary-text)]",
    "text-[var(--menu-fg,var(--secondary-foreground))]",
    "hover:text-[var(--menu-hover-fg,var(--foreground))]",
    "text-(length:--fs-cell)",
    "text-current",
    "text-left",
    "[&>*:first-child]:text-[var(--menu-fg,var(--foreground))]",
  ])("leaves %s", (value) => {
    expect(pageTextColours(value)).toEqual([]);
  });
});

describe("the menu column's pairing", () => {
  it("has menu slots to judge", () => {
    expect(menuSlots.length).toBeGreaterThan(10);
  });

  it.each(menuSlots)("%s names no page text colour", (_key, value) => {
    expect(pageTextColours(value)).toEqual([]);
  });

  it("defines the same variables on the column and on the rail", () => {
    const column = new Set(matches(shellSlots["console-menu-column"] ?? "", SCOPE_DEFINITION));
    const rail = new Set(matches(shellSlots["console-menu-rail"] ?? "", SCOPE_DEFINITION));
    expect([...column].sort()).toEqual([...rail].sort());
    expect(column.size).toBeGreaterThan(0);
  });

  it("defines every variable a menu slot reads", () => {
    const defined = new Set(matches(shellSlots["console-menu-column"] ?? "", SCOPE_DEFINITION));
    const read = new Set(menuSlots.flatMap(([, value]) => matches(value, SCOPE_READ)));
    expect([...read].filter((name) => !defined.has(name))).toEqual([]);
    expect(read.size).toBeGreaterThan(0);
  });

  it("gives each variable a page colour to fall back to where the column is absent", () => {
    // The same rows stand in the rail's flyout and the phone's menu sheet, on the page's grounds.
    for (const [key, value] of menuSlots) {
      for (const name of matches(value, SCOPE_READ)) {
        expect(value, `${key} reads ${name} with no fallback`).toMatch(new RegExp(`var\\(${name},\\s*var\\(--`));
      }
    }
  });

  it("derives each variable from a token the product sets beside the column's ground", () => {
    const column = shellSlots["console-menu-column"] ?? "";
    for (const name of matches(column, SCOPE_DEFINITION)) {
      expect(column, `${name} is defined from a --chrome-sidebar token`).toMatch(
        new RegExp(`\\[${name}:var\\(--chrome-sidebar-[\\w-]+`),
      );
    }
  });
});
