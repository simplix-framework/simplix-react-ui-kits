import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { bySlot, unmarked } from "../testing/markup";
import { ScreenSketch, SketchLines, SketchMeter, SketchNotice, SketchPill, SketchPills, SketchRow, SketchWords } from "./screen-sketch";
import { siteScreenStyle } from "./screen.style";

const tick = <svg data-slot="product-glyph" />;

describe("ScreenSketch", () => {
  it("is one picture hidden from assistive technology, with its title bar, rows and footer", () => {
    const html = renderToStaticMarkup(
      <ScreenSketch title="StageVoice" closeMark={tick} footer={<SketchPill tone="accent">Remake failed only</SketchPill>}>
        <SketchRow state="ok" text="We automated 32 tasks" meta="0:04" mark={tick} />
      </ScreenSketch>,
    );
    expect(bySlot(html, "site-screen")[0]?.attributes["aria-hidden"]).toBe("true");
    const order = ["site-screen-head", "site-screen-body", "site-screen-foot"].map((slot) => html.indexOf(`data-slot="${slot}"`));
    expect(order.every((at, i) => at > 0 && (i === 0 || at > (order[i - 1] ?? 0)))).toBe(true);
    expect(siteScreenStyle.base).toContain("max-w-sm");
    expect(unmarked(html.replaceAll('<svg data-slot="product-glyph"></svg>', ""))).toEqual([]);
  });

  it("draws a row's state on its disc and its ground, and no mark on a waiting row", () => {
    const row = (state: "ok" | "bad" | "wait") => renderToStaticMarkup(<SketchRow state={state} text="A sentence" mark={tick} />);
    expect(bySlot(row("bad"), "site-screen-row")[0]?.attributes["data-state"]).toBe("bad");
    expect(bySlot(row("bad"), "site-screen-disc")[0]?.attributes["data-state"]).toBe("bad");
    expect(row("ok")).toContain("product-glyph");
    expect(row("wait")).not.toContain("product-glyph");
    const failed = renderToStaticMarkup(
      <SketchRow state="bad" text="A sentence" meta="—">
        <SketchWords tone="bad" strong>
          Not enough credits
        </SketchWords>
        <SketchPills>
          <SketchPill tone="accent">Extra credits</SketchPill>
          <SketchPill>Use a free voice</SketchPill>
        </SketchPills>
      </SketchRow>,
    );
    expect(bySlot(failed, "site-screen-words")[0]?.name).toBe("b");
    expect(bySlot(failed, "site-screen-pill").map((pill) => pill.attributes["data-tone"])).toEqual(["accent", "plain"]);
    expect(unmarked(failed)).toEqual([]);
  });

  it("draws a notice, standing lines and a meter held to its track", () => {
    const html = renderToStaticMarkup(
      <ScreenSketch title="StageVoice">
        <SketchNotice title="App not found" text="Voices are made by the app" action={<SketchPill tone="accent">Open the app</SketchPill>} />
        <SketchLines lengths={["long", "short", "middle"]} />
        <SketchMeter label="Premium characters left" value="1,240 / 50,000" share={2} low note="Refilled Dec 1" />
      </ScreenSketch>,
    );
    expect(bySlot(html, "site-screen-line-bar").map((bar) => bar.attributes["data-length"])).toEqual(["long", "short", "middle"]);
    expect(bySlot(html, "site-screen-fill")[0]?.attributes["data-tone"]).toBe("warn");
    expect(html).toContain("width:100%");
    expect(unmarked(html)).toEqual([]);
  });
});
