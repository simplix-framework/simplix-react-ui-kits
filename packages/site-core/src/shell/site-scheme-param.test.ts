import { describe, expect, it } from "vitest";

import { applySiteScheme, markSiteScheme, parseSchemeParam, pickSiteScheme, SCHEME_PARAM, siteSchemeBootstrap, type SchemeQuery } from "./site-scheme";

function target() {
  const classes = new Set<string>();
  return {
    classes,
    target: { classList: { toggle: (token: string, force: boolean) => (force ? classes.add(token) : classes.delete(token), force) }, style: { colorScheme: "" } },
  };
}

const quietQuery = (matches: boolean): SchemeQuery => ({ matches, addEventListener: () => {}, removeEventListener: () => {} });

describe("the scheme parameter", () => {
  it("is named once, for every side that hands the choice to another origin", () => {
    expect(SCHEME_PARAM).toBe("ui_scheme");
  });

  it("reads an unknown value as no choice, where a stored value reads as the system's", () => {
    expect(parseSchemeParam("dark")).toBe("dark");
    expect(parseSchemeParam("system")).toBe("system");
    expect(parseSchemeParam("purple")).toBeNull();
    expect(parseSchemeParam(null)).toBeNull();
  });

  it("takes the address's choice first, then the kept one, then the system", () => {
    expect(pickSiteScheme("dark", "light")).toBe("dark");
    expect(pickSiteScheme(null, "light")).toBe("light");
    expect(pickSiteScheme("purple", undefined)).toBe("system");
    expect(pickSiteScheme("system", "dark")).toBe("system");
  });
});

describe("marking the document", () => {
  it("sets the dark class and the colour scheme the browser draws its own controls in", () => {
    const dark = target();
    markSiteScheme(dark.target, true);
    expect(dark.classes.has("dark")).toBe(true);
    expect(dark.target.style.colorScheme).toBe("dark");
    const light = target();
    applySiteScheme("light", quietQuery(true), light.target);
    expect(light.classes.has("dark")).toBe(false);
    expect(light.target.style.colorScheme).toBe("light");
    const system = target();
    applySiteScheme("system", quietQuery(true), system.target);
    expect(system.target.style.colorScheme).toBe("dark");
  });

  it("writes the colour scheme from the head script too, before the first paint", () => {
    expect(siteSchemeBootstrap()).toContain("colorScheme");
  });
});
