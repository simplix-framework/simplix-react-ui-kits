import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { bySlot, tabStops, tagsOf, unmarked } from "../testing/markup";
import { AccountLayout, SectionHead, SectionNav } from "./account-layout";
import { dayHeight, DaySeries, PanelLine, QuotaMeter, shareWidth, SitePanel, TableActions, TableCard } from "./figures";
import { IdentityRow, SettingsActions, SettingsBox, SettingsRow, SettingsRows, SettingsText } from "./settings";

const sections = [
  { key: "sub", label: "Subscription", href: "/account/sub", current: true },
  { key: "credits", label: "Credits", href: "/account/credits" },
  { key: "leave", label: "Delete account", href: "/account/leave", danger: true },
];

describe("AccountLayout", () => {
  it("draws the section list beside the section, the standing notice first in the section", () => {
    const html = renderToStaticMarkup(
      <AccountLayout nav={<SectionNav label="My account" items={sections} />} standing={<div data-slot="site-banner">failed</div>}>
        <SectionHead>Subscription</SectionHead>
      </AccountLayout>,
    );
    const order = tagsOf(html).map((tag) => tag.attributes["data-slot"]).filter(Boolean);
    expect(order.indexOf("site-section-nav")).toBeLessThan(order.indexOf("site-account-section"));
    expect(order.indexOf("site-banner")).toBeLessThan(order.indexOf("site-section-head"));
    expect(unmarked(html)).toEqual([]);
  });

  it("marks the current section as the page, and the deleting one in the bad colour only while it is not current", () => {
    const html = renderToStaticMarkup(<SectionNav label="My account" items={sections} />);
    const items = bySlot(html, "site-section-nav-item");
    expect(items.map((item) => item.attributes["data-state"])).toEqual(["current", "plain", "danger"]);
    expect(items[0]?.attributes["aria-current"]).toBe("page");
    expect(items.every((item) => item.name === "a" && item.attributes.href?.startsWith("/account/"))).toBe(true);
    const leaving = bySlot(renderToStaticMarkup(<SectionNav label="My account" items={sections.map((item) => ({ ...item, current: item.key === "leave" }))} />), "site-section-nav-item");
    expect(leaving[2]?.attributes["data-state"]).toBe("current");
  });

  it("draws a section without an address as its words in its place, with no press and the look of its state", () => {
    const html = renderToStaticMarkup(<SectionNav label="My account" items={[...sections.slice(0, 2), { key: "receipts", label: "Receipts" }, { key: "leave", label: "Delete account", danger: true }]} />);
    const items = bySlot(html, "site-section-nav-item");
    expect(items.map((item) => [item.name, item.attributes["data-state"], item.attributes["data-pending"]])).toEqual([
      ["a", "current", "false"],
      ["a", "plain", "false"],
      ["span", "plain", "true"],
      ["span", "danger", "true"],
    ]);
    expect(items.slice(2).some((item) => "href" in item.attributes || "aria-current" in item.attributes)).toBe(false);
    expect(tabStops(html)).toHaveLength(2);
  });

  it("draws a section title as h2 and a part title as h3", () => {
    expect(bySlot(renderToStaticMarkup(<SectionHead>Credits</SectionHead>), "site-section-head")[0]?.name).toBe("h2");
    const sub = bySlot(renderToStaticMarkup(<SectionHead level={3}>Credit history</SectionHead>), "site-section-head")[0];
    expect(sub?.name).toBe("h3");
    expect(sub?.attributes["data-level"]).toBe("3");
  });
});

describe("settings", () => {
  it("draws a row's title with its chip, its line and its small actions", () => {
    const html = renderToStaticMarkup(
      <SettingsRows>
        <SettingsRow title="Pro" badge={<span data-slot="site-chip">Active</span>} meta="Next payment Nov 14" actions={[{ id: "change", label: "Change plan" }]} />
        <SettingsRow title="Email" meta="t@example.com" />
      </SettingsRows>,
    );
    expect(bySlot(html, "site-settings-row")).toHaveLength(2);
    expect(bySlot(html, "site-settings-row-actions")).toHaveLength(1);
    expect(bySlot(html, "site-action")[0]?.attributes["data-size"]).toBe("sm");
    expect(unmarked(html)).toEqual([]);
  });

  it("draws a question on a card in its tone, its text and its actions", () => {
    const html = renderToStaticMarkup(
      <SettingsBox tone="danger">
        <SettingsText tone="muted">You keep it until Nov 14.</SettingsText>
        <SettingsActions actions={[{ id: "cancel", label: "Cancel", tone: "danger" }, { id: "keep", label: "Keep" }]} />
      </SettingsBox>,
    );
    expect(bySlot(html, "site-settings-box")[0]?.attributes["data-tone"]).toBe("danger");
    expect(bySlot(html, "site-settings-text")[0]?.attributes["data-tone"]).toBe("muted");
    expect(bySlot(html, "site-action").map((tag) => tag.attributes["data-tone"])).toEqual(["danger", "secondary"]);
    const alone = bySlot(renderToStaticMarkup(<SettingsActions size="md" actions={[{ id: "cancel", label: "Cancel subscription", tone: "subtle" }]} />), "site-action")[0];
    expect(alone?.attributes["data-size"]).toBe("md");
    expect(alone?.attributes["data-pad"]).toBe("quietMd");
  });

  it("names the identity mark only when it is given a name", () => {
    const named = renderToStaticMarkup(<IdentityRow tone="voice" mark="V" markLabel="My voice" name="My voice" meta="Made Oct 2" />);
    expect(bySlot(named, "site-identity-mark")[0]?.attributes.role).toBe("img");
    expect(bySlot(named, "site-identity-mark")[0]?.attributes["data-tone"]).toBe("voice");
    const plain = renderToStaticMarkup(<IdentityRow mark="T" name="Taylor" />);
    expect(bySlot(plain, "site-identity-mark")[0]?.attributes["aria-hidden"]).toBe("true");
  });
});

describe("figures", () => {
  it("holds a meter's share between empty and full", () => {
    expect(shareWidth(0.25)).toBe("25%");
    expect(shareWidth(1.4)).toBe("100%");
    expect(shareWidth(-1)).toBe("0%");
    expect(shareWidth(Number.NaN)).toBe("0%");
    const html = renderToStaticMarkup(<QuotaMeter share={0.5} label="Half used" start="This month" end={<b>Half left</b>} />);
    expect(bySlot(html, "site-quota-track")[0]?.attributes["aria-label"]).toBe("Half used");
    expect(html).toContain("width:50%");
    expect(unmarked(html.replace(/<b>|<\/b>/g, ""))).toEqual([]);
  });

  it("draws each day as a bar a share of the tallest high, a day without use at the floor, and reads each day out", () => {
    expect(dayHeight(50, 100)).toBe("50%");
    expect(dayHeight(0, 100)).toBe("2%");
    const html = renderToStaticMarkup(
      <DaySeries
        days={[
          { key: "1", value: 0, label: "Oct 1: 0 characters" },
          { key: "2", value: 200, label: "Oct 2: 200 characters" },
        ]}
        from="Oct 1"
        to="Oct 2"
      />,
    );
    expect(bySlot(html, "site-day-bar")).toHaveLength(2);
    expect(bySlot(html, "site-day-label").map((tag) => tag.name)).toEqual(["span", "span"]);
    expect(html).toContain("height:100%");
    expect(bySlot(html, "site-day-axis")[0]?.attributes["aria-hidden"]).toBe("true");
    expect(unmarked(html)).toEqual([]);
  });

  it("draws a table with the first column bold, the middle muted and the last at the end, and a pager for a growing set", () => {
    const html = renderToStaticMarkup(
      <TableCard
        label="Credit history"
        columns={[
          { key: "item", label: "Item" },
          { key: "when", label: "Date" },
          { key: "amount", label: "Characters" },
        ]}
        rows={[{ key: "a", cells: { item: "Premium voice", when: "Oct 14", amount: "-640" } }]}
        more={{ id: "more", label: "Show more" }}
      />,
    );
    expect(bySlot(html, "site-table-card-cell").map((tag) => tag.attributes["data-kind"])).toEqual(["lead", "value", "end"]);
    expect(bySlot(html, "site-table-card-th").map((tag) => tag.attributes["data-end"])).toEqual(["false", "false", "true"]);
    expect(bySlot(html, "site-table-card-more")).toHaveLength(1);
    expect(bySlot(html, "site-action")[0]?.attributes["data-tone"]).toBe("quiet");
    expect(unmarked(html)).toEqual([]);
  });

  it("draws a panel with its title, a line with its action and a row's actions", () => {
    const html = renderToStaticMarkup(
      <SitePanel title="Last 14 days" label="Last 14 days">
        <PanelLine action={{ id: "top-up", label: "Top up credits", href: "/checkout" }}>Extra credits 0</PanelLine>
        <TableActions actions={[{ id: "pdf", label: "PDF" }]} />
      </SitePanel>,
    );
    expect(bySlot(html, "site-panel")[0]?.attributes["aria-label"]).toBe("Last 14 days");
    expect(bySlot(html, "site-panel-title")[0]?.name).toBe("h3");
    expect(tabStops(html)).toHaveLength(2);
    expect(unmarked(html)).toEqual([]);
  });
});
