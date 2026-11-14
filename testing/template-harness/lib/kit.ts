import { readFileSync } from "node:fs";
import { resolve } from "node:path";

/**
 * The design kit a kit suite runs against. Every design kit of an area runs the area's suite on
 * itself (`KIT_DIR` is its package directory), so a template is held to the same rule in every
 * design.
 */
const dir = process.env.KIT_DIR;
if (!dir) throw new Error("KIT_DIR names the design kit this suite runs against (run it through the kit's `test:kit` script)");

/** The design kit's package directory. */
export const KIT_DIR = resolve(dir);

/** The design kit's package name, as a generated screen imports it. */
export const KIT_NAME = (JSON.parse(readFileSync(resolve(KIT_DIR, "package.json"), "utf8")) as { name: string }).name;
