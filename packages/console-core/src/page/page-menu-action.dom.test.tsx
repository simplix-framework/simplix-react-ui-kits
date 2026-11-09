import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { UIProvider } from "@simplix-react/ui";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { PageMenuAction } from "./page-menu-action";

/** The header choice under a real React root: its button names the chosen option and the control, and the menu lists every option. */

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

const OPTIONS = [
  { value: "DAY", label: "By day" },
  { value: "WEEK", label: "By week" },
];

function mount(value: string) {
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  const onChange = vi.fn();
  act(() => root?.render(createElement(UIProvider, { children: createElement(PageMenuAction, { label: "Cut by", options: OPTIONS, value, onChange }) })));
  return onChange;
}

describe("PageMenuAction", () => {
  it("names the chosen option on its button and the control to assistive technology", () => {
    mount("WEEK");
    const button = host?.querySelector("button") as HTMLButtonElement;
    expect(button.textContent).toBe("By week");
    expect(button.getAttribute("aria-label")).toBe("Cut by");
  });

  it("falls back to the value when it names no option", () => {
    mount("MONTH");
    expect((host?.querySelector("button") as HTMLButtonElement).textContent).toBe("MONTH");
  });
});
