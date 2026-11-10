import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";

// The time range region is the selector the framework draws over a list or a dashboard. Every
// pressable element the selector draws inline, outside its calendar popover, is a control of the
// region: a control missing from the contract is reported on any screen that reaches the state which
// draws it (`time-range-retry` stands in the load-error overlay, `time-range-custom-chip` in a custom
// window). The probe runs here against markup in the framework checkout's `jsdom`, which this package
// does not install.

// @ts-expect-error the script is plain JavaScript that a product's runner imports
import { compare, contract, probe, regionsOf } from "../../scripts/regions-rendered.mjs";
import { installedFramework } from "./installed-framework";

const framework = installedFramework();
const { JSDOM } = createRequire(join(framework, "package.json"))("jsdom") as { JSDOM: new (html: string) => { window: Window & typeof globalThis } };

/**
 * The slots the selector draws on a `<button>` inline in its card, in the order of its markup
 * (`base/inputs/time-range-selector/index.tsx` and `components.tsx`). The preset select of a narrow
 * bar is a `<select>`, which the probe does not read, and the from and to inputs sit in a popover that
 * is portalled out of the card.
 */
const INLINE_CONTROL_SLOTS = [
  "time-range-action",
  "time-range-nav-button",
  "time-range-preset",
  "time-range-custom-chip",
  "time-range-retry",
] as const;

const selector = (buttons: readonly string[]) =>
  `<main><div data-slot="time-range-selector">${buttons.map((slot) => `<button data-slot="${slot}"></button>`).join("")}</div></main>`;

function problemsOf(html: string, type: "list-detail" | "dashboard"): string[] {
  const { window } = new JSDOM(`<body>${html}</body>`);
  Object.assign(globalThis, { document: window.document, getComputedStyle: window.getComputedStyle.bind(window) });
  return compare({ ...probe(regionsOf(type), "main"), rows: 0 }, type);
}

afterEach(() => {
  Reflect.deleteProperty(globalThis, "document");
  Reflect.deleteProperty(globalThis, "getComputedStyle");
});

describe("the time range region's controls", () => {
  it("name every control the selector draws inline, including the retry button of the error overlay", () => {
    const timeRangeControls: readonly string[] = contract.regions.timeRange.controls;
    expect(INLINE_CONTROL_SLOTS.filter((slot) => !timeRangeControls.includes(slot))).toEqual([]);
  });

  it.each(["list-detail", "dashboard"] as const)("draw each of those controls without a problem on a %s page", (type) => {
    expect(problemsOf(selector(INLINE_CONTROL_SLOTS), type).filter((problem) => problem.startsWith("timeRange:"))).toEqual([]);
  });

  it("still report a control the selector does not draw in its card", () => {
    const problems = problemsOf(selector([...INLINE_CONTROL_SLOTS, "time-range-popover-close"]), "list-detail");
    expect(problems.some((problem) => problem.startsWith("timeRange: time-range-popover-close not allowed"))).toBe(true);
  });

  it("keep the listed slots in the framework's selector sources, so a rename there fails here", () => {
    const sources = ["time-range-selector.style.ts"].map((file) => readFileSync(join(framework, "src/base/inputs/time-range-selector", file), "utf8")).join("\n");
    expect(INLINE_CONTROL_SLOTS.filter((slot) => !sources.includes(`"${slot}"`))).toEqual([]);
  });

  it("cover every slot the selector's markup puts on a button", () => {
    const dir = join(framework, "src/base/inputs/time-range-selector");
    const styles = readFileSync(join(dir, "time-range-selector.style.ts"), "utf8");
    const slotOf = new Map<string, string>();
    for (const found of styles.matchAll(/export const (\w+) = defineSlotStyle\(\{\s*slot: "([^"]+)"/g)) slotOf.set(found[1] ?? "", found[2] ?? "");
    const buttonSlots = new Set<string>();
    for (const file of ["index.tsx", "components.tsx"]) {
      const text = readFileSync(join(dir, file), "utf8");
      // A button's attributes run to the first `>` outside braces that does not end an arrow.
      for (let from = text.indexOf("<button"); from >= 0; from = text.indexOf("<button", from + 1)) {
        let depth = 0;
        let at = from + "<button".length;
        for (; at < text.length; at += 1) {
          const char = text[at];
          if (char === "{") depth += 1;
          else if (char === "}") depth -= 1;
          else if (char === ">" && depth === 0 && text[at - 1] !== "=") break;
        }
        for (const use of text.slice(from, at).matchAll(/slotAttributes\(\s*(\w+)/g)) {
          const slot = slotOf.get(use[1] ?? "");
          if (slot === undefined) throw new Error(`${file}: ${use[1]} is not a slot declaration of the selector`);
          buttonSlots.add(slot);
        }
      }
    }
    expect([...buttonSlots].sort()).toEqual([...INLINE_CONTROL_SLOTS].sort());
  });
});
