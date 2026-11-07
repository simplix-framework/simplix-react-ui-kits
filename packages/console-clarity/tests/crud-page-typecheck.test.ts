import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { render, typecheck, virtualRoot } from "./template-typecheck";

/**
 * The generated CRUD page is the screen's whole start: it compiles against the kit's own sources with
 * the empty blocks file the kit lays down beside it, and with a blocks file that states every key.
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
export declare function useProductList(params?: Readonly<Record<string, unknown>>): { readonly rows: readonly ProductRow[]; readonly filters: CrudListFilters; readonly requestParams: Readonly<Record<string, unknown>> };
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
export declare function useGetProductAggregates(params?: { keyword?: string; "status.in"?: string[] }): { data?: unknown; isLoading: boolean };
`;

/** A blocks file stating every key the kit's `CrudPageBlocks` lists. */
const everyKeyBlocks = `
import type { CrudPageBlocks, PageBlocksContext } from "@simplix-react-ui-kits/console-clarity/page";
import type { ProductDetailProps, ProductListProps, ProductRow, useProductList } from "../../widgets/product";

export function usePageBlocks(page: PageBlocksContext): CrudPageBlocks<ProductRow, ProductListProps, ProductDetailProps, ReturnType<typeof useProductList>> {
  return {
    spec: { description: "Own" },
    listParams: { "status.in": ["ACTIVE"] },
    listProps: () => ({ activeRowId: "x" }),
    rowActions: (nav) => [{ type: "view", label: "Open", onClick: (row) => nav.showDetail(row.productId) }],
    deleteDisabled: (row) => (row.name ? false : "unnamed"),
    editDisabled: () => undefined,
    detailProps: () => ({ onDeleted: () => page.onNavigate({}) }),
    detailWidth: "regular",
    headerActions: (list) => (list.rows.length > 0 ? "export" : null),
    notices: (list) => [{ key: "n", kind: "warning", title: "T", when: list.rows.length > 0 }],
    dialogs: null,
  };
}
`;

function check(pageSource = render("crud-page.hbs", context), blocksSource = render("page.blocks.hbs", context)): string[] {
  const page = join(pageDir, "crud-page.tsx");
  return typecheck(
    {
      [page]: pageSource,
      [join(pageDir, "page.blocks.tsx")]: blocksSource,
      [join(widgetsDir, "index.ts")]: widgetsStub,
      [join(virtualRoot, "domain-product.ts")]: domainStub,
    },
    [page],
  );
}

describe("the generated CRUD page as a whole screen", () => {
  it("type-checks with the empty blocks file the kit lays down, reading its description from the screen catalog", () => {
    const page = render("crud-page.hbs", context);
    expect(page).toContain('import { usePageBlocks } from "./page.blocks";');
    expect(page).toContain('line !== "screen.product.description" ? line : undefined');
    expect(check(page)).toEqual([]);
  });

  it("reads every key of its blocks once, and type-checks with a blocks file that states them all", () => {
    const page = render("crud-page.hbs", context);
    for (const read of ["blocks.listParams", "blocks.headerActions?.(list)", "blocks.timeRange ?", "...blocks.spec", "blocks.notices?.(list)", "blocks.detailWidth", "blocks.editDisabled", "blocks.rowActions?.(nav)", "blocks.deleteDisabled", "blocks.listProps?.(nav)", "blocks.detailProps?.(id, nav)", "{blocks.dialogs}"]) {
      expect(page.split(read).length - 1, read).toBe(1);
    }
    expect(check(page, everyKeyBlocks)).toEqual([]);
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
    expect(check(page)).toEqual([]);
  });

  it("type-checks with the tones a context states for the status tiles, and refuses one that is not a status tone", () => {
    const withTone = (tone: string) =>
      render("crud-page.hbs", {
        ...context,
        figureTiles: {
          status: { hook: "useGetProductStatusCounts", field: "status", enumName: "ProductStatus", options: ["ACTIVE", "RETIRED"], tones: { RETIRED: tone } },
        },
      });
    expect(check(withTone("danger"))).toEqual([]);
    expect(check(withTone("loud")).length).toBeGreaterThan(0);
  });
});
