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
