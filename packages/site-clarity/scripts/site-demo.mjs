// The site kit's verification page: a page composed from the site parts, rendered on the server and
// drawn with the site stylesheet compiled the way an app's Tailwind compiles it, as one self-contained
// HTML file. A rendered check opens it where no Storybook and no app exists; `--probe` opens it in
// ego-browser itself and prints the page's region signature and the contract's verdict.
//   node scripts/site-demo.mjs --out <file.html> [--signed-in] [--dark-bar]
//   node scripts/site-demo.mjs --probe [--signed-in] [--dark-bar] [--width <px>] [--json <file>]
//   node scripts/site-demo.mjs --measure    every page measure.json records, held to its recorded look
//   node scripts/site-demo.mjs --selftest   the same, plus each page with a planted card radius that must be found
// The fixture (`tests/fixtures/pricing-page.tsx`) and the theme values (`tests/fixtures/theme.css`)
// stand in for a product's page and token file. esbuild and @tailwindcss/node are found the way the
// framework's design scripts find them: through this package's bundler, then through @simplix-react/ui.
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { byRegion, compare, contract, judge, probe } from "./site-regions-rendered.mjs";

const here = dirname(dirname(fileURLToPath(import.meta.url)));
const option = (name) => {
  const at = process.argv.indexOf(name);
  return at >= 0 ? process.argv[at + 1] : undefined;
};

/** Resolves `name` from `dir`, directly or through a bundler `dir` depends on. */
const resolveFrom = (dir, name) => {
  const req = createRequire(join(dir, "package.json"));
  for (const via of [null, "tsup", "vite", "@tailwindcss/vite", "@tailwindcss/postcss"]) {
    try {
      return (via ? createRequire(req.resolve(via)) : req).resolve(name);
    } catch {
      // not resolvable this way; the next one is tried
    }
  }
  return undefined;
};
// The framework package as installed beside this one; its exports name no package.json, so it is
// found on disk the way Node looks a package up, nearest node_modules first.
const framework = (() => {
  for (let dir = here; dir !== dirname(dir); dir = dirname(dir)) {
    const candidate = join(dir, "node_modules/@simplix-react/ui");
    if (existsSync(join(candidate, "package.json"))) return realpathSync(candidate);
  }
  return here;
})();
const find = (name) => {
  const found = resolveFrom(here, name) ?? resolveFrom(framework, name);
  if (!found) throw new Error(`site-demo needs ${name}, resolvable from this package's bundler or from @simplix-react/ui`);
  return found;
};

/** The fixture page's server renderer, bundled once per process. */
let renderer;
const loadRenderer = async () => {
  const esbuild = createRequire(import.meta.url)(find("esbuild"));
  const entry = `import { createElement } from "react";\nimport { renderToStaticMarkup } from "react-dom/server";\nimport { PricingFixture } from ${JSON.stringify(join(here, "tests/fixtures/pricing-page.tsx"))};\nexport const render = (props) => renderToStaticMarkup(createElement(PricingFixture, props));\n`;
  const { outputFiles } = await esbuild.build({
    stdin: { contents: entry, resolveDir: here, sourcefile: "site-demo-entry.tsx", loader: "tsx" },
    bundle: true,
    format: "esm",
    platform: "node",
    write: false,
    logLevel: "error",
    jsx: "automatic",
    conditions: ["source"],
    loader: { ".css": "empty" },
    external: ["react", "react-dom", "react/*", "react-dom/*"],
  });
  // Written beside this package's node_modules so the bundle resolves this package's React.
  const file = join(here, `node_modules/.cache/site-demo-${process.pid}.mjs`);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, outputFiles[0].text);
  try {
    return (await import(pathToFileURL(file).href)).render;
  } finally {
    rmSync(file);
  }
};

/** The fixture page's markup, rendered on the server. */
async function renderMarkup(props) {
  renderer ??= loadRenderer();
  return (await renderer)(props);
}

/** The site stylesheet compiled with Tailwind, as an app's build compiles `styles/app.css`. */
let stylesheet;
function compileStylesheet() {
  stylesheet ??= compileOnce();
  return stylesheet;
}
async function compileOnce() {
  const { compile } = await import(pathToFileURL(find("@tailwindcss/node")).href);
  const source = `@import "tailwindcss";\n@import ${JSON.stringify(join(here, "src/styles/app.css"))};\n`;
  const compiler = await compile(source, { base: here, onDependency: () => {} });
  return compiler.build([]);
}

/** The verification page as one HTML document. */
export async function buildDemo(props = {}, { planted = "" } = {}) {
  const [markup, css] = await Promise.all([renderMarkup(props), compileStylesheet()]);
  const theme = readFileSync(join(here, "tests/fixtures/theme.css"), "utf8") + planted;
  return `<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<title>Site kit verification page</title>\n<style>\n${css}\n</style>\n<style>\n${theme}\n</style>\n</head>\n<body>\n${markup}\n</body>\n</html>\n`;
}

/**
 * Opens each page in one ego-browser task space and returns the probe's signature of each. A run
 * names the viewport width and, where given, the page root's width, which a reference measured
 * inside a frame (a phone mock-up) dictates.
 */
export function probeInBrowser(runs) {
  const script = `
const task = await taskSpace("site-demo-" + ${process.pid});
const page = task.page("p1");
const probeFn = (${probe.toString()});
const runs = ${JSON.stringify(runs)};
const readings = [];
for (const run of runs) {
  await page.cdp("Emulation.setDeviceMetricsOverride", { width: run.viewport, height: 900, deviceScaleFactor: 1, mobile: run.viewport < 600 });
  await page.goto("about:blank");
  await page.evaluate((html) => { document.open(); document.write(html); document.close(); }, run.html);
  if (run.rootWidth) await page.evaluate((width) => { document.querySelector("[data-page]").style.width = width + "px"; }, run.rootWidth);
  await page.waitForTimeout(300);
  readings.push(await page.evaluate(probeFn, ${JSON.stringify({ contract, type: "pricing" })}));
}
await task.finish({ keep: [] });
console.log("SITE_DEMO_PROBE " + JSON.stringify(readings));
`;
  const run = spawnSync("ego-browser", ["nodejs"], { input: script, encoding: "utf8", maxBuffer: 256 * 1024 * 1024 });
  const printed = `${run.stdout ?? ""}${run.stderr ?? ""}`;
  const at = printed.indexOf("SITE_DEMO_PROBE ");
  if (run.status !== 0 || at < 0) throw new Error(`the browser run did not finish (exit ${run.status})\n${printed.slice(0, 1200)}`);
  return JSON.parse(printed.slice(at + "SITE_DEMO_PROBE ".length).split("\n")[0]);
}

/** A signature cut down to one region, as a measure.json entry with `only` records it. */
const onlyRegion = (signature, region) => ({
  rootWidth: signature.rootWidth,
  order: signature.order.filter((key) => key === region),
  frame: {},
  regions: signature.regions[region] ? { [region]: signature.regions[region] } : {},
});

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  const selftest = process.argv.includes("--selftest");
  if (process.argv.includes("--measure") || selftest) {
    // Every page measure.json records, rendered with its props at its width and held to it. The
    // selftest adds the same pages again with one card radius planted, which must be found on every
    // region that draws a card and nowhere else.
    const { pages } = JSON.parse(readFileSync(join(here, "measure.json"), "utf8"));
    const entries = Object.entries(pages);
    const plant = ":root { --site-radius-xl: 10px; }";
    const runs = await Promise.all(entries.map(async ([, page]) => ({ html: await buildDemo(page.props), viewport: page.viewport, rootWidth: page.rootWidth })));
    const planted = selftest ? await Promise.all(entries.map(async ([, page]) => ({ html: await buildDemo(page.props, { planted: plant }), viewport: page.viewport, rootWidth: page.rootWidth }))) : [];
    const readings = probeInBrowser([...runs, ...planted]);
    const held = (reading, page) => {
      const cut = page.only ? onlyRegion(reading, page.only) : reading;
      return { verdict: page.only ? [] : judge(cut, page.type), differences: compare(page.signature, cut) };
    };
    let failed = 0;
    entries.forEach(([name, page], index) => {
      const { verdict, differences } = held(readings[index], page);
      failed += verdict.length + differences.length;
      if (!selftest || verdict.length + differences.length) {
        console.log(`${differences.length + verdict.length === 0 ? "✔" : "✖"} ${name} (root ${readings[index].rootWidth}px): ${differences.length} difference(s) ${JSON.stringify(byRegion(differences))}${verdict.length ? `, contract: ${verdict.join(" | ")}` : ""}`);
        for (const difference of differences) console.log(`    ${difference}`);
      }
    });
    if (selftest) {
      const carded = new Set(["plans", "offers", "priceTable"]);
      const misses = [];
      entries.forEach(([name, page], index) => {
        const { differences } = held(readings[entries.length + index], page);
        const regions = Object.keys(byRegion(differences));
        const radiusOnly = differences.every((difference) => difference.endsWith(" radius: reference 12px | build 10px"));
        const expected = page.only ? [] : [...carded];
        if (!radiusOnly || JSON.stringify(regions.sort()) !== JSON.stringify(expected.sort())) misses.push(`${name}: planted radius reported in [${regions.join(", ")}], expected [${expected.join(", ")}]${radiusOnly ? "" : "; other differences too"}`);
      });
      failed += misses.length;
      console.log(misses.length || failed ? `site-demo selftest FAILED\n  ${misses.join("\n  ")}` : `site-demo selftest: ${entries.length} recorded pages hold and the planted card radius is found on each card region and nowhere else`);
    }
    process.exit(failed ? 1 : 0);
  }
  const html = await buildDemo({ signedIn: process.argv.includes("--signed-in"), barTone: process.argv.includes("--dark-bar") ? "dark" : "light" });
  const out = option("--out");
  if (out) {
    writeFileSync(resolve(out), html);
    console.log(`wrote ${resolve(out)} (${Math.round(html.length / 1024)} KB)`);
  }
  if (process.argv.includes("--probe")) {
    const width = Number(option("--width") ?? 1440);
    const [signature] = probeInBrowser([{ html, viewport: width }]);
    const json = option("--json");
    if (json) writeFileSync(resolve(json), JSON.stringify(signature, null, 1));
    const verdict = judge(signature, "pricing");
    console.log(`regions at ${width}: ${signature.order?.join(" > ") ?? signature.missing}`);
    console.log(verdict.length ? `contract: ${verdict.length} problem(s)\n  ${verdict.join("\n  ")}` : "contract: holds");
    process.exit(verdict.length ? 1 : 0);
  }
  if (!out) console.log(html);
}
