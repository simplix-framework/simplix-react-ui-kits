import { describe, expect, it } from "vitest";

import { refusalPageFor } from "./refusal-page";

const Conflict = () => null;

describe("refusalPageFor", () => {
  it("names the page for a refusal the app lists, and none for any other or for no refusal", () => {
    const pages = { IDENTITY_CONFLICT: Conflict };
    expect(refusalPageFor(pages, { errorCode: "IDENTITY_CONFLICT" })).toBe(Conflict);
    expect(refusalPageFor(pages, { errorCode: "OTHER" })).toBeUndefined();
    expect(refusalPageFor(pages, null)).toBeUndefined();
    expect(refusalPageFor(undefined, { errorCode: "IDENTITY_CONFLICT" })).toBeUndefined();
  });

  it("never resolves a code through the object's prototype", () => {
    expect(refusalPageFor({}, { errorCode: "constructor" })).toBeUndefined();
  });
});
