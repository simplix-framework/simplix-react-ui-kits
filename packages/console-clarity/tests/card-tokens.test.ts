import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * The geometry a list's cards read comes from tokens the kit's stylesheet carries, so a product
 * theme can map them onto its own; a card draws no width of its own.
 */
const tokens = readFileSync(join(__dirname, "../../console-core/src/styles/console-tokens.css"), "utf8");

describe("card tokens", () => {
  it("caps a card of the grid view at a length in rem and hands the cap to the framework's card", () => {
    expect(tokens).toMatch(/--console-card-max:\s*\d+(\.\d+)?rem;/);
    expect(tokens).toMatch(/--card-max-width:\s*var\(--console-card-max\);/);
  });

  it("caps the label column of a card's labelled lines at a length in rem", () => {
    expect(tokens).toMatch(/--console-card-label-max:\s*\d+(\.\d+)?rem;/);
  });
});
