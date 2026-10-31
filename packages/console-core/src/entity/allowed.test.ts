import { describe, expect, it } from "vitest";

import { decideAccess, permissionOf, type OperationAccess } from "./allowed";

// The @PreAuthorize chains the back office guards its user accounts with, as SimpliX Meta publishes them.
const ownerOr = (action: string, owner: string): OperationAccess => ({
  kind: "expression",
  raw: `hasPermission('USER_ADMIN', '${action}') or @userAccountService.hasOwnerPermission('${owner}', #userId, null)`,
  operator: "or",
  permissions: [{ group: "USER_ADMIN", action }],
  residual: true,
});
const updateAccount = ownerOr("edit", "edit");
const getAccount = ownerOr("view", "view");
const getAccountForEdit = ownerOr("view", "edit");

const granted = (...held: string[]) => (action: string, subject: string) => held.includes(`${subject}:${action}`);

describe("deciding an operation's access rule", () => {
  it("allows an owner-widened chain to a holder of its permission", () => {
    for (const rule of [updateAccount, getAccount, getAccountForEdit]) {
      expect(decideAccess(rule, granted("USER_ADMIN:edit", "USER_ADMIN:view"))).toBe(true);
    }
  });

  it("draws an owner-widened chain without the permission, since the server-side term may grant it", () => {
    expect(decideAccess(updateAccount, granted())).toBe(true);
  });

  it("refuses an or chain of permissions only when none holds", () => {
    const rule: OperationAccess = {
      kind: "expression",
      raw: "hasPermission('A', 'edit') or hasPermission('B', 'edit')",
      operator: "or",
      permissions: [{ group: "A", action: "edit" }, { group: "B", action: "edit" }],
      residual: false,
    };
    expect(decideAccess(rule, granted("B:edit"))).toBe(true);
    expect(decideAccess(rule, granted("A:view"))).toBe(false);
  });

  it("needs every permission of an and chain", () => {
    const rule: OperationAccess = {
      kind: "expression",
      raw: "hasPermission('A', 'edit') and @svc.check(#id)",
      operator: "and",
      permissions: [{ group: "A", action: "edit" }],
      residual: true,
    };
    expect(decideAccess(rule, granted("A:edit"))).toBe(true);
    expect(decideAccess(rule, granted())).toBe(false);
  });

  it("decides a permission rule by it, and draws what it cannot decide", () => {
    expect(decideAccess({ kind: "permission", group: "ORG_ADMIN", action: "edit" }, granted("ORG_ADMIN:edit"))).toBe(true);
    expect(decideAccess({ kind: "permission", group: "ORG_ADMIN", action: "edit" }, granted())).toBe(false);
    expect(decideAccess({ kind: "expression", raw: "#id == principal.id" }, granted())).toBe(true);
    expect(decideAccess({ kind: "authenticated" }, granted())).toBe(true);
    expect(decideAccess(undefined, granted())).toBe(true);
  });
});

describe("the permission a route is guarded on", () => {
  it("is the rule itself, an and chain's sole term, or none where a server-side term may admit", () => {
    expect(permissionOf({ kind: "permission", group: "ORG_ADMIN", action: "edit" })).toEqual({ group: "ORG_ADMIN", action: "edit" });
    expect(permissionOf({ kind: "expression", raw: "hasPermission('A', 'edit') and #x", operator: "and", permissions: [{ group: "A", action: "edit" }], residual: true })).toEqual({ group: "A", action: "edit" });
    expect(permissionOf(getAccount)).toBeUndefined();
    expect(permissionOf({ kind: "expression", raw: "isAuthenticated() and #x" })).toBeUndefined();
    expect(permissionOf({ kind: "authenticated" })).toBeUndefined();
  });
});
