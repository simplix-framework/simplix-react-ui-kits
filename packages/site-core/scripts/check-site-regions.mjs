// Holds regions.json to the parts site-core declares. Every slot the contract names (a region's
// marks, its `within`, its named parts, its controls, the frame) is a slot some site-core `.style.ts`
// declares, so a renamed slot cannot leave the rendered check reading nothing. A ready type lists
// regions the contract defines and requires only regions it lists; a planned type names its reason.
//   node scripts/check-site-regions.mjs              check the contract
//   node scripts/check-site-regions.mjs --selftest   prove the check on a broken and a sound contract
import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(dirname(fileURLToPath(import.meta.url)));
const coreSource = resolve(here, "src");

/** The slot names every `.style.ts` under `dir` declares. */
export function declaredSlots(dir = coreSource) {
  const walk = (path) => (statSync(path).isDirectory() ? readdirSync(path).flatMap((name) => walk(join(path, name))) : [path]);
  const slots = new Set();
  for (const file of walk(dir).filter((path) => path.endsWith(".style.ts"))) {
    for (const match of readFileSync(file, "utf8").matchAll(/\bslot:\s*"([^"]+)"/g)) slots.add(match[1]);
  }
  return slots;
}

/** The slot a contract mark names: the part before any attribute or pseudo-class qualifier. */
export const slotOfMark = (mark) => mark.split(/[[:]/)[0];

/** The ways `contract` breaks its own rules or names a slot `slots` lacks, as strings; empty when sound. */
export function problemsOf(contract, slots) {
  const problems = [];
  const known = (where, mark) => {
    const slot = slotOfMark(mark);
    if (!slots.has(slot)) problems.push(`${where}: names slot "${slot}", which no site-core declaration draws`);
  };
  for (const [name, slot] of Object.entries(contract.frame ?? {})) if (!name.startsWith("$")) known(`frame.${name}`, slot);
  for (const [key, region] of Object.entries(contract.regions ?? {})) {
    if (!region.part || !region.slot) problems.push(`regions.${key}: needs the part that fills it and the slot that feeds it`);
    if (!Array.isArray(region.marks) || region.marks.length === 0) problems.push(`regions.${key}: has no marks, so a rendered page cannot place it`);
    for (const mark of region.marks ?? []) known(`regions.${key}.marks`, mark);
    if (region.within) known(`regions.${key}.within`, region.within);
    for (const [part, mark] of Object.entries(region.parts ?? {})) {
      known(`regions.${key}.parts.${part}`, mark);
      // `:enabled` matches only a form control, so a part named by it never finds a link; an action
      // may be either, and only a button can be disabled.
      if (/:enabled\b/.test(mark)) problems.push(`regions.${key}.parts.${part}: "${mark}" never matches a link; an enabled action is "${slotOfMark(mark)}:not(:disabled)"`);
    }
    for (const control of region.controls ?? []) if (!["link", "button", "*"].includes(control)) known(`regions.${key}.controls`, control);
    if (!Array.isArray(region.widths)) problems.push(`regions.${key}: lists no widths, so a compare cannot tell a layout width from a text width`);
    for (const part of region.widths ?? []) if (part !== "root" && !(part in (region.parts ?? {}))) problems.push(`regions.${key}.widths: names "${part}", which is neither root nor one of its parts`);
    if (region.carded !== undefined && typeof region.carded !== "boolean") problems.push(`regions.${key}.carded: is true or false`);
  }
  for (const [type, entry] of Object.entries(contract.types ?? {})) {
    if (entry.status === "ready") {
      if (!entry.root) problems.push(`types.${type}: a ready type names the root a rendered check reads inside`);
      if (!Array.isArray(entry.regions) || entry.regions.length === 0) problems.push(`types.${type}: a ready type lists its regions`);
      for (const region of entry.regions ?? []) if (!contract.regions?.[region]) problems.push(`types.${type}: lists region "${region}", which the contract does not define`);
      if (new Set(entry.regions ?? []).size !== (entry.regions ?? []).length) problems.push(`types.${type}: lists a region twice`);
      for (const region of entry.required ?? []) if (!(entry.regions ?? []).includes(region)) problems.push(`types.${type}: requires "${region}", which it does not list`);
    } else if (entry.status === "planned") {
      if (typeof entry.reason !== "string" || entry.reason.trim() === "") problems.push(`types.${type}: a planned type says why it is not ready`);
      if (!Array.isArray(entry.plannedRegions) || entry.plannedRegions.length === 0) problems.push(`types.${type}: a planned type names the regions it will draw`);
    } else {
      problems.push(`types.${type}: status is "${entry.status}", not ready or planned`);
    }
  }
  return problems;
}

if (process.argv.includes("--selftest")) {
  const slots = new Set(["site-bar", "site-bar-link", "site-action", "site-page", "site-window", "site-main"]);
  const sound = {
    frame: { window: "site-window", main: "site-main", column: "site-page" },
    regions: { bar: { part: "SiteBar", slot: "SiteWindow.bar", marks: ["site-bar"], controls: ["site-action", "link"], parts: { link: "site-bar-link[data-current=false]", action: "site-action:not(:disabled)", disabled: "site-action:disabled" }, widths: ["root", "link"], carded: false } },
    types: { pricing: { status: "ready", root: "[data-page]", regions: ["bar"], required: ["bar"] }, help: { status: "planned", reason: "next slice", plannedRegions: ["bar"] } },
  };
  const broken = {
    frame: { window: "site-window", main: "site-main", column: "site-column" },
    regions: {
      bar: { part: "SiteBar", slot: "SiteWindow.bar", marks: ["site-topbar"], controls: ["site-chip"], parts: { link: "site-bar-anchor[data-current=false]", action: "site-action:enabled" }, widths: ["root", "brand"], carded: "yes" },
      loose: { marks: [] },
    },
    types: {
      pricing: { status: "ready", regions: ["bar", "bar", "hero"], required: ["footer"] },
      help: { status: "planned" },
      odd: { status: "draft" },
    },
  };
  const miss = problemsOf(sound, slots);
  const hit = problemsOf(broken, slots);
  const expected = [
    /frame\.column: names slot "site-column"/,
    /regions\.bar\.marks: names slot "site-topbar"/,
    /regions\.bar\.controls: names slot "site-chip"/,
    /regions\.bar\.parts\.link: names slot "site-bar-anchor"/,
    /regions\.bar\.parts\.action: "site-action:enabled" never matches a link/,
    /regions\.loose: needs the part/,
    /regions\.loose: has no marks/,
    /regions\.loose: lists no widths/,
    /regions\.bar\.widths: names "brand"/,
    /regions\.bar\.carded: is true or false/,
    /types\.pricing: a ready type names the root/,
    /types\.pricing: lists region "hero"/,
    /types\.pricing: lists a region twice/,
    /types\.pricing: requires "footer"/,
    /types\.help: a planned type says why/,
    /types\.help: a planned type names the regions/,
    /types\.odd: status is "draft"/,
  ];
  const missing = expected.filter((pattern) => !hit.some((problem) => pattern.test(problem)));
  const real = problemsOf(JSON.parse(readFileSync(resolve(here, "regions.json"), "utf8")), declaredSlots());
  const ok = miss.length === 0 && missing.length === 0 && hit.length === expected.length && real.length === 0;
  console.log(ok ? `check-site-regions selftest: ${expected.length} broken cases caught, the sound contract and regions.json pass` : `check-site-regions selftest FAILED\nmiss: ${miss.join("\n")}\nnot caught: ${missing.join("\n")}\nhit: ${hit.join("\n")}\nregions.json: ${real.join("\n")}`);
  process.exit(ok ? 0 : 1);
} else if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  const contract = JSON.parse(readFileSync(resolve(here, "regions.json"), "utf8"));
  const slots = declaredSlots();
  const problems = problemsOf(contract, slots);
  const ready = Object.entries(contract.types).filter(([, t]) => t.status === "ready").map(([name]) => name);
  if (problems.length) {
    console.error(`regions.json: ${problems.length} problem${problems.length === 1 ? "" : "s"}\n  ${problems.join("\n  ")}`);
    process.exit(1);
  }
  console.log(`regions.json holds against ${slots.size} site-core slots (${Object.keys(contract.regions).length} regions; ready: ${ready.join(", ")}; planned: ${Object.keys(contract.types).length - ready.length})`);
}
