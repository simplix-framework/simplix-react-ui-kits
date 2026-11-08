import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { UIProvider } from "@simplix-react/ui";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { RecordForm, type RecordFormProps } from "./record-form";

/**
 * A save the server has not answered yet: the primary button is disabled and says it is working, in
 * the kit's saving word or the one the screen gives it, instead of a dead button with its old label.
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

const sections = [{ key: "s", title: "S", fields: [{ key: "name", kind: "text" as const, label: "Name", value: "Ada" }] }];

function mount(props: Partial<RecordFormProps>) {
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  act(() => root?.render(createElement(UIProvider, { children: createElement(RecordForm, { title: "Invite", submitLabel: "Send invite", sections, ...props }) })));
}

const submitButton = () => host?.querySelector('button[type="submit"]') as HTMLButtonElement;

describe("a RecordForm whose save is held", () => {
  it("disables the button and draws the kit's saving word in place of its label", async () => {
    let answer: (value: unknown) => void = () => undefined;
    mount({ onSubmit: () => new Promise((accept) => (answer = accept)) });
    expect(submitButton().textContent).toContain("Send invite");
    act(() => submitButton().click());
    expect(submitButton().disabled).toBe(true);
    // No catalog is loaded here, so the kit's word reads as its key.
    expect(submitButton().textContent).toContain("recordForm.saving");
    expect(submitButton().textContent).not.toContain("Send invite");
    await act(async () => answer(1));
    expect(submitButton().disabled).toBe(false);
    expect(submitButton().textContent).toContain("Send invite");
  });

  it("draws the screen's own running word when it gives one", () => {
    mount({ runningLabel: "Sending...", onSubmit: () => new Promise(() => undefined) });
    act(() => submitButton().click());
    expect(submitButton().textContent).toContain("Sending...");
  });
});
