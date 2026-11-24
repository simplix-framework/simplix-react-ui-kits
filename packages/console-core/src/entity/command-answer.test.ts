import { describe, expect, it, vi } from "vitest";

import { stageGateFromAnswer, verbsFromCommands } from "./command-answer";

describe("verbsFromCommands", () => {
  it("presses a command by the ref its answer carries", () => {
    const press = vi.fn();
    const [approve] = verbsFromCommands([{ ref: "Plan.approve", label: "Approve", kind: "primary" }], press);
    approve?.onClick?.();
    expect(press).toHaveBeenCalledWith("Plan.approve");
    expect(approve).toMatchObject({ label: "Approve", kind: "primary" });
    expect(approve).not.toHaveProperty("disabled");
  });

  it("keeps the server's reason and gives nothing to press where the answer has no ref", () => {
    const [later, blocked] = verbsFromCommands([{ label: "Close", kind: "plain" }, { ref: "Plan.close", label: "Close", kind: "plain", disabled: "Not reviewed" }], () => {});
    expect(later).not.toHaveProperty("onClick");
    expect(blocked?.disabled).toBe("Not reviewed");
  });
});

describe("stageGateFromAnswer", () => {
  const answer = {
    label: "Approve",
    conditions: [
      { key: "a", label: "Signed", state: "met" as const },
      { key: "b", label: "Evidence attached", state: "unmet" as const },
      { key: "c", label: "Rule interpreted", state: "held" as const },
    ],
  };

  it("draws nothing where the server answered no gate", () => {
    expect(stageGateFromAnswer(undefined, () => {})).toBeUndefined();
  });

  it("orders what is still to do first, then held, then met", () => {
    expect(stageGateFromAnswer(answer, () => {})?.conditions.map((one) => one.key)).toEqual(["b", "c", "a"]);
  });

  it("offers the way on an unmet condition alone", () => {
    const go = { label: "Open evidence", onClick: () => {} };
    const gate = stageGateFromAnswer(answer, () => {}, () => go);
    expect(gate?.conditions.find((one) => one.key === "b")?.go).toBe(go);
    expect(gate?.conditions.find((one) => one.key === "a")).not.toHaveProperty("go");
    expect(gate?.conditions.find((one) => one.key === "c")).not.toHaveProperty("go");
  });
});
