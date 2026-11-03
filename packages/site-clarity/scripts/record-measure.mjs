// Reads the pages a measure file records from their reference stories again, compares each reading with
// the recorded signature and with the kit's verification page drawn at the reading's page-root width,
// and with --record writes the reading into the file. A page is recorded only when its reference drew,
// the verification page equals the reading (so `site-demo --measure` holds it by construction) and, with
// --expect, every difference from the recorded signature matches the expected pattern.
//   node scripts/record-measure.mjs --file measure/<type>.json --origin <storybook origin>
//        --selectors <module>[#<export>] [--only <name,...>] [--expect <regex>] [--record] [--cdp <ws url>]
// The story is `<origin>/iframe.html?viewMode=story&id=<entry.story>&globals=locale:<l>;appearance:light`,
// read at the entry's viewport (900 high) in the light scheme with every finite animation finished.
// `--selectors` names the product's stand-ins for the parts its reference draws without a site mark: a
// module path and an export (default `default`), an object `probe` takes as `selectors` or a function
// from the entry to one. Reader and runner agree when they read through the same module.
// The browser is a headless Chromium started as an agent-browser session (or the one `--cdp` names):
// a headless browser draws classic scrollbars, so a story that scrolls inside its frame lays its root
// out narrower by the scrollbar, as every recorded page was read; a headed browser following a system
// set to overlay scrollbars reads those roots wider and is not used.
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { buildDemo } from "./site-demo.mjs";
import { byRegion, compare, contract, judge, probe } from "./site-regions-rendered.mjs";

const here = dirname(dirname(fileURLToPath(import.meta.url)));
const option = (name) => {
  const at = process.argv.indexOf(name);
  return at >= 0 ? process.argv[at + 1] : undefined;
};

/** A signature cut down to one region, as a measure entry with `only` records it. */
const onlyRegion = (signature, region) => ({
  rootWidth: signature.rootWidth,
  order: signature.order.filter((key) => key === region),
  frame: {},
  regions: signature.regions[region] ? { [region]: signature.regions[region] } : {},
});
const cut = (signature, entry) => (entry.only && !signature.missing ? onlyRegion(signature, entry.only) : signature);

/** A CDP connection to the first page of a browser endpoint: send, evaluate and a navigation that waits. */
async function connect(url) {
  const ws = new WebSocket(url);
  await new Promise((open, fail) => {
    ws.onopen = open;
    ws.onerror = () => fail(new Error(`no browser answers at ${url}`));
  });
  let id = 0;
  const waiting = new Map();
  ws.onmessage = (message) => {
    const msg = JSON.parse(message.data);
    const pending = msg.id ? waiting.get(msg.id) : undefined;
    if (!pending) return;
    waiting.delete(msg.id);
    if (msg.error) pending.fail(new Error(msg.error.message));
    else pending.done(msg.result);
  };
  const raw = (method, params = {}, sessionId) =>
    new Promise((done, fail) => {
      const n = ++id;
      waiting.set(n, { done, fail });
      ws.send(JSON.stringify({ id: n, method, params, ...(sessionId ? { sessionId } : {}) }));
    });
  const { targetInfos } = await raw("Target.getTargets");
  const target = targetInfos.find((info) => info.type === "page");
  if (!target) throw new Error(`the browser at ${url} has no page open`);
  const { sessionId } = await raw("Target.attachToTarget", { targetId: target.targetId, flatten: true });
  const send = (method, params) => raw(method, params, sessionId);
  const evaluate = async (expression) => {
    const answer = await send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
    if (answer.exceptionDetails) throw new Error(answer.exceptionDetails.exception?.description ?? answer.exceptionDetails.text);
    return answer.result.value;
  };
  const sleep = (ms) => new Promise((wake) => setTimeout(wake, ms));
  const until = async (expression, timeout) => {
    const end = Date.now() + timeout;
    while (Date.now() < end) {
      if (await evaluate(expression).catch(() => false)) return true;
      await sleep(200);
    }
    return false;
  };
  return { send, evaluate, sleep, until, close: () => ws.close() };
}

/** The probe's reading of the page the browser shows, with `selectors` standing in for marks. */
const read = (browser, type, selectors) => browser.evaluate(`(${probe.toString()})(${JSON.stringify({ contract, type, selectors })})`);

async function readStory(browser, origin, entry, selectors) {
  await browser.send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-color-scheme", value: "light" }] });
  await browser.send("Emulation.setDeviceMetricsOverride", { width: entry.viewport, height: 900, deviceScaleFactor: 1, mobile: false });
  await browser.send("Page.navigate", { url: `${origin}/iframe.html?viewMode=story&id=${encodeURIComponent(entry.story)}&globals=locale:${entry.locale ?? "en"};appearance:light` });
  if (!(await browser.until(`!!document.querySelector(${JSON.stringify(contract.types[entry.type]?.root ?? "[data-page]")})`, 30000))) return { missing: "the story drew no page root in 30 seconds" };
  await browser.evaluate("document.fonts.ready.then(() => true)");
  await browser.sleep(800);
  await browser.evaluate("document.getAnimations().forEach((animation) => { try { animation.finish(); } catch { /* an endless animation cannot finish */ } })");
  return read(browser, entry.type, selectors);
}

async function readFixture(browser, entry, reading) {
  const html = await buildDemo(entry.props, { fixture: entry.fixture ?? entry.type });
  await browser.send("Emulation.setDeviceMetricsOverride", { width: entry.viewport, height: 900, deviceScaleFactor: 1, mobile: false });
  await browser.send("Page.navigate", { url: "about:blank" });
  await browser.until("document.readyState === 'complete'", 5000);
  await browser.evaluate(`(() => { document.open(); document.write(${JSON.stringify(html)}); document.close(); return true; })()`);
  await browser.evaluate(`(() => { const root = document.querySelector("[data-page]"); root.style.width = ${reading.rootWidth} + "px"; root.style.minHeight = ${reading.frame?.window?.height ?? 0} + "px"; return true; })()`);
  await browser.evaluate("document.fonts.ready.then(() => true)");
  await browser.sleep(300);
  return read(browser, entry.type, {});
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  const file = option("--file");
  const origin = option("--origin");
  const selectorsAt = option("--selectors");
  if (!file || !origin || !selectorsAt) {
    console.error("usage: record-measure.mjs --file measure/<type>.json --origin <storybook origin> --selectors <module>[#<export>] [--only <name,...>] [--expect <regex>] [--record] [--cdp <ws url>]");
    process.exit(2);
  }
  const [modulePath, exportName = "default"] = selectorsAt.split("#");
  const exported = (await import(pathToFileURL(resolve(modulePath)).href))[exportName];
  if (!exported) throw new Error(`${modulePath} exports no ${exportName}`);
  const selectorsOf = (name, entry) => (typeof exported === "function" ? exported({ ...entry, name }) : exported);
  const path = join(here, file);
  const data = JSON.parse(readFileSync(path, "utf8"));
  const only = option("--only")?.split(",");
  const unknown = (only ?? []).filter((name) => !data.pages[name]);
  if (unknown.length) throw new Error(`${file} records no page ${unknown.join(", ")}`);
  const names = Object.keys(data.pages).filter((name) => !only || only.includes(name));
  const expect = option("--expect") ? new RegExp(option("--expect")) : undefined;
  const record = process.argv.includes("--record");

  const session = `site-record-${process.pid}`;
  const started = !option("--cdp");
  if (started) execFileSync("agent-browser", ["--session", session, "--hide-scrollbars", "false", "open", "about:blank"], { stdio: "ignore" });
  const cdp = option("--cdp") ?? execFileSync("agent-browser", ["--session", session, "get", "cdp-url"], { encoding: "utf8" }).trim();
  const browser = await connect(cdp);
  let failed = 0;
  let written = 0;
  try {
    for (const name of names) {
      const entry = data.pages[name];
      const reading = cut(await readStory(browser, origin, entry, selectorsOf(name, entry)), entry);
      if (reading.missing) {
        failed += 1;
        console.log(`✖ ${name}: not read (${reading.missing})`);
        continue;
      }
      const fixture = cut(await readFixture(browser, entry, reading), entry);
      const drift = compare(entry.signature, reading);
      const held = [...compare(reading, fixture), ...(entry.only ? [] : judge(fixture, entry.type).map((problem) => `contract: ${problem}`))];
      const unexpected = expect ? drift.filter((difference) => !expect.test(difference)) : [];
      const ok = held.length === 0 && unexpected.length === 0;
      if (!ok) failed += 1;
      console.log(`${ok ? "✔" : "✖"} ${name} (root ${reading.rootWidth}px, recorded ${entry.rootWidth}px): ${drift.length} from the record ${JSON.stringify(byRegion(drift))}, ${held.length} from the fixture${unexpected.length ? `, ${unexpected.length} unexpected` : ""}`);
      for (const difference of drift) console.log(`    record  ${unexpected.includes(difference) ? "✖ " : ""}${difference}`);
      for (const difference of held) console.log(`    fixture ${difference}`);
      if (record && ok && drift.length) {
        entry.rootWidth = reading.rootWidth;
        entry.signature = reading;
        written += 1;
      }
    }
  } finally {
    browser.close();
    if (started) execFileSync("agent-browser", ["--session", session, "close"], { stdio: "ignore" });
  }
  if (record && written) {
    data.measuredOn = new Date().toISOString().slice(0, 10);
    writeFileSync(path, `${JSON.stringify(data, null, 1)}\n`);
  }
  console.log(`${names.length} page(s) read, ${failed} not holding${record ? `, ${written} recorded in ${file}` : ""}`);
  process.exit(failed ? 1 : 0);
}
