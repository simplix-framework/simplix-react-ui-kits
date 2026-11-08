import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { SCHEME_SWITCH_ATTRIBUTE } from "./scheme-switch";
import { useTheme } from "./use-theme";

/**
 * The real hook on a real document element: the mark is set before the class or the colour theme
 * changes, is still set when the styles are read, and is gone once the change is drawn.
 */

let root: Root | undefined;
let host: HTMLElement | undefined;
const held: { theme?: ReturnType<typeof useTheme> } = {};

function Probe() {
  held.theme = useTheme();
  return null;
}

beforeAll(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
});

afterEach(() => {
  act(() => root?.unmount());
  host?.remove();
  root = undefined;
  host = undefined;
  document.documentElement.classList.remove("dark");
  document.documentElement.removeAttribute("data-color-theme");
});

function mount() {
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  act(() => root?.render(createElement(Probe)));
}

/** What happens to the document element while `run` executes: the order of the mark, the class and the colour theme. */
function observe(run: () => void): string[] {
  const events: string[] = [];
  const observer = new MutationObserver(() => undefined);
  const html = document.documentElement;
  observer.observe(html, { attributes: true, attributeOldValue: true });
  run();
  for (const record of observer.takeRecords()) {
    const name = record.attributeName ?? "";
    if (name === SCHEME_SWITCH_ATTRIBUTE) events.push(html.hasAttribute(SCHEME_SWITCH_ATTRIBUTE) || record.oldValue === null ? "mark" : "unmark");
    else events.push(name);
  }
  observer.disconnect();
  return events;
}

describe("the console's scheme switch", () => {
  it("marks the document element around the dark class and leaves no mark behind", () => {
    mount();
    const events = observe(() => act(() => held.theme?.setDarkMode(true)));
    expect(events).toEqual(["mark", "class", "unmark"]);
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(document.documentElement.hasAttribute(SCHEME_SWITCH_ATTRIBUTE)).toBe(false);
  });

  it("marks the change of colour theme the same way", () => {
    mount();
    const events = observe(() => act(() => held.theme?.setColorTheme("ocean")));
    expect(events).toEqual(["mark", "data-color-theme", "unmark"]);
    expect(document.documentElement.getAttribute("data-color-theme")).toBe("ocean");
  });

  it("does not mark a document that already carries the scheme", () => {
    mount();
    act(() => held.theme?.setDarkMode(true));
    const events = observe(() => act(() => held.theme?.setDarkMode(true)));
    expect(events).toEqual([]);
  });
});
