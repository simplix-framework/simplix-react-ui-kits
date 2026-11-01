import { describe, expect, it } from "vitest";

import { CONTRACT_COLUMN_SIZE, jsonText } from "./record-contract";

describe("a json contract field", () => {
  it("draws an object as indented JSON rather than as [object Object]", () => {
    expect(jsonText({ event_id: "evt_1", data: { id: "sub_1" } })).toBe('{\n  "event_id": "evt_1",\n  "data": {\n    "id": "sub_1"\n  }\n}');
    expect(jsonText([1, 2])).toBe("[\n  1,\n  2\n]");
  });

  it("keeps text it is handed as it is", () => {
    expect(jsonText('{"a":1}')).toBe('{"a":1}');
  });

  it("takes a wrapping column", () => {
    expect(CONTRACT_COLUMN_SIZE.json.wrap).toBe(true);
  });
});
