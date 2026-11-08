import { act, createElement, useState, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { adaptOrvalList, forcedScope, useCrudList, type UseCrudListResult } from "@simplix-react/ui";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

/**
 * A page with tabs holds one list hook across all of them: the tab that has a body of its own draws no
 * list, and the hook, with the page index it holds, outlives it. The generated list hands the hook the
 * scope below as its `scopeKey` (`console-clarity/tests/list-scope.test.ts` holds the template to this
 * exact expression), so these tests mount the real `useCrudList` under a real React root with it and
 * move the tab the way the page's address does.
 */

/** The scope the generated list builds from the page's forced request and its open tab. */
const scopeOf = (params: Record<string, unknown> | undefined, scope: string | undefined): string | undefined =>
  params || scope ? `${params ? forcedScope({ ...params }) : ""}|${scope ?? ""}` : undefined;

interface Row {
  readonly id: string;
}

const read = vi.fn((_params: Record<string, unknown>, _options: unknown) => ({ data: { content: [] as Row[], totalElements: 100 }, isLoading: false, error: null }));
const useRows = adaptOrvalList<Row>(read);

const held: { list?: UseCrudListResult<Row>; openTab?: (tab: string) => void } = {};

/** A page with no router: the open tab is a state, written the way a route's `navigate` writes it. */
function Harness({ forced }: { forced?: Record<string, unknown> }): ReactNode {
  const [tab, setTab] = useState("keys");
  const list = useCrudList<Row>(useRows, { stateMode: "server", defaultPageSize: 20, scopeKey: scopeOf(forced, tab) });
  held.list = list;
  held.openTab = setTab;
  return null;
}

let root: Root | undefined;

beforeAll(() => {
  // React's `act` is quiet only in a test environment that says so.
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
});

afterEach(() => {
  act(() => root?.unmount());
  root = undefined;
  read.mockClear();
});

function mount(forced?: Record<string, unknown>): void {
  root = createRoot(document.createElement("div"));
  act(() => root?.render(createElement(Harness, { forced })));
}

const page = () => held.list?.pagination.page;

describe("a list held by a page with tabs", () => {
  it("returns to its first page when the reader leaves for another tab and comes back, whatever the tabs force", () => {
    mount();
    act(() => held.list?.pagination.setPage(2));
    expect(page()).toBe(2);
    act(() => held.openTab?.("installation"));
    act(() => held.openTab?.("keys"));
    expect(page()).toBe(1);
  });

  it("does the same when every tab forces the same request", () => {
    mount({ "scope.equals": "ROLE" });
    act(() => held.list?.pagination.setPage(3));
    act(() => held.openTab?.("areas"));
    act(() => held.openTab?.("roles"));
    expect(page()).toBe(1);
  });

  it("keeps the page it is on while the tab stays open", () => {
    mount();
    act(() => held.list?.pagination.setPage(2));
    act(() => held.openTab?.("keys"));
    expect(page()).toBe(2);
  });
});
