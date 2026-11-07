import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { bySlot } from "../testing/markup";
import { SiteRead, type SiteReadState } from "./site-read";

const draw = (read: SiteReadState<readonly string[]>) =>
  renderToStaticMarkup(
    <SiteRead read={read} failed="Could not be read" empty="Nothing yet" isEmpty={(rows) => rows.length === 0}>
      {(rows) => <ul>{rows.map((row) => <li key={row}>{row}</li>)}</ul>}
    </SiteRead>,
  );

describe("SiteRead", () => {
  it("draws nothing while the first answer is on its way", () => {
    expect(draw({ data: undefined, isError: false })).toBe("");
  });

  it("says the read failed in a caption, before anything else", () => {
    const html = draw({ data: ["kept"], isError: true });
    expect(bySlot(html, "site-caption")[0]?.name).toBe("p");
    expect(html).toContain("Could not be read");
    expect(html).not.toContain("<li>");
  });

  it("says the answer is empty, and draws the region once it holds something", () => {
    expect(draw({ data: [], isError: false })).toContain("Nothing yet");
    const html = draw({ data: ["one", "two"], isError: false });
    expect(html).toContain("<li>two</li>");
    expect(html).not.toContain("Nothing yet");
  });

  it("hands an empty answer to the region when it names no empty sentence", () => {
    const html = renderToStaticMarkup(
      <SiteRead read={{ data: [] as string[], isError: false }} failed="x">
        {(rows) => <span>{rows.length === 0 ? "own empty rows" : "rows"}</span>}
      </SiteRead>,
    );
    expect(html).toContain("own empty rows");
  });
});
