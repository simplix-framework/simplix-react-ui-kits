import { describe, expect, it } from "vitest";

import { lifecycleNodes } from "./record-lifecycle";

const steps = [
  { key: "queued", label: "Queued", at: "10:00" },
  { key: "running", label: "Running", at: "10:01" },
  { key: "finished", label: "Finished" },
];

describe("lifecycleNodes", () => {
  it("marks the steps reached as done and the last one as current while the record moves", () => {
    expect(lifecycleNodes(steps).map((node) => node.state)).toEqual(["done", "active", "pending"]);
  });
  it("marks the last reached step done once the record has ended, and the rest as never", () => {
    expect(lifecycleNodes(steps, { ended: true }).map((node) => node.state)).toEqual(["done", "done", "skip"]);
  });
  it("marks a step passed over as skipped", () => {
    const nodes = lifecycleNodes([{ key: "received", label: "Received", at: "1" }, { key: "processed", label: "Processed" }, { key: "failed", label: "Failed", at: "2", tone: "danger" }], { ended: true });
    expect(nodes.map((node) => node.state)).toEqual(["done", "skip", "done"]);
    expect(nodes[2]?.tone).toBe("danger");
  });
  it("draws each reached step's time beside it and no tone on a step not reached", () => {
    const nodes = lifecycleNodes([{ key: "a", label: "A", at: "10:00" }, { key: "b", label: "B", tone: "danger" }]);
    expect(nodes[0]?.trail).toBe("10:00");
    expect(nodes[1]?.tone).toBeUndefined();
  });
  it("leaves every step to come before anything is reached", () => {
    expect(lifecycleNodes(steps.map(({ key, label }) => ({ key, label }))).map((node) => node.state)).toEqual(["pending", "pending", "pending"]);
  });
});
