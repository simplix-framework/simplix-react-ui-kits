import { describe, expect, it } from "vitest";

import type { ConsolePreviewChrome } from "./preview-chrome";
import { previewStripProps } from "./preview-chrome";

const LABELS = { status: "Status", quiet: "All quiet" } as ConsolePreviewChrome["labels"];

function chrome(parts: Partial<ConsolePreviewChrome>): ConsolePreviewChrome {
  return { labels: LABELS, ...parts } as ConsolePreviewChrome;
}

describe("the preview chrome's strip", () => {
  it("draws the product's own strip as given, with no zone and no clock added", () => {
    const strip = { label: "Service status", ticker: { text: "All services running", live: true }, segments: [{ label: "Billing slow", tone: "warn" as const }] };
    expect(previewStripProps(chrome({ strip, status: { clockStart: "10:24:00", segments: [{ label: "Other" }] } }), "No region", "10:24:01")).toBe(strip);
  });

  it("composes the ticker, the zone, the readings and the clock when the product gives none", () => {
    const props = previewStripProps(chrome({ status: { ticker: { text: "Waiting", live: true }, shift: "Day", segments: [{ label: "3 open" }] } }), "Seoul", "10:24:01");
    expect(props.label).toBe("Status");
    expect(props.ticker).toEqual({ text: "Waiting", live: true });
    expect(props.segments?.map((segment) => segment.label)).toEqual(["Seoul · Day", "3 open"]);
    expect(props.clock).toBe("10:24:01");
  });

  it("says nothing is waiting when there is no ticker", () => {
    expect(previewStripProps(chrome({}), "Seoul", undefined).ticker.text).toBe("All quiet");
  });
});
