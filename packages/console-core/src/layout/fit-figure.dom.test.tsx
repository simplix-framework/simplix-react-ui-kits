import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { FitFigure } from "./fit-figure";

let root: Root | undefined;
let host: HTMLElement | undefined;

beforeAll(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
});

afterEach(() => {
  act(() => root?.unmount());
  host?.remove();
  root = undefined;
  host = undefined;
  vi.restoreAllMocks();
});

/**
 * Draws the figure in the shape a stat card has: a row holding the value, which holds the figure. A
 * document with no layout reports no widths, so each element's width is told to the measurement: the
 * row is `room` wide and the figure takes `need` at its own size.
 */
function draw(text: string, room: number, need: number): HTMLElement {
  vi.spyOn(Element.prototype, "getBoundingClientRect").mockImplementation(function (this: Element) {
    const width = this.getAttribute("data-slot") === "stat-card-body" ? room : this.tagName === "SPAN" ? need : 0;
    return { width, height: 0, top: 0, left: 0, right: width, bottom: 0, x: 0, y: 0, toJSON: () => ({}) };
  });
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  act(() =>
    root?.render(
      createElement(
        "div",
        { "data-slot": "stat-card-body" },
        createElement("p", { "data-slot": "stat-card-value" }, createElement(FitFigure, null, text)),
      ),
    ),
  );
  return host.querySelector("span") as HTMLElement;
}

describe("FitFigure", () => {
  it("keeps a figure on one line at its own size where the card has the room", () => {
    const figure = draw("US$93.20", 300, 190);
    expect(figure.style.fontSize).toBe("");
    expect(figure.style.whiteSpace).toBe("nowrap");
  });

  it("draws a figure the card cannot hold at the share that fits, on one line", () => {
    const figure = draw("US$0.000096", 150, 200);
    expect(figure.style.fontSize).toBe("75%");
    expect(figure.style.whiteSpace).toBe("nowrap");
  });

  it("wraps a figure that does not fit even at the floor", () => {
    const figure = draw("US$0.000096", 80, 200);
    expect(figure.style.fontSize).toBe("60%");
    expect(figure.style.whiteSpace).toBe("normal");
  });

  it("leaves a value of several words to wrap at its spaces", () => {
    const figure = draw("No payments yet", 80, 200);
    expect(figure.style.fontSize).toBe("");
    expect(figure.style.whiteSpace).toBe("");
  });
});
