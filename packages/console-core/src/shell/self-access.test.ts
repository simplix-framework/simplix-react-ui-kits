import { describe, expect, it } from "vitest";

import { createSelfAccessPolicy, currentSelfAccessRefusal } from "./self-access";

const GRANTS = { body: { userId: "u-1", username: "operator", permissions: {}, roles: [] } };

function refused(status: number, body: unknown) {
  return Object.assign(new Error("refused"), { status, body: JSON.stringify(body) });
}

describe("currentSelfAccessRefusal", () => {
  it("names the status and error code of a refused self read, and clears on the next answer", async () => {
    let answer: () => Promise<unknown> = () => Promise.reject(refused(409, { errorCode: "CODE_A" }));
    const policy = createSelfAccessPolicy({ endpoint: "/me", fetchFn: () => answer() });

    await policy.update("token").catch(() => undefined);
    expect(currentSelfAccessRefusal()).toEqual({ status: 409, errorCode: "CODE_A" });

    answer = () => Promise.resolve(GRANTS);
    await policy.update("token");
    expect(currentSelfAccessRefusal()).toBeNull();
  });

  it("reads the code from an envelope-aware error's own field", async () => {
    const error = Object.assign(new Error("refused"), { status: 409, errorCode: "CODE_B" });
    const policy = createSelfAccessPolicy({ endpoint: "/me", fetchFn: () => Promise.reject(error) });

    await policy.update("token").catch(() => undefined);
    expect(currentSelfAccessRefusal()).toEqual({ status: 409, errorCode: "CODE_B" });
  });
});
