import { createElement, useState } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { usePageOpenedAt, useZoneRange } from "./page-time";

describe("usePageOpenedAt", () => {
  it("holds the minute the page opened across renders", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-11-07T10:15:42.500Z"));
    const seen: string[] = [];
    function Probe() {
      const opened = usePageOpenedAt();
      const [, rerender] = useState(0);
      seen.push(opened.toISOString());
      void rerender;
      return null;
    }
    renderToStaticMarkup(createElement(Probe));
    vi.useRealTimers();
    expect(seen[0]).toBe("2026-11-07T10:15:00.000Z");
  });
});

describe("useZoneRange", () => {
  it("bounds today, and the last days reaching back from it, in the installation's zone", () => {
    let today: { from: string; to: string } | undefined;
    let week: { from: string; to: string } | undefined;
    function Probe() {
      today = useZoneRange("day");
      week = useZoneRange("lastDays", 7);
      return null;
    }
    renderToStaticMarkup(createElement(Probe));
    expect(today && Date.parse(today.to) - Date.parse(today.from)).toBeGreaterThan(0);
    expect(week && Date.parse(week.to) - Date.parse(week.from)).toBeGreaterThan(today ? Date.parse(today.to) - Date.parse(today.from) : 0);
    expect(week?.to).toBe(today?.to);
  });
});

describe("the datetime barrel", () => {
  it("hands on the framework's today and rolling-window hooks beside the kit's own", async () => {
    const barrel = await import("./index");
    expect(typeof barrel.useZoneToday).toBe("function");
    expect(typeof barrel.useRollingWindow).toBe("function");
    expect(typeof barrel.useZoneRange).toBe("function");
  });
});
