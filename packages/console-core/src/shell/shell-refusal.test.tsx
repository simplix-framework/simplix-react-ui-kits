import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { createSelfAccessPolicy, currentSelfAccessRefusal } from "./self-access";
import { refusalScreenFor, type ShellRefusalPages } from "./shell-refusal";

function HeldPage() {
  return createElement("p", null, "held page");
}

const PAGES: ShellRefusalPages = { CODE_A: HeldPage };

function markup(screen: ReturnType<typeof refusalScreenFor>): string {
  return screen === null ? "" : renderToStaticMarkup(screen);
}

describe("refusalScreenFor", () => {
  it("draws the page named for the refusal's error code at the height of the window", () => {
    const html = markup(refusalScreenFor(PAGES, { status: 409, errorCode: "CODE_A" }));
    expect(html).toContain("held page");
    expect(html).toContain("min-h-dvh");
  });

  it("draws nothing while the self read is answered", () => {
    expect(refusalScreenFor(PAGES, null)).toBeNull();
  });

  it("draws nothing for a refusal the app names no page for", () => {
    expect(refusalScreenFor(PAGES, { status: 409, errorCode: "CODE_B" })).toBeNull();
    expect(refusalScreenFor(PAGES, { status: 403 })).toBeNull();
  });

  it("draws nothing when the app names no pages at all", () => {
    expect(refusalScreenFor(undefined, { status: 409, errorCode: "CODE_A" })).toBeNull();
    expect(refusalScreenFor({}, { status: 409, errorCode: "CODE_A" })).toBeNull();
  });

  it("looks the code up as an own key, so a code naming a prototype member resolves to nothing", () => {
    for (const code of ["constructor", "toString", "__proto__", "hasOwnProperty"]) {
      expect(refusalScreenFor(PAGES, { status: 409, errorCode: code })).toBeNull();
    }
  });

  it("draws the page for a refusal the self access policy recorded, and none once the read is answered", async () => {
    const refused = Object.assign(new Error("refused"), { status: 409, errorCode: "CODE_A" });
    let answer: () => Promise<unknown> = () => Promise.reject(refused);
    const policy = createSelfAccessPolicy({ endpoint: "/me", fetchFn: () => answer() });

    await policy.update("token").catch(() => undefined);
    expect(markup(refusalScreenFor(PAGES, currentSelfAccessRefusal()))).toContain("held page");

    answer = () => Promise.resolve({ body: { userId: "u-1", username: "operator", permissions: {}, roles: [] } });
    await policy.update("token");
    expect(refusalScreenFor(PAGES, currentSelfAccessRefusal())).toBeNull();
  });
});
