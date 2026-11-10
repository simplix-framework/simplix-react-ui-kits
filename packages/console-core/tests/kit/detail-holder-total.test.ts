import { describe, expect, it } from "vitest";

import { render } from "./template-typecheck";

/**
 * A generated detail's holder tab counts its rows from the holder's list. A list that is not read
 * (the reader's rule refuses it, or the record the list is forced to has not answered) has no
 * total, and a count drawn as 0 says somebody counted and found none.
 */

const field = { name: "name", contractKind: "text" };

const context = {
  entity: "product",
  EntityPascal: "Product",
  entityPath: "/api/v1/product",
  packageName: "@test/domain-product",
  rowIdField: "productId",
  displayNameField: "name",
  displayNameFields: ["name"],
  nameContractFields: [{ name: "name", contractKind: "text" }],
  hookGet: "useGetProduct",
  hookCreate: "useCreateProduct",
  hookUpdate: "useUpdateProduct",
  hasUpdate: true,
  fields: [field],
  detailFields: [field],
  listFields: [field],
  contractFilters: [],
  hookList: "useListProduct",
  listRowType: "ProductListRow",
  holderColumnsHooks: [{ hook: "useMemberColumns", from: "../member", field: "productId" }],
};

const holder = {
  entity: "member",
  EntityPascal: "Member",
  key: "members",
  filterKey: "productId",
  rowIdField: "memberId",
  fields: [field],
  hookList: "useListMember",
  accessList: "listMemberAccess",
  hasKeywordSearch: false,
};

describe("a generated detail's holder tab", () => {
  it("counts by the same condition the list is read under, so a list held back has no total", () => {
    const text = render("detail.hbs", { ...context, holders: [{ ...holder, matchField: "productKey" }] });
    expect(text).toContain('const holder0Enabled = holder0Allowed && holder0Forced["productId"] !== "";');
    expect(text).toContain("queryOptions: { enabled: holder0Enabled }");
    expect(text).toContain("count: listTotal(holder0List, { enabled: holder0Enabled }),");
  });

  it("counts by the reader's rule alone where the list is forced to the record's own key", () => {
    const text = render("detail.hbs", { ...context, holders: [holder] });
    expect(text).toContain("const holder0Enabled = holder0Allowed;");
    expect(text).toContain("count: listTotal(holder0List, { enabled: holder0Enabled }),");
  });
});
