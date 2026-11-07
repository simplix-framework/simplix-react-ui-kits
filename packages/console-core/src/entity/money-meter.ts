import { recordValueText, type ContractField } from "./record-contract";
import type { RecordValue } from "./record-value";

/** The part of a record contract a money meter draws its figures with. */
export interface MoneyMeterContract {
  readonly value: (field: ContractField, row: Readonly<Record<string, unknown>> | undefined) => RecordValue;
}

/**
 * A spend read against its limit as the kit's meter, both figures drawn as their money fields draw
 * them (`$12.40 / $50.00`), amber from {@link METER_WARN_SHARE} of the limit and red at it. A spend
 * that is absent reads as nothing spent. With no limit there is no bar to fill, so the value is the
 * spend's text alone.
 *
 * @param contract the record contract that draws the money
 * @param spentField the money field holding what is spent
 * @param limitField the money field holding the limit
 * @param row the record
 * @returns the meter, or the spend's text where the record has no limit
 */
export function moneyMeter(
  contract: MoneyMeterContract,
  spentField: ContractField,
  limitField: ContractField,
  row: Readonly<Record<string, unknown>>,
): RecordValue {
  const amount = (field: ContractField): number => {
    const raw = row[field.name];
    return typeof raw === "number" ? raw : 0;
  };
  const text = (field: ContractField, value: number) => recordValueText(contract.value(field, { [field.name]: value }));
  const spent = amount(spentField);
  const limit = amount(limitField);
  if (!(limit > 0)) return text(spentField, spent);
  return { meter: { value: spent, total: limit, text: `${text(spentField, spent)} / ${text(limitField, limit)}` } };
}
