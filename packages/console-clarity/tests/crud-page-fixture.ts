import { join } from "node:path";

import { virtualRoot } from "./template-typecheck";

/**
 * What a generated CRUD page compiles against in the kit's tests: the context the CLI hands its
 * templates for an entity with every operation, and the stand-ins for the entity's widgets and its
 * domain package that the page imports.
 */

/** The context the CLI hands the page templates for an entity with every operation. */
export const context = {
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

export const pageDir = join(virtualRoot, "modules", "mymod", "src", "pages", "product");
export const widgetsDir = join(virtualRoot, "modules", "mymod", "src", "widgets", "product");

export const widgetsStub = `
import type { ReactNode } from "react";
import type { CrudListFilters } from "@simplix-react/ui";
import type { ListAddress, RecordAction } from "@simplix-react-ui-kits/console-clarity/entity";

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
export declare function useProductList(params?: Readonly<Record<string, unknown>>, address?: ListAddress, scope?: string): { readonly rows: readonly ProductRow[]; readonly filters: CrudListFilters; readonly requestParams: Readonly<Record<string, unknown>> };
export declare function ProductList(props: ProductListProps): ReactNode;
export declare function ProductDetail(props: ProductDetailProps): ReactNode;
export declare function ProductForm(props: ProductFormProps): ReactNode;
`;

export const domainStub = `
import type { OrvalMutationLike } from "@simplix-react/ui";
import type { useAllowed } from "@simplix-react-ui-kits/console-clarity/entity";

type Rule = Parameters<typeof useAllowed>[0];
export declare function useDeleteProduct(): OrvalMutationLike;
export declare const createProductAccess: Rule;
export declare const updateProductAccess: Rule;
export declare const deleteProductAccess: Rule;
export declare function useGetProductStatusCounts(params: { field: string }, options?: { query?: { meta?: Record<string, unknown> } }): { data?: unknown; isLoading: boolean; isError?: boolean };
export declare function useGetProductAggregates(params?: { keyword?: string; "status.in"?: string[] }, options?: { query?: { meta?: Record<string, unknown>; placeholderData?: (previous: unknown) => unknown } }): { data?: unknown; isLoading: boolean; isError?: boolean };
`;
