import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { UIProvider } from "@simplix-react/ui";
import { describe, expect, it } from "vitest";

import { NoticeDismissalsProvider, type NoticeDismissals } from "../notice/dismissal-source";
import { RecordNotices, type RecordNotice } from "./record-blocks";

/** A dismissal set that has answered, holding the given keys as put away. */
function dismissals(hidden: readonly string[] = []): NoticeDismissals {
  return { ready: true, isHidden: (key) => hidden.includes(key), hiddenKeys: hidden, hide: () => {}, show: () => {} };
}

function html(notices: readonly RecordNotice[], put: NoticeDismissals = dismissals()): string {
  return renderToStaticMarkup(
    createElement(UIProvider, { children: createElement(NoticeDismissalsProvider, { value: put, children: createElement(RecordNotices, { notices }) }) }),
  );
}

const standing: RecordNotice = { key: "suspended", noticeKey: "test.record.suspended", tone: "warning", title: "Suspended marker", body: "Body marker" };
const answer: RecordNotice = { key: "read-failed", tone: "danger", title: "Read failed marker" };

describe("RecordNotices standing messages", () => {
  it("draws a notice that names a key as a card the reader can put away, with its body as the hint", () => {
    const out = html([standing]);
    expect(out).toContain("Suspended marker");
    expect(out).toContain("Body marker");
    expect(out).toContain('aria-label="notice.hide"');
  });

  it("leaves a notice with no key as a banner with no close, the shape of the answer to a press", () => {
    const out = html([answer]);
    expect(out).toContain("Read failed marker");
    expect(out).not.toContain("notice.hide");
  });

  it("draws nothing for a card the operator put away, and still draws the banner beside it", () => {
    const out = html([standing, answer], dismissals([standing.noticeKey as string]));
    expect(out).not.toContain("Suspended marker");
    expect(out).toContain("Read failed marker");
  });

  it("keeps a success notice a banner whatever key it names, since a confirmation has no card kind", () => {
    const out = html([{ key: "done", noticeKey: "test.record.done", tone: "success", title: "Done marker" }]);
    expect(out).toContain("Done marker");
    expect(out).not.toContain("notice.hide");
  });

  it("draws a card's action only where the notice gives it something to do", () => {
    const withAction = html([{ ...standing, action: { label: "Open marker", onClick: () => {} } }]);
    expect(withAction).toContain("Open marker");
    expect(html([{ ...standing, action: { label: "Open marker" } }])).not.toContain("Open marker");
  });
});
