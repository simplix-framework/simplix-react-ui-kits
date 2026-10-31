import { describe, expect, it } from "vitest";

import { render } from "./template-typecheck";

/**
 * A list that reorders by drag owns the record's order, so the generated form leaves the order
 * field out and a create sends the default the drag starts from.
 */
const fields = [
  { name: "name", contractKind: "text" },
  { name: "sortOrder", contractKind: "number" },
];
const context = {
  entity: "voice",
  EntityPascal: "Voice",
  entityPath: "/api/v1/voice",
  packageName: "@test/domain-voice",
  hookGet: "useGetVoice",
  hookCreate: "useCreateVoice",
  hookUpdate: "useUpdateVoice",
  hasUpdate: true,
  fields,
};

describe("the generated form under a list that reorders by drag", () => {
  it("leaves the order field out and sends the default on create", async () => {
    const out = await render("form.hbs", { ...context, formOrderField: "sortOrder" });
    expect(out).not.toContain('name: "sortOrder"');
    expect(out).toContain("{ sortOrder: 0, ...written }");
  });

  it("keeps the order field where nothing reorders", async () => {
    const out = await render("form.hbs", context);
    expect(out).toContain('name: "sortOrder"');
    expect(out).not.toContain("sortOrder: 0");
  });
});

describe("the generated form for a new record", () => {
  it("states the contract's default of a field", async () => {
    const out = await render("form.hbs", { ...context, fields: [{ name: "active", contractKind: "boolean", defaultLiteral: "true" }] });
    expect(out).toContain('{ name: "active", kind: "boolean", defaultValue: true }');
  });
});
