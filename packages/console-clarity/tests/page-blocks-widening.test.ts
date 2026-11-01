import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { render, typecheck, virtualRoot } from "./template-typecheck";

/**
 * A generated CRUD page is rewritten on every run, while its `page.blocks.tsx` is the author's and
 * is written once. A key the kit's blocks contract gains later therefore reaches a blocks file
 * that never declared it, and the page that reads it must still type-check. These tests render the
 * real `crud-page.hbs` and `page.blocks.hbs` and check them with the compiler against the kit's own
 * sources, with blocks files written before each key existed.
 */

/** The context the CLI hands the page templates for an entity with every operation. */
const context = {
  entity: "product",
  EntityPascal: "Product",
  entityKebab: "product",
  entityPath: "/api/v1/product",
  packageName: "@test/domain-product",
  rowIdField: "productId",
  displayNameField: "name",
  displayNameFields: ["name"],
  nameContractFields: [{ name: "name", contractKind: "text" }],
  hookDelete: "useDeleteProduct",
  accessCreate: "createProductAccess",
  accessUpdate: "updateProductAccess",
  accessDelete: "deleteProductAccess",
  hasCreate: true,
  hasUpdate: true,
  hasDelete: true,
  hasForm: true,
};

const pageDir = join(virtualRoot, "modules", "mymod", "src", "pages", "product");
const widgetsDir = join(virtualRoot, "modules", "mymod", "src", "widgets", "product");

const widgetsStub = `
import type { ReactNode } from "react";
import type { CrudListFilters } from "@simplix-react/ui";
import type { RecordAction } from "@simplix-react-ui-kits/console-clarity/entity";

export interface ProductRow { readonly productId: string; readonly name?: string }
export interface ProductListProps {
  readonly list: ReturnType<typeof useProductList>;
  readonly activeRowId?: string;
  readonly onRowClick?: (row: ProductRow) => void;
  readonly actions?: readonly RecordAction<ProductRow>[];
}
export interface ProductDetailProps {
  readonly productId: string;
  readonly onClose?: () => void;
  readonly onEdit?: () => void;
  readonly onDelete?: (name: string) => void;
  readonly onDeleted?: () => void;
}
export interface ProductFormProps {
  readonly productId?: string;
  readonly onClose?: () => void;
  readonly onSuccess?: () => void;
  readonly onCancel?: () => void;
}
export declare function useProductList(params?: Readonly<Record<string, unknown>>): { readonly rows: readonly ProductRow[]; readonly filters: CrudListFilters };
export declare function ProductList(props: ProductListProps): ReactNode;
export declare function ProductDetail(props: ProductDetailProps): ReactNode;
export declare function ProductForm(props: ProductFormProps): ReactNode;
`;

const domainStub = `
import type { OrvalMutationLike } from "@simplix-react/ui";
import type { useAllowed } from "@simplix-react-ui-kits/console-clarity/entity";

type Rule = Parameters<typeof useAllowed>[0];
export declare function useDeleteProduct(): OrvalMutationLike;
export declare const createProductAccess: Rule;
export declare const updateProductAccess: Rule;
export declare const deleteProductAccess: Rule;
export declare function useGetProductStatusCounts(params: { field: string }): { data?: unknown; isLoading: boolean };
export declare function useGetProductAggregates(params?: Readonly<Record<string, unknown>>): { data?: unknown; isLoading: boolean };
`;

/** A blocks file written before the page read `editDisabled` and `deleteDisabled`. */
const blocksBeforeRowGates = `
import type { ConsoleSearch, CrudPageNavigation } from "@simplix-react-ui-kits/console-clarity/page";
import type { RecordAction } from "@simplix-react-ui-kits/console-clarity/entity";
import type { ProductRow } from "../../widgets/product";

export interface PageBlocks {
  readonly listParams?: Readonly<Record<string, unknown>>;
  readonly rowActions?: (nav: CrudPageNavigation) => readonly RecordAction<ProductRow>[];
}

export function usePageBlocks(_page: { readonly search: ConsoleSearch; readonly onNavigate: (search: ConsoleSearch) => void }): PageBlocks {
  return {};
}
`;

/** A blocks file that declares none of the optional keys the page reads. */
const blocksWithNoKeys = `
import type { ConsoleSearch } from "@simplix-react-ui-kits/console-clarity/page";

export interface PageBlocks {}

export function usePageBlocks(_page: { readonly search: ConsoleSearch; readonly onNavigate: (search: ConsoleSearch) => void }): PageBlocks {
  return {};
}
`;

function check(blocks: string, pageSource = render("crud-page.hbs", context)): string[] {
  const page = join(pageDir, "crud-page.tsx");
  return typecheck(
    {
      [page]: pageSource,
      [join(pageDir, "page.blocks.tsx")]: blocks,
      [join(widgetsDir, "index.ts")]: widgetsStub,
      [join(virtualRoot, "domain-product.ts")]: domainStub,
    },
    [page],
  );
}

describe("the generated CRUD page against a blocks file written before a key existed", () => {
  it("type-checks against a blocks file that has no editDisabled and no deleteDisabled", () => {
    expect(check(blocksBeforeRowGates)).toEqual([]);
  });

  it("type-checks against a blocks file that declares none of the optional keys", () => {
    expect(check(blocksWithNoKeys)).toEqual([]);
  });

  it("type-checks against the blocks stub the kit ships beside it", () => {
    expect(check(render("page.blocks.hbs", context))).toEqual([]);
  });

  it("is told apart from a page that reads the keys without widening them", () => {
    // The page as it was before the widening: the blocks hook's own type, with nothing added.
    const widened = render("crud-page.hbs", context);
    const unwidened = widened.replace(/const blocks: [^=]+= usePageBlocks/, "const blocks = usePageBlocks");
    expect(unwidened).not.toBe(widened);

    const messages = check(blocksBeforeRowGates, unwidened);
    expect(messages.some((line) => line.includes("editDisabled"))).toBe(true);
    expect(messages.some((line) => line.includes("deleteDisabled"))).toBe(true);
  });
});

/** A blocks file that draws a narrowing tile and raises a notice from the list the page hands it. */
const blocksWithTiles = `
import type { ConsoleSearch, CrudPageBlocks } from "@simplix-react-ui-kits/console-clarity/page";
import type { ProductDetailProps, ProductListProps, ProductRow, useProductList } from "../../widgets/product";

export type PageBlocks = CrudPageBlocks<ProductRow, ProductListProps, ProductDetailProps, ReturnType<typeof useProductList>>;

export function usePageBlocks(_page: { readonly search: ConsoleSearch; readonly onNavigate: (search: ConsoleSearch) => void }): PageBlocks {
  return {
    spec: { description: "", tiles: [{ key: "active", label: "Active", value: 3, counted: true, filter: { field: "status", value: "ACTIVE" } }] },
    notices: (list) => [{ key: "empty", kind: "info", title: "Nothing here", when: list.rows.length === 0 }],
  };
}
`;

describe("the generated CRUD page's figure tiles and notices", () => {
  it("hands the list to the blocks' notices, and the list's filters to the figure tiles", () => {
    const text = render("crud-page.hbs", context);
    expect(text).toContain("tileFilters={list.filters}");
    expect(text).not.toContain("cards=");
    expect(text).toContain("notices={blocks.notices?.(list)}");
  });

  it("keeps the entity's description unless the blocks state one", () => {
    expect(render("crud-page.hbs", context)).toContain("description: blocks.spec?.description ?? words.description");
  });

  it("type-checks against a blocks file that draws narrowing tiles and raises notices", () => {
    expect(check(blocksWithTiles)).toEqual([]);
  });

  it("names the description, cards and notices in the blocks stub", () => {
    const stub = render("page.blocks.hbs", context);
    expect(stub).toContain("`spec.description`");
    expect(stub).toContain("`spec.tiles`");
    expect(stub).not.toContain("`cards`");
    expect(stub).toContain("`notices`");
  });
});

describe("the generated CRUD page's default figure tiles", () => {
  it("type-checks with the counts and sums its entity's Meta names", () => {
    const page = render("crud-page.hbs", {
      ...context,
      figureTiles: {
        status: { hook: "useGetProductStatusCounts", field: "status", enumName: "ProductStatus", options: ["ACTIVE", "RETIRED"] },
        aggregates: { hook: "useGetProductAggregates", figures: [{ field: "productId", op: "count", kind: "number", isRowCount: true }, { field: "price", op: "sum", kind: "money", money: { currency: "KRW", scale: 0 }, isRowCount: false }] },
      },
    });
    expect(check(render("page.blocks.hbs", context), page)).toEqual([]);
  });
});
