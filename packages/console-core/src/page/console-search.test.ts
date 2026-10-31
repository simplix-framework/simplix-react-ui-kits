import { describe, expect, it } from "vitest";

import { validateConsoleSearch } from "./console-search";

describe("a console page's address", () => {
  it("keeps the explanation and the overlays it opens", () => {
    expect(validateConsoleSearch({ help: "lifecycle", gap: "a", grant: "b" })).toMatchObject({ help: "lifecycle", gap: "a", grant: "b" });
  });

  it("leaves out a field that is not text", () => {
    expect(validateConsoleSearch({ help: 3 })).not.toHaveProperty("help");
  });
});
