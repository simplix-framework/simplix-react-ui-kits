import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { TooltipProvider, UIProvider } from "@simplix-react/ui";

import { ConsoleMenuSearch } from "./menu-search";
import { ConsoleMenuColumn, ConsoleMenuRail } from "./menu-tree";

/**
 * The console's search stands at the foot of the menu: a field across the expanded column, between
 * the destinations and the services, and a glyph at the end of the rail. Both open the palette.
 */

let root: Root | undefined;
let host: HTMLElement | undefined;

beforeAll(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.stubGlobal("ResizeObserver", class { observe() {} unobserve() {} disconnect() {} });
});

afterEach(() => {
  act(() => root?.unmount());
  host?.remove();
  root = undefined;
  host = undefined;
  document.body.innerHTML = "";
});

function mount(node: ReturnType<typeof createElement>) {
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  act(() => root?.render(createElement(UIProvider, null, createElement(TooltipProvider, null, node))));
}

const searchButton = () => host?.querySelector("button[aria-haspopup='dialog']") as HTMLButtonElement | null;

describe("ConsoleMenuSearch", () => {
  it("opens the palette from the column's field", () => {
    const onOpen = vi.fn();
    mount(createElement(ConsoleMenuSearch, { onOpen }));
    expect(searchButton()?.textContent).toContain("⌘K");
    act(() => searchButton()?.click());
    expect(onOpen).toHaveBeenCalledTimes(1);
  });

  it("is a glyph without the field's word or key on the rail", () => {
    const onOpen = vi.fn();
    mount(createElement(ConsoleMenuSearch, { onOpen, layout: "rail" }));
    expect(searchButton()?.textContent).toBe("");
    act(() => searchButton()?.click());
    expect(onOpen).toHaveBeenCalledTimes(1);
  });
});

describe("the menu column and rail with a search", () => {
  it("draws the column's search after the destinations and before the foot", () => {
    mount(
      createElement(ConsoleMenuColumn, {
        label: "Menu",
        title: "Area",
        search: createElement("i", { "data-test": "search" }),
        foot: createElement("i", { "data-test": "foot" }),
        children: createElement("i", { "data-test": "body" }),
      }),
    );
    const order = [...(host?.querySelectorAll("[data-test]") ?? [])].map((el) => el.getAttribute("data-test"));
    expect(order).toEqual(["body", "search", "foot"]);
  });

  it("leaves off the services' own rule under a search, which has its rule above it", () => {
    mount(createElement(ConsoleMenuColumn, { label: "Menu", title: "Area", search: createElement("i"), children: createElement("i") }));
    expect(host?.querySelector('[aria-label="Menu"]')?.className).toContain("border-t-0");
    act(() => root?.unmount());
    host?.remove();
    mount(createElement(ConsoleMenuColumn, { label: "Menu", title: "Area", children: createElement("i") }));
    expect(host?.querySelector('[aria-label="Menu"]')?.className ?? "").not.toContain("border-t-0");
  });

  it("draws nothing extra in the column without one", () => {
    mount(createElement(ConsoleMenuColumn, { label: "Menu", title: "Area", foot: createElement("i", { "data-test": "foot" }), children: createElement("i") }));
    expect(host?.querySelector('[data-part="console-menu-search-box"]')).toBeNull();
  });

  it("ends the rail with the search above the foot, and ends it with the search alone", () => {
    mount(
      createElement(ConsoleMenuRail, {
        label: "Rail",
        search: createElement("i", { "data-test": "search" }),
        foot: createElement("i", { "data-test": "foot" }),
        children: createElement("i", { "data-test": "mark" }),
      }),
    );
    expect([...(host?.querySelectorAll("[data-test]") ?? [])].map((el) => el.getAttribute("data-test"))).toEqual(["mark", "search", "foot"]);
    act(() => root?.unmount());
    host?.remove();
    mount(createElement(ConsoleMenuRail, { label: "Rail", search: createElement("i", { "data-test": "search" }), children: createElement("i", { "data-test": "mark" }) }));
    expect(host?.querySelector('[data-test="search"]')).not.toBeNull();
  });
});
