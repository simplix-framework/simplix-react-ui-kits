import { describe, expect, it } from "vitest";

import {
  applySiteScheme,
  followSystemScheme,
  parseSiteScheme,
  readSiteScheme,
  SITE_SCHEME_KEY,
  siteSchemeBootstrap,
  writeSiteScheme,
  type SchemeQuery,
  type SchemeStorage,
} from "./site-scheme";

describe("followSystemScheme", () => {
  function fakes(matches: boolean) {
    const listeners = new Set<(event: { readonly matches: boolean }) => void>();
    const query: SchemeQuery = {
      matches,
      addEventListener: (_type, listener) => listeners.add(listener),
      removeEventListener: (_type, listener) => listeners.delete(listener),
    };
    const classes = new Set<string>();
    const target = { classList: { toggle: (token: string, force: boolean) => (force ? classes.add(token) : classes.delete(token), force) } };
    return { query, target, classes, listeners, change: (dark: boolean) => listeners.forEach((listener) => listener({ matches: dark })) };
  }

  it("draws the dark scheme exactly while the system asks for it, and follows a later change", () => {
    const dark = fakes(true);
    followSystemScheme(dark.query, dark.target);
    expect(dark.classes.has("dark")).toBe(true);
    dark.change(false);
    expect(dark.classes.has("dark")).toBe(false);
    const light = fakes(false);
    light.classes.add("dark");
    followSystemScheme(light.query, light.target);
    expect(light.classes.has("dark")).toBe(false);
  });

  it("stops following once the returned function runs", () => {
    const scheme = fakes(false);
    const stop = followSystemScheme(scheme.query, scheme.target);
    expect(scheme.listeners.size).toBe(1);
    stop();
    expect(scheme.listeners.size).toBe(0);
    scheme.change(true);
    expect(scheme.classes.has("dark")).toBe(false);
  });
});

describe("the reader's scheme choice", () => {
  function target() {
    const classes = new Set<string>();
    return { classes, classList: { toggle: (token: string, force: boolean) => (force ? classes.add(token) : classes.delete(token), force) } };
  }
  function query(matches: boolean): SchemeQuery & { readonly count: () => number } {
    const listeners = new Set<unknown>();
    return {
      matches,
      addEventListener: (_type, listener) => listeners.add(listener),
      removeEventListener: (_type, listener) => listeners.delete(listener),
      count: () => listeners.size,
    };
  }
  function memory(initial: Record<string, string> = {}): SchemeStorage & { readonly values: Map<string, string> } {
    const values = new Map(Object.entries(initial));
    return {
      values,
      getItem: (key) => values.get(key) ?? null,
      setItem: (key, value) => void values.set(key, value),
      removeItem: (key) => void values.delete(key),
    };
  }

  it("reads only light and dark as a fixed choice; nothing stored, or anything else, is the system's", () => {
    expect([parseSiteScheme("light"), parseSiteScheme("dark"), parseSiteScheme(null), parseSiteScheme("true"), parseSiteScheme("")]).toEqual(["light", "dark", "system", "system", "system"]);
  });

  it("keeps a fixed choice under its own key and the system's as no value at all", () => {
    const storage = memory();
    writeSiteScheme(storage, "dark");
    expect(storage.values.get(SITE_SCHEME_KEY)).toBe("dark");
    expect(readSiteScheme(storage)).toBe("dark");
    writeSiteScheme(storage, "system");
    expect(storage.values.has(SITE_SCHEME_KEY)).toBe(false);
    expect(readSiteScheme(storage)).toBe("system");
    expect(SITE_SCHEME_KEY).not.toMatch(/:$/);
  });

  it("answers the system's when the store refuses to be read or written", () => {
    const refusing: SchemeStorage = {
      getItem: () => {
        throw new Error("blocked");
      },
      setItem: () => {
        throw new Error("blocked");
      },
      removeItem: () => {
        throw new Error("blocked");
      },
    };
    expect(readSiteScheme(refusing)).toBe("system");
    expect(() => writeSiteScheme(refusing, "dark")).not.toThrow();
  });

  it("draws a fixed choice whatever the system says, and follows the system only for the system's", () => {
    const darkSystem = query(true);
    const light = target();
    applySiteScheme("light", darkSystem, light);
    expect(light.classes.has("dark")).toBe(false);
    expect(darkSystem.count()).toBe(0);
    const lightSystem = query(false);
    const dark = target();
    applySiteScheme("dark", lightSystem, dark);
    expect(dark.classes.has("dark")).toBe(true);
    const followed = target();
    const stop = applySiteScheme("system", darkSystem, followed);
    expect(followed.classes.has("dark")).toBe(true);
    expect(darkSystem.count()).toBe(1);
    stop();
    expect(darkSystem.count()).toBe(0);
  });

  it("opens the page before the first paint exactly as the choice draws it, from the same key", () => {
    // The bootstrap is the text a page puts in its head; it runs here against fakes of what it reads.
    const run = (stored: string | null, systemDark: boolean, key?: string) => {
      const html = target();
      const storage = memory(stored === null ? {} : { [key ?? SITE_SCHEME_KEY]: stored });
      new Function("localStorage", "window", "document", siteSchemeBootstrap(key))(storage, { matchMedia: () => ({ matches: systemDark }) }, { documentElement: html });
      return html.classes.has("dark");
    };
    for (const stored of ["light", "dark", null, "stale"]) {
      for (const systemDark of [true, false]) {
        const drawn = target();
        applySiteScheme(parseSiteScheme(stored), query(systemDark), drawn);
        expect(run(stored, systemDark)).toBe(drawn.classes.has("dark"));
      }
    }
    expect(siteSchemeBootstrap()).toContain(JSON.stringify(SITE_SCHEME_KEY));
    expect(run("dark", false, "other.prefs:scheme")).toBe(true);
    const unreadable = target();
    new Function("localStorage", "window", "document", siteSchemeBootstrap())(
      { getItem: () => { throw new Error("blocked"); } },
      { matchMedia: () => ({ matches: true }) },
      { documentElement: unreadable },
    );
    expect(unreadable.classes.has("dark")).toBe(true);
  });
});
