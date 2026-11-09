import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { sublistKind, useStickyFull } from "./record-detail";

/** The form of a tab's sub-list under a real React root: the main table stays the main table when a search narrows its rows. */

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
});

function Probe({ rows, count }: { readonly rows: number; readonly count: number | undefined }) {
  return createElement("span", { "data-kind": useStickyFull(sublistKind(rows, count)) });
}

function draw(rows: number, count: number | undefined): void {
  if (!root) {
    host = document.createElement("div");
    document.body.append(host);
    root = createRoot(host);
  }
  act(() => root?.render(createElement(Probe, { rows, count })));
}

function kind(): string | null {
  return host?.querySelector("span")?.getAttribute("data-kind") ?? null;
}

describe("a sub-list's form", () => {
  it("stays the main table when a search narrows its rows to the compact limit", () => {
    draw(20, undefined);
    expect(kind()).toBe("full");
    draw(3, undefined);
    expect(kind()).toBe("full");
  });

  it("stays the main table when the tab's count is more than the narrowed rows", () => {
    draw(30, 30);
    expect(kind()).toBe("full");
    draw(5, 30);
    expect(kind()).toBe("full");
  });

  it("is compact for a list that was small from the start, and then grows into the main table", () => {
    draw(4, 4);
    expect(kind()).toBe("compact");
    draw(40, 40);
    expect(kind()).toBe("full");
  });
});
