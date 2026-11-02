import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

// The theme store reads the browser's storage while the module loads, which a test running in node
// does not have; an empty one gives it the defaults.
vi.hoisted(() => {
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: { getItem: () => null, setItem: () => undefined, removeItem: () => undefined },
  });
});

import { PHONE_WINDOW } from "../layout/window-size";
import {
  ConsoleBandMenuDestinations,
  ConsoleBandMenuFooter,
  ConsoleBandTopBar,
  type ConsoleBandDestination,
} from "./top-bar-window";

/**
 * Stands in for the browser's `matchMedia`: the phone query matches while `phone` is set, which is
 * what a window narrower than the phone width reports. The hook reads it on the first render, so
 * a static render sees the width the test chose.
 */
function setWindow(phone: boolean): void {
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: {
      matchMedia: (query: string) => ({
        matches: query === PHONE_WINDOW && phone,
        addEventListener: () => undefined,
        removeEventListener: () => undefined,
      }),
    },
  });
}

afterEach(() => {
  Reflect.deleteProperty(globalThis, "window");
});

const DESTINATIONS: readonly ConsoleBandDestination[] = [
  { key: "credits", label: "Credits", current: true, onSelect: () => undefined },
  { key: "consents", label: "Consents", onSelect: () => undefined },
];

function band(): string {
  return renderToStaticMarkup(
    createElement(
      ConsoleBandTopBar,
      { mark: "Mark", home: { href: "/", label: "Home" }, destinations: DESTINATIONS, phoneMenu: "Account row" },
      createElement("span", null, "Wide controls"),
    ),
  );
}

describe("ConsoleBandTopBar", () => {
  it("draws the destinations and the controls in one row on a window wider than a phone", () => {
    setWindow(false);
    const html = band();
    expect(html).toContain('data-part="console-band-top-bar"');
    expect(html).toContain("Credits");
    expect(html).toContain("Consents");
    expect(html).toContain("Wide controls");
    expect(html).not.toContain('data-part="console-phone-bar"');
  });

  it("links the mark to the first screen when it is given a home", () => {
    setWindow(false);
    expect(band()).toContain('href="/"');
    expect(band()).toContain('aria-label="Home"');
  });

  it("draws the phone bar with one menu button and none of the row that overflows a phone", () => {
    setWindow(true);
    const html = band();
    expect(html).toContain('data-part="console-phone-bar"');
    expect(html).toContain('aria-haspopup="dialog"');
    expect(html).toContain('aria-label="phone.menu"');
    expect(html).toContain("Mark");
    expect(html).not.toContain('data-part="console-band-top-bar"');
    // The destinations and the controls moved into the sheet, closed until the button is pressed.
    expect(html).not.toContain("Credits");
    expect(html).not.toContain("Wide controls");
    expect(html).not.toContain("Account row");
  });

  it("keeps the mark linked to the first screen on a phone", () => {
    setWindow(true);
    const html = band();
    expect(html).toContain('href="/"');
    expect(html).toContain('aria-label="Home"');
  });
});

describe("the phone sheet of the band", () => {
  it("lists every destination as a row of its own and marks the one the reader stands on", () => {
    const html = renderToStaticMarkup(createElement(ConsoleBandMenuDestinations, { destinations: DESTINATIONS, onClose: () => undefined }));
    expect(html).toContain("Credits");
    expect(html).toContain("Consents");
    expect(html.match(/aria-current="page"/g)).toHaveLength(1);
    expect(html).toContain("min-h-11");
  });

  it("carries the language and theme rows and the app's own rows, without the display settings", () => {
    const html = renderToStaticMarkup(createElement(ConsoleBandMenuFooter, { phoneMenu: "Account row", onClose: () => undefined }));
    expect(html).toContain("Account row");
    expect(html).toContain("theme.language");
    expect(html).toContain("theme.darkMode");
    expect(html).not.toContain("display.title");
  });
});
