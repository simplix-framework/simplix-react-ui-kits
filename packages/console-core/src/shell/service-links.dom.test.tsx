import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { TooltipProvider } from "@simplix-react/ui";

import { ConsoleServiceLinks, type ConsoleServiceLink, type ConsoleServiceLinksLayout } from "./service-links";

/**
 * The services' menu on a real document: it opens upward from the column's row and to the right of the
 * rail's mark, lists every configured service with no opener and no referrer, and closes on Escape.
 */

const LINKS: readonly ConsoleServiceLink[] = [
  { key: "portal", label: "Customer portal", href: " https://portal.example.test/ " },
  { key: "unset", label: "Unset service", href: undefined },
  { key: "mail", label: "Mail catcher", href: "http://localhost:8025/" },
];

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
  document.body.innerHTML = "";
});

function mount(layout: ConsoleServiceLinksLayout) {
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  act(() => root?.render(createElement(TooltipProvider, null, createElement(ConsoleServiceLinks, { title: "Related services", links: LINKS, layout }))));
}

function open(trigger: HTMLElement) {
  // Radix opens a menu on the pointer's press, not on a click.
  act(() => {
    trigger.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, button: 0, ctrlKey: false, pointerType: "mouse" }));
  });
}

function menuAnchors(): HTMLAnchorElement[] {
  return [...document.body.querySelectorAll<HTMLAnchorElement>('[role="menu"] a')];
}

describe.each<ConsoleServiceLinksLayout>(["column", "rail"])("the services' menu in the %s", (layout) => {
  it("draws no service until it is opened, then every configured one", () => {
    mount(layout);
    expect(menuAnchors()).toHaveLength(0);
    open(host!.querySelector<HTMLElement>("button")!);
    expect(menuAnchors().map((anchor) => anchor.getAttribute("href"))).toEqual(["https://portal.example.test/", "http://localhost:8025/"]);
  });

  it("opens every service in a new tab with no opener and no referrer", () => {
    mount(layout);
    open(host!.querySelector<HTMLElement>("button")!);
    for (const anchor of menuAnchors()) {
      expect(anchor.getAttribute("target")).toBe("_blank");
      expect(anchor.getAttribute("rel")).toBe("noopener noreferrer");
    }
  });

  it("opens on the side the layout leaves free", () => {
    mount(layout);
    const trigger = host!.querySelector<HTMLElement>("button")!;
    open(trigger);
    const content = document.body.querySelector<HTMLElement>('[role="menu"]')!;
    expect(content.getAttribute("data-side")).toBe(layout === "column" ? "top" : "right");
  });
});
