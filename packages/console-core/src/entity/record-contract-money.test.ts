import { describe, expect, it } from "vitest";
import { moneyAmount, moneyFilterTransform, moneyStored, moneyText } from "./record-contract";

const micros = { currency: "USD", scale: 6 } as const;

describe("money fields", () => {
  it("draws a stored whole number as currency in the reader's locale", () => {
    expect(moneyText(micros, 50_000_000, "en")).toBe("$50.00");
    expect(moneyText(micros, 1_200, "en")).toBe("$0.0012");
    expect(moneyText(micros, 50_250_000, "ko")).toBe("US$50.25");
    expect(moneyText({ currency: "KRW", scale: 0 }, 12_000, "ko")).toBe("₩12,000");
  });

  it("keeps the fractions of a cent in a cell, so the cells and the figure above them read the same total", () => {
    const rows = [0, 16, 15, 0, 17];
    expect(rows.map((micro) => moneyText(micros, micro, "en"))).toEqual(["$0.00", "$0.000016", "$0.000015", "$0.00", "$0.000017"]);
    const total = rows.reduce((sum, micro) => sum + micro, 0);
    expect(moneyText(micros, total, "en")).toBe("$0.000048");
    // A stored number the server wrote as text draws the same, in either language.
    expect(moneyText(micros, "81", "en")).toBe("$0.000081");
    expect(moneyText(micros, 81, "ko")).toBe("US$0.000081");
  });

  it("edits in the currency's units and writes the stored whole number back", () => {
    expect(moneyAmount(micros, 50_250_000)).toBe(50.25);
    expect(moneyStored(micros, 50.25)).toBe(50_250_000);
    expect(moneyStored(micros, "0.1")).toBe(100_000);
    expect(moneyStored(micros, "")).toBeNull();
    expect(moneyAmount(micros, null)).toBeNull();
  });

  it("sends a money filter's currency units as the stored whole number and leaves other filters alone", () => {
    const transform = moneyFilterTransform([
      { kind: "number", field: "amountUsdMicros", currency: "USD", scale: 6 },
      { kind: "number", field: "units" },
    ]);
    expect(transform?.({ "amountUsdMicros.greaterThanOrEqualTo": "1.5", "units.equals": "3", status: ["OPEN"] })).toEqual({
      "amountUsdMicros.greaterThanOrEqualTo": 1_500_000,
      "units.equals": "3",
      status: ["OPEN"],
    });
    expect(moneyFilterTransform([{ kind: "number", field: "units" }])).toBeUndefined();
  });
});
