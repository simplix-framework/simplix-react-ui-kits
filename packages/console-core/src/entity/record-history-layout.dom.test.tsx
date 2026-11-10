import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { UIProvider } from "@simplix-react/ui";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { RecordDetail } from "./record-detail";
import { HISTORY_ASIDE_FROM, type RecordHistory } from "./record-history-layout";

/**
 * A record's progress history stands in a column beside it while the record is wide enough, and at the
 * foot of its first tab below that, never in both and never dropped.
 */

let root: Root | undefined;
let host: HTMLElement | undefined;
let width = 0;

beforeAll(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.stubGlobal("ResizeObserver", class { observe() {} unobserve() {} disconnect() {} });
  const measured = Element.prototype.getBoundingClientRect;
  vi.spyOn(Element.prototype, "getBoundingClientRect").mockImplementation(function (this: Element) {
    return (this.getAttribute("data-slot") ?? this.getAttribute("data-part")) === "console-history-layout" ? ({ width, height: 600, top: 0, left: 0, right: width, bottom: 600, x: 0, y: 0, toJSON: () => ({}) } as DOMRect) : measured.call(this);
  });
});

afterEach(() => {
  act(() => root?.unmount());
  host?.remove();
  root = undefined;
  host = undefined;
  width = 0;
});

const history: RecordHistory = {
  title: "Progress",
  description: "When, who, result",
  nodes: [
    { key: "a", label: "Received", state: "done" },
    { key: "b", label: "Approval", state: "active" },
  ],
};
const tabs = [
  { key: "overview", label: "Overview", sections: [{ key: "s", title: "Details", fields: [{ label: "Name", value: "Ada" }] }] },
  { key: "other", label: "Other", sections: [] },
];

function mount(extra: { history?: RecordHistory; tabs?: typeof tabs | undefined; sections?: unknown } = {}) {
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  act(() => root?.render(createElement(UIProvider, { children: createElement(RecordDetail, { title: "Record", tabs, history, ...extra } as never) })));
}
const aside = () => host?.querySelector("aside[aria-label]") as HTMLElement | null;

describe("a RecordDetail with a progress history", () => {
  it("draws the history in a column beside the record once the record is wide enough", () => {
    width = HISTORY_ASIDE_FROM;
    mount();
    expect(aside()?.getAttribute("aria-label")).toBe("Progress");
    expect(aside()?.textContent).toContain("When, who, result");
    expect(aside()?.textContent).toContain("Approval");
    // The record's own tab does not draw it a second time.
    expect(host?.textContent?.match(/Approval/g)).toHaveLength(1);
  });

  it("draws it at the foot of the first tab, under its own heading, below that width", () => {
    width = HISTORY_ASIDE_FROM - 1;
    mount();
    expect(aside()).toBeNull();
    expect(host?.textContent).toContain("Progress");
    expect(host?.textContent).toContain("Approval");
    expect(host?.textContent?.match(/Approval/g)).toHaveLength(1);
  });

  it("draws it under the sections of a record with no tabs below that width", () => {
    width = 400;
    mount({ tabs: undefined, sections: [{ key: "s", title: "Details", fields: [{ label: "Name", value: "Ada" }] }] });
    expect(aside()).toBeNull();
    expect(host?.textContent).toContain("Details");
    expect(host?.textContent).toContain("Received");
  });

  it("is the same record with no extra wrapper when it has no history", () => {
    mount({ history: undefined });
    expect(host?.querySelector('[data-slot="console-history-layout"], [data-part="console-history-layout"]')).toBeNull();
    expect(aside()).toBeNull();
  });
});
