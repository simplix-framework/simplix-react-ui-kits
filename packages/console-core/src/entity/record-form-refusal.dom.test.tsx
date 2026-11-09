import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { UIProvider } from "@simplix-react/ui";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { ClientRefusal, RecordForm } from "./record-form";

/**
 * A refused save is told in a banner at the top of the form, headed by who refused it: the page's
 * own check before any request, or the server. The banner takes the focus when it appears, so a
 * refusal above the fold of a long form is read and not missed.
 */

let root: Root | undefined;
let host: HTMLElement | undefined;

beforeAll(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  // jsdom has no layout, so it has no scrolling either.
  Element.prototype.scrollIntoView = vi.fn();
});

afterEach(() => {
  act(() => root?.unmount());
  host?.remove();
  root = undefined;
  host = undefined;
});

const sections = [{ key: "s", title: "S", fields: [{ key: "name", kind: "text" as const, label: "Name", value: "Ada" }] }];

function mount(onSubmit: () => Promise<unknown>) {
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  act(() => root?.render(createElement(UIProvider, { children: createElement(RecordForm, { title: "Invite", submitLabel: "Send", sections, onSubmit }) })));
}

const banner = () => host?.querySelector("[data-record-refusal]") as HTMLElement | null;

async function submit() {
  await act(async () => (host?.querySelector('button[type="submit"]') as HTMLButtonElement).click());
  await act(async () => void (await Promise.resolve()));
}

describe("a RecordForm whose save was refused", () => {
  it("heads a refusal of the page's own check as a check, and moves the focus to the banner", async () => {
    mount(() => Promise.reject(new ClientRefusal([{ field: "name", message: "Too short" }])));
    await submit();
    expect(banner()?.textContent).toContain("recordForm.refusedCheck");
    expect(banner()?.textContent).not.toContain("recordForm.refused\u0000");
    expect(banner()?.getAttribute("role")).toBe("alert");
    expect(document.activeElement).toBe(banner());
  });

  it("heads a refusal the server answered as the server's, and moves the focus the same way", async () => {
    mount(() => Promise.reject(new Error("The bucket does not exist")));
    await submit();
    expect(banner()?.textContent).toContain("recordForm.refused");
    expect(banner()?.textContent).not.toContain("recordForm.refusedCheck");
    expect(banner()?.textContent).toContain("The bucket does not exist");
    expect(document.activeElement).toBe(banner());
  });

  it("draws no banner while nothing was refused", async () => {
    mount(() => Promise.resolve());
    await submit();
    expect(banner()).toBeNull();
  });
});
