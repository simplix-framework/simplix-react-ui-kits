// Enforces the source half of regions.json: a value part draws no control, and every boolean prop of
// a slot interface is listed with the reason it changes content rather than look.
//   node scripts/check-regions.mjs            check the kit
//   node scripts/check-regions.mjs --selftest prove the rules on their hit and miss cases
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(dirname(fileURLToPath(import.meta.url)));

const CONTROL = /<Button\b(?![^>]*variant="link")|<button\b|role=["']button["']|<PopoverTrigger\b|<DropdownMenuTrigger\b/;

/** The controls a value part's source draws, as "line: text". */
export function controlsIn(source) {
  return source.split("\n").flatMap((line, i) => (CONTROL.test(line) && !line.trim().startsWith("//") && !line.trim().startsWith("*") ? [`${i + 1}: ${line.trim()}`] : []));
}

/** The boolean props of the named interface, as "Interface.prop". */
export function booleanProps(source, name) {
  const start = source.search(new RegExp(`export interface ${name}\\b[^{]*\\{`));
  if (start < 0) return null;
  let depth = 0;
  let body = "";
  for (let i = source.indexOf("{", start); i < source.length; i++) {
    const c = source[i];
    if (c === "{") depth++;
    if (c === "}") depth--;
    body += c;
    if (depth === 0) break;
  }
  // Only the interface's own members, at depth one: nested object types belong to their own prop.
  const own = [];
  let d = 0;
  for (const line of body.split("\n")) {
    const at = d;
    for (const c of line) { if (c === "{") d++; if (c === "}") d--; }
    const m = at === 1 && line.match(/^\s*(?:readonly\s+)?(\w+)\??:\s*boolean\b/);
    if (m) own.push(`${name}.${m[1]}`);
  }
  return own;
}

export function check(contract, read) {
  const problems = [];
  for (const file of contract.valueParts.files) {
    for (const hit of controlsIn(read(file))) problems.push(`${file}:${hit} - a value part draws no control; a row's verbs go in its action strip, copy and the whole text in the detail`);
  }
  const listed = contract.slotProps.flags;
  for (const [file, names] of Object.entries(contract.slotProps.interfaces)) {
    const source = read(file);
    for (const name of names) {
      const props = booleanProps(source, name);
      if (props === null) { problems.push(`${file}: interface ${name} named in regions.json is missing`); continue; }
      for (const prop of props) if (!listed[prop]) problems.push(`${file}: ${prop} is a boolean slot prop with no reason in regions.json; a prop that changes look per screen is removed`);
    }
  }
  return problems;
}

function selftest() {
  const contract = { valueParts: { files: ["v.tsx"] }, slotProps: { interfaces: { "t.ts": ["A"] }, flags: { "A.when": "exists for this reader" } } };
  const hit = { "v.tsx": `<span>{x}</span>\n<Button onClick={copy}>`, "t.ts": `export interface A {\n  readonly when?: boolean;\n  readonly labelled?: boolean;\n  readonly nested?: { readonly deep?: boolean };\n}` };
  const miss = { "v.tsx": `// draws no <Button here\n<span title={x}>{x}</span>\n<Button variant="link" size="link">{name}</Button>`, "t.ts": `export interface A {\n  readonly when?: boolean;\n  readonly nested?: { readonly deep?: boolean };\n}` };
  const h = check(contract, (f) => hit[f]);
  const m = check(contract, (f) => miss[f]);
  const ok = h.length === 2 && h.some((p) => p.includes("v.tsx:2")) && h.some((p) => p.includes("A.labelled")) && m.length === 0;
  console.log(ok ? "check-regions selftest: hit 2, miss 0" : `check-regions selftest FAILED\nhit: ${h.join("\n")}\nmiss: ${m.join("\n")}`);
  process.exit(ok ? 0 : 1);
}

if (process.argv.includes("--selftest")) selftest();
const contract = JSON.parse(readFileSync(resolve(here, "regions.json"), "utf8"));
const problems = check(contract, (f) => readFileSync(resolve(here, f), "utf8"));
for (const p of problems) console.log(`✖ ${p}`);
console.log(`check-regions: ${problems.length} problem(s)`);
process.exit(problems.length ? 1 : 0);
