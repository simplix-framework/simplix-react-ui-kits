#!/usr/bin/env node
// Refuses the em dash (U+2014) in any text the kit can put in front of a reader.
//   node scripts/check-em-dash.mjs [root...]   default root: packages
//   node scripts/check-em-dash.mjs --test      proves the check on its own hit and miss cases
//
// The products drawing with this kit write the character on no surface: not in a cell, a label,
// a placeholder or a console message. What is read is the text a file can draw: a script's string
// and template literals and its JSX text, and a style sheet's `content` values. Comments are read
// in the source and are left to the people editing it; tests are left out, because a test that
// refuses the character has to spell it. A Handlebars template (`.hbs`) is read whole, comments
// included: everything in it is written into a generated file, where the comment is source a
// product ships.
import { mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const ts = require("typescript");

const SKIPPED_DIRECTORIES = new Set(["node_modules", "dist", ".turbo", ".git"]);
const EM_DASH = "\u2014";

/**
 * The character as written, or spelled as an escape in a script (`\u2014`), a style sheet
 * (`\2014`) or JSX text and markup (`&mdash;`, `&#8212;`, `&#x2014;`).
 */
export function holdsEmDash(text) {
  return text.includes(EM_DASH) || /\\u2014|\\2014|&mdash;|&#8212;|&#x2014;/i.test(text);
}

function isScanned(name) {
  if (/\.test\.[cm]?[jt]sx?$/.test(name) || name.endsWith(".d.ts")) return false;
  return /\.(?:[cm]?[jt]sx?|css|hbs)$/.test(name);
}

function listSources(directory, found) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (SKIPPED_DIRECTORIES.has(entry.name)) continue;
    const path = join(directory, entry.name);
    if (entry.isDirectory()) listSources(path, found);
    else if (isScanned(entry.name)) found.push(path);
  }
  return found;
}

function scriptKind(file) {
  if (file.endsWith(".tsx")) return ts.ScriptKind.TSX;
  if (file.endsWith(".jsx")) return ts.ScriptKind.JSX;
  if (/\.[cm]?js$/.test(file)) return ts.ScriptKind.JS;
  return ts.ScriptKind.TS;
}

/** The drawable text of one file, each piece with the line it starts on. */
export function drawnText(file, text) {
  if (file.endsWith(".hbs")) {
    return text.split("\n").map((line, index) => ({ line: index + 1, text: line }));
  }
  if (file.endsWith(".css")) {
    const withoutComments = text.replace(/\/\*[\s\S]*?\*\//g, (comment) => comment.replace(/[^\n]/g, " "));
    return [...withoutComments.matchAll(/content:\s*([^;}]+)/g)].map((match) => ({
      line: withoutComments.slice(0, match.index).split("\n").length,
      text: match[1].trim(),
    }));
  }
  const source = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, scriptKind(file));
  const found = [];
  const visit = (node) => {
    if (ts.isStringLiteralLike(node) || ts.isTemplateLiteralToken(node) || ts.isJsxText(node)) {
      found.push({ line: source.getLineAndCharacterOfPosition(node.getStart(source)).line + 1, text: node.getText(source) });
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
  return found;
}

/** Every piece of drawable text under the roots that holds the character. */
export function findEmDashes(roots) {
  const hits = [];
  for (const root of roots) {
    for (const file of listSources(root, [])) {
      for (const piece of drawnText(file, readFileSync(file, "utf-8"))) {
        if (holdsEmDash(piece.text)) hits.push({ file, line: piece.line, text: piece.text });
      }
    }
  }
  return hits;
}

function selfTest() {
  const root = mkdtempSync(join(tmpdir(), "check-em-dash-"));
  const write = (path, text) => {
    mkdirSync(join(root, path, ".."), { recursive: true });
    writeFileSync(join(root, path), text);
  };
  try {
    write("a/src/cell.tsx", `// a ${EM_DASH} b\nexport const Cell = () => <span>c ${EM_DASH} d</span>;\n`);
    write("a/src/absent.ts", `export const ABSENT = "${EM_DASH}";\n`);
    write("a/src/message.ts", "export const m = `e ${1} \\u2014 f`;\n");
    write("a/src/app.css", `/* g ${EM_DASH} h */\ntd:empty::after { content: '\\2014'; }\n`);
    write("a/src/clean.tsx", `/** i ${EM_DASH} j */\nexport const Clean = () => <span>-</span>;\n`);
    write("a/src/clean.css", `/* k ${EM_DASH} l */\ntd:empty::after { content: '-'; }\n`);
    write("a/src/cell.test.tsx", `expect(text).not.toContain("${EM_DASH}");\n`);
    write("a/node_modules/dep/index.js", `export const x = "${EM_DASH}";\n`);
    // A template is read whole: the character in drawn output, an escape inside a template
    // comment and an entity in JSX text are all written into the generated file.
    write("a/templates/list.hbs", `export const List = () => (\n  <span>{{label}} ${EM_DASH} {{count}}</span>\n);\n`);
    write("a/templates/detail.hbs", "{{!-- the row \\u2014 its value --}}\nexport const Detail = () => null;\n");
    write("a/templates/empty.hbs", "export const Empty = () => <td>&mdash;</td>;\n");
    write("a/templates/clean.hbs", "{{!-- the row - its value --}}\nexport const Clean = () => <span>{{label}} - {{count}}</span>;\n");
    // The same template text in a test's comment is left alone, as every test is.
    write("a/templates/list.test.ts", `// <span>{{label}} ${EM_DASH} {{count}}</span>\nexport {};\n`);
    const hits = findEmDashes([root]).map((hit) => `${relative(root, hit.file)}:${hit.line}`).sort();
    const expected = [
      "a/src/absent.ts:1",
      "a/src/app.css:2",
      "a/src/cell.tsx:2",
      "a/src/message.ts:1",
      "a/templates/detail.hbs:1",
      "a/templates/empty.hbs:1",
      "a/templates/list.hbs:2",
    ];
    if (JSON.stringify(hits) !== JSON.stringify(expected)) {
      console.error(`check-em-dash self-test failed: expected ${expected.join(", ")}, found ${hits.join(", ") || "none"}`);
      process.exit(1);
    }
    console.log(`check-em-dash self-test: ${expected.length} hits found, comments, tests and dependencies left alone`);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  if (args.includes("--test")) {
    selfTest();
  } else {
    const roots = args.length > 0 ? args : [fileURLToPath(new URL("../packages", import.meta.url))];
    const hits = findEmDashes(roots);
    for (const hit of hits) console.error(`${relative(process.cwd(), hit.file)}:${hit.line}: em dash in drawn text: ${hit.text.slice(0, 100)}`);
    if (hits.length > 0) {
      console.error(`check-em-dash: ${hits.length} piece(s) of drawn text hold U+2014; write a hyphen-minus, a colon or a comma instead`);
      process.exit(1);
    }
    console.log("check-em-dash: no em dash in drawn text");
  }
}
