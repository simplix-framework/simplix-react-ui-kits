#!/usr/bin/env node
// Records what every screen story shows, so that a change meant to leave the screens as they are
// can be proved to: the visible text, every button with whether it can be pressed and why not, and
// the marks the mockup names (attributes of its own that say what a screen is showing).
//   story-digest --url <storybook url> --out <file.json> [--filter <regex>] [--root <mockup root>] [--channel chrome]
//   story-digest --diff <before.json> <after.json>
// mockup.config.json `digest` may name `marks` ({ name: { selector, attribute? } }; without an
// attribute the mark says whether the element is there) and `moving` (regular expressions of text
// that changes by itself, such as the time left on a deadline; a clock time is always left out).
import { readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { chromium } from "playwright";
import { parseArgs } from "../lib/fs-util.mjs";

const argv = process.argv.slice(2);

if (argv[0] === "--diff") {
  if (!argv[1] || !argv[2]) { console.error("usage: story-digest --diff <before.json> <after.json>"); process.exit(2); }
  const before = JSON.parse(readFileSync(argv[1], "utf8"));
  const after = JSON.parse(readFileSync(argv[2], "utf8"));
  const ids = [...new Set([...Object.keys(before), ...Object.keys(after)])].sort();
  let differing = 0;
  for (const id of ids) {
    const was = before[id];
    const now = after[id];
    if (JSON.stringify(was) === JSON.stringify(now)) continue;
    differing += 1;
    const lines = [];
    if (!was) lines.push("new story");
    else if (!now) lines.push("story gone");
    else {
      for (const key of ["text", "buttons", "marks", "errors"]) {
        if (JSON.stringify(was[key]) === JSON.stringify(now[key])) continue;
        if (key === "text") {
          const a = was.text.split("\n");
          const b = now.text.split("\n");
          const gone = a.filter((line) => !b.includes(line)).slice(0, 4);
          const come = b.filter((line) => !a.includes(line)).slice(0, 4);
          // The same lines in another order or number still differ: said so, where no line came or went.
          lines.push(gone.length + come.length > 0 ? `text: -[${gone.join(" | ").slice(0, 200)}] +[${come.join(" | ").slice(0, 200)}]` : `text: the same lines, ${a.length === b.length ? "in another order" : `${a.length} then ${b.length}`}`);
        } else if (key === "buttons") {
          const a = new Set(was.buttons);
          const b = new Set(now.buttons);
          lines.push(`buttons: -[${[...a].filter((x) => !b.has(x)).slice(0, 5).join(" | ")}] +[${[...b].filter((x) => !a.has(x)).slice(0, 5).join(" | ")}]`);
        } else lines.push(`${key}: ${JSON.stringify(was[key])} -> ${JSON.stringify(now[key])}`.slice(0, 300));
      }
    }
    console.log(`${id}: ${lines.join("; ")}`);
  }
  console.log(`${ids.length} stories compared, ${differing} differ`);
  process.exit(differing === 0 ? 0 : 1);
}

const args = parseArgs(argv);
if (!args.url || !args.out) {
  console.error("usage: story-digest --url <storybook url> --out <file.json> [--filter <regex>] [--root <mockup root>] [--channel chrome]");
  process.exit(2);
}
const url = String(args.url).replace(/\/$/, "");
const root = resolve(String(args.root ?? "."));
let config = {};
try { config = JSON.parse(readFileSync(join(root, "mockup.config.json"), "utf8")).digest ?? {}; } catch (error) { if (error.code !== "ENOENT") throw error; }
const marks = Object.entries(config.marks ?? {}).map(([name, mark]) => ({ name, selector: mark.selector, attribute: mark.attribute ?? null }));
const moving = (config.moving ?? []).map((source) => String(source));
const filter = args.filter ? new RegExp(String(args.filter)) : undefined;

const entries = Object.values((await (await fetch(`${url}/index.json`)).json()).entries).filter((entry) => entry.type === "story" && entry.importPath.startsWith("./screens/") && (!filter || filter.test(entry.id)));
// --channel names an installed browser (chrome, msedge) where the bundled one is not downloaded.
const browser = await chromium.launch(args.channel ? { channel: String(args.channel) } : {});
const page = await (await browser.newContext({ viewport: { width: Number(args.width ?? 1440), height: Number(args.height ?? 900) } })).newPage();
page.setDefaultTimeout(20000);
const out = {};
for (const story of entries) {
  const errors = [];
  const onError = (error) => errors.push(error.message.split("\n")[0].slice(0, 160));
  page.on("pageerror", onError);
  await page.goto(`${url}/iframe.html?id=${story.id}&viewMode=story`, { timeout: 180000 }).catch((error) => errors.push(`goto: ${error.message.slice(0, 80)}`));
  // The story is drawn, and what it draws has stopped changing.
  await page.waitForFunction(() => document.querySelector("#storybook-root")?.childElementCount > 0, undefined, { timeout: 60000 }).catch(() => errors.push("nothing drawn"));
  // A screen still fetching its modules can stand still for a moment before it is drawn whole: the
  // network is given time to go quiet, and the reading has to hold over two rounds in a row.
  await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => {});
  let last = "";
  let held = 0;
  for (let round = 0; round < 16 && held < 2; round += 1) {
    await page.waitForTimeout(300);
    const now = await page.evaluate(() => `${document.body.innerText.length}:${document.querySelectorAll("button").length}`);
    held = now === last ? held + 1 : 0;
    last = now;
  }
  const read = () => page.evaluate(({ marks, moving }) => {
    let text = document.body.innerText.replace(/\b\d{1,2}:\d{2}(:\d{2})?\b/g, "<time>");
    for (const source of moving) text = text.replace(new RegExp(source, "g"), "<moving>");
    return {
      text: text.split("\n").map((line) => line.trim()).filter(Boolean).join("\n"),
      buttons: [...document.querySelectorAll("button")].filter((button) => button.offsetParent !== null).map((button) => `${(button.innerText || button.getAttribute("aria-label") || "").replace(/\s+/g, " ").trim()}${button.disabled || button.getAttribute("aria-disabled") === "true" ? ` [off: ${button.closest("[aria-description]")?.getAttribute("aria-description") ?? button.title ?? ""}]` : ""}`),
      marks: Object.fromEntries(marks.map((mark) => { const found = document.querySelector(mark.selector); return [mark.name, mark.attribute === null ? found !== null : found?.getAttribute(mark.attribute) ?? null]; })),
    };
  }, { marks, moving });
  // A page that reloads while it is read (the dev server pushing a module) is read again.
  out[story.id] = await read().catch(async () => { await page.waitForTimeout(2000); return read(); });
  out[story.id].errors = errors;
  page.off("pageerror", onError);
}
await browser.close();
writeFileSync(String(args.out), JSON.stringify(out, null, 1));
const failed = Object.values(out).filter((one) => one.errors.length > 0).length;
console.log(`${Object.keys(out).length} stories recorded; ${failed} with errors`);
process.exitCode = failed > 0 ? 1 : 0;
