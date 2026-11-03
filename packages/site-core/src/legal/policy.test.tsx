import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { SiteChip } from "../page/site-bits";
import { bySlot, silentRefusals, tabStops, unmarked } from "../testing/markup";
import { InfoCard, KeyValues } from "./legal-parts";
import { AgencyGrid, GlanceGrid, LegalSection, RightsGrid } from "./policy-parts";

const noop = () => {};

describe("LegalSection", () => {
  it("draws a plain section's heading straight under the section", () => {
    const html = renderToStaticMarkup(
      <LegalSection id="p-1" heading="2. What we collect">
        <p data-slot="product-text">Words</p>
      </LegalSection>,
    );
    const section = bySlot(html, "site-legal-section")[0];
    expect(section?.attributes.id).toBe("p-1");
    expect(section?.attributes["data-tone"]).toBe("plain");
    expect(bySlot(html, "site-legal-section-head")).toHaveLength(0);
    expect(bySlot(html, "site-doc-heading")[0]?.name).toBe("h2");
    expect(unmarked(html)).toEqual([]);
  });

  it("sets the voice section apart and puts its chip before the heading in one row", () => {
    const html = renderToStaticMarkup(
      <LegalSection id="p-2" tone="voice" heading="3. Your voice" chip={<SiteChip tone="voice">Biometric data</SiteChip>} action={{ id: "transfer", label: "See 4. Transfers abroad", tone: "quiet", onSelect: noop }} />,
    );
    expect(bySlot(html, "site-legal-section")[0]?.attributes["data-tone"]).toBe("voice");
    expect(html.indexOf('data-slot="site-legal-section-head"')).toBeLessThan(html.indexOf('data-slot="site-chip"'));
    expect(html.indexOf('data-slot="site-chip"')).toBeLessThan(html.indexOf('data-slot="site-doc-heading"'));
    expect(bySlot(html, "site-action")[0]?.attributes["data-size"]).toBe("sm");
    expect(unmarked(html)).toEqual([]);
  });
});

describe("GlanceGrid", () => {
  it("makes every card a button that jumps, the one about the voice in the voice tone", () => {
    const html = renderToStaticMarkup(
      <GlanceGrid
        items={[
          { key: "collect", title: "What we collect", text: "Email, payment and usage records", onSelect: noop },
          { key: "voice", title: "Biometric data", text: "Your voice", voice: true, onSelect: noop },
        ]}
      />,
    );
    const cards = bySlot(html, "site-glance");
    expect(cards.map((card) => card.attributes["data-tone"])).toEqual(["plain", "voice"]);
    expect(tabStops(html)).toHaveLength(2);
    expect(cards.every((card) => card.attributes.type === "button")).toBe(true);
    expect(unmarked(html)).toEqual([]);
  });
});

describe("RightsGrid", () => {
  it("draws the reason under the cards and describes every disabled right by it, and draws no reason when every right can be used", () => {
    const html = renderToStaticMarkup(
      <RightsGrid
        reason="Opens with the account pages."
        items={[
          { key: "data", title: "See my data", text: "We bundle your records.", action: { id: "data", label: "My data", disabled: true, reason: "Opens once accounts are live" } },
          { key: "fix", title: "Correct", text: "Change your email.", action: { id: "fix", label: "Sign-in", href: "/me" } },
        ]}
      />,
    );
    expect(silentRefusals(html)).toEqual([]);
    expect(bySlot(html, "site-caption")).toHaveLength(1);
    const open = renderToStaticMarkup(<RightsGrid reason="Never shown" items={[{ key: "fix", title: "Correct", text: "Change your email.", action: { id: "fix", label: "Sign-in", href: "/me" } }]} />);
    expect(bySlot(open, "site-caption")).toHaveLength(0);
  });

  it("describes a right that cannot be used yet by the line that says why", () => {
    const described = renderToStaticMarkup(
      <>
        <RightsGrid items={[{ key: "data", title: "See my data", text: "We bundle your records.", action: { id: "data", label: "My account › My data", disabled: true, reason: "Opens once accounts are live", describedBy: "why" } }]} />
        <p id="why">Opens with the account pages.</p>
      </>,
    );
    expect(silentRefusals(described)).toEqual([]);
    const silent = renderToStaticMarkup(<RightsGrid items={[{ key: "data", title: "See my data", text: "We bundle your records.", action: { id: "data", label: "My account › My data", disabled: true, reason: "Opens once accounts are live" } }]} />);
    // Without a line on the page the action is described by its own reason, drawn for a screen reader only.
    expect(silentRefusals(silent)).toEqual([]);
    expect(bySlot(silent, "site-action")[0]?.attributes["aria-describedby"]).toBe(bySlot(silent, "site-action-reason")[0]?.attributes.id);
  });

  it("draws each right as a card with its title, words and a small action", () => {
    const html = renderToStaticMarkup(<RightsGrid items={[{ key: "fix", title: "Correct", text: "Change your email.", action: { id: "fix", label: "Sign-in and devices", href: "/me" } }]} />);
    expect(bySlot(html, "site-rights-card")[0]?.name).toBe("section");
    expect(bySlot(html, "site-action")[0]?.attributes["data-size"]).toBe("sm");
    expect(unmarked(html)).toEqual([]);
  });
});

describe("AgencyGrid", () => {
  it("draws an agency's name, number and site in that order", () => {
    const html = renderToStaticMarkup(<AgencyGrid items={[{ key: "kisa", name: "Report Center", phone: "118", site: "privacy.kisa.or.kr" }]} />);
    const order = ["site-agency-name", "site-agency-phone", "site-agency-site"].map((slot) => html.indexOf(`data-slot="${slot}"`));
    expect(order).toEqual([...order].sort((a, b) => a - b));
    expect(order.every((at) => at > 0)).toBe(true);
    expect(unmarked(html)).toEqual([]);
  });
});

describe("InfoCard", () => {
  const rows = <KeyValues rows={[{ key: "mail", label: "Email", value: "privacy@example.com" }]} />;

  it("draws a card of values alone, without a heading", () => {
    const html = renderToStaticMarkup(<InfoCard>{rows}</InfoCard>);
    expect(bySlot(html, "site-info-card-title")).toHaveLength(0);
    expect(bySlot(html, "site-key-values")).toHaveLength(1);
  });

  it("describes a disabled action by its reason line, and draws no line for an action that runs", () => {
    const off = renderToStaticMarkup(
      <InfoCard title="Business information" action={{ id: "verify", label: "Check business details", tone: "quiet", disabled: true, reason: "Checked once registration is done." }} reason="Checked once registration is done.">
        {rows}
      </InfoCard>,
    );
    expect(silentRefusals(off)).toEqual([]);
    expect(bySlot(off, "site-caption")).toHaveLength(1);
    const silent = renderToStaticMarkup(
      <InfoCard title="Business information" action={{ id: "verify", label: "Check business details", tone: "quiet", disabled: true, reason: "Checked once registration is done." }}>
        {rows}
      </InfoCard>,
    );
    // Without a line on the page the action is described by its own reason, drawn for a screen reader only.
    expect(silentRefusals(silent)).toEqual([]);
    expect(bySlot(silent, "site-action")[0]?.attributes["aria-describedby"]).toBe(bySlot(silent, "site-action-reason")[0]?.attributes.id);
    const on = renderToStaticMarkup(
      <InfoCard title="Support" action={{ id: "contact", label: "Contact us", tone: "primary", href: "/help" }} reason="Never shown">
        {rows}
      </InfoCard>,
    );
    expect(bySlot(on, "site-caption")).toHaveLength(0);
  });
});
