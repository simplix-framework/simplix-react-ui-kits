import { describe, expect, it } from "vitest";

import en from "../error/locales/features/en.json";
import ja from "../error/locales/features/ja.json";
import ko from "../error/locales/features/ko.json";
import { routeFailureOf } from "./route-error";

describe("routeFailureOf", () => {
  it("tells a render crash as the screen's own failure, with no status", () => {
    expect(routeFailureOf(new TypeError("Cannot read properties of undefined"))).toEqual({ kind: "screen" });
    expect(routeFailureOf(undefined)).toEqual({ kind: "screen" });
    expect(routeFailureOf("boom")).toEqual({ kind: "screen" });
  });

  it("tells an error carrying a server status as the server's, naming that status", () => {
    expect(routeFailureOf(Object.assign(new Error("HTTP 503"), { status: 503 }))).toEqual({ kind: "server", code: "503" });
    expect(routeFailureOf(Object.assign(new Error("HTTP 500"), { status: 500 }))).toEqual({ kind: "server", code: "500" });
  });

  it("leaves a client status, which no server fault caused, to the screen's page", () => {
    expect(routeFailureOf(Object.assign(new Error("HTTP 404"), { status: 404 }))).toEqual({ kind: "screen" });
  });
});

describe("the screen failure page's words", () => {
  it.each([
    ["en", en],
    ["ko", ko],
    ["ja", ja],
  ] as const)("name neither the server nor a status in %s", (_locale, catalog) => {
    for (const text of [catalog.error.screenErrorTitle, catalog.error.screenErrorDescription]) {
      expect(text.trim()).not.toBe("");
      expect(text).not.toMatch(/500|server|서버|サーバー/i);
    }
  });
});
