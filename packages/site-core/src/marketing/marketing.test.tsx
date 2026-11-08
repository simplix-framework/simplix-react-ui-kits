import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { bySlot, tabStops, unmarked } from "../testing/markup";
import { HeroBand } from "./hero-band";
import { siteHeroInnerStyle, siteHeroTitleStyle, siteSplitStyle, siteStepsListStyle } from "./marketing.style";
import { seededLevels } from "./levels";
import { NumberedSteps, stepNumber } from "./numbered-steps";
import { PlayerCard, PlayToggle, ReadAlong, readWordAt, readWordState, SiteBars, SiteWave } from "./player";
import { SampleList, SampleRow, SplitSection } from "./sample-row";

describe("HeroBand", () => {
  const hero = (over = {}) =>
    renderToStaticMarkup(
      <HeroBand
        tone="dark"
        eyebrow="VOICE YOUR DECK."
        title="Speaker notes"
        accent="in your own voice"
        lede="Write notes for every slide."
        actions={[
          { id: "download", label: "Download free", href: "/download", tone: "primary" },
          { id: "pricing", label: "See pricing", href: "/pricing" },
        ]}
        facts="Windows · PowerPoint"
        media={<span data-slot="product-media">player</span>}
        {...over}
      />,
    );

  it("draws the eyebrow, the one h1 with its accent line, the lede, the actions, the facts and the media in that order", () => {
    const html = hero();
    expect(html.match(/<h1/g)).toHaveLength(1);
    const order = ["site-hero-eyebrow", "site-hero-title", "site-hero-accent", "site-hero-lede", "site-hero-actions", "site-hero-facts", "site-hero-media"].map((slot) => html.indexOf(`data-slot="${slot}"`));
    expect(order.every((at, i) => at > 0 && (i === 0 || at > (order[i - 1] ?? 0)))).toBe(true);
    expect(unmarked(html.replace(/<span data-slot="product-media">player<\/span>/, ""))).toEqual([]);
  });

  it("reads its title and accent as two words in the h1's text, since the line break between them is no space to a reader of the text", () => {
    const h1 = /<h1[^>]*>([\s\S]*?)<\/h1>/.exec(hero())?.[1] ?? "";
    // The text a screen reader or a copy takes: tags dropped, entities left as written.
    expect(h1.replace(/<[^>]*>/g, "")).toBe("Speaker notes in your own voice");
    const bare = /<h1[^>]*>([\s\S]*?)<\/h1>/.exec(hero({ accent: undefined }))?.[1] ?? "";
    expect(bare.replace(/<[^>]*>/g, "")).toBe("Speaker notes");
  });

  it("is its own dark band when asked, and draws its actions large, the strongest first", () => {
    const html = hero();
    expect(bySlot(html, "site-hero")[0]?.attributes["data-band"]).toBe("dark");
    const actions = bySlot(html, "site-action");
    expect(actions.map((action) => [action.attributes["data-size"], action.attributes["data-tone"]])).toEqual([
      ["lg", "primary"],
      ["lg", "secondary"],
    ]);
    expect(tabStops(html).map((stop) => stop.attributes.href)).toEqual(["/download", "/pricing"]);
  });

  it("draws no band mark on a light hero and leaves out what it is not handed", () => {
    const html = renderToStaticMarkup(<HeroBand title="Speaker notes" />);
    expect(bySlot(html, "site-hero")[0]?.attributes["data-band"]).toBeUndefined();
    for (const slot of ["site-hero-eyebrow", "site-hero-accent", "site-hero-lede", "site-hero-actions", "site-hero-facts", "site-hero-media"]) expect(bySlot(html, slot)).toEqual([]);
  });

  it("puts the media under the pitch below the medium tier and draws the title a step smaller below the narrow tier", () => {
    expect(siteHeroInnerStyle.base).toContain("grid-cols-2");
    expect(siteHeroInnerStyle.base).toContain("@max-page-medium/page:grid-cols-1");
    expect(siteHeroInnerStyle.base).toContain("@max-page-narrow/page:px-4");
    expect(siteHeroTitleStyle.base).toContain("@max-page-narrow/page:text-(length:--site-fs-display)");
  });
});

describe("PlayerCard and its parts", () => {
  it("draws the choice, the sentence, the wave and the play row, the toggle saying what a press does", () => {
    const html = renderToStaticMarkup(
      <PlayerCard choice={<span data-slot="product-choice" />} text={<ReadAlong text="We save hours" at={null} />} playing={false} toggleLabel="Listen" caption="Free voice" />,
    );
    const toggle = bySlot(html, "site-play-toggle")[0];
    expect(toggle?.name).toBe("button");
    expect(toggle?.attributes["aria-label"]).toBe("Listen");
    expect(toggle?.attributes["aria-pressed"]).toBe("false");
    expect(bySlot(html, "site-player-caption")).toHaveLength(1);
    expect(tabStops(html)).toHaveLength(1);
  });

  it("presses the toggle while the sample plays", () => {
    const html = renderToStaticMarkup(<PlayToggle playing label="Stop" />);
    expect(bySlot(html, "site-play-toggle")[0]?.attributes["aria-pressed"]).toBe("true");
  });

  it("lights the word the voice reached, marks the words before it read and the ones after it waiting", () => {
    expect([0, 1, 2, 3].map((index) => readWordState(index, 2))).toEqual(["read", "read", "spoken", "upcoming"]);
    expect(readWordState(0, null)).toBe("rest");
    const html = renderToStaticMarkup(<ReadAlong text="one two three four" at={2} />);
    expect(bySlot(html, "site-read-word").map((word) => word.attributes["data-state"])).toEqual(["read", "read", "spoken", "upcoming"]);
    expect(bySlot(html, "site-read-along")[0]?.attributes["aria-live"]).toBe("off");
  });

  it("finds the word reached from the share played, never past the last word", () => {
    expect(readWordAt(null, 10)).toBeNull();
    expect(readWordAt(0, 10)).toBe(0);
    expect(readWordAt(0.45, 10)).toBe(4);
    expect(readWordAt(1, 10)).toBe(9);
    expect(readWordAt(0.5, 0)).toBeNull();
  });

  it("draws a wave bar per level, the share played marked, with its name for a screen reader", () => {
    const html = renderToStaticMarkup(<SiteWave levels={[0.5, 0.2, 1, 0.4]} progress={0.5} height={40} label="Voice waveform, 50% played" />);
    const svg = bySlot(html, "site-wave")[0];
    expect(svg?.attributes.role).toBe("img");
    expect(svg?.attributes["aria-label"]).toBe("Voice waveform, 50% played");
    expect(svg?.attributes.viewBox).toBe("0 0 16 40");
    expect(bySlot(html, "site-wave-bar").map((bar) => bar.attributes["data-played"])).toEqual(["true", "true", "false", "false"]);
    expect(unmarked(html)).toEqual([]);
  });

  it("draws the same stand-in shape for a seed every time, as the reference design's waveform does", () => {
    const shape = seededLevels("site-step-voice", 80);
    expect(shape).toHaveLength(80);
    // The reference design's generator gives these first levels for this seed; a changed hash, step
    // or envelope draws a different picture than the design.
    expect(shape.slice(0, 4).map((level) => level.toFixed(6))).toEqual(["0.572904", "0.425043", "0.702697", "0.234714"]);
    expect(seededLevels("", 3).map((level) => level.toFixed(6))).toEqual(["0.148868", "0.327252", "0.486888"]);
    expect(seededLevels("site-step-voice", 80)).toEqual(shape);
    expect(seededLevels("site-hero-free", 80)).not.toEqual(shape);
    expect(Math.min(...shape)).toBeGreaterThanOrEqual(0.07);
    expect(Math.max(...shape)).toBeLessThanOrEqual(1);
  });

  it("draws a picture of bars hidden from screen readers, each with its height or its share of the width", () => {
    const html = renderToStaticMarkup(
      <SiteBars
        tone="strong"
        bars={[
          { key: "a", grow: 22 },
          { key: "b", height: 12 },
        ]}
      />,
    );
    expect(bySlot(html, "site-bars")[0]?.attributes["aria-hidden"]).toBe("true");
    const bars = bySlot(html, "site-bars-bar");
    expect(bars.map((bar) => bar.attributes["data-tone"])).toEqual(["strong", "strong"]);
    expect(bars[0]?.attributes.style).toBe("flex-grow:22");
    expect(bars[1]?.attributes.style).toBe("height:12px");
  });
});

describe("SampleRow", () => {
  const row = (over = {}) => renderToStaticMarkup(<SampleRow name="Free" meta="On this computer" text="We save hours" playing={false} label="Listen to the free voice" {...over} />);

  it("is one toggle naming what a press does, with the disc, the name, where it is made and the text", () => {
    const html = row();
    const button = bySlot(html, "site-sample")[0];
    expect(button?.name).toBe("button");
    expect(button?.attributes["aria-pressed"]).toBe("false");
    expect(button?.attributes["aria-label"]).toBe("Listen to the free voice");
    const order = ["site-sample-disc", "site-sample-name", "site-sample-meta", "site-sample-text"].map((slot) => html.indexOf(`data-slot="${slot}"`));
    expect(order.every((at, i) => at > 0 && (i === 0 || at > (order[i - 1] ?? 0)))).toBe(true);
    expect(unmarked(html)).toEqual([]);
  });

  it("puts the product's wave in the text's place while it plays", () => {
    const html = row({ playing: true, playingMedia: <SiteWave levels={[0.3]} height={30} label="playing" /> });
    expect(bySlot(html, "site-sample")[0]?.attributes["data-playing"]).toBe("true");
    expect(bySlot(html, "site-sample-disc")[0]?.attributes["data-playing"]).toBe("true");
    expect(bySlot(html, "site-sample-text")).toEqual([]);
    expect(bySlot(html, "site-wave")).toHaveLength(1);
  });

  it("cannot start while disabled, and can still stop when it is the one playing", () => {
    expect(bySlot(row({ disabled: true }), "site-sample")[0]?.attributes.disabled).toBeDefined();
    expect(bySlot(row({ disabled: true, playing: true }), "site-sample")[0]?.attributes.disabled).toBeUndefined();
  });

  it("stands in a list beside a display heading, one under the other below the medium tier", () => {
    const html = renderToStaticMarkup(
      <SplitSection heading="Hear free and premium" lede="Switch before you sign up.">
        <SampleList>
          <SampleRow name="Free" text="We save hours" playing={false} label="Listen" />
        </SampleList>
      </SplitSection>,
    );
    const section = bySlot(html, "site-split")[0];
    const heading = bySlot(html, "site-display-heading")[0];
    expect(section?.attributes["aria-labelledby"]).toBe(heading?.attributes.id);
    expect(siteSplitStyle.base).toContain("@max-page-medium/page:grid-cols-1");
    expect(unmarked(html)).toEqual([]);
  });
});

describe("NumberedSteps", () => {
  it("numbers the steps in two digits and draws each card's picture, title and body, then the promises", () => {
    const html = renderToStaticMarkup(
      <NumberedSteps
        heading="From notes to a ready presentation"
        steps={[
          { key: "a", title: "Write notes", body: "From the slide.", media: <SiteBars bars={[{ key: "x", height: 8 }]} /> },
          { key: "b", title: "Make the voice", body: "Free or premium." },
        ]}
        notes={[{ key: "n", label: "Never leaves your computer" }]}
        noteMark={<svg data-slot="product-glyph" />}
      />,
    );
    expect(stepNumber(0)).toBe("01");
    expect(stepNumber(11)).toBe("12");
    expect(html).toContain(">01<");
    expect(html).toContain(">02<");
    expect(bySlot(html, "site-step")).toHaveLength(2);
    expect(bySlot(html, "site-step-media")).toHaveLength(1);
    expect(bySlot(html, "site-note")).toHaveLength(1);
    expect(bySlot(html, "site-note-mark")[0]?.attributes["aria-hidden"]).toBe("true");
    expect(bySlot(html, "site-steps-list")[0]?.name).toBe("ol");
    expect(siteStepsListStyle.base).toContain("@max-page-medium/page:grid-cols-1");
    expect(unmarked(html)).toEqual([]);
    expect(tabStops(html)).toEqual([]);
  });

  it("draws no promise line when there are none", () => {
    const html = renderToStaticMarkup(<NumberedSteps heading="Steps" steps={[{ key: "a", title: "One", body: "First." }]} />);
    expect(bySlot(html, "site-note-list")).toEqual([]);
  });
});
