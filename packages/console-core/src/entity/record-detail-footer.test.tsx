import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { UIProvider } from "@simplix-react/ui";
import { describe, expect, it, vi } from "vitest";

import type { RecordDetailProps } from "./record-detail";

// The detail's import graph reads the browser's storage when it loads, and this suite renders on the server.
vi.hoisted(() => {
  const items = new Map<string, string>();
  Object.assign(globalThis, {
    localStorage: { getItem: (key: string) => items.get(key) ?? null, setItem: (key: string, value: string) => void items.set(key, value), removeItem: (key: string) => void items.delete(key) },
  });
});
const { RecordDetail } = await import("./record-detail");

const sections: RecordDetailProps["sections"] = [{ key: "main", title: "Main", fields: [{ label: "Field", value: "Value" }] }];

function html(props: Partial<RecordDetailProps>): string {
  return renderToStaticMarkup(createElement(UIProvider, { children: createElement(RecordDetail, { title: "Record", sections, ...props }) }));
}

/** The `data-part-bare` mark of the footer's actions row. */
function bare(out: string): string | undefined {
  const row = out.match(/<[^>]*data-part="crud-detail-actions"[^>]*>/)?.[0];
  return row?.match(/data-part-bare="(true|false)"/)?.[1];
}

describe("RecordDetail footer", () => {
  it("marks the footer row bare for a record with no command, whose head draws the close", () => {
    expect(bare(html({ onClose: () => {} }))).toBe("true");
  });

  it("draws the footer row for a record with a command", () => {
    expect(bare(html({ onClose: () => {}, actions: [{ label: "Approve", onClick: () => {} }] }))).toBe("false");
  });

  it("marks the body, so a notice that leads it keeps its room under the head", () => {
    expect(html({ onClose: () => {} })).toMatch(/data-part="console-record-body"/);
  });

  it("draws the footer row for a record a page leads back from", () => {
    expect(bare(html({ onBack: () => {} }))).toBe("false");
  });
});
