// Captures every story of a running Storybook as one PNG per story and mode, for hand-off.
import { mkdirSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { chromium } from "playwright";

/** File name of a story's capture. */
export function captureName(id) {
  return `${id}.png`;
}

/** Story ids a Storybook serves, from its index.json; docs entries are left out. */
export async function storyIds(url) {
  const response = await fetch(`${url}/index.json`);
  if (!response.ok) throw new Error(`${url}/index.json: ${response.status}`);
  const index = await response.json();
  return Object.values(index.entries).filter((e) => e.type === "story").map((e) => e.id);
}

/**
 * Writes <out>/<mode>/<story id>.png for every story (matching `filter`) and <out>/report.json
 * with each render failure. `modes` are values of the Storybook `mode` global; `globals` adds more
 * (`detailPresentation:drawer;locale:ko`) to every capture. Returns the report.
 */
export async function captureAll({ url, out, modes = ["light", "dark"], globals = "", filter, concurrency = 4, viewport = { width: 1280, height: 800 }, timeout = 20000 }) {
  out = resolve(out);
  const started = Date.now();
  const ids = (await storyIds(url)).filter((id) => !filter || filter.test(id));
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport, deviceScaleFactor: 1, reducedMotion: "reduce", locale: "en-US", timezoneId: "UTC" });
  const jobs = modes.flatMap((mode) => ids.map((id) => ({ id, mode })));
  const failures = [];
  let done = 0;

  async function openPage(errors) {
    const page = await context.newPage();
    page.on("pageerror", (error) => errors.push(error.message));
    return page;
  }

  async function worker() {
    const errors = [];
    let page = await openPage(errors);
    while (jobs.length > 0) {
      const { id, mode } = jobs.shift();
      errors.length = 0;
      try {
        await page.goto(`${url}/iframe.html?id=${encodeURIComponent(id)}&viewMode=story&globals=${encodeURIComponent([`mode:${mode}`, globals].filter(Boolean).join(";"))}`);
        // Storybook marks the body once a story has rendered or failed.
        await page.waitForFunction(() => /sb-show-(main|errordisplay|nopreview)/.test(document.body.className), null, { timeout });
        const shown = await page.evaluate(() => document.body.className);
        if (!shown.includes("sb-show-main")) {
          const message = await page.evaluate(() => document.querySelector("#error-message")?.textContent ?? "no story rendered");
          throw new Error(message);
        }
        await page.waitForLoadState("networkidle");
        await page.evaluate(() => document.fonts.ready);
        mkdirSync(join(out, mode), { recursive: true });
        await page.screenshot({ path: join(out, mode, captureName(id)), animations: "disabled", caret: "hide" });
      } catch (error) {
        failures.push({ id, mode, error: String(error instanceof Error ? error.message : error).split("\n")[0], pageErrors: [...errors] });
        // A crashed or hung page is discarded so one story cannot fail the ones after it.
        await page.close().catch(() => undefined);
        page = await openPage(errors);
      }
      done++;
    }
    await page.close();
  }
  await Promise.all(Array.from({ length: concurrency }, worker));
  await browser.close();

  const report = { url, modes, globals, viewport, stories: ids.length, captured: done - failures.length, seconds: Math.round((Date.now() - started) / 1000), failures };
  mkdirSync(out, { recursive: true });
  writeFileSync(join(out, "report.json"), JSON.stringify(report, null, 2) + "\n");
  return report;
}
