import { createRequire } from "node:module";
import { realpathSync } from "node:fs";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";

// `probe` (scripts/regions-rendered.mjs) counts the rows a page's list draws, and `compare` requires the
// row action strip over them. A table that is not the list (a tab's free content, a panel) is not a list
// row: counting it asked a screen with no list for an action strip it cannot have. The probe runs here
// against markup in the framework checkout's `jsdom`, which this package does not install.

// @ts-expect-error the script is plain JavaScript that a product's runner imports
import { compare, probe, regionsOf } from "../../scripts/regions-rendered.mjs";

const root = join(__dirname, "../..");
const uiDir = realpathSync(join(root, "../../node_modules/@simplix-react/ui"));
const { JSDOM } = createRequire(join(uiDir, "package.json"))("jsdom") as { JSDOM: new (html: string) => { window: Window & typeof globalThis } };

/** What `probe` reads from the page: the document and its computed styles are globals in a driver's evaluate. */
function rowsOf(html: string, type: string): number {
  const { window } = new JSDOM(`<body>${html}</body>`);
  Object.assign(globalThis, { document: window.document, getComputedStyle: window.getComputedStyle.bind(window) });
  return probe(regionsOf(type), "main").rows;
}

afterEach(() => {
  Reflect.deleteProperty(globalThis, "document");
  Reflect.deleteProperty(globalThis, "getComputedStyle");
});

const table = (rows: number) => `<table><tbody>${"<tr><td>x</td></tr>".repeat(rows)}</tbody></table>`;
const list = (inner: string) => `<div data-slot="console-record-list">${inner}</div>`;

describe("the rows the probe counts", () => {
  it("are the rows of the list's table", () => {
    expect(rowsOf(`<main>${list(table(3))}</main>`, "list-detail")).toBe(3);
  });

  it("are the cards of the list drawn as cards", () => {
    expect(rowsOf(`<main>${list('<div data-slot="crud-card"></div><div data-slot="crud-card"></div>')}</main>`, "list-detail")).toBe(2);
  });

  it("are none on a screen whose default tab is free content with a table and no list", () => {
    const html = `<main><div data-slot="console-page-tab-panel">${table(4)}<div data-slot="crud-card"></div></div></main>`;
    expect(rowsOf(html, "list-detail")).toBe(0);
  });

  it("leave a table beside the list out", () => {
    expect(rowsOf(`<main>${table(5)}${list(table(2))}</main>`, "list-detail")).toBe(2);
  });
});

describe("the action strip a list screen requires", () => {
  it("is not asked of a screen that draws a table and no list", () => {
    const html = `<main><div data-slot="console-page-tab-panel">${table(4)}</div></main>`;
    const { window } = new JSDOM(`<body>${html}</body>`);
    Object.assign(globalThis, { document: window.document, getComputedStyle: window.getComputedStyle.bind(window) });
    const signature = probe(regionsOf("list-detail"), "main");
    expect(compare(signature, "list-detail").filter((problem: string) => problem.startsWith("rowActions"))).toEqual([]);
  });

  it("is still asked of a list with rows and no strip", () => {
    const { window } = new JSDOM(`<body><main>${list(table(2))}</main></body>`);
    Object.assign(globalThis, { document: window.document, getComputedStyle: window.getComputedStyle.bind(window) });
    const signature = probe(regionsOf("list-detail"), "main");
    expect(compare(signature, "list-detail").some((problem: string) => problem.startsWith("rowActions: required"))).toBe(true);
  });
});
