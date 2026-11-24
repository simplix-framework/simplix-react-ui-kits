// Runs a product's check stages one after another and reports every failure together. A chain of
// commands joined by `&&` stops at the first failure and hides the stages behind it, so one
// cluster's unfinished file masks every other stage's result; here each stage runs whatever the
// stages before it did, and the run fails when any of them failed.
import { spawnSync } from "node:child_process";
import { delimiter, join, resolve } from "node:path";

/**
 * The environment a stage runs in: the caller's, with the root's own `node_modules/.bin` first on the
 * path, so a stage names a command the root installs (`simplix-mockup`, `tsc`) however the run was
 * started.
 */
export function stageEnvironment(cwd = process.cwd(), env = process.env) {
  const key = Object.keys(env).find((name) => name.toUpperCase() === "PATH") ?? "PATH";
  return { ...env, [key]: [join(resolve(cwd), "node_modules", ".bin"), env[key]].filter(Boolean).join(delimiter) };
}

/**
 * Checks the shape of the stage list a root declares.
 *
 * @param {unknown} stages the `checkStages` value of `mockup.config.json`
 * @returns {string[]} one problem per malformed stage; empty when the list is usable
 */
export function stageProblems(stages) {
  if (!Array.isArray(stages) || stages.length === 0) return ["checkStages is empty: list the stages as [{ name, command }]"];
  const problems = [];
  const names = new Set();
  stages.forEach((stage, index) => {
    const label = typeof stage?.name === "string" && stage.name !== "" ? `"${stage.name}"` : `#${index + 1}`;
    if (typeof stage?.name !== "string" || stage.name === "") problems.push(`stage #${index + 1} has no name`);
    else if (names.has(stage.name)) problems.push(`stage ${label} is listed twice`);
    else names.add(stage.name);
    if (typeof stage?.command !== "string" || stage.command === "") problems.push(`stage ${label} has no command`);
  });
  return problems;
}

/**
 * Runs every stage, in order, none skipped for an earlier failure.
 *
 * @param {{ name: string, command: string }[]} stages the stages to run
 * @param {{ cwd?: string, run?: (command: string, cwd?: string) => { status: number | null, signal?: string | null }, log?: (line: string) => void }} [options]
 *   `run` executes one command and returns its exit status (a shell, output inherited by default)
 * @returns {{ results: { name: string, command: string, status: number, seconds: number }[], failed: { name: string, status: number }[] }}
 */
export function runStages(stages, options = {}) {
  const log = options.log ?? ((line) => console.log(line));
  const run = options.run ?? ((command, cwd) => spawnSync(command, { cwd, shell: true, stdio: "inherit", env: stageEnvironment(cwd) }));
  const results = [];
  for (const stage of stages) {
    log(`\n▶ ${stage.name}`);
    const started = Date.now();
    const outcome = run(stage.command, options.cwd);
    // A process killed by a signal has no status; it counts as failed.
    const status = outcome.status ?? 1;
    results.push({ name: stage.name, command: stage.command, status, seconds: Math.round((Date.now() - started) / 100) / 10 });
  }
  return { results, failed: results.filter((result) => result.status !== 0).map(({ name, status }) => ({ name, status })) };
}

/**
 * The closing report: one line per stage, then the stages that failed, repeated so they are the
 * last thing a long run prints.
 *
 * @param {{ results: { name: string, status: number, seconds: number }[], failed: { name: string, status: number }[] }} outcome
 * @returns {string[]} the lines to print
 */
export function summaryLines({ results, failed }) {
  const lines = ["", "check summary"];
  for (const result of results) lines.push(`  ${result.status === 0 ? "✔" : "✖"} ${result.name} (${result.seconds}s${result.status === 0 ? "" : `, exit ${result.status}`})`);
  lines.push(failed.length === 0 ? `all ${results.length} stages passed` : `${failed.length} of ${results.length} stages failed: ${failed.map((one) => one.name).join(", ")}`);
  return lines;
}
