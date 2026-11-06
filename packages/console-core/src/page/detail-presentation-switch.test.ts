import { describe, expect, it } from "vitest";

import { keyMovesFocus } from "./detail-presentation-switch";

describe("keyMovesFocus", () => {
  it("counts the keys a reader moves the focus with", () => {
    for (const key of ["Tab", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End", "PageUp", "PageDown"]) expect(keyMovesFocus(key)).toBe(true);
  });

  it("leaves out the keys that press the focused control, so a record opened with Enter opens no tooltip", () => {
    for (const key of ["Enter", " ", "Escape", "a", "Shift", "Meta"]) expect(keyMovesFocus(key)).toBe(false);
  });
});
