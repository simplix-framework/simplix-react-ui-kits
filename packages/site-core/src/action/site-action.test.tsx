import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { PlainSiteLink, SiteLinkProvider, type SiteLinkProps } from "../link/site-link";
import { bySlot, tabStops } from "../testing/markup";
import { SiteAction } from "./site-action";

describe("SiteAction", () => {
  it("draws an action with an address as a link and one without as a button", () => {
    const link = bySlot(renderToStaticMarkup(<SiteAction id="go" label="Go" href="/go" />), "site-action")[0];
    expect(link?.name).toBe("a");
    expect(link?.attributes.href).toBe("/go");
    const button = bySlot(renderToStaticMarkup(<SiteAction id="go" label="Go" />), "site-action")[0];
    expect(button?.name).toBe("button");
    expect(button?.attributes.type).toBe("button");
  });

  it("draws a disabled action as a disabled button even when it has an address", () => {
    const html = renderToStaticMarkup(<SiteAction id="top-up" label="Top up" href="/checkout" disabled />);
    const action = bySlot(html, "site-action")[0];
    expect(action?.name).toBe("button");
    expect(action?.attributes.disabled).toBeDefined();
    expect(html).not.toContain("href=");
    expect(tabStops(html)).toEqual([]);
  });

  it("writes its tone, size and width as the variants the design draws, secondary and medium by default", () => {
    const plain = bySlot(renderToStaticMarkup(<SiteAction id="a" label="A" />), "site-action")[0];
    expect(plain?.attributes["data-tone"]).toBe("secondary");
    expect(plain?.attributes["data-size"]).toBe("md");
    expect(plain?.attributes["data-block"]).toBe("false");
    const set = bySlot(renderToStaticMarkup(<SiteAction id="a" label="A" tone="quiet" size="sm" block />), "site-action")[0];
    expect(set?.attributes["data-tone"]).toBe("quiet");
    expect(set?.attributes["data-size"]).toBe("sm");
    expect(set?.attributes["data-block"]).toBe("true");
    expect(set?.attributes["data-action"]).toBe("a");
  });

  it("is described by the line it names, as a link and as a disabled button", () => {
    const button = bySlot(renderToStaticMarkup(<SiteAction id="a" label="Top up" disabled describedBy="why" />), "site-action")[0];
    expect(button?.attributes["aria-describedby"]).toBe("why");
    const link = bySlot(renderToStaticMarkup(<SiteAction id="a" label="Open" href="/a" describedBy="about" />), "site-action")[0];
    expect(link?.attributes["aria-describedby"]).toBe("about");
    expect(bySlot(renderToStaticMarkup(<SiteAction id="a" label="A" />), "site-action")[0]?.attributes["aria-describedby"]).toBeUndefined();
  });

  it("draws its icon before its label", () => {
    const html = renderToStaticMarkup(<SiteAction id="a" label="Download" icon={<svg data-slot="glyph" />} />);
    expect(html.indexOf("glyph")).toBeLessThan(html.indexOf("Download"));
  });
});

describe("SiteLink", () => {
  it("draws a plain anchor without a provider and the product's link under one", () => {
    expect(renderToStaticMarkup(<SiteAction id="a" label="A" href="/a" />)).toMatch(/^<a /);
    const Routed = (props: SiteLinkProps) => <a {...props} data-router="yes" />;
    const html = renderToStaticMarkup(
      <SiteLinkProvider component={Routed}>
        <SiteAction id="a" label="A" href="/a" />
      </SiteLinkProvider>,
    );
    expect(html).toContain('data-router="yes"');
    expect(html).toContain('data-slot="site-action"');
    const reset = renderToStaticMarkup(
      <SiteLinkProvider>
        <SiteAction id="a" label="A" href="/a" />
      </SiteLinkProvider>,
    );
    expect(reset).not.toContain("data-router");
    expect(renderToStaticMarkup(<PlainSiteLink href="/x">x</PlainSiteLink>)).toBe('<a href="/x">x</a>');
  });
});
