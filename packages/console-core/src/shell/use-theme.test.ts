import { afterEach, describe, expect, it, vi } from "vitest";

describe("use-theme without browser storage", () => {
  afterEach(() => {
    Reflect.deleteProperty(globalThis, "localStorage");
    vi.resetModules();
  });

  it("loads where localStorage is not defined, so a module importing it runs in Node", async () => {
    expect(typeof localStorage).toBe("undefined");
    const theme = await import("./use-theme");
    expect(theme.COLOR_THEMES.length).toBeGreaterThan(0);
  });

  it("loads where reading the storage is refused", async () => {
    const refused = {
      getItem: () => {
        throw new DOMException("blocked", "SecurityError");
      },
      setItem: () => {
        throw new DOMException("blocked", "SecurityError");
      },
    };
    Object.assign(globalThis, { localStorage: refused });
    const theme = await import("./use-theme");
    expect(theme.COLOR_THEMES.length).toBeGreaterThan(0);
  });
});
