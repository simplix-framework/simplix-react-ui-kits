import { describe, expect, it } from "vitest";

import { recordBodyStyle, recordHeadFigureLabelStyle, recordHeadFigureStyle, recordHeadFigureValueStyle } from "./record-detail.style";

const classes = (value: string) => value.split(" ");

// The record's name is the one heavy line of its head. A key figure sits on one line, its value in
// the label's size, so the head stays low and a figure does not read as a second title.
describe("the key figures of a record head", () => {
  it("set a figure's name and value on one line", () => {
    expect(classes(recordHeadFigureStyle.base)).toContain("items-baseline");
    expect(classes(recordHeadFigureStyle.base)).not.toContain("flex-col");
  });

  it("draw the value in the label's size, at a weight under the title's", () => {
    expect(classes(recordHeadFigureLabelStyle.base)).toContain("text-xs");
    expect(classes(recordHeadFigureValueStyle.base)).toContain("text-xs");
    expect(classes(recordHeadFigureValueStyle.base)).toContain("font-medium");
    expect(recordHeadFigureValueStyle.base).not.toMatch(/font-(semibold|bold)/);
  });
});

// A notice that leads the body keeps room under the head's rule, and the room is the notice's own.
describe("the body of a record under its head", () => {
  it("gives a leading notice card and a leading banner their room", () => {
    expect(classes(recordBodyStyle.base)).toContain("[&>[data-slot=console-notice-card]:first-child]:mt-2");
    expect(classes(recordBodyStyle.base)).toContain("[&>[data-slot=alert-banner]:first-child]:mt-2");
  });
});
