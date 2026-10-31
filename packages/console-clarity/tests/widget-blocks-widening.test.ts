import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { render, typecheck, virtualRoot } from "./template-typecheck";

/**
 * A generated form and a generated detail are rewritten on every run, while their
 * `form.blocks.tsx` and `detail.blocks.tsx` are the author's and are written once. A key the kit's
 * `CrudFormBlocks` or `CrudDetailBlocks` gains later reaches a blocks file that never declared it,
 * and the widget that reads it must still type-check. These tests render the real templates and
 * check them with the compiler against the kit's own sources.
 */

const field = { name: "name", contractKind: "text" };

/** The context the CLI hands the widget templates for an entity with every operation. */
const context = {
  entity: "product",
  EntityPascal: "Product",
  entityPath: "/api/v1/product",
  packageName: "@test/domain-product",
  rowIdField: "productId",
  displayNameField: "name",
  hookGet: "useGetProduct",
  hookCreate: "useCreateProduct",
  hookUpdate: "useUpdateProduct",
  hasUpdate: true,
  fields: [field],
  detailFields: [field],
  holders: [],
};

const widgetsDir = join(virtualRoot, "modules", "mymod", "src", "widgets", "product");

const domainStub = `
import type { OrvalMutationLike } from "@simplix-react/ui";

export interface ProductDetail { readonly productId: string; readonly name?: string }
export declare function useGetProduct(id: string, options?: unknown): { readonly data?: ProductDetail; readonly isLoading: boolean; readonly isError: boolean };
export declare function useCreateProduct(options?: unknown): OrvalMutationLike;
export declare function useUpdateProduct(options?: unknown): OrvalMutationLike;
`;

/** A form blocks file that declares none of the optional keys the form reads. */
const formBlocksWithNoKeys = `
import type { ContractOverrides, RecordFormField } from "@simplix-react-ui-kits/console-clarity/entity";

export interface FormBlocks {}

export function useFormBlocks<T>(_form: { readonly record: T | undefined; readonly editing: boolean; readonly generated: readonly RecordFormField[] }): FormBlocks {
  return {};
}

export function useFormContract(): ContractOverrides {
  return {};
}
`;

/** A detail blocks file that declares none of the optional keys the detail reads. */
const detailBlocksWithNoKeys = `
import type { ProductDetailProps } from "./detail";

export interface DetailBlocks {}

export function useDetailBlocks<T>(_detail: { readonly record: T | undefined; readonly props: ProductDetailProps }): DetailBlocks {
  return {};
}
`;

function check(widget: "form" | "detail", blocks: string, source = render(`${widget}.hbs`, context)): string[] {
  const file = join(widgetsDir, `${widget}.tsx`);
  return typecheck(
    {
      [file]: source,
      [join(widgetsDir, `${widget}.blocks.tsx`)]: blocks,
      [join(virtualRoot, "domain-product.ts")]: domainStub,
    },
    [file],
  );
}

/** The widget as it reads its blocks without widening them: the blocks hook's own type, with nothing added. */
function unwidened(widget: "form" | "detail"): string {
  const widened = render(`${widget}.hbs`, context);
  const hook = widget === "form" ? "useFormBlocks" : "useDetailBlocks";
  const plain = widened.replace(new RegExp(`const blocks: [^=]+= ${hook}`), `const blocks = ${hook}`);
  expect(plain).not.toBe(widened);
  return plain;
}

describe("the generated form against a blocks file written before a key existed", () => {
  it("type-checks against a blocks file that declares none of the optional keys", () => {
    expect(check("form", formBlocksWithNoKeys)).toEqual([]);
  });

  it("type-checks against the blocks stub the kit ships beside it", () => {
    expect(check("form", render("form.blocks.hbs", context))).toEqual([]);
  });

  it("is told apart from a form that reads the keys without widening them", () => {
    const messages = check("form", formBlocksWithNoKeys, unwidened("form"));
    for (const key of ["title", "sections", "note", "fieldNotices", "toRequest"]) {
      expect(messages.some((line) => line.includes(`'${key}'`)), key).toBe(true);
    }
  });
});

describe("the generated detail against a blocks file written before a key existed", () => {
  it("type-checks against a blocks file that declares none of the optional keys", () => {
    expect(check("detail", detailBlocksWithNoKeys)).toEqual([]);
  });

  it("type-checks against the blocks stub the kit ships beside it", () => {
    expect(check("detail", render("detail.blocks.hbs", context))).toEqual([]);
  });

  it("is told apart from a detail that reads the keys without widening them", () => {
    const messages = check("detail", detailBlocksWithNoKeys, unwidened("detail"));
    for (const key of ["contract", "note", "notices", "tabs"]) {
      expect(messages.some((line) => line.includes(`'${key}'`)), key).toBe(true);
    }
  });
});
