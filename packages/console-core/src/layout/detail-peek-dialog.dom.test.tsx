import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { UIProvider } from "@simplix-react/ui";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { DetailPeekDialog } from "./detail-peek-dialog";

/**
 * A peek is a record opened in a dialog, so it takes the width of a record opened in one: the theme's
 * `--detail-dialog-width`. A theme that names none leaves the dialog at its own class width.
 */

let root: Root | undefined;

beforeAll(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
});

afterEach(() => {
  act(() => root?.unmount());
  root = undefined;
  document.documentElement.style.removeProperty("--detail-dialog-width");
  document.body.replaceChildren();
});

function mount(): HTMLElement | null {
  const host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  act(() =>
    root?.render(
      createElement(UIProvider, {
        children: createElement(DetailPeekDialog, { open: true, onOpenChange: () => undefined, title: "Record", closeLabel: "Close", children: "body" }),
      }),
    ),
  );
  return document.querySelector('[role="dialog"]');
}

describe("DetailPeekDialog width", () => {
  it("caps the dialog at the theme's dialog width, and never past the window", () => {
    document.documentElement.style.setProperty("--detail-dialog-width", "1120px");
    const dialog = mount();
    expect(dialog?.style.maxWidth).toBe("min(1120px, calc(100% - 2rem))");
  });

  it("keeps the class width where the theme names none", () => {
    const dialog = mount();
    expect(dialog).not.toBeNull();
    expect(dialog?.style.maxWidth).toBe("");
    expect(dialog?.className).toContain("sm:max-w-3xl");
  });
});
