import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { context, domainStub, pageDir, widgetsDir, widgetsStub } from "./crud-page-fixture";
import { render, typecheck, virtualRoot } from "./template-typecheck";

/**
 * The generated CRUD page is the screen's whole start: it compiles against the kit's own sources with
 * the empty blocks file the kit lays down beside it, and with a blocks file that states every key.
 */

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
