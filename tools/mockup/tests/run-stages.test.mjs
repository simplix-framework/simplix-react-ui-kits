// Hit and miss cases for lib/run-stages.mjs: a failing stage must not hide the stages behind it,
// and a run of passing stages must stay quiet.
import assert from "node:assert/strict";
import { chmodSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { delimiter, join } from "node:path";
import { describe, it } from "node:test";
import { runStages, stageEnvironment, stageProblems, summaryLines } from "../lib/run-stages.mjs";

/** A runner that answers each command with the status the table gives it and records the order. */
const fake = (statuses, ran = []) => (command) => {
  ran.push(command);
  return { status: statuses[command] ?? 0 };
};

describe("runStages", () => {
  const stages = [
    { name: "format", command: "a" },
    { name: "types", command: "b" },
    { name: "menu", command: "c" },
  ];

  it("runs every stage after one failed and reports all failures together", () => {
    const ran = [];
    const { results, failed } = runStages(stages, { run: fake({ a: 1, c: 3 }, ran), log: () => undefined });
    assert.deepEqual(ran, ["a", "b", "c"]);
    assert.deepEqual(failed, [{ name: "format", status: 1 }, { name: "menu", status: 3 }]);
    assert.equal(results.length, 3);
  });

  it("reports no failure when every stage passes", () => {
    const { failed } = runStages(stages, { run: fake({}), log: () => undefined });
    assert.deepEqual(failed, []);
  });

  it("counts a stage killed by a signal as failed", () => {
    const { failed } = runStages([{ name: "types", command: "b" }], { run: () => ({ status: null, signal: "SIGKILL" }), log: () => undefined });
    assert.deepEqual(failed, [{ name: "types", status: 1 }]);
  });

  it("runs a real command through the shell and reads its exit status", () => {
    const { failed } = runStages([{ name: "ok", command: "node -e \"process.exit(0)\"" }, { name: "bad", command: "node -e \"process.exit(4)\"" }, { name: "after", command: "node -e \"process.exit(0)\"" }], { log: () => undefined });
    assert.deepEqual(failed, [{ name: "bad", status: 4 }]);
  });
});

describe("summaryLines", () => {
  it("names the failed stages on the last line", () => {
    const lines = summaryLines({ results: [{ name: "a", status: 1, seconds: 1 }, { name: "b", status: 0, seconds: 2 }], failed: [{ name: "a", status: 1 }] });
    assert.match(lines.at(-1), /1 of 2 stages failed: a/);
    assert.ok(lines.some((line) => line.includes("✖ a")) && lines.some((line) => line.includes("✔ b")));
  });

  it("says all passed when none failed", () => {
    assert.match(summaryLines({ results: [{ name: "a", status: 0, seconds: 0 }], failed: [] }).at(-1), /all 1 stages passed/);
  });
});

describe("stageProblems", () => {
  it("accepts a list of named stages with commands", () => {
    assert.deepEqual(stageProblems([{ name: "a", command: "x" }]), []);
  });

  it("refuses a missing list, an unnamed or commandless stage and a repeated name", () => {
    assert.equal(stageProblems(undefined).length, 1);
    assert.equal(stageProblems([]).length, 1);
    assert.ok(stageProblems([{ command: "x" }]).some((p) => /no name/.test(p)));
    assert.ok(stageProblems([{ name: "a" }]).some((p) => /no command/.test(p)));
    assert.ok(stageProblems([{ name: "a", command: "x" }, { name: "a", command: "y" }]).some((p) => /twice/.test(p)));
  });
});

describe("stageEnvironment", () => {
  it("puts the root's node_modules/.bin first and keeps the caller's path behind it", () => {
    const env = stageEnvironment("/root", { PATH: "/usr/bin", HOME: "/home" });
    assert.equal(env.PATH, ["/root/node_modules/.bin", "/usr/bin"].join(delimiter));
    assert.equal(env.HOME, "/home");
  });

  it("writes the path under the name the caller's environment uses", () => {
    const env = stageEnvironment("/root", { Path: "C:/bin" });
    assert.equal(env.Path, ["/root/node_modules/.bin", "C:/bin"].join(delimiter));
    assert.equal("PATH" in env, false);
  });

  it("lets a stage name a command the root installs, and still fails for one it does not", () => {
    const root = mkdtempSync(join(tmpdir(), "run-stages-"));
    try {
      mkdirSync(join(root, "node_modules", ".bin"), { recursive: true });
      const tool = join(root, "node_modules", ".bin", "root-tool");
      writeFileSync(tool, "#!/bin/sh\nexit 0\n");
      chmodSync(tool, 0o755);
      const { failed } = runStages([{ name: "installed", command: "root-tool" }, { name: "absent", command: "no-such-root-tool 2>/dev/null" }], { cwd: root, log: () => undefined });
      assert.deepEqual(failed.map((one) => one.name), ["absent"]);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});
