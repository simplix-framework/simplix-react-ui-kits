import { describe, expect, it } from "vitest";
import { stageGateVerdict } from "./stage-gate-verdict";

describe("stageGateVerdict", () => {
  it("enables a command whose conditions are all met", () => {
    expect(stageGateVerdict([{ state: "met" }, { state: "met" }])).toEqual({ enabled: true, met: 2, unmet: 0, held: 0, blockedBy: null });
  });

  it("enables a command with no conditions", () => {
    expect(stageGateVerdict([]).enabled).toBe(true);
  });

  it("disables on one unmet condition", () => {
    const verdict = stageGateVerdict([{ state: "met" }, { state: "unmet" }]);
    expect(verdict.enabled).toBe(false);
    expect(verdict.blockedBy).toBe("unmet");
  });

  it("keeps a held condition disabled and names it apart from unmet", () => {
    const verdict = stageGateVerdict([{ state: "met" }, { state: "held" }]);
    expect(verdict).toEqual({ enabled: false, met: 1, unmet: 0, held: 1, blockedBy: "held" });
  });

  it("reports unmet ahead of held when both stand", () => {
    const verdict = stageGateVerdict([{ state: "held" }, { state: "unmet" }]);
    expect(verdict.blockedBy).toBe("unmet");
    expect(verdict.held).toBe(1);
    expect(verdict.unmet).toBe(1);
  });
});
