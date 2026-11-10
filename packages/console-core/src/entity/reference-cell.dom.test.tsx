import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { UIProvider } from "@simplix-react/ui";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { PeekHostContext, type PeekHostController } from "../peek/peek-context";
import { useRecordContract, type ContractField } from "./record-contract";
import { RecordValueView } from "./record-value";
import { registerReferenceLookup } from "./reference-state";

let root: Root | undefined;
let host: HTMLElement | undefined;

beforeAll(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
});

afterEach(() => {
  act(() => root?.unmount());
  host?.remove();
  root = undefined;
  host = undefined;
});

const user: ContractField = { name: "userId", kind: "reference", peekKind: "userAccount", nameField: "userName" };

function Cell({ field, row }: { field: ContractField; row: Record<string, unknown> }) {
  const contract = useRecordContract("diagnostic-report");
  return createElement(RecordValueView, { value: contract.column(field).value(row) });
}

async function draw(field: ContractField, row: Record<string, unknown>) {
  const peek: PeekHostController = { open: vi.fn(), close: vi.fn(), closeAll: vi.fn(), depth: 0 };
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  act(() => {
    root?.render(
      createElement(
        QueryClientProvider,
        { client: new QueryClient() },
        createElement(UIProvider, { children: createElement(PeekHostContext.Provider, { value: peek }, createElement(Cell, { field, row })) }),
      ),
    );
  });
  return { peek, host };
}

/** Waits for the lookup the cell asked, and for the state it answered to be drawn. */
async function settled(find: ReturnType<typeof vi.fn>, host: HTMLElement, until: () => boolean = () => true) {
  await vi.waitFor(() => expect(find).toHaveBeenCalled());
  await vi.waitFor(() => expect(until()).toBe(true));
  await act(async () => void (await Promise.resolve()));
  return host;
}

describe("a list cell that names a person", () => {
  it("draws the person's name as a link that opens the account's peek, once the account is known to exist", async () => {
    const find = vi.fn(async (ids: readonly string[]) => ids);
    registerReferenceLookup("userAccount", { find });
    const { host: cell, peek } = await draw(user, { userId: "u1", userName: "Mira Han" });
    await settled(find, cell);
    const link = cell.querySelector<HTMLButtonElement>('[data-variant="link"]');
    expect(link?.textContent).toBe("Mira Han");
    expect(cell.querySelector("[data-record-gone]")).toBeNull();
    act(() => link?.click());
    expect(peek.open).toHaveBeenCalledWith({ kind: "userAccount", target: { id: "u1", name: "Mira Han" } });
  });

  it("draws the link while the answer is on its way, never as gone", async () => {
    registerReferenceLookup("userAccount", { find: () => new Promise(() => undefined) });
    const { host: cell } = await draw(user, { userId: "u1", userName: "Mira Han" });
    expect(cell.querySelector('[data-variant="link"]')?.textContent).toBe("Mira Han");
  });

  it("draws no link, and says why, where the account no longer exists", async () => {
    const find = vi.fn(async () => [] as string[]);
    registerReferenceLookup("userAccount", { find });
    const { host: cell } = await draw(user, { userId: "u1", userName: "Mira Han" });
    await settled(find, cell, () => cell.querySelector("[data-record-gone]") !== null);
    expect(cell.querySelector('[data-variant="link"]')).toBeNull();
    expect(cell.querySelector("[data-record-gone]")?.getAttribute("data-record-gone")).toBe("deleted");
  });

  it("draws the record's id where the name the column reads is null or empty, never an empty link", async () => {
    for (const userName of [null, ""]) {
      const { host: cell } = await draw({ name: "userId", kind: "reference", nameField: "userName" }, { userId: "u1", userName });
      expect(cell.textContent, String(userName)).toContain("u1");
      cell.remove();
    }
  });

  it("draws a plain name where the column names no peek kind", async () => {
    const { host: cell } = await draw({ name: "userId", kind: "reference", nameField: "userName" }, { userId: "u1", userName: "Mira Han" });
    expect(cell.querySelector('[data-variant="link"]')).toBeNull();
    expect(cell.textContent).toContain("Mira Han");
  });
});
