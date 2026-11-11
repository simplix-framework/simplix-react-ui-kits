import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { TooltipProvider, UIProvider } from "@simplix-react/ui";
import { ConsolePreviewPhoneMenu, type ConsolePreviewChrome } from "./preview-chrome";

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

function mount(open = true) {
  const navigate = vi.fn(), close = vi.fn();
  const chrome = {
    title: "Console", area: "work", current: "tasks", namespace: "phone-menu-test",
    labels: { menu: "Menu" },
    areas: [{ key: "home", label: "Home", href: "/home" }, { key: "empty", label: "Empty area" }, { key: "work", label: "Work" }, { key: "personal", label: "My work" }],
    menuFor: (area: string) => ({ title: area, groups: ["home", "empty"].includes(area) ? [] : [{ key: area, label: area === "work" ? "Work" : "My work", entries: area === "work" ? [{ key: "tasks", label: "Tasks", href: "/tasks" }, { key: "unbuilt", label: "Unavailable" }] : [{ key: "requests", label: "Requests", href: "/requests" }] }] }),
    settings: createElement("button", null, "Language"), navigate,
  } as unknown as ConsolePreviewChrome;
  host = document.createElement("div"); document.body.append(host); root = createRoot(host);
  act(() => root?.render(createElement(UIProvider, null, createElement(TooltipProvider, null, createElement(ConsolePreviewPhoneMenu, { chrome, open, onOpenChange: close })))));
  return { navigate, close };
}

describe("the preview's phone menu", () => {
  it("offers the same declared destinations across areas and keeps unavailable entries inactive", () => {
    mount();
    expect([...document.querySelectorAll("a[href]")].map((link) => link.getAttribute("href"))).toEqual(["/home", "/tasks", "/requests"]);
    expect(document.body.textContent).toContain("Unavailable");
    expect(document.body.textContent).toContain("Language");
  });
  it("prints a shared area and group title once and uses the phone body spacing", () => {
    mount();
    expect(document.body.textContent?.match(/My work/g)).toHaveLength(1);
    expect(document.body.textContent).not.toContain("Empty area");
    expect(document.querySelector('[data-part="console-phone-menu-sheet"] [data-part="console-phone-screen-body"]')).not.toBeNull();
  });
  it("uses the supplied navigation port and closes on a destination", () => {
    const { navigate, close } = mount();
    act(() => (document.querySelector('a[href="/requests"]') as HTMLElement).click());
    expect(navigate).toHaveBeenCalledExactlyOnceWith("/requests");
    expect(close).toHaveBeenCalledWith(false);
  });
  it("does not leave menu links in the document while closed", () => {
    mount(false);
    expect(document.querySelector('a[href="/requests"]')).toBeNull();
  });
});
