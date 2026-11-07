import { describe, expect, it } from "vitest";

import { routesInPage, type SitePress } from "./routes-in-page";

const plain: SitePress = { button: 0, metaKey: false, ctrlKey: false, shiftKey: false, altKey: false, defaultPrevented: false };
const ORIGIN = "https://portal.example.test";

describe("routesInPage", () => {
  it("routes a plain press on an address of the page's own origin, relative or absolute", () => {
    expect(routesInPage(plain, "/pricing?cycle=yearly", {}, ORIGIN)).toBe(true);
    expect(routesInPage(plain, `${ORIGIN}/help/novoice`, {}, ORIGIN)).toBe(true);
  });

  it("leaves another origin's address, a download and a named window to the browser", () => {
    expect(routesInPage(plain, "https://files.example.test/StageVoice.dmg", {}, ORIGIN)).toBe(false);
    expect(routesInPage(plain, "https://id.example.test/realms/stagevoice/account", {}, ORIGIN)).toBe(false);
    expect(routesInPage(plain, "/files/receipt.pdf", { download: "" }, ORIGIN)).toBe(false);
    expect(routesInPage(plain, "/terms", { target: "_blank" }, ORIGIN)).toBe(false);
  });

  it("leaves a press with a key, another button, or one a handler took to the browser", () => {
    expect(routesInPage({ ...plain, metaKey: true }, "/pricing", {}, ORIGIN)).toBe(false);
    expect(routesInPage({ ...plain, button: 1 }, "/pricing", {}, ORIGIN)).toBe(false);
    expect(routesInPage({ ...plain, defaultPrevented: true }, "/pricing", {}, ORIGIN)).toBe(false);
  });
});
