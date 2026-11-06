import en from "./locales/features/en.json";
import ja from "./locales/features/ja.json";
import ko from "./locales/features/ko.json";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { UIProvider } from "@simplix-react/ui";
import { describe, expect, it } from "vitest";

import { useRecordContract, type ContractField } from "./record-contract";
import { RecordValueView } from "./record-value";

const owner: ContractField = {
  name: "ownerId",
  kind: "reference",
  peekKinds: { field: "ownerType", kinds: { USER: "userAccount" } },
  nameField: "ownerName",
  stateField: "ownerState",
};

function Probe(props: { row: Record<string, unknown> }) {
  const contract = useRecordContract("credit-account");
  return createElement("pre", null, JSON.stringify(contract.value(owner, props.row)));
}

function read(row: Record<string, unknown>) {
  const html = renderToStaticMarkup(createElement(UIProvider, { children: createElement(Probe, { row }) }));
  const json = /<pre>([\s\S]*)<\/pre>/.exec(html)?.[1] ?? "null";
  return JSON.parse(json.replace(/&quot;/g, '"').replace(/&amp;/g, "&").replace(/&#x27;/g, "'")) as Record<string, unknown>;
}

/** Without a loaded catalog the translator answers with the key, so these read which words the contract asks for. */
describe("a reference whose record cannot be opened", () => {
  it("keeps the recorded name and asks for the deleted words", () => {
    const value = read({ ownerId: "u1", ownerType: "USER", ownerName: "Mira Han", ownerState: "DELETED" }) as { gone: Record<string, string> };
    expect(value.gone.name).toBe("Mira Han");
    expect(value.gone.reason).toBe("deleted");
    expect(value.gone.badge).toBe("recordGone.reasons.deleted.badge");
    expect(value.gone.title).toBe("recordGone.reasons.deleted.title");
  });

  it("follows the reason, not the owner type", () => {
    const hidden = read({ ownerId: "t1", ownerType: "TEAM", ownerName: "Studio", ownerState: "UNAVAILABLE" }) as { gone: Record<string, string> };
    expect(hidden.gone.reason).toBe("unavailable");
    expect(hidden.gone.badge).toBe("recordGone.reasons.unavailable.badge");
  });

  it("draws a live reference as before", () => {
    expect(read({ ownerId: "t1", ownerType: "TEAM", ownerName: "Studio" })).toEqual({ link: "Studio" });
  });
});

describe("the catalogs", () => {
  for (const [locale, catalog] of Object.entries({ en, ko, ja })) {
    it(`${locale} words every reason and every kind the contract asks for`, () => {
      const words = catalog.recordGone;
      for (const reason of ["deleted", "unavailable"] as const) {
        expect(words.reasons[reason].badge).toBeTruthy();
        expect(words.reasons[reason].title).toBeTruthy();
      }
      expect(words.reasons.deleted.title).toContain("{{kind}}");
      for (const kind of ["record", "userAccount", "USER", "TEAM"] as const) expect(words.kinds[kind]).toBeTruthy();
    });
  }
});

describe("the gone reference drawing", () => {
  it("is plain muted text with a neutral badge, no button, link or focus stop", () => {
    const html = renderToStaticMarkup(
      createElement(UIProvider, {
        children: createElement(RecordValueView, { value: { gone: { name: "Mira Han", reason: "deleted", badge: "Deleted", title: "gone" } } }),
      }),
    );
    expect(html).toContain("Mira Han");
    expect(html).toContain("Deleted");
    expect(html).toContain('title="gone"');
    expect(html).not.toMatch(/<(a|button)\b|tabindex/i);
  });
});
