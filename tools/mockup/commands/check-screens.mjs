#!/usr/bin/env node
// Every screen is drawn with the UI kit named in mockup.config.json (`uiKit`). A screen file may
// import only that kit, React, Storybook types, its own fixtures and locales, and the mockup
// settings hook; it may not lay itself out with className or style. Anything else needs a
// `// ui-kit-exception: <reason>` line directly above it and is counted, because a screen type the
// kit lacks belongs in the kit, not in the screen. A button the screen declares (a verb, a row
// action, a page action) has an onClick or the reason it cannot be pressed (`disabled`): a mockup
// whose buttons do nothing shows a shape and hides what pressing it does. Only an object handed
// where a button is expected is judged: the value of an action key (`actions`, `verbs`, `action`,
// and the keys mockup.config.json `buttonKeys` adds), alone or in an array. A type literal and a
// value object elsewhere (a badge's `{ label: "" }`) are not buttons.
//   check-screens [--root <mockup root>]
import { existsSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { listFiles, parseArgs } from "../lib/fs-util.mjs";
import { PACKAGE_ROOT } from "../lib/package-root.mjs";

// The settings hook is this package's own `settings` entry, under whatever name it is published.
const SETTINGS = `${JSON.parse(readFileSync(join(PACKAGE_ROOT, "package.json"), "utf8")).name}/settings`;

const args = parseArgs(process.argv.slice(2));
const root = resolve(args.root ?? process.cwd());
const configPath = join(root, "mockup.config.json");
if (!existsSync(configPath)) {
  console.error(`no mockup.config.json in ${root}`);
  process.exit(2);
}
const config = JSON.parse(readFileSync(configPath, "utf8"));
if (!config.uiKit) {
  console.error(`${configPath}: "uiKit" names no UI kit package; every screen is drawn with one`);
  process.exit(2);
}
const allowed = [
  (spec) => spec === config.uiKit || spec.startsWith(`${config.uiKit}/`),
  (spec) => spec === "react",
  (spec) => spec.startsWith("@storybook/"),
  (spec) => /^(\.\.\/)+fixtures\//.test(spec) || spec.startsWith("./fixtures/"),
  (spec) => /^(\.\.\/)+locales\//.test(spec),
  (spec) => spec === SETTINGS,
  ...(config.screenImports ?? []).map((prefix) => (spec) => spec === prefix || spec.startsWith(`${prefix}/`)),
];
const EXCEPTION = /\/\/\s*ui-kit-exception:\s*\S/;
// An object literal naming a button: a `label`, and none of the fields a badge, an option, a tab,
// a column, a field or a filter carries instead.
const OBJECT = /\{[^{}]*\}/g;
const isButton = (text) => /\blabel\s*:/.test(text) && !/\b(tone|value|key|field|header|kind\s*:\s*"(text|email|textarea|number|select|multi|date|switch|choice)")\s*:?/.test(text);
const wired = (text) => /\b(onClick|onAction|disabled|href)\s*[:=]/.test(text);
// A type literal names types, not values: `{ readonly label: string; dialog?: string }`.
const isTypeLiteral = (text) => /\breadonly\s|\w\?\s*:|:\s*(string|number|boolean|unknown|ReactNode)\b\s*[;,}]/.test(text);
// The keys whose value is a button or a list of buttons: the UI kit's own action props.
const BUTTON_KEYS = new Set(["action", "actions", "verbs", "rowActions", "buttons", "commands", "primaryAction", "secondaryActions", ...(config.buttonKeys ?? [])]);

/**
 * The key an object literal starting at `start` is the value of: `key: {`, `key={{`, or an item of
 * `key: [ ... ]` after any sibling objects. Undefined when the object is not a keyed value (a
 * function argument, a returned value, a spread).
 */
function ownerKey(text, start) {
  let i = start - 1;
  const skip = () => {
    while (i >= 0 && /[\s,]/.test(text[i])) i--;
  };
  skip();
  // Step back over sibling objects of the same array.
  while (i >= 0 && text[i] === "}") {
    for (let depth = 0; i >= 0; i--) {
      if (text[i] === "}") depth++;
      else if (text[i] === "{" && --depth === 0) {
        i--;
        break;
      }
    }
    skip();
  }
  if (text[i] === "[") {
    i--;
    skip();
  }
  if (text[i] === "{" && text[i - 1] === "=") i -= 2;
  else if (text[i] === ":" || text[i] === "=") i--;
  else return undefined;
  skip();
  const end = i + 1;
  while (i >= 0 && /[\w$]/.test(text[i])) i--;
  return text.slice(i + 1, end) || undefined;
}

const violations = [];
const exceptions = [];
const files = listFiles(join(root, "screens"), (rel, isDir) => isDir || /\.[jt]sx?$/.test(rel));
for (const rel of files) {
  const text = readFileSync(join(root, "screens", rel), "utf8");
  const lines = text.split("\n");
  let offset = 0;
  lines.forEach((line, i) => {
    const lineStart = offset;
    offset += line.length + 1;
    const where = `screens/${rel}:${i + 1}`;
    const excused = i > 0 && EXCEPTION.test(lines[i - 1]);
    const imported = line.match(/^\s*(?:import|export)\b[^"']*?from\s*["']([^"']+)["']|^\s*import\s*["']([^"']+)["']/);
    const spec = imported?.[1] ?? imported?.[2];
    if (spec && !allowed.some((ok) => ok(spec))) {
      (excused ? exceptions : violations).push(`${where}: imports ${spec}`);
    }
    for (const match of line.matchAll(OBJECT)) {
      const object = match[0];
      if (!isButton(object) || isTypeLiteral(object) || wired(object)) continue;
      if (!BUTTON_KEYS.has(ownerKey(text, lineStart + match.index) ?? "")) continue;
      (excused ? exceptions : violations).push(`${where}: a button that does nothing ${object}`);
    }
    // A page action written over several lines is read up to the end of its tag.
    const rest = /<PageAction\b/.test(line) ? lines.slice(i, i + 12).join(" ") : "";
    const tag = rest.slice(rest.indexOf("<PageAction"), rest.indexOf("/>") + 2 || undefined);
    if (tag && !wired(tag)) (excused ? exceptions : violations).push(`${where}: a page action that does nothing`);
    // A notice's verb is declared as `actionLabel` and wired by an `onAction` beside it.
    if (/\bactionLabel\s*:/.test(line) && !/\bonAction\s*:/.test(lines.slice(Math.max(0, i - 6), i + 7).join(" "))) {
      (excused ? exceptions : violations).push(`${where}: a notice action that does nothing`);
    }
    if (/\b(className|style)\s*=/.test(line)) {
      (excused ? exceptions : violations).push(`${where}: lays out with ${line.match(/\b(className|style)/)[1]}`);
    }
  });
}
console.log(`screens: ${files.length} files with ${config.uiKit}, ${violations.length} violations, ${exceptions.length} declared exceptions`);
for (const v of violations) console.log(`  ✖ ${v}`);
for (const e of exceptions) console.log(`  ⚠ exception ${e}`);
process.exitCode = violations.length > 0 ? 1 : 0;
