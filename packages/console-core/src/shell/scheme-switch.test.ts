import { describe, expect, it } from "vitest";

import { drawSchemeChange, SCHEME_SWITCH_ATTRIBUTE, type SchemeSwitchTarget } from "./scheme-switch";

/** An element that records, in order, what is done to it, and whether the mark is on at each step. */
function recordingTarget() {
  const calls: string[] = [];
  const marks = new Set<string>();
  const target: SchemeSwitchTarget = {
    setAttribute: (name) => {
      calls.push(`set ${name}`);
      marks.add(name);
    },
    removeAttribute: (name) => {
      calls.push(`remove ${name}`);
      marks.delete(name);
    },
    getBoundingClientRect: () => {
      calls.push(`flush (mark ${marks.has(SCHEME_SWITCH_ATTRIBUTE) ? "on" : "off"})`);
      return {};
    },
  };
  return { calls, marks, target };
}

describe("a change of scheme", () => {
  it("is drawn in one frame: marked, changed, flushed with the mark on, then unmarked", () => {
    const { calls, marks, target } = recordingTarget();
    drawSchemeChange(target, () => calls.push(`change (mark ${marks.has(SCHEME_SWITCH_ATTRIBUTE) ? "on" : "off"})`));
    expect(calls).toEqual([`set ${SCHEME_SWITCH_ATTRIBUTE}`, "change (mark on)", "flush (mark on)", `remove ${SCHEME_SWITCH_ATTRIBUTE}`]);
    expect(marks.size).toBe(0);
  });

  it("removes the mark when the change throws, so no transition stays switched off", () => {
    const { marks, target } = recordingTarget();
    expect(() =>
      drawSchemeChange(target, () => {
        throw new Error("refused");
      }),
    ).toThrow("refused");
    expect(marks.size).toBe(0);
  });
});
