import assert from "node:assert/strict";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { frameworkPin, frameworkVersions } from "./framework-versions.mjs";

const LOCKFILE = `lockfileVersion: '9.0'

importers:

  .:
    devDependencies:
      turbo:
        specifier: ^2.0.0
        version: 2.5.0

  apps/storybook:
    dependencies:
      '@simplix-react/ui':
        specifier: workspace:*
        version: link:../../packages/ui
      storybook:
        specifier: 10.2.19
        version: 10.2.19(react@19.2.4)

  packages/ui:
    dependencies:
      lucide-react:
        specifier: ^1.12.0
        version: 1.12.0(react@19.2.4)
      react:
        specifier: ^19.2.4
        version: 19.2.4
    devDependencies:
      react:
        specifier: ^19.2.4
        version: 19.10.0-rc.1

packages:

  react@19.2.4:
    resolution: {integrity: x}
`;

function checkout() {
  const root = mkdtempSync(join(tmpdir(), "framework-versions-"));
  writeFileSync(join(root, "pnpm-lock.yaml"), LOCKFILE);
  return root;
}

test("reads the versions the packages and apps resolve, without the peer suffix", () => {
  const root = checkout();
  try {
    const resolved = frameworkVersions(root);
    assert.deepEqual([...resolved.get("lucide-react")], ["1.12.0"]);
    assert.deepEqual([...resolved.get("storybook")], ["10.2.19"]);
    assert.deepEqual([...resolved.get("react")].sort(), ["19.10.0-rc.1", "19.2.4"]);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("leaves out the workspace root's own tools and linked workspace packages", () => {
  const root = checkout();
  try {
    const resolved = frameworkVersions(root);
    assert.equal(resolved.has("turbo"), false);
    assert.equal(resolved.has("@simplix-react/ui"), false);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("pins the newest resolved version, by number and not by text", () => {
  const root = checkout();
  try {
    const resolved = frameworkVersions(root);
    assert.equal(frameworkPin(resolved, "react"), "19.10.0-rc.1");
    assert.equal(frameworkPin(resolved, "lucide-react"), "1.12.0");
    assert.equal(frameworkPin(resolved, "absent"), undefined);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("a checkout without a lockfile is refused", () => {
  const root = mkdtempSync(join(tmpdir(), "framework-versions-"));
  try {
    assert.throws(() => frameworkVersions(root), /no pnpm-lock\.yaml/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
