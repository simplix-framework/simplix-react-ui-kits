import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { UIProvider } from "@simplix-react/ui";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { ActionDialog, type ActionDialogProps } from "./action-dialog";

/**
 * A decision on a record under a real React root and DOM: while the server answers the dialog holds
 * on its running word and refuses to close; a refusal stays inside it with what was typed; only a
 * success closes it. The same rule serves a decision with an input and one with none.
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

/** Mounts the dialog, open, and returns what it reported closing with. */
function mount(props: Omit<ActionDialogProps, "open" | "onOpenChange" | "title">) {
  const closed = vi.fn();
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  act(() => root?.render(createElement(UIProvider, { children: createElement(ActionDialog, { ...props, title: "Revoke grant", open: true, onOpenChange: closed }) })));
  return closed;
}

const dialog = () => document.body.querySelector('[role="dialog"]') as HTMLElement;
const buttons = () => [...dialog().querySelectorAll("button")];
const named = (label: string) => buttons().find((button) => button.textContent?.includes(label)) as HTMLButtonElement;
const press = (button: HTMLButtonElement) => act(() => void button.click());

/** Lets a promise's continuation and the render it schedules run. */
const settle = () => act(async () => void (await Promise.resolve()));

/** Sets a text input's value the way typing does, so React's change handler runs. */
function type(input: HTMLInputElement, value: string) {
  const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set;
  act(() => {
    set?.call(input, value);
    input.dispatchEvent(new Event("input", { bubbles: true }));
  });
}

const reasonField = [{ key: "reason", title: "Why", fields: [{ key: "reason", kind: "text" as const, label: "Reason", value: "" }] }];

describe("a decision with an input", () => {
  it("holds on its running word while the server answers, and refuses to close", async () => {
    let answer: (value: unknown) => void = () => undefined;
    const closed = mount({ fields: reasonField, submit: { label: "Revoke", runningLabel: "Revoking...", onSubmit: () => new Promise((accept) => (answer = accept)) } });
    press(named("Revoke"));
    expect(named("Revoking...")).toBeDefined();
    expect((named("Revoking...") as HTMLButtonElement).disabled).toBe(true);
    // No catalog is loaded here, so a label reads as its key.
    expect(named("common.cancel").disabled).toBe(true);
    expect(closed).not.toHaveBeenCalled();
    answer(1);
    await settle();
    expect(closed).toHaveBeenCalledWith(false);
  });

  it("stays open on a refusal with the typed reason and the server's words, and closes only on the retry that succeeds", async () => {
    const onSubmit = vi.fn().mockRejectedValueOnce(new Error("Already revoked")).mockResolvedValueOnce(1);
    const closed = mount({ fields: reasonField, submit: { label: "Revoke", onSubmit } });
    type(dialog().querySelector("input") as HTMLInputElement, "Left the company");
    press(named("Revoke"));
    await settle();
    expect(closed).not.toHaveBeenCalled();
    expect(dialog().textContent).toContain("Already revoked");
    expect((dialog().querySelector("input") as HTMLInputElement).value).toBe("Left the company");
    expect(onSubmit).toHaveBeenLastCalledWith({ reason: "Left the company" });

    press(named("Revoke"));
    await settle();
    expect(onSubmit).toHaveBeenCalledTimes(2);
    expect(dialog().textContent).not.toContain("Already revoked");
    expect(closed).toHaveBeenCalledWith(false);
  });

  it("leads the refusal with the action dialog's own key, not the form's 'save again' one", async () => {
    mount({ fields: reasonField, submit: { label: "Revoke", onSubmit: () => Promise.reject(new Error("Already revoked")) } });
    press(named("Revoke"));
    await settle();
    expect(dialog().textContent).toContain("actionDialog.refused");
    expect(dialog().textContent).not.toContain("recordForm.refused");
  });
});

describe("a decision with no input", () => {
  it("holds, then closes on success, as one with an input does", async () => {
    let answer: (value: unknown) => void = () => undefined;
    const closed = mount({ submit: { label: "Reinstate", runningLabel: "Reinstating...", onSubmit: () => new Promise((accept) => (answer = accept)) } });
    press(named("Reinstate"));
    expect(named("Reinstating...").disabled).toBe(true);
    expect(closed).not.toHaveBeenCalled();
    answer(1);
    await settle();
    expect(closed).toHaveBeenCalledWith(false);
  });

  it("stays open on a refusal and says why", async () => {
    const closed = mount({ submit: { label: "Reinstate", onSubmit: () => Promise.reject(new Error("The account is closed")) } });
    press(named("Reinstate"));
    await settle();
    expect(closed).not.toHaveBeenCalled();
    expect(dialog().textContent).toContain("The account is closed");
  });
});
