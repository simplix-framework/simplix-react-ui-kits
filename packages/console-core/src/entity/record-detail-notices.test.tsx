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

const sections: RecordDetailProps["sections"] = [{ key: "main", title: "Health marker", fields: [{ label: "State field", value: "Failing" }] }];
const notices: RecordDetailProps["notices"] = [{ key: "failing", tone: "danger", title: "Notice marker" }];
const tabs: RecordDetailProps["tabs"] = [
  { key: "overview", label: "Overview", sections },
  { key: "other", label: "Other" },
];

function html(props: Partial<RecordDetailProps>): string {
  return renderToStaticMarkup(createElement(UIProvider, { children: createElement(RecordDetail, { title: "Record", ...props }) }));
}

describe("RecordDetail notices", () => {
  it("draws a tab-less detail's notices above its sections", () => {
    const out = html({ sections, notices });
    expect(out).toContain("Notice marker");
    expect(out.indexOf("Notice marker")).toBeLessThan(out.indexOf("Health marker"));
  });

  it("draws a tabbed detail's notices above its tab body, as before", () => {
    const out = html({ tabs, notices });
    expect(out.indexOf("Notice marker")).toBeLessThan(out.indexOf("Health marker"));
  });

  it("draws each notice once", () => {
    expect(html({ sections, notices }).split("Notice marker").length - 1).toBe(1);
    expect(html({ tabs, notices }).split("Notice marker").length - 1).toBe(1);
  });

  it("keeps the note under the sections of a tab-less detail", () => {
    const out = html({ sections, notices, note: "Note marker" });
    expect(out.indexOf("Health marker")).toBeLessThan(out.indexOf("Note marker"));
  });
});
