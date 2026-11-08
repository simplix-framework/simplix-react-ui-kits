import { createRequire } from "node:module";
import { realpathSync } from "node:fs";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";

// The opened record is probed under the surface it stands on (`record-detail` in regions.json): the
// drawer, the panel beside the list or the dialog. Its head (title, status, close) is the framework's
// detail header on every one of them, so the close control belongs to the head whichever surface the
// installation chose. The probe runs here against markup in the framework checkout's `jsdom`, which this
// package does not install.

// @ts-expect-error the script is plain JavaScript that a product's runner imports
import { compare, contract, probe, regionsOf } from "../scripts/regions-rendered.mjs";

const root = join(__dirname, "..");
const uiDir = realpathSync(join(root, "../../node_modules/@simplix-react/ui"));
const { JSDOM } = createRequire(join(uiDir, "package.json"))("jsdom") as { JSDOM: new (html: string) => { window: Window & typeof globalThis } };

interface Reading {
  readonly kinds: readonly string[];
  readonly perCard: number;
}

const ROOT = contract.types["record-detail"].root as string;

/** The record's content as the framework's detail draws it, inside any surface. */
const record = (extra = "") => `
  <div data-slot="stack" data-part="crud-detail-header" data-crud-slot="header">
    <div data-slot="stack"><div data-part="presentation-group"><button data-slot="button">Side panel</button></div></div>
    <button data-slot="button" aria-label="Close"></button>
  </div>
  <div data-slot="crud-detail-body">
    <div data-slot="tabs-list"><button data-slot="tabs-trigger" role="tab">Overview</button></div>
    ${extra}
  </div>
  <div data-slot="crud-detail-footer" data-crud-slot="footer"><button data-slot="button">Edit</button></div>`;

const surfaces: Record<string, string> = {
  panel: `<main></main><article data-slot="crud-list-detail-detail">${record()}</article>`,
  drawer: `<main></main><div data-part="crud-list-detail-drawer"><div data-slot="crud-list-detail-drawer-body">${record()}</div></div>`,
  dialog: `<main></main><div data-slot="dialog-content"><div>${record()}</div></div>`,
};

function signatureOf(html: string): Record<string, Reading> {
  const { window } = new JSDOM(`<body>${html}</body>`);
  Object.assign(globalThis, { document: window.document, getComputedStyle: window.getComputedStyle.bind(window) });
  return probe(regionsOf("record-detail"), ROOT);
}

afterEach(() => {
  Reflect.deleteProperty(globalThis, "document");
  Reflect.deleteProperty(globalThis, "getComputedStyle");
});

describe("the record's head under each surface", () => {
  for (const [surface, html] of Object.entries(surfaces)) {
    it(`claims the close control of the ${surface}, beside the view switch that is its own region`, () => {
      const signature = signatureOf(html);
      expect(signature.recordHead?.kinds).toEqual(["button"]);
      expect(signature.recordView?.kinds).toEqual(["button"]);
      expect(signature.unassigned).toBeUndefined();
    });

    it(`leaves a control that stands in no region of the ${surface} unassigned`, () => {
      const signature = signatureOf(html.replace('<div data-slot="stack" data-part="crud-detail-header"', '<button data-slot="button">Stray</button><div data-slot="stack" data-part="crud-detail-header"'));
      expect(signature.unassigned?.kinds).toEqual(["button"]);
      expect(compare(signature, "record-detail").some((problem: string) => problem.startsWith("unassigned: button"))).toBe(true);
    });
  }

  it("reads the same head on the panel as on the drawer", () => {
    expect(signatureOf(surfaces.panel).recordHead).toEqual(signatureOf(surfaces.drawer).recordHead);
  });
});
