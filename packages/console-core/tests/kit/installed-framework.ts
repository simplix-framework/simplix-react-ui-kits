import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

/** The kit's `packages` directory, found from this file rather than from the working directory. */
export const PACKAGES = fileURLToPath(new URL("../../../", import.meta.url));

/** The installed `@simplix-react/ui`, found by walking up from the kit to the nearest install. */
export function installedFramework(): string {
  for (let dir = PACKAGES; dir !== dirname(dir); dir = dirname(dir)) {
    const candidate = join(dir, "node_modules/@simplix-react/ui");
    if (existsSync(join(candidate, "package.json"))) return candidate;
  }
  throw new Error("@simplix-react/ui is not installed above the kit");
}
