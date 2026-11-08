import { act, createElement, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { DashboardCard } from "./dashboard-card";
import { DashboardFigure } from "./dashboard-figure";
import { isPlainPrimaryClick } from "./head-link";

/**
 * A card's or figure's head leads to a list. With an address it is a link, so the keyboard, a middle
 * click and "open in a new tab" work, while a plain press still goes through the app's router.
 */

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

/** Mounts `node` in a real document so a click reaches React's handlers. */
function mount(node: ReactNode): HTMLElement {
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  act(() => root?.render(node));
  return host;
}

/**
 * Dispatches a click on `element` the way a pointer would, returning whether the browser's own action
 * would still run: a handler that took the click has prevented it by the time it reaches the document,
 * where this stops the document from navigating (the DOM here cannot).
 */
function click(element: Element, init: MouseEventInit = {}): boolean {
  let browserActs = false;
  const settle = (event: Event) => {
    browserActs = !event.defaultPrevented;
    event.preventDefault();
  };
  document.addEventListener("click", settle, { once: true });
  act(() => {
    element.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, button: 0, ...init }));
  });
  document.removeEventListener("click", settle);
  return browserActs;
}

describe("a card's heading action", () => {
  it("is an anchor with the address when it has one, and a plain press runs onClick instead of reloading", () => {
    const onClick = vi.fn();
    const page = mount(createElement(DashboardCard, { title: "Jobs", action: { label: "Open jobs", onClick, href: "/jobs?filters=x" }, children: null }));
    const head = page.querySelector('[data-slot="figure-action"]');
    expect(head?.tagName).toBe("A");
    expect(head?.getAttribute("href")).toBe("/jobs?filters=x");
    expect(click(head as Element)).toBe(false);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("leaves a modified or middle click to the browser, so the address opens in a new tab", () => {
    const onClick = vi.fn();
    const page = mount(createElement(DashboardCard, { title: "Jobs", action: { label: "Open jobs", onClick, href: "/jobs" }, children: null }));
    const head = page.querySelector('[data-slot="figure-action"]') as Element;
    expect(click(head, { ctrlKey: true })).toBe(true);
    expect(click(head, { metaKey: true })).toBe(true);
    expect(click(head, { shiftKey: true })).toBe(true);
    expect(click(head, { button: 1 })).toBe(true);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("stays a button that runs onClick when no address is given", () => {
    const onClick = vi.fn();
    const page = mount(createElement(DashboardCard, { title: "Jobs", action: { label: "Open jobs", onClick }, children: null }));
    const head = page.querySelector('[data-slot="figure-action"]');
    expect(head?.tagName).toBe("BUTTON");
    click(head as Element);
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});

describe("a figure's head", () => {
  it("draws the figure and its action as links when each has an address", () => {
    const open = vi.fn();
    const more = vi.fn();
    const page = mount(
      createElement(DashboardFigure, { value: 3, context: "failed", label: "3 failed jobs", onClick: open, href: "/jobs?f", action: { label: "All jobs", onClick: more, href: "/jobs" } }),
    );
    const figure = page.querySelector('[data-slot="figure-button"]');
    const action = page.querySelector('[data-slot="figure-action"]');
    expect([figure?.tagName, figure?.getAttribute("href"), figure?.getAttribute("aria-label")]).toEqual(["A", "/jobs?f", "3 failed jobs"]);
    expect([action?.tagName, action?.getAttribute("href")]).toEqual(["A", "/jobs"]);
    click(figure as Element);
    click(action as Element);
    expect([open.mock.calls.length, more.mock.calls.length]).toEqual([1, 1]);
  });
});

describe("what counts as a plain press", () => {
  const plain = { defaultPrevented: false, button: 0, metaKey: false, ctrlKey: false, shiftKey: false, altKey: false };
  it("refuses every modifier, a non-primary button and a click another handler took", () => {
    expect(isPlainPrimaryClick(plain)).toBe(true);
    for (const change of [{ defaultPrevented: true }, { button: 1 }, { button: 2 }, { metaKey: true }, { ctrlKey: true }, { shiftKey: true }, { altKey: true }]) {
      expect(isPlainPrimaryClick({ ...plain, ...change })).toBe(false);
    }
  });
});
