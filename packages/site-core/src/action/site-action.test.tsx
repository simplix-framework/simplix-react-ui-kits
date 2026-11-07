import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { PlainSiteLink, SiteLinkProvider, type SiteLinkProps } from "../link/site-link";
import { bySlot, silentRefusals, tabStops, unmarked } from "../testing/markup";
import { SiteAction, type SiteActionSpec } from "./site-action";
import { siteActionStyle } from "./site-action.style";

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
    const html = renderToStaticMarkup(<SiteAction id="top-up" label="Top up" href="/checkout" disabled reason="Pick a plan first" />);
    const action = bySlot(html, "site-action")[0];
    expect(action?.name).toBe("button");
    expect(action?.attributes.disabled).toBeDefined();
    expect(html).not.toContain("href=");
    expect(tabStops(html)).toEqual([]);
  });

  it("draws a pending action as a disabled button that says what it waits for, even with an address or a line of its own", () => {
    const html = renderToStaticMarkup(<SiteAction id="send" label="Send" href="/send" describedBy="note" onSelect={() => undefined} pending="Sending the request" />);
    const action = bySlot(html, "site-action")[0];
    const reason = bySlot(html, "site-action-reason")[0];
    expect(action?.name).toBe("button");
    expect(action?.attributes.disabled).toBeDefined();
    expect(action?.attributes["aria-describedby"]).toBe(reason?.attributes.id);
    expect(html).toContain(">Sending the request</span>");
    expect(html).not.toContain("href=");
    // It is marked busy, which the design draws in the action's own tone and not in the disabled grey.
    expect(action?.attributes["aria-busy"]).toBe("true");
    // Without a wait the same spec presses again, with no reason drawn.
    const idle = renderToStaticMarkup(<SiteAction id="send" label="Send" onSelect={() => undefined} pending={undefined} />);
    expect(bySlot(idle, "site-action")[0]?.attributes.disabled).toBeUndefined();
    expect(bySlot(idle, "site-action")[0]?.attributes["aria-busy"]).toBeUndefined();
    expect(bySlot(idle, "site-action-reason")).toEqual([]);
  });

  it("draws a refused action that is not waiting without the busy mark, so it keeps the disabled look", () => {
    const refused = bySlot(renderToStaticMarkup(<SiteAction id="a" label="A" disabled reason="Pick a plan first" />), "site-action")[0];
    expect(refused?.attributes.disabled).toBeDefined();
    expect(refused?.attributes["aria-busy"]).toBeUndefined();
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

  it("lets a block action wrap a label too long for its column, and keeps every other action on one line at least as tall as its size", () => {
    expect(siteActionStyle.base).toContain("whitespace-nowrap");
    expect(siteActionStyle.variants.block.true).toContain("whitespace-normal");
    expect(siteActionStyle.variants.block.true).toContain("[overflow-wrap:anywhere]");
    expect(siteActionStyle.variants.block.false).toBe("");
    for (const size of ["md", "sm", "lg"] as const) {
      expect(siteActionStyle.variants.size[size]).toMatch(/(?:^|\s)min-h-\(--site-control/);
      expect(siteActionStyle.variants.size[size]).not.toMatch(/(?:^|\s)h-\(--site-control/);
    }
  });

  it("is described by the line it names, as a link and as a disabled button", () => {
    const button = bySlot(renderToStaticMarkup(<SiteAction id="a" label="Top up" disabled reason="Pick a plan first" describedBy="why" />), "site-action")[0];
    expect(button?.attributes["aria-describedby"]).toBe("why");
    const link = bySlot(renderToStaticMarkup(<SiteAction id="a" label="Open" href="/a" describedBy="about" />), "site-action")[0];
    expect(link?.attributes["aria-describedby"]).toBe("about");
    expect(bySlot(renderToStaticMarkup(<SiteAction id="a" label="A" />), "site-action")[0]?.attributes["aria-describedby"]).toBeUndefined();
  });

  it("draws a disabled action's reason for a screen reader beside it and is described by it, when no line says why", () => {
    const html = renderToStaticMarkup(<SiteAction id="top-up" label="Top up" disabled reason="Extra credits need a paid plan" />);
    const action = bySlot(html, "site-action")[0];
    const reason = bySlot(html, "site-action-reason")[0];
    expect(reason?.name).toBe("span");
    expect(reason?.attributes.id).toBeTruthy();
    expect(action?.attributes["aria-describedby"]).toBe(reason?.attributes.id);
    expect(html).toContain(">Extra credits need a paid plan</span>");
    expect(silentRefusals(html)).toEqual([]);
    expect(unmarked(html)).toEqual([]);
  });

  it("is described by the line a part names instead of its hidden reason, and draws no reason while it can run", () => {
    const lined = renderToStaticMarkup(<SiteAction id="a" label="Top up" disabled reason="Pick a plan first" describedBy="why" />);
    expect(bySlot(lined, "site-action-reason")).toEqual([]);
    const open = renderToStaticMarkup(<SiteAction id="a" label="Top up" disabled={false} reason="Pick a plan first" />);
    expect(bySlot(open, "site-action-reason")).toEqual([]);
    expect(bySlot(open, "site-action")[0]?.attributes["aria-describedby"]).toBeUndefined();
    const linked = renderToStaticMarkup(<SiteAction id="a" label="Top up" href="/top-up" reason="Pick a plan first" />);
    expect(bySlot(linked, "site-action-reason")).toEqual([]);
  });

  it("refuses by type a disabled action without its reason, a computed flag included", () => {
    const paid = false as boolean;
    const spec = (action: SiteActionSpec) => action;
    // @ts-expect-error a disabled action carries the reason it cannot run
    expect(spec({ id: "a", label: "A", disabled: true })).toBeDefined();
    // @ts-expect-error a flag computed at the call site needs the reason beside it too
    expect(spec({ id: "a", label: "A", disabled: !paid })).toBeDefined();
    // @ts-expect-error the reason is words, never an empty value
    expect(spec({ id: "a", label: "A", disabled: true, reason: undefined })).toBeDefined();
    expect(spec({ id: "a", label: "A", disabled: !paid, reason: "Pick a plan first" })).toBeDefined();
    expect(spec({ id: "a", label: "A" })).toBeDefined();
    expect(spec({ id: "a", label: "A", disabled: false })).toBeDefined();
  });

  it("carries the element id a server script finds it by, and a pressed submit's own field", () => {
    const passkey = bySlot(renderToStaticMarkup(<SiteAction id="passkey" elementId="authenticateWebAuthnButton" label="Passkey" />), "site-action")[0];
    expect(passkey?.attributes.id).toBe("authenticateWebAuthnButton");
    const cancel = bySlot(renderToStaticMarkup(<SiteAction id="cancel" submit field={{ name: "cancel-aia", value: "true" }} label="Cancel" />), "site-action")[0];
    expect([cancel?.attributes.type, cancel?.attributes.name, cancel?.attributes.value]).toEqual(["submit", "cancel-aia", "true"]);
    const plain = bySlot(renderToStaticMarkup(<SiteAction id="cancel" field={{ name: "cancel-aia", value: "true" }} label="Cancel" />), "site-action")[0];
    expect(plain?.attributes.name).toBeUndefined();
    expect(bySlot(renderToStaticMarkup(<SiteAction id="go" label="Go" />), "site-action")[0]?.attributes.id).toBeUndefined();
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
