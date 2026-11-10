import { readFileSync } from "node:fs";
import { resolve } from "node:path";

/**
 * The design kit this suite runs against. Every console design kit runs the suite on itself
 * (`KIT_DIR` is its package directory), so a template, a contract or a core part is held to the
 * same rule in every design.
 */
const dir = process.env.KIT_DIR;
if (!dir) throw new Error("KIT_DIR names the console design kit this suite runs against (run it through the kit's `test:kit` script)");

/** The design kit's package directory. */
export const KIT_DIR = resolve(dir);

/** The design kit's package name, as a generated screen imports it. */
export const KIT_NAME = (JSON.parse(readFileSync(resolve(KIT_DIR, "package.json"), "utf8")) as { name: string }).name;
