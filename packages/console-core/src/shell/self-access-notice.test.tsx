import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { UIProvider } from "@simplix-react/ui";
import { describe, expect, it, vi } from "vitest";

import type { SelfAccessRefusal } from "./self-access";

const state = vi.hoisted(() => ({ refusal: null as { status: number; errorCode?: string } | null }));
vi.mock("./self-access", () => ({ useSelfAccessRefusal: () => state.refusal }));

const { SelfAccessNotice, selfAccessRefusalIsTold } = await import("./self-access-notice");

const html = (refusal: SelfAccessRefusal | null) => {
  state.refusal = refusal;
  return renderToStaticMarkup(createElement(UIProvider, { children: createElement(SelfAccessNotice) }));
};

describe("selfAccessRefusalIsTold", () => {
  it("tells a read that failed or was refused, and not one that answers or asks for a sign-in", () => {
    expect(selfAccessRefusalIsTold({ status: 500 })).toBe(true);
    expect(selfAccessRefusalIsTold({ status: 403, errorCode: "ACCOUNT_BLOCKED" })).toBe(true);
    expect(selfAccessRefusalIsTold(null)).toBe(false);
    expect(selfAccessRefusalIsTold({ status: 401 })).toBe(false);
  });
});

describe("SelfAccessNotice", () => {
  it("draws the warning and the reload while the read is refused", () => {
    const out = html({ status: 500 });
    expect(out).toContain("selfAccess.title");
    expect(out).toContain("selfAccess.reload");
  });

  it("draws nothing while the read answers", () => {
    expect(html(null)).toBe("");
  });
});
