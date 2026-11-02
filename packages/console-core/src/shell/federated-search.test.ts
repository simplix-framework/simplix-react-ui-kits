import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { createFederatedSearch, summarizeSearch, type FederatedSearchGroup, type FederatedSearchSource } from "./federated-search";

interface Row {
  readonly id: string;
  readonly name: string;
}

/** An answer the test settles by hand, so the order answers arrive in is the test's. */
function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

/** A source whose every ask is recorded and answered by the test. */
function source(key: string, extra: Partial<FederatedSearchSource<Row>> = {}) {
  const asks: { query: string; signal: AbortSignal; answer: ReturnType<typeof deferred<readonly Row[]>> }[] = [];
  const declared: FederatedSearchSource<Row> = {
    key,
    label: key,
    search: (query, signal) => {
      const answer = deferred<readonly Row[]>();
      asks.push({ query, signal, answer });
      return answer.promise;
    },
    toResult: (row) => ({ id: row.id, title: row.name, href: `/${key}?id=${row.id}` }),
    listHref: (query) => `/${key}?q=${query}`,
    ...extra,
  };
  return { declared, asks };
}

const settle = async () => {
  for (let i = 0; i < 5; i++) await Promise.resolve();
};

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

describe("the console's record search", () => {
  it("asks nothing until the pause after the last key", () => {
    const users = source("users");
    const search = createFederatedSearch<Row>();
    search.setSources([users.declared]);
    search.setQuery("ki");
    search.setQuery("kim");
    vi.advanceTimersByTime(249);
    expect(users.asks).toHaveLength(0);
    expect(search.getState().waiting).toBe(true);
    vi.advanceTimersByTime(1);
    expect(users.asks.map((ask) => ask.query)).toEqual(["kim"]);
  });

  it("asks nothing for a text shorter than two characters", () => {
    const users = source("users");
    const search = createFederatedSearch<Row>();
    search.setSources([users.declared]);
    search.setQuery("k");
    vi.advanceTimersByTime(1000);
    expect(users.asks).toHaveLength(0);
    expect(search.getState()).toEqual({ query: "", waiting: false, groups: [] });
  });

  it("asks nothing for a text the product says no search can match", () => {
    const users = source("users");
    const search = createFederatedSearch<Row>({ accepts: (query) => !/^[ㄱ-ㅎ]+$/.test(query) });
    search.setSources([users.declared]);
    search.setQuery("ㅅㅇㅈ");
    vi.advanceTimersByTime(1000);
    expect(users.asks).toHaveLength(0);
  });

  it("never asks a source the account may not list", () => {
    const users = source("users");
    const roles = source("roles", { allowed: false });
    const search = createFederatedSearch<Row>();
    search.setSources([users.declared, roles.declared]);
    search.setQuery("kim");
    vi.advanceTimersByTime(250);
    expect(roles.asks).toHaveLength(0);
    expect(search.getState().groups.map((group) => group.key)).toEqual(["users"]);
  });

  it("names each group's results and the list searched for the same text", async () => {
    const users = source("users");
    const search = createFederatedSearch<Row>({ limit: 2 });
    search.setSources([users.declared]);
    search.setQuery("kim");
    vi.advanceTimersByTime(250);
    expect(search.getState().groups[0]).toMatchObject({ status: "loading", listHref: "/users?q=kim" });
    users.asks[0]!.answer.resolve([
      { id: "1", name: "Kim A" },
      { id: "2", name: "Kim B" },
      { id: "3", name: "Kim C" },
    ]);
    await settle();
    expect(search.getState().groups[0]).toMatchObject({ status: "done", results: [{ title: "Kim A" }, { title: "Kim B" }] });
  });

  it("drops an older text's answer that arrives after the newer one was asked", async () => {
    const users = source("users");
    const search = createFederatedSearch<Row>();
    search.setSources([users.declared]);
    search.setQuery("ki");
    vi.advanceTimersByTime(250);
    search.setQuery("kim");
    vi.advanceTimersByTime(250);
    users.asks[1]!.answer.resolve([{ id: "2", name: "Kim" }]);
    await settle();
    users.asks[0]!.answer.resolve([{ id: "1", name: "Kia" }]);
    await settle();
    expect(search.getState().query).toBe("kim");
    expect(search.getState().groups[0]!.results.map((result) => result.title)).toEqual(["Kim"]);
  });

  it("cancels the older ask through its signal when a newer text is typed", () => {
    const users = source("users");
    const search = createFederatedSearch<Row>();
    search.setSources([users.declared]);
    search.setQuery("ki");
    vi.advanceTimersByTime(250);
    search.setQuery("kim");
    expect(users.asks[0]!.signal.aborted).toBe(true);
  });

  it("cancels everything when the palette closes", () => {
    const users = source("users");
    const search = createFederatedSearch<Row>();
    search.setSources([users.declared]);
    search.setQuery("kim");
    vi.advanceTimersByTime(250);
    search.dispose();
    expect(users.asks[0]!.signal.aborted).toBe(true);
    expect(search.getState().groups).toEqual([]);
  });

  it("keeps the other groups standing when one source fails", async () => {
    const users = source("users");
    const roles = source("roles");
    const search = createFederatedSearch<Row>();
    search.setSources([users.declared, roles.declared]);
    search.setQuery("kim");
    vi.advanceTimersByTime(250);
    users.asks[0]!.answer.reject(Object.assign(new Error("SEARCH_INVALID_PARAMETER"), { type: "ERROR", status: 400 }));
    roles.asks[0]!.answer.resolve([{ id: "r", name: "Kim's role" }]);
    await settle();
    const [failed, found] = search.getState().groups;
    expect(failed).toMatchObject({ key: "users", status: "failed", results: [] });
    expect(found).toMatchObject({ key: "roles", status: "done", results: [{ title: "Kim's role" }] });
  });

  it("takes a body that is not a list of rows as the source failing, not as no records", async () => {
    const users = source("users");
    const search = createFederatedSearch<Row>();
    search.setSources([users.declared]);
    search.setQuery("kim");
    vi.advanceTimersByTime(250);
    users.asks[0]!.answer.resolve({ type: "ERROR" } as unknown as readonly Row[]);
    await settle();
    expect(search.getState().groups[0]!.status).toBe("failed");
  });

  it("takes a source that throws before it answers as failing", async () => {
    const broken = source("broken", {
      search: () => {
        throw new Error("no request built");
      },
    });
    const search = createFederatedSearch<Row>();
    search.setSources([broken.declared]);
    search.setQuery("kim");
    vi.advanceTimersByTime(250);
    await settle();
    expect(search.getState().groups[0]!.status).toBe("failed");
  });

  it("leaves out a row it cannot name", async () => {
    const users = source("users", { toResult: (row) => (row.name ? { id: row.id, title: row.name, href: "/" } : undefined) });
    const search = createFederatedSearch<Row>();
    search.setSources([users.declared]);
    search.setQuery("kim");
    vi.advanceTimersByTime(250);
    users.asks[0]!.answer.resolve([
      { id: "1", name: "" },
      { id: "2", name: "Kim" },
    ]);
    await settle();
    expect(search.getState().groups[0]!.results.map((result) => result.id)).toEqual(["2"]);
  });

  it("tells a listener every change", () => {
    const users = source("users");
    const search = createFederatedSearch<Row>();
    search.setSources([users.declared]);
    const heard = vi.fn();
    search.subscribe(heard);
    search.setQuery("kim");
    vi.advanceTimersByTime(250);
    expect(heard).toHaveBeenCalledTimes(2);
  });
});

describe("what the palette says about the text typed now", () => {
  const group = (status: FederatedSearchGroup["status"], results = 0): FederatedSearchGroup => ({
    key: status + results,
    label: "x",
    status,
    results: Array.from({ length: results }, (_, i) => ({ id: String(i), title: "t", href: "/" })),
  });
  it("is looking while the pause runs or a source is asked", () => {
    expect(summarizeSearch({ query: "kim", waiting: true, groups: [] }, "kim").looking).toBe(true);
    expect(summarizeSearch({ query: "kim", waiting: false, groups: [group("loading")] }, "kim").looking).toBe(true);
  });
  it("says no record matched once every source answered or failed and none found one", () => {
    expect(summarizeSearch({ query: "kim", waiting: false, groups: [group("done"), group("failed")] }, "kim").noRecords).toBe(true);
  });
  it("says nothing of the kind while a source is asked, when a record was found, or when every source failed", () => {
    expect(summarizeSearch({ query: "kim", waiting: false, groups: [group("done"), group("loading")] }, "kim").noRecords).toBe(false);
    expect(summarizeSearch({ query: "kim", waiting: false, groups: [group("done", 1)] }, "kim").noRecords).toBe(false);
    expect(summarizeSearch({ query: "kim", waiting: false, groups: [group("failed")] }, "kim").noRecords).toBe(false);
  });
  it("says nothing about the text typed now from an older text's answer", () => {
    expect(summarizeSearch({ query: "ki", waiting: false, groups: [group("done")] }, "kim").noRecords).toBe(false);
  });
});
