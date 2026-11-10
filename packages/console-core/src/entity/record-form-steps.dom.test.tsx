import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { UIProvider } from "@simplix-react/ui";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { ClientRefusal, RecordForm } from "./record-form";
import type { RecordFormSection } from "./record-form-types";

/**
 * A stepped form draws one section at a time, holds the reader on a step whose required fields are
 * empty or whose own check refuses, shows every answer before anything is sent, and sends once.
 */

let root: Root | undefined;
let host: HTMLElement | undefined;

beforeAll(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  Element.prototype.scrollIntoView = vi.fn();
  Element.prototype.scrollTo = vi.fn();
  vi.stubGlobal("ResizeObserver", class { observe() {} unobserve() {} disconnect() {} });
  // jsdom has no CSS.escape, which the form uses to find a field to focus.
  vi.stubGlobal("CSS", { escape: (value: string) => value });
  vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
    callback(0);
    return 0;
  });
});

afterEach(() => {
  act(() => root?.unmount());
  host?.remove();
  root = undefined;
  host = undefined;
});

const sections: RecordFormSection[] = [
  { key: "who", title: "Who", description: "Pick the account", fields: [{ key: "name", kind: "text", label: "Name", required: true, value: "" }] },
  {
    key: "scope",
    title: "Scope",
    fields: [
      { key: "axis", kind: "radio", label: "Axis", required: true, value: "", options: [{ value: "site", label: "Site" }, { value: "team", label: "Team" }] },
      { key: "site", kind: "text", label: "Site name", required: true, value: "", shownWhen: { field: "axis", is: ["site"] } },
      { key: "team", kind: "text", label: "Team name", required: true, value: "", shownWhen: { field: "axis", is: ["team"] } },
    ],
  },
  { key: "terms", title: "Terms", fields: [{ key: "reason", kind: "textarea", label: "Reason", required: true, value: "" }] },
];

function mount(props: { onSubmit?: (values: Readonly<Record<string, unknown>>) => void | Promise<unknown>; validateStep?: (keys: readonly string[], values: Readonly<Record<string, unknown>>) => void } = {}) {
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  act(() => root?.render(createElement(UIProvider, { children: createElement(RecordForm, { title: "Grant", submitLabel: "Grant access", sections, onCancel: () => undefined, onSubmit: props.onSubmit, steps: { validateStep: props.validateStep } }) })));
}

const input = (label: string) => host?.querySelector(`[data-record-field="${label}"] input, [data-record-field="${label}"] textarea`) as HTMLInputElement | HTMLTextAreaElement | null;
const submitButton = () => host?.querySelector('button[type="submit"]') as HTMLButtonElement;
const strip = () => [...(host?.querySelectorAll('[data-slot="wizard-step-cell"]') ?? [])].map((cell) => cell.textContent);
const current = () => host?.querySelector('[aria-current="step"]')?.textContent;
const text = () => host?.textContent ?? "";

async function type(key: string, value: string) {
  const element = input(key)!;
  const setter = Object.getOwnPropertyDescriptor(element instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype, "value")!.set!;
  await act(async () => {
    setter.call(element, value);
    element.dispatchEvent(new Event("input", { bubbles: true }));
  });
}
async function press(button: Element | null | undefined) {
  await act(async () => (button as HTMLButtonElement).click());
  await act(async () => void (await Promise.resolve()));
}
const next = () => press(submitButton());
const back = () => press([...(host?.querySelectorAll("button") ?? [])].find((button) => button.textContent === "recordForm.back"));

describe("a stepped RecordForm", () => {
  it("draws the strip with a cell per section and a review, and the step in hand", () => {
    mount();
    expect(strip().map((cell) => cell?.replace(/^\d+/, ""))).toEqual(["Who", "Scope", "Terms", "recordForm.stepReview"]);
    expect(current()).toContain("Who");
    // Only the first section is drawn; the others wait for their turn.
    expect(input("name")).not.toBeNull();
    expect(input("axis")).toBeNull();
    expect(text()).toContain("Pick the account");
    expect(submitButton().textContent).toBe("recordForm.next");
  });

  it("holds the reader on a step whose required field is empty and marks it", async () => {
    mount();
    await next();
    expect(current()).toContain("Who");
    expect(host?.querySelector('[data-record-field="name"]')?.textContent).toContain("recordForm.errors.required");
  });

  it("holds the reader on a step whose own check refuses, with the refusal in the banner", async () => {
    mount({
      validateStep: (keys) => {
        if (keys.includes("name")) throw new ClientRefusal([{ field: "name", message: "Taken" }]);
      },
    });
    await type("name", "Ada");
    await next();
    expect(current()).toContain("Who");
    expect(host?.querySelector("[data-record-refusal]")?.textContent).toContain("recordForm.refusedCheck");
  });

  it("asks for a later field only while the choice that shows it holds, and reviews only what is shown", async () => {
    mount();
    await type("name", "Ada");
    await next();
    expect(current()).toContain("Scope");
    expect(input("site")).toBeNull();
    expect(input("team")).toBeNull();
    await press(host?.querySelector('[data-record-field="axis"] [role="radio"][value="team"]'));
    expect(input("team")).not.toBeNull();
    expect(input("site")).toBeNull();
    await type("team", "Platform");
    await next();
    await type("reason", "Cover an absence");
    await next();
    expect(current()).toContain("recordForm.stepReview");
    // The axis that was chosen and the field it showed are listed; the field it hid is not.
    expect(text()).toContain("Team");
    expect(text()).toContain("Platform");
    expect(text()).not.toContain("Site name");
  });

  it("sends once, from the review, with every answer, and not from a step before it", async () => {
    const onSubmit = vi.fn();
    const only: RecordFormSection[] = [
      { key: "a", title: "A", fields: [{ key: "x", kind: "text", label: "X", required: true, value: "" }] },
      { key: "b", title: "B", fields: [{ key: "y", kind: "text", label: "Y", value: "kept" }] },
    ];
    host = document.createElement("div");
    document.body.append(host);
    root = createRoot(host);
    act(() => root?.render(createElement(UIProvider, { children: createElement(RecordForm, { title: "T", submitLabel: "Send", sections: only, onSubmit, steps: {} }) })));
    await type("x", "one");
    await next();
    expect(onSubmit).not.toHaveBeenCalled();
    await next();
    // The review: both steps' answers, named, and the submit's own word on the button.
    expect(current()).toContain("recordForm.stepReview");
    expect(text()).toContain("one");
    expect(text()).toContain("kept");
    expect(submitButton().textContent).toBe("Send");
    expect(onSubmit).not.toHaveBeenCalled();
    await next();
    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith({ x: "one", y: "kept" });
  });

  it("keeps the answers when the reader goes back, and goes back through the strip to a step it passed", async () => {
    mount();
    await type("name", "Ada");
    await next();
    expect(current()).toContain("Scope");
    await back();
    expect(current()).toContain("Who");
    expect(input("name")?.value).toBe("Ada");
    await next();
    // A step the reader has not reached is not a button; the one passed is.
    const cells = host?.querySelectorAll('[data-slot="wizard-step-cell"]') ?? [];
    expect(cells[0]?.tagName).toBe("BUTTON");
    expect(cells[2]?.tagName).toBe("DIV");
    await press(cells[0]);
    expect(current()).toContain("Who");
  });
});
