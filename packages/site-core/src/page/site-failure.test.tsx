import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { bySlot, tagsOf, unmarked } from "../testing/markup";
import { SiteSpinner } from "./site-bits";
import { SiteFailure } from "./site-failure";

describe("SiteFailure", () => {
  it("draws the mark, the one h1, the sentence and the ways on in that order, the actions at the large size", () => {
    const html = renderToStaticMarkup(
      <SiteFailure
        mark={<svg data-slot="glyph" />}
        title="We could not find this page"
        body="The address may be mistyped."
        actions={[
          { id: "home", label: "Go to the start", href: "/", tone: "primary" },
          { id: "help", label: "Open help", href: "/help", tone: "secondary" },
        ]}
      />,
    );
    expect(tagsOf(html)[0]?.attributes["data-slot"]).toBe("site-failure-mark");
    expect(tagsOf(html)[0]?.attributes["aria-hidden"]).toBe("true");
    expect(html.match(/<h1/g)).toHaveLength(1);
    const at = ["site-failure-mark", "site-failure-title", "site-failure-text", "site-failure-actions"].map((slot) => html.indexOf(slot));
    expect([...at].sort((a, b) => a - b)).toEqual(at);
    expect(bySlot(html, "site-action").map((action) => [action.attributes["data-tone"], action.attributes["data-size"]])).toEqual([
      ["primary", "lg"],
      ["secondary", "lg"],
    ]);
    expect(unmarked(html)).toEqual([]);
  });

  it("marks the tone it is handed, quiet by default", () => {
    const quiet = renderToStaticMarkup(<SiteFailure mark={<svg data-slot="glyph" />} title="Not found" />);
    const bad = renderToStaticMarkup(<SiteFailure mark={<svg data-slot="glyph" />} tone="bad" title="This page could not be shown" />);
    expect(bySlot(quiet, "site-failure-mark")[0]?.attributes["data-tone"]).toBe("quiet");
    expect(bySlot(bad, "site-failure-mark")[0]?.attributes["data-tone"]).toBe("bad");
  });

  it("marks the good tone for a done thing, the page a mail link opens", () => {
    const good = renderToStaticMarkup(<SiteFailure mark={<svg data-slot="glyph" />} tone="good" title="Your identity is checked" />);
    expect(bySlot(good, "site-failure-mark")[0]?.attributes["data-tone"]).toBe("good");
  });

  it("announces the sentence with the role it is handed, and with none when none is", () => {
    const alert = renderToStaticMarkup(<SiteFailure mark={<svg data-slot="glyph" />} title="Too many tries" body="Wait a little." live="alert" />);
    const status = renderToStaticMarkup(<SiteFailure mark={<svg data-slot="glyph" />} title="Checking your link" body="One moment." live="status" />);
    const silent = renderToStaticMarkup(<SiteFailure mark={<svg data-slot="glyph" />} title="Not found" body="The address may be mistyped." />);
    expect(bySlot(alert, "site-failure-text")[0]?.attributes.role).toBe("alert");
    expect(bySlot(status, "site-failure-text")[0]?.attributes.role).toBe("status");
    expect(bySlot(silent, "site-failure-text")[0]?.attributes.role).toBeUndefined();
  });

  it("holds a large wait ring in the mark while an answer is awaited, the small one elsewhere", () => {
    const waiting = renderToStaticMarkup(<SiteFailure mark={<SiteSpinner size="lg" />} title="Checking your link" />);
    expect(bySlot(waiting, "site-spinner")[0]?.attributes["data-size"]).toBe("lg");
    expect(bySlot(renderToStaticMarkup(<SiteSpinner />), "site-spinner")[0]?.attributes["data-size"]).toBe("sm");
  });

  it("draws no sentence and no action row when none is handed", () => {
    const html = renderToStaticMarkup(<SiteFailure mark={<svg data-slot="glyph" />} title="Not found" />);
    expect(bySlot(html, "site-failure-text")).toEqual([]);
    expect(bySlot(html, "site-failure-actions")).toEqual([]);
  });
});
