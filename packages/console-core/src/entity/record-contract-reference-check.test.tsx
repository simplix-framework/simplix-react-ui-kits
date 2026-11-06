import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { UIProvider } from "@simplix-react/ui";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, expect, it } from "vitest";

import { useRecordContract, type ContractField } from "./record-contract";
import { RecordValueView, type RecordValue } from "./record-value";
import { registerReferenceLookup } from "./reference-state";

const owner: ContractField = {
  name: "ownerId",
  kind: "reference",
  peekKinds: { field: "ownerType", kinds: { USER: "userAccount", TEAM: "team" } },
  nameField: "ownerName",
};
const user: ContractField = { name: "userId", kind: "reference", peekKind: "userAccount", nameField: "userName" };
const voice: ContractField = { name: "voiceCode", kind: "reference", peekKind: "catalogVoice", peekBy: "voiceCode", nameField: "voiceName" };

function Probe(props: { field: ContractField; row: Record<string, unknown> }) {
  const contract = useRecordContract("consent-record");
  return createElement("pre", null, JSON.stringify(contract.value(props.field, props.row)));
}

function read(field: ContractField, row: Record<string, unknown>) {
  const html = renderToStaticMarkup(createElement(UIProvider, { children: createElement(Probe, { field, row }) }));
  const json = /<pre>([\s\S]*)<\/pre>/.exec(html)?.[1] ?? "null";
  return JSON.parse(json.replace(/&quot;/g, '"').replace(/&amp;/g, "&").replace(/&#x27;/g, "'")) as Record<string, any>;
}

describe("a reference asks whether its record exists before it is pressed", () => {
  it("carries the kind, the id and both gone readings for a user", () => {
    const value = read(user, { userId: "u1", userName: "Mira Han" });
    expect(value.link).toBe("Mira Han");
    expect(value.check.kind).toBe("userAccount");
    expect(value.check.id).toBe("u1");
    expect(value.check.gone.deleted.reason).toBe("deleted");
    expect(value.check.gone.deleted.name).toBe("Mira Han");
    expect(value.check.gone.unavailable.reason).toBe("unavailable");
  });

  it("draws a live person with the avatar and the line naming what they are, as a gone one", () => {
    const value = read(user, { userId: "u1", userName: "Mira Han" });
    expect(value.avatar).toBe("u1");
    expect(value.sub).toBe("recordGone.personLine");
    expect(value.check.gone.deleted.avatar).toBe("u1");
  });

  it("looks a team owner up as a team, never as a user", () => {
    const value = read(owner, { ownerId: "t1", ownerType: "TEAM", ownerName: "Studio" });
    expect(value.check.kind).toBe("team");
    expect(value.avatar).toBeUndefined();
  });

  it("looks a user owner up as a user", () => {
    expect(read(owner, { ownerId: "u9", ownerType: "USER", ownerName: "Mira" }).check.kind).toBe("userAccount");
  });

  it("asks nothing for a reference that is another field than the id", () => {
    expect(read(voice, { voiceCode: "ko-KR-1", voiceName: "Seoyeon" }).check).toBeUndefined();
  });

  it("still draws a row that already says why at once", () => {
    const value = read({ ...user, stateField: "userState" }, { userId: "u1", userName: "Mira", userState: "DELETED" });
    expect(value.gone.reason).toBe("deleted");
  });
});

describe("a checked reference while its answer is on its way", () => {
  it("is drawn as the link it is, never as gone", () => {
    // A lookup that never answers holds the reference in its loading state.
    registerReferenceLookup("pendingKind", { find: () => new Promise(() => undefined) });
    const value: RecordValue = {
      link: "Mira Han",
      onClick: () => undefined,
      check: {
        kind: "pendingKind",
        id: "u1",
        gone: {
          deleted: { name: "Mira Han", reason: "deleted", badge: "Deleted", title: "gone" },
          unavailable: { name: "Mira Han", reason: "unavailable", badge: "Not available", title: "hidden" },
        },
      },
    };
    const html = renderToStaticMarkup(
      createElement(QueryClientProvider, { client: new QueryClient() }, createElement(UIProvider, { children: createElement(RecordValueView, { value }) })),
    );
    expect(html).toContain("Mira Han");
    expect(html).not.toContain("Deleted");
    expect(html).not.toContain("data-record-gone");
  });
});
