import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { RecordForm } from "./record-form";

describe("a RecordForm's required field", () => {
  it("is checked by the form rather than the browser, so no constraint bubble stops the submit", () => {
    const html = renderToStaticMarkup(
      createElement(RecordForm, {
        title: "Profile",
        submitLabel: "Save",
        sections: [{ key: "s", title: "S", fields: [{ key: "name", kind: "text", label: "Name", value: "", required: true }] }],
      }),
    );
    expect(html).toMatch(/<form[^>]*novalidate/i);
  });
});

describe("a RecordForm's live field notice", () => {
  it("is drawn beside the field from the values the form holds", () => {
    const html = renderToStaticMarkup(
      createElement(RecordForm, {
        title: "Position",
        submitLabel: "Save",
        sections: [{ key: "s", title: "S", fields: [{ key: "rank", kind: "number", label: "Rank", value: 3 }] }],
        fieldNotices: (values) => ({ rank: values.rank === 3 ? "Rank 3 is already held by Manager." : undefined }),
      }),
    );
    expect(html).toContain("Rank 3 is already held by Manager.");
  });
});
