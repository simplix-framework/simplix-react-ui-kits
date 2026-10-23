#!/usr/bin/env node
// capture --url http://localhost:6106 --out captures [--modes light,dark] [--filter <regex>]
//         [--globals "detailPresentation:drawer;locale:ko"] [--concurrency 4] [--width 1280] [--height 800]
import { captureAll } from "../lib/capture.mjs";
import { parseArgs } from "../lib/fs-util.mjs";

const args = parseArgs(process.argv.slice(2));
if (!args.url || !args.out) {
  console.error("usage: capture --url <storybook url> --out <dir> [--modes light,dark] [--filter <regex>]");
  process.exit(2);
}
const report = await captureAll({
  url: String(args.url).replace(/\/$/, ""),
  out: args.out,
  modes: String(args.modes ?? "light,dark").split(","),
  globals: args.globals ? String(args.globals) : "",
  filter: args.filter ? new RegExp(args.filter) : undefined,
  concurrency: Number(args.concurrency ?? 4),
  viewport: { width: Number(args.width ?? 1280), height: Number(args.height ?? 800) },
  timeout: Number(args.timeout ?? 20000),
});
console.log(`${report.captured}/${report.stories * report.modes.length} captured, ${report.failures.length} failed, ${report.seconds}s`);
for (const f of report.failures.slice(0, 20)) console.log(`  ✖ ${f.mode} ${f.id}: ${f.error}`);
process.exitCode = report.failures.length > 0 ? 1 : 0;
