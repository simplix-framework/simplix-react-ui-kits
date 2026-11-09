import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { UIProvider } from "@simplix-react/ui";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { PageBanner } from "./page-banner";

/** The page banner under a real React root: it says its title and hint, offers its action, and has no control that puts it away. */

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

function mount(props: Parameters<typeof PageBanner>[0]) {
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  act(() => root?.render(createElement(UIProvider, { children: createElement(PageBanner, props) })));
}

describe("PageBanner", () => {
  it("says what happened and runs its action, and offers no way to put it away", () => {
    const retry = vi.fn();
    mount({ tone: "danger", title: "The report could not be read", hint: "Choose another period.", actionLabel: "Try again", onAction: retry });
    expect(host?.textContent).toContain("The report could not be read");
    expect(host?.textContent).toContain("Choose another period.");
    const buttons = [...(host?.querySelectorAll("button") ?? [])];
    expect(buttons.map((button) => button.textContent)).toEqual(["Try again"]);
    act(() => buttons[0]?.click());
    expect(retry).toHaveBeenCalledOnce();
  });

  it("draws no button when it has no action", () => {
    mount({ tone: "info", title: "Nothing to mend" });
    expect(host?.querySelectorAll("button").length).toBe(0);
  });
});
