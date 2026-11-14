import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { typecheck as typecheckKit, virtualRoot } from "../../../../testing/template-harness/lib/template-check";

export { render, virtualRoot } from "../../../../testing/template-harness/lib/template-check";

// The generated app declares these itself (the CLI's app and module package.json), so they resolve
// as the app resolves them, not from the design kit, which draws none of them.
const fromCore = createRequire(fileURLToPath(new URL("../../package.json", import.meta.url)));
const appDependencies = Object.fromEntries(["lucide-react"].map((name) => [name, [dirname(fromCore.resolve(`${name}/package.json`))]]));

/**
 * The compiler's messages for a console screen's `roots`, with `files` present in memory;
 * `domain-product.ts` under {@link virtualRoot} stands for the domain package. `extraPaths` adds
 * module mappings of the test's own (a module's `pages` entry, a stand-in for the router).
 */
export function typecheck(files: Readonly<Record<string, string>>, roots: readonly string[], extraPaths: Readonly<Record<string, readonly string[]>> = {}): string[] {
  return typecheckKit(files, roots, {
    "@test/domain-product": [join(virtualRoot, "domain-product.ts")],
    "@test/domain-member": [join(virtualRoot, "domain-member.ts")],
    "@test/member-widgets": [join(virtualRoot, "modules", "other", "src", "widgets", "index.ts")],
    ...appDependencies,
    ...extraPaths,
  });
}
