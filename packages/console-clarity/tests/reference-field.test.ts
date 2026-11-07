import { describe, expect, it } from "vitest";

import { render } from "./template-typecheck";

const reference = { name: "voiceCode", contractKind: "reference", peekKind: "catalogVoice", nameField: "catalogVoiceName", peekBy: "voiceCode" };
const context = {
  entity: "speechResult",
  EntityPascal: "SpeechResult",
  entityPath: "/api/v1/speech-result",
  packageName: "@test/domain-speech",
  rowIdField: "speechResultId",
  hookList: "useListSpeechResult",
  hookGet: "useGetSpeechResult",
  listRowType: "SpeechResultListRow",
  listFields: [reference],
  detailFields: [reference],
  fields: [],
  contractFilters: [],
  holders: [],
};

describe("a reference the contract matches on a field other than the identifier", () => {
  it("names that field in the list and the detail", () => {
    for (const template of ["list.hbs", "detail.hbs"]) {
      expect(render(template, context)).toContain('peekKind: "catalogVoice", nameField: "catalogVoiceName", peekBy: "voiceCode"');
    }
  });
});

describe("a holder that names the record by another field than its key", () => {
  const holder = { entity: "speechResult", EntityPascal: "SpeechResult", key: "speechResultByVoiceCode", hookList: "useListSpeechResults", accessList: "listSpeechResultsAccess", packageName: "@test/domain-speech", filterKey: "voiceCode.equals", rowIdField: "speechResultId", fields: [] };
  const voice = { ...context, entity: "catalogVoice", EntityPascal: "CatalogVoice", rowIdField: "catalogVoiceId", hookGet: "useGetCatalogVoice" };

  it("is forced to that field of the open record, once the record has loaded", () => {
    const out = render("detail.hbs", { ...voice, holders: [{ ...holder, matchField: "voiceCode" }], holderColumnsHooks: [{ hook: "useSpeechResultColumns", from: "@test/speech-widgets", field: "voiceCode" }] });
    expect(out).toContain("?.voiceCode;");
    expect(out).not.toContain('"voiceCode.equals": props.catalogVoiceId');
    expect(out).toContain('enabled: holder0Allowed && holder0Forced["voiceCode.equals"] !== ""');
  });

  it("is forced to the record's key otherwise", () => {
    expect(render("detail.hbs", { ...voice, holders: [holder], holderColumnsHooks: [{ hook: "useSpeechResultColumns", from: "@test/speech-widgets", field: "catalogVoiceId" }] })).toContain('"voiceCode.equals": props.catalogVoiceId');
  });
});
