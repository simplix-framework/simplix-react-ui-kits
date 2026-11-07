import { STATUS_TONE_NAMES, type StatusTone } from "@simplix-react/ui";
import { describe, expect, it } from "vitest";

import { toneTextClass } from "./tone-text";

/** Tailwind's default palette, for the steps a tone's text classes name; a class outside it fails the test. */
const PALETTE: Readonly<Record<string, string>> = {
  "emerald-400": "#34d399",
  "emerald-500": "#10b981",
  "emerald-700": "#047857",
  "amber-400": "#fbbf24",
  "amber-500": "#f59e0b",
  "amber-700": "#b45309",
  "red-400": "#f87171",
  "red-500": "#ef4444",
  "red-700": "#b91c1c",
  "blue-400": "#60a5fa",
  "blue-500": "#3b82f6",
  "blue-700": "#1d4ed8",
  "orange-400": "#fb923c",
  "orange-500": "#f97316",
  "orange-700": "#c2410c",
};

const LIGHT_GROUND = "#ffffff";
/** A dark page ground; every dark theme this kit draws sits at or below it. */
const DARK_GROUND = "#1c1c1e";
/** The contrast WCAG asks of body-size text. */
const TEXT_CONTRAST = 4.5;

function luminance(hex: string): number {
  const channels = [1, 3, 5].map((at) => Number.parseInt(hex.slice(at, at + 2), 16) / 255);
  const [r, g, b] = channels.map((value) => (value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4)) as [number, number, number];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** The WCAG contrast ratio of two colours written as `#rrggbb`. */
function contrast(foreground: string, ground: string): number {
  const [a, b] = [luminance(foreground), luminance(ground)];
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

/** The palette step a `text-<hue>-<step>` class names, or `undefined` for a class that is no palette colour. */
function paletteHex(className: string): string | undefined {
  const named = /text-([a-z]+-\d+)$/.exec(className);
  return named ? PALETTE[named[1] as string] : undefined;
}

describe("the contrast measure", () => {
  it("fails the icon colour of a tone drawn as words", () => {
    expect(contrast(PALETTE["emerald-500"] as string, LIGHT_GROUND)).toBeLessThan(TEXT_CONTRAST);
    expect(contrast(PALETTE["blue-500"] as string, LIGHT_GROUND)).toBeLessThan(TEXT_CONTRAST);
  });

  it("passes a text-grade colour", () => {
    expect(contrast(PALETTE["emerald-700"] as string, LIGHT_GROUND)).toBeGreaterThanOrEqual(TEXT_CONTRAST);
    expect(contrast(PALETTE["emerald-400"] as string, DARK_GROUND)).toBeGreaterThanOrEqual(TEXT_CONTRAST);
  });
});

describe("toneTextClass", () => {
  const coloured = STATUS_TONE_NAMES.filter((tone: StatusTone) => tone !== "neutral");

  it.each(coloured)("gives the %s tone a text colour for both grounds", (tone) => {
    const classes = (toneTextClass(tone) ?? "").split(" ");
    expect(classes.some((name) => name.startsWith("text-"))).toBe(true);
    expect(classes.some((name) => name.startsWith("dark:text-"))).toBe(true);
  });

  it.each(coloured)("keeps the %s tone's text at the contrast words need on a light and a dark ground", (tone) => {
    for (const name of (toneTextClass(tone) ?? "").split(" ")) {
      const hex = paletteHex(name);
      expect(hex, `${name} is not in the palette table`).toBeDefined();
      const ground = name.startsWith("dark:") ? DARK_GROUND : LIGHT_GROUND;
      expect(contrast(hex as string, ground), `${name} on ${ground}`).toBeGreaterThanOrEqual(TEXT_CONTRAST);
    }
  });

  it("leaves a border class of the outline slot out", () => {
    for (const tone of STATUS_TONE_NAMES) expect(toneTextClass(tone) ?? "").not.toMatch(/border/);
  });
});
