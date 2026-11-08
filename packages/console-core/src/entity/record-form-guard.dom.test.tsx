import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { RouterContext, UIProvider, type RouterAdapter, type RouterBlockRequest } from "@simplix-react/ui";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { RecordForm, type RecordFormProps } from "./record-form";

/**
 * A form with typed input holds the navigation that would discard it: a menu link, Back, or a tab
 * press that moves the address. The page that draws a `RecordForm` (the account's own profile among
 * them) mounts no guard of its own, so the form is where this has to hold. The router adapter here
 * records what the guard asks it for, as the TanStack adapter's `useBlocker` receives it.
 */

let root: Root | undefined;
let host: HTMLElement | undefined;
/** The latest request the form's guard made of the router. */
let asked: RouterBlockRequest | undefined;

const router: RouterAdapter = {
  navigate: () => undefined,
  getSearchParams: () => new URLSearchParams(),
  setSearchParams: () => undefined,
  useCurrentPath: () => "/me",
  useBlocker: (request) => {
    asked = request;
  },
};

beforeAll(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
});

afterEach(() => {
  act(() => root?.unmount());
  host?.remove();
  root = undefined;
  host = undefined;
  asked = undefined;
});

const sections = [{ key: "s", title: "S", fields: [{ key: "name", kind: "text" as const, label: "Name", value: "Ada" }] }];

function mount(props: Partial<RecordFormProps> = {}) {
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  const form = createElement(RecordForm, { title: "Profile", submitLabel: "Save", sections, ...props });
  act(() => root?.render(createElement(UIProvider, { children: createElement(RouterContext.Provider, { value: router, children: form }) })));
}

const input = () => host?.querySelector("input") as HTMLInputElement;
const submitButton = () => host?.querySelector('button[type="submit"]') as HTMLButtonElement;

/** Types into the field the way a reader does: through the value setter React watches, then an input event. */
function type(value: string) {
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set;
  act(() => {
    setter?.call(input(), value);
    input().dispatchEvent(new Event("input", { bubbles: true }));
  });
}

describe("a RecordForm and the navigation that would leave it", () => {
  it("holds nothing while the form is as it was drawn", () => {
    mount();
    expect(asked?.enabled).toBe(false);
  });

  it("holds the navigation once a value differs from the one the form started with", () => {
    mount();
    type("Grace");
    expect(asked?.enabled).toBe(true);
  });

  it("lets go again when the value is typed back to the one it started with", () => {
    mount();
    type("Grace");
    type("Ada");
    expect(asked?.enabled).toBe(false);
  });

  it("does not hold the navigation while a save is in flight, which is not unsaved input", () => {
    mount({ onSubmit: () => new Promise(() => undefined) });
    type("Grace");
    expect(asked?.enabled).toBe(true);
    act(() => submitButton().click());
    expect(asked?.enabled).toBe(false);
  });
});
