import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { context, domainStub, pageDir, widgetsDir, widgetsStub } from "./crud-page-fixture";
import { render, typecheck, virtualRoot } from "./template-typecheck";
import { KIT_NAME } from "../../../../testing/template-harness/lib/kit";

/**
 * The generated TanStack route hands its page the router's `navigate`, so a change the page records
 * as a replace reaches the router as one. The route compiles against the generated page it opens: a
 * page that took no navigation options would refuse the route's two-argument handler.
 */

const routeDir = join(virtualRoot, "routes");
const route = join(routeDir, "products.tsx");
const pagesIndex = join(virtualRoot, "modules", "mymod", "src", "pages", "index.ts");
const routerStub = join(virtualRoot, "router-stub.ts");

/** The part of the router the generated route uses, typed as the router types it: `replace` is a boolean. */
const routerSource = `
import type { ComponentType } from "react";
import type { ConsoleSearch } from "${KIT_NAME}/page";

export declare function createFileRoute(path: string): (options: {
  readonly component: ComponentType;
  readonly validateSearch: (search: Record<string, unknown>) => ConsoleSearch;
}) => { useSearch(): ConsoleSearch };
export declare function useNavigate(): (options: { readonly to: string; readonly search?: ConsoleSearch; readonly replace?: boolean }) => Promise<void>;
`;

function check(pageSource: string): string[] {
  return typecheck(
    {
      [route]: render("route.tanstack.hbs", { ...context, modulePackage: "@test/mymod", routePath: "products" }),
      [pagesIndex]: 'export { ProductCrudPage } from "./product/crud-page";\n',
      [join(pageDir, "crud-page.tsx")]: pageSource,
      [join(pageDir, "page.blocks.tsx")]: render("page.blocks.hbs", context),
      [join(widgetsDir, "index.ts")]: widgetsStub,
      [join(virtualRoot, "domain-product.ts")]: domainStub,
      [routerStub]: routerSource,
    },
    [route],
    { "@tanstack/react-router": [routerStub], "@test/mymod/pages": [pagesIndex] },
  );
}

describe("the generated route against the generated page", () => {
  it("compiles: the page takes the navigation options the route passes on as replace", () => {
    expect(check(render("crud-page.hbs", context))).toEqual([]);
  });

  it("is refused by a page whose navigation takes no options, so a replace could not reach the router", () => {
    const page = render("crud-page.hbs", context).replace(
      "readonly onNavigate: (search: ConsoleSearch, options?: CrudNavigateOptions) => void;",
      "readonly onNavigate: (search: ConsoleSearch) => void;",
    );
    expect(page).not.toContain("options?: CrudNavigateOptions) => void;");
    const problems = check(page);
    expect(problems.length).toBeGreaterThan(0);
    expect(problems.join("\n")).toContain("products.tsx");
  });
});
