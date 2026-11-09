import { describe, expect, it } from "vitest";
import { moneyFieldOf, moneyText } from "./record-contract";

describe("a money field whose currency is a field of the row", () => {
  const field = { currencyField: "currencyCode" } as const;

  it("takes each row's currency and that currency's own smallest unit", () => {
    expect(moneyFieldOf(field, { currencyCode: "KRW" })).toEqual({ currency: "KRW", scale: 0 });
    expect(moneyFieldOf(field, { currencyCode: "usd" })).toEqual({ currency: "USD", scale: 2 });
  });

  it("writes won as won and dollars from cents in the reader's locale", () => {
    expect(moneyText(moneyFieldOf(field, { currencyCode: "KRW" }), 14_900, "en")).toBe("₩14,900");
    expect(moneyText(moneyFieldOf(field, { currencyCode: "USD" }), 1_200, "en")).toBe("$12.00");
  });

  it("keeps the field's own currency and scale when the row names none, or the field does not ask", () => {
    expect(moneyFieldOf(field, { currencyCode: "" })).toBe(field);
    expect(moneyFieldOf(field, undefined)).toBe(field);
    const own = { currency: "USD", scale: 6 } as const;
    expect(moneyFieldOf(own, { currencyCode: "KRW" })).toBe(own);
  });
});
