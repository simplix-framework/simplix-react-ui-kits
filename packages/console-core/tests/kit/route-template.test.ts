import { describe, expect, it } from "vitest";

import { render } from "./template-typecheck";

const context = { entity: "catalogVoice", EntityPascal: "CatalogVoice", packageName: "@test/domain-speech", modulePackage: "@test/admin-speech", routePath: "catalog-voices" };

describe("the TanStack route a list screen is reached through", () => {
  it("guards the route on the list operation's access rule", () => {
    const out = render("route.tanstack.hbs", { ...context, accessList: "listCatalogVoicesAccess" });
    expect(out).toContain('createFileRoute("/catalog-voices")');
    expect(out).toContain('import { listCatalogVoicesAccess } from "@test/domain-speech";');
    expect(out).toContain("guardedBy(listCatalogVoicesAccess, CatalogVoiceRoute)");
    expect(out).toContain('import { CatalogVoiceCrudPage } from "@test/admin-speech/pages";');
    expect(out).toContain("validateSearch: validateConsoleSearch,");
    expect(out).not.toContain('import "@test/admin-speech/locales";');
  });

  it("registers the module's words where the module exports them", () => {
    expect(render("route.tanstack.hbs", { ...context, moduleLocales: true })).toContain('import "@test/admin-speech/locales";');
  });

  it("admits everyone the server admits where the contract states no rule", () => {
    expect(render("route.tanstack.hbs", context)).toContain("guardedBy(undefined, CatalogVoiceRoute)");
  });

  it("renders a menu entry for the path", () => {
    expect(render("menu-entry.tanstack.hbs", { menuKey: "catalogVoices", routePath: "catalog-voices", menuIcon: "LibraryIcon", menuGate: '{ action: "list", subject: "SPEECH_ADMIN" }' })).toContain(
      'href: "/catalog-voices", icon: LibraryIcon, gate: { action: "list", subject: "SPEECH_ADMIN" } },',
    );
  });
});
