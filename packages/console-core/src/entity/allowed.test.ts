import { describe, expect, it } from "vitest";

import { permissionOf } from "./allowed";

describe("the permission an operation's rule names", () => {
  it("is the rule itself, the first hasPermission term of an expression, or none", () => {
    expect(permissionOf({ kind: "permission", group: "ORG_ADMIN", action: "edit" })).toEqual({ group: "ORG_ADMIN", action: "edit" });
    expect(permissionOf({ kind: "expression", raw: "hasPermission('USER_ADMIN','view') or #id == principal.id" })).toEqual({ group: "USER_ADMIN", action: "view" });
    expect(permissionOf({ kind: "expression", raw: "isAuthenticated()" })).toBeUndefined();
    expect(permissionOf({ kind: "authenticated" })).toBeUndefined();
  });
});
