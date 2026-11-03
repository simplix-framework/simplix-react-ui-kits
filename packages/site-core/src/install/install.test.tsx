import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { SiteCaption, SiteChip, SiteLive, SiteSpinner } from "../page/site-bits";
import { bySlot, silentRefusals, tabStops, unmarked } from "../testing/markup";
import { CheckCard, checkPassed } from "./check-card";
import { ActionLine, CopyBlock, DisclosureList, NumberedList } from "./disclosure-list";
import { DownloadCard, DownloadGrid, NoticeCard } from "./download-card";
import { siteDownloadFileStyle, siteDownloadGridStyle, siteInstallStepStyle } from "./install.style";
import { InstallSteps, ScreenSketch } from "./install-steps";
import { SiteProgress, VideoCard } from "./video-card";

describe("CheckCard", () => {
  const findings = [
    { key: "os", label: "Windows 11", ok: true },
    { key: "office", label: "PowerPoint 2016", ok: false },
  ];

  it("asks before it runs, with its one action", () => {
    const html = renderToStaticMarkup(<CheckCard state={{ kind: "idle", ask: "Check this computer?", action: { id: "check", label: "Check" } }} />);
    expect(bySlot(html, "site-check-title")[0]?.attributes["data-grow"]).toBe("true");
    expect(bySlot(html, "site-action")[0]?.attributes["data-size"]).toBe("sm");
    expect(tabStops(html)).toHaveLength(1);
    expect(unmarked(html)).toEqual([]);
  });

  it("turns a spinner while it runs and offers no action", () => {
    const html = renderToStaticMarkup(<CheckCard state={{ kind: "running", label: "Checking…" }} status="Checking…" />);
    expect(bySlot(html, "site-spinner")[0]?.attributes["aria-hidden"]).toBe("true");
    expect(tabStops(html)).toEqual([]);
    expect(bySlot(html, "site-live")[0]?.attributes.role).toBe("status");
    expect(html).toContain(">Checking…</span>");
  });

  it("draws a chip per finding in its tone and the verdict bad when any finding blocks", () => {
    const html = renderToStaticMarkup(<CheckCard state={{ kind: "done", title: "This computer", findings, verdict: "Not ready yet" }} />);
    expect(bySlot(html, "site-chip").map((chip) => chip.attributes["data-tone"])).toEqual(["good", "bad"]);
    expect(bySlot(html, "site-chip-dot")).toHaveLength(2);
    expect(bySlot(html, "site-check-verdict")[0]?.attributes["data-tone"]).toBe("bad");
    expect(checkPassed(findings)).toBe(false);
    expect(checkPassed(findings.slice(0, 1))).toBe(true);
    expect(unmarked(html)).toEqual([]);
  });
});

describe("DownloadCard and NoticeCard", () => {
  it("outlines the download to take first and makes its action primary, the other secondary", () => {
    const html = renderToStaticMarkup(
      <DownloadGrid>
        <DownloadCard highlight title="Windows" body="Windows 10 or later." file="Setup.exe · 64 MB" action={{ id: "win", label: "Download for Windows" }} />
        <DownloadCard title="Mac" body="macOS 13 or later." file="App.dmg" action={{ id: "mac", label: "Download for Mac" }} />
      </DownloadGrid>,
    );
    expect(bySlot(html, "site-download").map((card) => card.attributes["data-highlight"])).toEqual(["true", "false"]);
    expect(bySlot(html, "site-action").map((action) => action.attributes["data-tone"])).toEqual(["primary", "secondary"]);
    expect(siteDownloadGridStyle.base).toContain("@max-page-narrow/page:grid-cols-1");
    expect(unmarked(html)).toEqual([]);
  });

  it("breaks a file line that has no break points, such as a checksum, at the card's edge", () => {
    expect(siteDownloadFileStyle.base).toContain("break-words");
  });

  it("describes a disabled download by its file line, which says there is no file yet", () => {
    const html = renderToStaticMarkup(<DownloadCard title="Windows" body="Windows 10 or later." file="Not available yet" action={{ id: "win", label: "Download for Windows", disabled: true, reason: "No installer yet" }} />);
    expect(bySlot(html, "site-action")[0]?.attributes["aria-describedby"]).toBe(bySlot(html, "site-download-file")[0]?.attributes.id);
    expect(silentRefusals(html)).toEqual([]);
    expect(silentRefusals(renderToStaticMarkup(<DownloadCard title="Windows" body="Windows 10 or later." action={{ id: "win", label: "Download for Windows", disabled: true, reason: "No installer yet" }} />))).toEqual([]);
    const open = renderToStaticMarkup(<DownloadCard title="Windows" body="Windows 10 or later." file="Setup.exe · 64 MB" action={{ id: "win", label: "Download for Windows" }} />);
    expect(bySlot(open, "site-action")[0]?.attributes["aria-describedby"]).toBeUndefined();
  });

  it("draws neither file nor action when a phone cannot install", () => {
    const html = renderToStaticMarkup(<DownloadCard title="Windows" body="Windows 10 or later." />);
    expect(bySlot(html, "site-download-file")).toEqual([]);
    expect(tabStops(html)).toEqual([]);
  });

  it("draws a notice as an outlined card with its title and words", () => {
    const html = renderToStaticMarkup(<NoticeCard title="Install on your computer" body="Open this page there." />);
    expect(bySlot(html, "site-notice")[0]?.attributes["data-tone"]).toBe("accent");
    expect(bySlot(html, "site-notice-title")).toHaveLength(1);
    expect(unmarked(html)).toEqual([]);
  });
});

describe("InstallSteps and ScreenSketch", () => {
  it("numbers each step on a disc, with its tag, words and sketch, stacked below the narrow tier", () => {
    const html = renderToStaticMarkup(
      <InstallSteps
        steps={[
          { key: "a", title: "Install the app", body: "Open the file.", media: <ScreenSketch content={{ kind: "progress", label: "Installing", share: 0.6 }} /> },
          { key: "b", title: "Install the add-in", tag: <SiteChip>For PowerPoint</SiteChip>, body: "Press Add.", media: <ScreenSketch content={{ kind: "pill", label: "App", pill: "Add" }} /> },
          { key: "c", title: "Connect", body: "Six digits.", media: <ScreenSketch accentBar content={{ kind: "code", code: "482913" }} /> },
        ]}
      />,
    );
    expect(bySlot(html, "site-install-steps")[0]?.name).toBe("ol");
    expect(bySlot(html, "site-step-disc").length).toBe(3);
    expect(html).toContain(">1</span>");
    expect(bySlot(html, "site-install-step-tag")).toHaveLength(1);
    expect(bySlot(html, "site-sketch").every((sketch) => sketch.attributes["aria-hidden"] === "true")).toBe(true);
    expect(bySlot(html, "site-sketch-fill")[0]?.attributes.style).toBe("width:60%");
    expect(bySlot(html, "site-sketch-label").map((label) => label.attributes["data-kind"])).toEqual(["progress", "pill", "code"]);
    expect(bySlot(html, "site-sketch-line").map((line) => line.attributes["data-span"])).toEqual(["short", "long", "short", "long", "short", "accent"]);
    expect(siteInstallStepStyle.base).toContain("@max-page-narrow/page:grid-cols-1");
    expect(unmarked(html)).toEqual([]);
  });

  it("holds a sketch's progress between empty and full", () => {
    const html = renderToStaticMarkup(<ScreenSketch content={{ kind: "progress", label: "x", share: 1.7 }} />);
    expect(bySlot(html, "site-sketch-fill")[0]?.attributes.style).toBe("width:100%");
  });
});

describe("VideoCard", () => {
  it("is named by its title, its toggle pressed while it plays and its track filled to the share played", () => {
    const html = renderToStaticMarkup(<VideoCard title="Watch the install" caption="Two minutes." played={0.25} toggleLabel="Play the install video" />);
    expect(bySlot(html, "site-video")[0]?.attributes["aria-label"]).toBe("Watch the install");
    expect(bySlot(html, "site-video-toggle")[0]?.attributes["aria-pressed"]).toBe("true");
    expect(bySlot(html, "site-progress-fill")[0]?.attributes.style).toBe("width:25%");
    expect(unmarked(html)).toEqual([]);
  });

  it("draws an empty track while it is not playing", () => {
    const html = renderToStaticMarkup(<VideoCard title="Watch" played={null} toggleLabel="Play" />);
    expect(bySlot(html, "site-video-toggle")[0]?.attributes["aria-pressed"]).toBe("false");
    expect(renderToStaticMarkup(<SiteProgress share={-1} />)).toContain("width:0%");
  });
});

describe("DisclosureList", () => {
  const items = [
    { key: "old", title: "Add-ins are not available", lead: "PowerPoint is too old.", body: "Update it.", steps: ["File › Account", "Update Now"] },
    { key: "store", title: "Not in Get Add-ins", body: "An admin deploys it.", copy: <CopyBlock text={"Admin center\n› Integrated apps"} action={{ id: "copy", label: "Copy the message" }} /> },
  ];

  it("opens one answer, its question pressed open and pointing at it, the cause first and the steps numbered", () => {
    const html = renderToStaticMarkup(<DisclosureList items={items} open="old" onOpenChange={() => {}} mark={<svg data-slot="product-glyph" />} />);
    const buttons = bySlot(html, "site-disclosure-button");
    expect(buttons.map((button) => button.attributes["aria-expanded"])).toEqual(["true", "false"]);
    const panel = bySlot(html, "site-disclosure-panel")[0];
    expect(buttons[0]?.attributes["aria-controls"]).toBe(panel?.attributes.id);
    expect(buttons[1]?.attributes["aria-controls"]).toBeUndefined();
    expect(bySlot(html, "site-disclosure-mark").map((mark) => mark.attributes["data-open"])).toEqual(["true", "false"]);
    expect(bySlot(html, "site-disclosure-lead")).toHaveLength(1);
    expect(bySlot(html, "site-numbered-item")).toHaveLength(2);
    expect(unmarked(html.replace('<svg data-slot="product-glyph"></svg>', ""))).toEqual([]);
  });

  it("keeps a copied message as written, with the action that copies it", () => {
    const html = renderToStaticMarkup(<DisclosureList items={items} open="store" onOpenChange={() => {}} />);
    expect(bySlot(html, "site-copy-text")[0]?.name).toBe("pre");
    expect(html).toContain("Admin center\n› Integrated apps");
    expect(bySlot(html, "site-action")[0]?.attributes["data-size"]).toBe("sm");
  });

  it("opens nothing when no key is open", () => {
    const html = renderToStaticMarkup(<DisclosureList items={items} open={null} onOpenChange={() => {}} />);
    expect(bySlot(html, "site-disclosure-panel")).toEqual([]);
  });

  it("draws a numbered list on its own", () => {
    expect(bySlot(renderToStaticMarkup(<NumberedList items={["One", "Two"]} />), "site-numbered-list")[0]?.name).toBe("ol");
  });
});

describe("the small page parts", () => {
  it("end a muted line in its one action, caption a part, and speak a status", () => {
    const line = renderToStaticMarkup(<ActionLine text="Not installing?" action={{ id: "help", label: "Troubleshooting", href: "/help" }} />);
    expect(tabStops(line).map((stop) => stop.attributes.href)).toEqual(["/help"]);
    expect(bySlot(renderToStaticMarkup(<SiteCaption>Still stuck?</SiteCaption>), "site-caption")[0]?.name).toBe("p");
    expect(bySlot(renderToStaticMarkup(<SiteLive>Ready</SiteLive>), "site-live")[0]?.attributes.role).toBe("status");
    expect(unmarked(renderToStaticMarkup(<SiteSpinner />))).toEqual([]);
    expect(bySlot(renderToStaticMarkup(<SiteChip tone="warn">Draft</SiteChip>), "site-chip")[0]?.attributes["data-tone"]).toBe("warn");
  });
});
