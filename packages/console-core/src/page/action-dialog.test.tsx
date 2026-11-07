import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { UIProvider } from "@simplix-react/ui";
import { describe, expect, it, vi } from "vitest";

import { RecordVerbButton } from "../entity/record-blocks";
import { settleSubmit } from "./action-dialog";

/** Records what `settleSubmit` told its caller, in order. */
function follow(sent: void | Promise<unknown>) {
  const told: string[] = [];
  settleSubmit(sent, {
    pending: (pending) => told.push(`pending:${pending}`),
    done: () => told.push("done"),
    refused: (error) => told.push(`refused:${(error as Error).message}`),
  });
  return told;
}

describe("settleSubmit", () => {
  it("closes at once for a decision that returns nothing", () => {
    expect(follow(undefined)).toEqual(["done"]);
  });

  it("holds the dialog while a promise is pending and closes only once it resolves", async () => {
    let resolve: (value: unknown) => void = () => undefined;
    const sent = new Promise((accept) => {
      resolve = accept;
    });
    const told = follow(sent);
    expect(told).toEqual(["pending:true"]);
    resolve(1);
    await sent;
    await Promise.resolve();
    expect(told).toEqual(["pending:true", "pending:false", "done"]);
  });

  it("keeps the dialog on a refusal and hands the rejection on, so what was typed is not lost", async () => {
    const sent = Promise.reject(new Error("Already revoked"));
    const told = follow(sent);
    await sent.catch(() => undefined);
    await Promise.resolve();
    expect(told).toEqual(["pending:true", "pending:false", "refused:Already revoked"]);
    expect(told).not.toContain("done");
  });
});

describe("a verb that is running", () => {
  const draw = (verb: Parameters<typeof RecordVerbButton>[0]["verb"]) =>
    renderToStaticMarkup(createElement(UIProvider, { children: createElement(RecordVerbButton, { verb }) }));

  it("is drawn busy under its running word and cannot be pressed again", () => {
    const out = draw({ label: "Revoke", kind: "danger", pending: "Working…" });
    expect(out).toContain("Working…");
    expect(out).toContain("disabled");
    expect(out).toContain('aria-busy="true"');
  });

  it("is drawn as before while nothing runs", () => {
    const out = draw({ label: "Revoke", kind: "danger", onClick: vi.fn() });
    expect(out).toContain("Revoke");
    expect(out).not.toContain("aria-busy");
  });
});
