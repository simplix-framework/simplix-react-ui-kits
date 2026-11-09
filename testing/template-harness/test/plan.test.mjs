import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { overrideBreaches, planTemplates } from "../lib/plan.mjs";

describe("planTemplates", () => {
  it("renders the CRUD screen's templates through one scaffold", () => {
    const plan = planTemplates(["crud-page", "list", "detail", "form", "page.blocks", "feature-index", "crud-page.stories"]);
    assert.equal(plan.scaffold, true);
    assert.deepEqual(plan.pages, []);
    assert.deepEqual(plan.unrendered, []);
  });

  it("renders each page kind and variant through add-page, with its board frame", () => {
    const plan = planTemplates(["app-shell", "app-shell.stories", "app-shell.top-bar", "static-page.account-section"]);
    assert.deepEqual(plan.pages, [
      { kind: "app-shell", variant: undefined, story: true },
      { kind: "app-shell", variant: "top-bar", story: false },
      { kind: "static-page", variant: "account-section", story: false },
    ]);
    assert.equal(plan.scaffold, false);
  });

  it("renders a route and its menu entry through the scaffold", () => {
    const plan = planTemplates(["crud-page", "route.tanstack", "menu-entry.tanstack"]);
    assert.equal(plan.route, "route.tanstack");
    assert.deepEqual(plan.unrendered, []);
  });

  it("names a template no command renders", () => {
    const plan = planTemplates(["crud-page", "wizard-page", "menu-entry.other", "error-page.stories", "route.only"]);
    assert.deepEqual(plan.unrendered, ["error-page.stories", "menu-entry.other", "wizard-page"]);
  });

  it("names a route template with no screen to route to", () => {
    assert.deepEqual(planTemplates(["route.tanstack", "menu-entry.tanstack"]).unrendered, ["route.tanstack"]);
  });
});

describe("overrideBreaches", () => {
  const base = new Set(["crud-page", "list"]);

  it("accepts a kit that replaces nothing", () => {
    assert.deepEqual(overrideBreaches(base, new Set(), {}), []);
  });

  it("accepts a replacement declared with its reason", () => {
    assert.deepEqual(overrideBreaches(base, new Set(["list"]), { list: "draws rows as cards" }), []);
  });

  it("refuses a replacement with no declaration, an empty reason, and a declaration with no template", () => {
    assert.deepEqual(overrideBreaches(base, new Set(["list"]), {}), ["list.hbs replaces the base kit's without a reason in simplix.overrides"]);
    assert.deepEqual(overrideBreaches(base, new Set(["list"]), { list: " " }), ["simplix.overrides.list gives no reason"]);
    assert.deepEqual(overrideBreaches(base, new Set(), { list: "x" }), ["simplix.overrides names list, and the kit ships no list.hbs"]);
  });

  it("refuses a template only the kit ships", () => {
    assert.deepEqual(overrideBreaches(base, new Set(["wizard-page"]), {}), ["wizard-page.hbs is the kit's alone; add it to the base kit, so every kit of the family has it"]);
  });

  it("judges nothing for a kit that extends no base", () => {
    assert.deepEqual(overrideBreaches(new Set(), new Set(["list"]), {}), []);
  });
});
