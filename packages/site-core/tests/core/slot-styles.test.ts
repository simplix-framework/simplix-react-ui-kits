import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { cn } from "@simplix-react/ui";
import { describe, expect, it } from "vitest";

// Two utilities that set the same property in one base (or in one variant value) are decided by the
// order the stylesheet writes them in, not by the order the class string lists them: a card ground
// written `border-(--site-line)` with `border-(--site-accent)` appended drew the hairline, not the
// accent. tailwind-merge knows which utilities set the same property, so a class it drops from a
// base is one that base can never draw. An override belongs in a variant, which the stylesheet
// writes after the base.

interface SlotStyleShape {
  readonly slot: string;
  readonly base: string;
  readonly variants: Readonly<Record<string, Readonly<Record<string, string>>>>;
}

const isSlotStyle = (value: unknown): value is SlotStyleShape =>
  typeof value === "object" && value !== null && "slot" in value && "base" in value && "variants" in value;

/** The classes of `classes` that another class in the same string overrides. */
function overridden(classes: string): string[] {
  const listed = classes.split(/\s+/).filter(Boolean);
  const kept = new Set(cn(listed.join(" ")).split(/\s+/));
  return listed.filter((name) => !kept.has(name));
}

const core = join(import.meta.dirname, "../../src");
const walk = (path: string): string[] => (statSync(path).isDirectory() ? readdirSync(path).flatMap((name) => walk(join(path, name))) : [path]);
const files = walk(core).filter((path) => path.endsWith(".style.ts"));
const styles: SlotStyleShape[] = [];
for (const file of files) for (const value of Object.values(await import(pathToFileURL(file).href))) if (isSlotStyle(value)) styles.push(value);

describe("the site-core slot styles", () => {
  it("are read from every style file", () => {
    expect(files.length).toBeGreaterThan(5);
    expect(styles.length).toBeGreaterThan(100);
  });

  it("never set one property twice in a base or in a variant value", () => {
    const found: string[] = [];
    for (const style of styles) {
      const lost = overridden(style.base);
      if (lost.length > 0) found.push(`${style.slot} base: ${lost.join(" ")}`);
      for (const [variant, values] of Object.entries(style.variants)) {
        for (const [value, classes] of Object.entries(values)) {
          const lostHere = overridden(classes);
          if (lostHere.length > 0) found.push(`${style.slot} ${variant}=${value}: ${lostHere.join(" ")}`);
        }
      }
    }
    expect(found).toEqual([]);
  });
});

describe("the overlap reader", () => {
  it("finds a colour and a direction set twice, and leaves a sound base alone", () => {
    expect(overridden("flex flex-col border border-(--site-line) border-(--site-accent)")).toEqual(["border-(--site-line)"]);
    expect(overridden("flex flex-col gap-3 flex-row")).toEqual(["flex-col"]);
    expect(overridden("flex min-w-0 flex-col gap-3 rounded-(--site-radius-xl) border border-(--site-line) bg-(--site-surface) px-4 py-3.5")).toEqual([]);
    expect(overridden("text-(length:--site-fs-caption) leading-(--site-lh-caption) text-(--site-ink-muted)")).toEqual([]);
  });
});
