import { describe, expectTypeOf, it } from "vitest";

import type { SiteLinkProps } from "./site-link";

describe("SiteLinkProps", () => {
  it("carries no ref, so an app on its own copy of the React types can hand the props to its anchor", () => {
    expectTypeOf<SiteLinkProps>().not.toHaveProperty("ref");
    expectTypeOf<SiteLinkProps>().toHaveProperty("href").toEqualTypeOf<string>();
  });
});
