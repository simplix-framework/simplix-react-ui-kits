import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

// The suite every console design kit runs on itself (`KIT_DIR`): the area's templates rendered with
// the CLI's template engine and type-checked against the kit. A check that reads no kit lives in
// `tests/core` and runs once, with the core's own tests. A run loads the compiler's program and is given room for it.
export default defineConfig({
  root: dirname(fileURLToPath(import.meta.url)),
  test: { include: ["**/*.test.ts"], testTimeout: 120_000 },
});
