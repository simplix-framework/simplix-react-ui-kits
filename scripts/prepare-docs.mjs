#!/usr/bin/env node
/**
 * Combines the published site with a new build into the tree GitHub Pages serves.
 *
 *   node scripts/prepare-docs.mjs <previous site> <built site> <output> <snapshot|x.y.z>
 *
 * The folder of the given version is replaced by the build and every other version folder of the
 * previous site is kept, except that a release line (2.x, 1.x) keeps its newest release only.
 * Every folder then takes the current shell of the site (index.html, the shared assets and the
 * settings of this library), so an archived version looks and navigates like the newest one.
 * versions.json and the redirect of the root are written last.
 *
 * This file is the same in every SimpliX documentation repository.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const docsDir = fileURLToPath(new URL('../docs/', import.meta.url));
const selector = path.join(docsDir, 'assets', 'version-selector.js');
const folder = /^(?:snapshot|\d+\.\d+\.\d+(?:-SNAPSHOT)?)$/;
/** What a version folder takes from the current site, relative to docs/ and to the folder. */
const SHELL = ['index.html', 'assets/site', 'assets/site-config.js', 'assets/version-selector.js'];

/** The version selector is a browser script; its path arithmetic is read here without a window. */
function loadNavigation() {
  const module = { exports: {} };
  new Function('module', fs.readFileSync(selector, 'utf8'))(module);
  return module.exports;
}
export const navigation = loadNavigation();

/** The newest release of each major line, newest line first. */
export function lineLatest(releases) {
  const lines = new Set();
  return navigation.versions({ releases, snapshot: null }).filter(version => {
    const line = version.split('.')[0];
    if (lines.has(line)) return false;
    lines.add(line);
    return true;
  });
}

/** The language folders of a version: two letters, with a home page. */
function languagesOf(directory) {
  return fs.readdirSync(directory, { withFileTypes: true })
    .filter(entry => entry.isDirectory() && /^[a-z]{2}$/.test(entry.name) && fs.existsSync(path.join(directory, entry.name, 'README.md')))
    .map(entry => entry.name)
    .sort();
}

function versionFolders(root) {
  return fs.readdirSync(root, { withFileTypes: true })
    .filter(entry => entry.isDirectory() && folder.test(entry.name) && fs.existsSync(path.join(root, entry.name, 'index.html')))
    .map(entry => entry.name);
}

export function prepareDocs({ previous, built, output, version }) {
  if (!/^(?:snapshot|\d+\.\d+\.\d+)$/.test(version)) throw new Error('Invalid documentation version');
  for (const input of [previous, built]) {
    const relative = path.relative(path.resolve(input), path.resolve(output));
    if (!relative || (!relative.startsWith('..') && !path.isAbsolute(relative))) throw new Error('Output must be outside source directories');
  }
  if (!fs.existsSync(path.join(built, 'index.html'))) throw new Error('Missing built documentation');
  fs.mkdirSync(output, { recursive: true });
  if (fs.existsSync(previous)) {
    for (const name of versionFolders(previous)) fs.cpSync(path.join(previous, name), path.join(output, name), { recursive: true });
  }
  const destination = path.join(output, version);
  fs.rmSync(destination, { recursive: true, force: true });
  fs.cpSync(built, destination, { recursive: true });

  // A release line keeps its newest release.
  const kept = new Set(lineLatest(versionFolders(output)));
  for (const name of versionFolders(output)) {
    if (name !== 'snapshot' && !kept.has(name)) fs.rmSync(path.join(output, name), { recursive: true, force: true });
  }

  const directories = versionFolders(output);
  const sorted = navigation.versions({ releases: directories, snapshot: directories.includes('snapshot') ? 'snapshot' : null });
  const manifest = { releases: sorted.filter(name => name !== 'snapshot'), snapshot: sorted.includes('snapshot') ? 'snapshot' : null };

  // Every version takes the current shell and says which languages it has.
  for (const directory of directories) {
    const base = path.join(output, directory);
    for (const item of SHELL) {
      const source = path.join(docsDir, item);
      if (!fs.existsSync(source)) continue;
      const target = path.join(base, item);
      fs.rmSync(target, { recursive: true, force: true });
      fs.mkdirSync(path.dirname(target), { recursive: true });
      fs.cpSync(source, target, { recursive: true });
    }
    const settings = path.join(base, 'assets', 'site-config.js');
    if (fs.existsSync(settings)) {
      fs.appendFileSync(settings, '\n/* The languages this version has. */\nwindow.SIMPLIX_FOLDER = ' + JSON.stringify({ languages: languagesOf(base) }) + ';\n');
    }
  }

  fs.writeFileSync(path.join(output, 'versions.json'), JSON.stringify(manifest, null, 2) + '\n');
  const preferred = manifest.releases[0] || manifest.snapshot;
  const title = /<title>([^<]*)<\/title>/.exec(fs.readFileSync(path.join(built, 'index.html'), 'utf8'))?.[1] ?? 'Documentation';
  fs.writeFileSync(path.join(output, 'index.html'), `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>${title}</title>
<meta http-equiv="refresh" content="0; url=./${preferred}/">
<script>location.replace('./${preferred}/' + location.search + location.hash);</script></head>
<body><a href="./${preferred}/">Open documentation</a></body></html>\n`);
  fs.writeFileSync(path.join(output, '.nojekyll'), '');
  return manifest;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const [previous, built, output, version] = process.argv.slice(2);
  if (![previous, built, output, version].every(Boolean)) throw new Error('Usage: node scripts/prepare-docs.mjs <previous> <built> <output> <snapshot|x.y.z>');
  console.log(JSON.stringify(prepareDocs({ previous, built, output, version }), null, 2));
}
