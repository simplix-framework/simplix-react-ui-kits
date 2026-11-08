import { describe, expect, it } from "vitest";

import { applySiteScheme, markSiteScheme, SCHEME_SWITCH_ATTRIBUTE, type SchemeQuery, type SchemeTarget } from "./site-scheme";

/**
 * A document element that records, in order, what is done to it, and answers the way a browser
 * does: the mark is on the element exactly between its set and its removal.
 */
function recordingTarget(dark: boolean) {
  const calls: string[] = [];
  const attributes = new Map<string, string>();
  let isDark = dark;
  const target: SchemeTarget = {
    classList: {
      toggle: (token, force) => {
        calls.push(`toggle ${token} ${String(force)} (mark ${attributes.has(SCHEME_SWITCH_ATTRIBUTE) ? "on" : "off"})`);
        isDark = force;
        return force;
      },
      contains: () => isDark,
    },
    style: { colorScheme: "" },
    setAttribute: (name, value) => {
      calls.push(`set ${name}`);
      attributes.set(name, value);
    },
    removeAttribute: (name) => {
      calls.push(`remove ${name}`);
      attributes.delete(name);
    },
    getBoundingClientRect: () => {
      calls.push("flush");
      return {};
    },
  };
  return { calls, attributes, target };
}

const quietQuery = (matches: boolean): SchemeQuery => ({ matches, addEventListener: () => {}, removeEventListener: () => {} });

describe("a change of scheme", () => {
  it("is drawn in one frame: marked, swapped, flushed with the mark on, then unmarked", () => {
    const light = recordingTarget(false);
    markSiteScheme(light.target, true);
    expect(light.calls).toEqual([`set ${SCHEME_SWITCH_ATTRIBUTE}`, "toggle dark true (mark on)", "flush", `remove ${SCHEME_SWITCH_ATTRIBUTE}`]);
    expect(light.attributes.size).toBe(0);
    expect(light.target.style?.colorScheme).toBe("dark");
  });

  it("is drawn the same way going back to light", () => {
    const dark = recordingTarget(true);
    markSiteScheme(dark.target, false);
    expect(dark.calls).toEqual([`set ${SCHEME_SWITCH_ATTRIBUTE}`, "toggle dark false (mark on)", "flush", `remove ${SCHEME_SWITCH_ATTRIBUTE}`]);
    expect(dark.target.style?.colorScheme).toBe("light");
  });

  it("leaves a document that already carries the scheme as it is, with no mark and no flush", () => {
    const already = recordingTarget(true);
    markSiteScheme(already.target, true);
    expect(already.calls).toEqual(["toggle dark true (mark off)"]);
  });

  it("marks the change that following the system makes, not the first reading that agrees with the document", () => {
    const system = recordingTarget(true);
    const stop = applySiteScheme("system", quietQuery(true), system.target);
    expect(system.calls.some((call) => call.startsWith("set "))).toBe(false);
    stop();
    const fixed = recordingTarget(true);
    applySiteScheme("light", quietQuery(true), fixed.target);
    expect(fixed.calls[0]).toBe(`set ${SCHEME_SWITCH_ATTRIBUTE}`);
  });

  it("still marks a target that has no mark to set, which a head script's fake or a minimal target is", () => {
    const classes = new Set<string>();
    const minimal: SchemeTarget = { classList: { toggle: (token, force) => (force ? classes.add(token) : classes.delete(token), force) }, style: { colorScheme: "" } };
    markSiteScheme(minimal, true);
    expect(classes.has("dark")).toBe(true);
    expect(minimal.style?.colorScheme).toBe("dark");
  });
});
