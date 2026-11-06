import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

/**
 * A reference the holding record names nothing for (a hold or a payment a ledger entry points at):
 * drawn as the referenced entity's label and the start of its id, still a link that opens the peek
 * and asks whether the record is gone, never a bare id with nothing to press.
 */

const labels: Record<string, string> = { "entity/creditHold": "Credit hold" };

vi.mock("@simplix-react/i18n/react", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@simplix-react/i18n/react")>()),
  useTranslation: () => ({
    t: (key: string, values?: Record<string, string>) => (key === "recordValue.unnamedReference" ? `${values?.label} ${values?.id}` : key),
    locale: "en",
    exists: () => true,
  }),
  useI18n: () => ({
    exists: (key: string, namespace: string) => key === "_label" && namespace in labels,
    tn: (namespace: string) => labels[namespace] ?? "",
  }),
  useLocale: () => "en",
}));

const { UIProvider } = await import("@simplix-react/ui");
const { useRecordContract } = await import("./record-contract");
type Field = import("./record-contract").ContractField;

function Probe(props: { field: Field; row: Record<string, unknown> }) {
  const contract = useRecordContract("credit-ledger-entry");
  return createElement("pre", null, JSON.stringify(contract.value(props.field, props.row)));
}

function read(field: Field, row: Record<string, unknown>) {
  const html = renderToStaticMarkup(createElement(UIProvider, { children: createElement(Probe, { field, row }) }));
  const json = /<pre>([\s\S]*)<\/pre>/.exec(html)?.[1] ?? "null";
  return JSON.parse(json.replace(/&quot;/g, '"').replace(/&amp;/g, "&").replace(/&#x27;/g, "'")) as Record<string, any>;
}

const HOLD_ID = "01a1af93-d95c-7d70-8717-59d3d608cd8c";
const hold: Field = { name: "creditHoldId", kind: "reference", peekKind: "creditHold" };

describe("a reference its record names nothing for", () => {
  it("is drawn as the target's label and the start of its id, as a link that asks whether it is gone", () => {
    const value = read(hold, { creditHoldId: HOLD_ID });
    expect(value.link).toBe("Credit hold 01a1af93");
    expect(value.check).toMatchObject({ kind: "creditHold", id: HOLD_ID });
    expect(value.check.gone.deleted.name).toBe("Credit hold 01a1af93");
    expect(value.check.gone.unavailable.reason).toBe("unavailable");
  });

  it("is drawn by its whole id where the target's catalog states no label", () => {
    const value = read({ name: "paymentEventId", kind: "reference", peekKind: "paymentEvent" }, { paymentEventId: HOLD_ID });
    expect(value.link).toBe(HOLD_ID);
    expect(value.check.kind).toBe("paymentEvent");
  });

  it("draws no avatar for a person nothing names", () => {
    const value = read({ name: "actorUserId", kind: "reference", peekKind: "userAccount" }, { actorUserId: "u1" });
    expect(value.avatar).toBeUndefined();
    expect(value.check.kind).toBe("userAccount");
  });

  it("keeps a by-kind value whose kind names nothing as plain text, never a dead link", () => {
    const subject: Field = { name: "subjectId", kind: "reference", peekKinds: { field: "jobType", kinds: { PAYMENT_EVENT: "paymentEvent" } } };
    const value = read(subject, { subjectId: "s1", jobType: "DATA_EXPORT" });
    expect(value.link).toBe("s1");
    expect(value.check).toBeUndefined();
    expect(read(subject, { subjectId: "s1", jobType: "PAYMENT_EVENT" }).check.kind).toBe("paymentEvent");
  });
});
