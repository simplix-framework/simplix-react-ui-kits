import { describe, expect, it } from "vitest";

import type { ContractField } from "./record-contract";
import { moneyMeter, type MoneyMeterContract } from "./money-meter";
import { METER_WARN_SHARE, meterTone, type RecordMeterValue } from "./record-meter";

const SPENT: ContractField = { name: "spentMicros", kind: "money", currency: "USD", scale: 6 };
const LIMIT: ContractField = { name: "limitMicros", kind: "money", currency: "USD", scale: 6 };

/** Draws a money field as dollars from its micro amount, as the contract does for scale 6. */
const contract: MoneyMeterContract = {
  value: (field, row) => `$${(Number(row?.[field.name] ?? 0) / 1_000_000).toFixed(2)}`,
};

function meterOf(row: Readonly<Record<string, unknown>>): RecordMeterValue {
  const value = moneyMeter(contract, SPENT, LIMIT, row);
  if (!value || typeof value !== "object" || !("meter" in value)) throw new Error(`no meter: ${JSON.stringify(value)}`);
  return value.meter;
}

describe("a spend read against its limit", () => {
  it("reads the spend alone, with no bar, where there is no limit", () => {
    expect(moneyMeter(contract, SPENT, LIMIT, { spentMicros: 12_400_000, limitMicros: 0 })).toBe("$12.40");
    expect(moneyMeter(contract, SPENT, LIMIT, { spentMicros: 12_400_000 })).toBe("$12.40");
  });
  it("draws both figures as money and is neutral below the warning share", () => {
    const meter = meterOf({ spentMicros: 10_000_000, limitMicros: 50_000_000 });
    expect(meter).toEqual({ value: 10_000_000, total: 50_000_000, text: "$10.00 / $50.00" });
    expect(meterTone(meter)).toBe("neutral");
  });
  it("turns amber at the warning share", () => {
    expect(meterTone(meterOf({ spentMicros: 50_000_000 * METER_WARN_SHARE, limitMicros: 50_000_000 }))).toBe("warning");
  });
  it("turns red at the limit", () => {
    expect(meterTone(meterOf({ spentMicros: 50_000_000, limitMicros: 50_000_000 }))).toBe("danger");
  });
  it("reads an absent spend as nothing spent", () => {
    expect(meterOf({ spentMicros: null, limitMicros: 50_000_000 })).toEqual({ value: 0, total: 50_000_000, text: "$0.00 / $50.00" });
    expect(meterOf({ limitMicros: 50_000_000 })).toEqual({ value: 0, total: 50_000_000, text: "$0.00 / $50.00" });
  });
});
