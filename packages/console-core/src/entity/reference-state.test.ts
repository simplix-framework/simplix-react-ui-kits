import { describe, expect, it } from "vitest";

import { createReferenceStateLoader, REFERENCE_BATCH_SIZE, type ReferenceLookup } from "./reference-state";

/** A loader whose batches flush when the test says so, over lookups that record what they were asked. */
function harness(lookups: Record<string, (ids: readonly string[]) => Promise<readonly string[]>>) {
  const asked: Record<string, string[][]> = {};
  let flush: () => void = () => undefined;
  const load = createReferenceStateLoader(
    (kind) => {
      const find = lookups[kind];
      if (!find) return undefined;
      const lookup: ReferenceLookup = {
        find: (ids) => {
          (asked[kind] ??= []).push([...ids]);
          return find(ids);
        },
      };
      return lookup;
    },
    (next) => {
      flush = next;
    },
  );
  return { load, asked, flush: () => flush() };
}

const refused = Object.assign(new Error("Forbidden"), { status: 403 });
const broken = Object.assign(new Error("Internal"), { status: 500 });

describe("the reference state loader", () => {
  it("answers every id asked in one tick with one search per kind", async () => {
    const h = harness({ userAccount: async () => ["u1"], team: async () => ["t1"] });
    const answers = Promise.all([h.load("userAccount", "u1"), h.load("userAccount", "u2"), h.load("userAccount", "u1"), h.load("team", "t1")]);
    h.flush();
    expect(await answers).toEqual(["live", "deleted", "live", "live"]);
    expect(h.asked.userAccount).toEqual([["u1", "u2"]]);
    expect(h.asked.team).toEqual([["t1"]]);
  });

  it("reads an id the search did not return as deleted", async () => {
    const h = harness({ userAccount: async () => [] });
    const answer = h.load("userAccount", "gone");
    h.flush();
    expect(await answer).toBe("deleted");
  });

  it("reads a refused search as every id of the kind unavailable", async () => {
    const h = harness({ userAccount: async () => Promise.reject(refused) });
    const answers = Promise.all([h.load("userAccount", "a"), h.load("userAccount", "b")]);
    h.flush();
    expect(await answers).toEqual(["unavailable", "unavailable"]);
  });

  it("decides nothing on any other failure", async () => {
    const h = harness({ userAccount: async () => Promise.reject(broken) });
    const answer = h.load("userAccount", "a");
    h.flush();
    await expect(answer).rejects.toBe(broken);
  });

  it("leaves a kind with no lookup live and asks nothing", async () => {
    const h = harness({});
    const answer = h.load("plan", "p1");
    h.flush();
    expect(await answer).toBe("live");
    expect(h.asked).toEqual({});
  });

  it("splits a long batch so no search asks about more than the batch size", async () => {
    const h = harness({ userAccount: async (ids) => ids });
    const ids = Array.from({ length: REFERENCE_BATCH_SIZE + 3 }, (_, i) => `u${i}`);
    const answers = Promise.all(ids.map((id) => h.load("userAccount", id)));
    h.flush();
    expect((await answers).every((state) => state === "live")).toBe(true);
    expect(h.asked.userAccount!.map((batch) => batch.length)).toEqual([REFERENCE_BATCH_SIZE, 3]);
  });

  it("opens a new batch after a flush", async () => {
    const h = harness({ userAccount: async () => ["a", "b"] });
    const first = h.load("userAccount", "a");
    h.flush();
    await first;
    const second = h.load("userAccount", "b");
    h.flush();
    expect(await second).toBe("live");
    expect(h.asked.userAccount).toEqual([["a"], ["b"]]);
  });
});

describe("a lookup built from a list call", () => {
  it("asks for the ids under <idField>.in in one page as large as the batch and reads the ids back", async () => {
    const { lookupFromList } = await import("./reference-state");
    const seen: unknown[] = [];
    const lookup = lookupFromList(async (params: { "userId.in"?: string; page?: number; size?: number }) => {
      seen.push(params);
      return { content: [{ userId: "u1", name: "Mira" }, { userId: null }] };
    }, "userId");
    expect(await lookup.find(["u1", "u2"])).toEqual(["u1"]);
    expect(seen).toEqual([{ "userId.in": "u1,u2", page: 0, size: 2 }]);
  });
});
