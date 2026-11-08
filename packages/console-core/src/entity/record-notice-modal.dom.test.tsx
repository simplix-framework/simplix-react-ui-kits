import { act, createElement, useState, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { Dialog, DialogContent, DialogTitle, UIProvider } from "@simplix-react/ui";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { NoticeDismissalsProvider, NoticeMenu, NoticeRegistryProvider, type NoticeDismissals } from "../notice";
import { ActionDialog } from "../page/action-dialog";
import { CrudPresentationProvider, type CrudPresentation } from "../page/crud-page";
import { RecordDetail, type RecordDetailProps } from "./record-detail";

/**
 * A record notice put away inside a modal surface (the drawer, the dialog) has a way back the
 * reader can press. The modal's overlay covers the page header and the control it draws, so the
 * control is drawn in the record's own head; once the surface is closed the page header's control
 * lists the notice again, because the put-away choice outlives the surface.
 *
 * <p>The surface is a real Radix modal dialog, which is what a drawer is made of: its content is
 * portalled, the rest of the page is hidden from assistive technology and covered by the overlay.
 * The overlay's geometry is not computed by a DOM without layout, so "not covered" is asserted as
 * "inside the modal's own content", the one place the overlay never lies over.
 */

const NOTICE_KEY = "test.record.suspended";
const notices: RecordDetailProps["notices"] = [{ key: "suspended", noticeKey: NOTICE_KEY, tone: "warning", title: "Suspended marker", body: "Body marker" }];

let root: Root | undefined;
let host: HTMLElement | undefined;
/** Which keys the operator has put away; shared by every record, as the real state key is. */
let hidden: string[] = [];

beforeAll(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  // The card folds out over a transition unless the reader prefers reduced motion; a DOM without
  // layout fires no transition end, so the test reads as a reader who prefers none.
  // A card brought back scrolls itself into view, which a DOM without layout does not implement.
  Element.prototype.scrollIntoView = () => undefined;
  vi.stubGlobal("matchMedia", (query: string) => ({ matches: true, media: query, addEventListener: () => undefined, removeEventListener: () => undefined }));
});

afterEach(() => {
  act(() => root?.unmount());
  host?.remove();
  root = undefined;
  host = undefined;
  hidden = [];
});

/** A put-away set the harness owns, so pressing a card's close and "Show again" change what is drawn. */
function useDismissals(): NoticeDismissals {
  const [keys, setKeys] = useState<string[]>(hidden);
  return {
    ready: true,
    isHidden: (key) => keys.includes(key),
    hiddenKeys: keys,
    hide: (key) => setKeys((now) => (now.includes(key) ? now : [...now, key])),
    show: (key) => setKeys((now) => now.filter((one) => one !== key)),
  };
}

function Page({ open, presentation, record }: { open: boolean; presentation: CrudPresentation["presentation"]; record: string }): ReactNode {
  const dismissals = useDismissals();
  return createElement(
    NoticeDismissalsProvider,
    { value: dismissals },
    createElement(
      NoticeRegistryProvider,
      null,
      // The page header: the control it draws is the one the overlay covers.
      createElement("header", { "data-testid": "page-header" }, createElement(NoticeMenu)),
      createElement(
        Dialog,
        { open },
        createElement(
          DialogContent,
          { "aria-describedby": undefined },
          createElement(DialogTitle, null, "Record"),
          createElement(
            CrudPresentationProvider,
            { value: { presentation, close: () => undefined } },
            createElement(RecordDetail, { title: record, notices, sections: [{ key: "main", title: "Main", fields: [{ label: "State", value: "Suspended" }] }] }),
          ),
        ),
      ),
    ),
  );
}

function mount(props: { open: boolean; presentation: CrudPresentation["presentation"]; record: string }): void {
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  render(props);
}

function render(props: { open: boolean; presentation: CrudPresentation["presentation"]; record: string }): void {
  act(() => root?.render(createElement(UIProvider, { children: createElement(Page, props) })));
}

const modal = () => document.body.querySelector('[role="dialog"]') as HTMLElement | null;
const pageHeader = () => document.body.querySelector('[data-testid="page-header"]') as HTMLElement;
/** No catalog is loaded here, so a control's name reads as its key. */
const WAY_BACK = 'button[aria-label="notice.openHidden"]';

/** Opens a menu the way the keyboard does: a DOM without pointer events does not open Radix's on a click. */
function open(trigger: Element): void {
  act(() => void trigger.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true })));
}

/** Presses the card's own close mark. */
function hideCard(): void {
  const close = modal()?.querySelector<HTMLButtonElement>('button[aria-label="notice.hide"]');
  if (!close) throw new Error("the card has no close mark");
  act(() => void close.click());
}

const showAgain = () => [...document.body.querySelectorAll('[role="menuitem"]')].find((item) => item.textContent?.includes("notice.show")) as HTMLElement | undefined;

describe("a record notice put away inside a modal surface", () => {
  it("is drawn as a card with a close, and no way back while nothing is put away", () => {
    mount({ open: true, presentation: "drawer", record: "Voice one" });
    expect(modal()?.textContent).toContain("Suspended marker");
    expect(modal()?.querySelector('button[aria-label="notice.hide"]')).not.toBeNull();
    expect(modal()?.querySelector(WAY_BACK)).toBeNull();
    expect(pageHeader().querySelector(WAY_BACK)).toBeNull();
  });

  it("leaves a way back inside the modal's own content, which the overlay does not cover, and it restores the card", () => {
    mount({ open: true, presentation: "drawer", record: "Voice one" });
    hideCard();
    expect(modal()?.textContent).not.toContain("Suspended marker");
    const control = modal()?.querySelector(WAY_BACK);
    expect(control).not.toBeNull();
    // The page header's own control exists too, but it sits outside the modal: behind its overlay.
    expect(modal()?.contains(pageHeader().querySelector(WAY_BACK))).toBe(false);
    open(control as Element);
    expect(showAgain()).toBeDefined();
    act(() => void showAgain()?.click());
    expect(modal()?.textContent).toContain("Suspended marker");
    expect(modal()?.querySelector(WAY_BACK)).toBeNull();
  });

  it("stays reachable from the page header once the surface is closed, and from the next record in the same state", () => {
    mount({ open: true, presentation: "drawer", record: "Voice one" });
    hideCard();

    render({ open: false, presentation: "drawer", record: "Voice one" });
    expect(modal()).toBeNull();
    const headerControl = pageHeader().querySelector(WAY_BACK);
    expect(headerControl).not.toBeNull();
    open(headerControl as Element);
    expect(document.body.textContent).toContain("Suspended marker");

    // Another record in the same state: the state key is shared, so it opens with the card still put away.
    render({ open: true, presentation: "drawer", record: "Voice two" });
    expect(modal()?.textContent).not.toContain("Suspended marker");
    expect(modal()?.querySelector(WAY_BACK)).not.toBeNull();
  });

  it("brings the card back from the page header while no surface is open, and the control goes with it", () => {
    mount({ open: true, presentation: "dialog", record: "Voice one" });
    hideCard();
    render({ open: false, presentation: "dialog", record: "Voice one" });
    open(pageHeader().querySelector(WAY_BACK) as Element);
    act(() => void showAgain()?.click());
    expect(pageHeader().querySelector(WAY_BACK)).toBeNull();
    render({ open: true, presentation: "dialog", record: "Voice one" });
    expect(modal()?.textContent).toContain("Suspended marker");
  });

  it("draws no second control in the record's head where the record sits beside the list and the page header is reachable", () => {
    mount({ open: true, presentation: "panel", record: "Voice one" });
    hideCard();
    expect(modal()?.querySelector(WAY_BACK)).toBeNull();
    expect(pageHeader().querySelector(WAY_BACK)).not.toBeNull();
  });

  it("does not list a card that is neither drawn nor put away when the surface is closed", () => {
    mount({ open: true, presentation: "drawer", record: "Voice one" });
    render({ open: false, presentation: "drawer", record: "Voice one" });
    expect(pageHeader().querySelector(WAY_BACK)).toBeNull();
    expect(pageHeader().querySelector("button")).toBeNull();
  });
});

describe("a record notice put away inside an action dialog", () => {
  it("leaves a way back in the dialog's own head, and in the page header once the dialog is closed", () => {
    function Host({ shown }: { shown: boolean }): ReactNode {
      const dismissals = useDismissals();
      return createElement(
        NoticeDismissalsProvider,
        { value: dismissals },
        createElement(
          NoticeRegistryProvider,
          null,
          createElement("header", { "data-testid": "page-header" }, createElement(NoticeMenu)),
          createElement(ActionDialog, {
            open: shown,
            onOpenChange: () => undefined,
            title: "Revoke grant",
            notices,
            submit: { label: "Revoke", onSubmit: () => undefined },
          }),
        ),
      );
    }
    host = document.createElement("div");
    document.body.append(host);
    root = createRoot(host);
    const draw = (shown: boolean) => act(() => root?.render(createElement(UIProvider, { children: createElement(Host, { shown }) })));
    draw(true);
    hideCard();
    expect(modal()?.textContent).not.toContain("Suspended marker");
    expect(modal()?.querySelector(WAY_BACK)).not.toBeNull();
    draw(false);
    expect(modal()).toBeNull();
    expect(pageHeader().querySelector(WAY_BACK)).not.toBeNull();
  });
});
