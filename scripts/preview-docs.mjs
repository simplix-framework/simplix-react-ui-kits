#!/usr/bin/env node
/**
 * Serves the documentation site the way GitHub Pages does: under /<name>/, with a folder for each
 * version, so the version selector and the redirect of the root can be seen before a deployment.
 *
 *   node scripts/preview-docs.mjs [--port 8764] [--release 1.2.3 ...]
 *
 * The build is published as "snapshot". Each --release publishes the same build once more under
 * that version, which gives the version selector something to switch to.
 */

import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDocs, loadConfig } from './build-docs.mjs';
import { prepareDocs } from './prepare-docs.mjs';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const valuesOf = flag => args.flatMap((arg, index) => (arg === flag && args[index + 1] ? [args[index + 1]] : []));
const port = Number(valuesOf('--port')[0] ?? 8764);
const releases = valuesOf('--release');

const built = buildDocs({ root });
if (built.problems.length > 0) {
  for (const problem of built.problems) console.error('  ' + problem);
  process.exit(1);
}
const prefix = '/' + loadConfig(root).name + '/';
const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'docs-preview-'));
const site = path.join(temporary, 'site');
prepareDocs({ previous: path.join(temporary, 'absent'), built: path.join(root, 'build-docs'), output: site, version: 'snapshot' });
for (const [index, version] of releases.entries()) {
  prepareDocs({ previous: site, built: path.join(root, 'build-docs'), output: path.join(temporary, 'site-' + index), version });
  fs.rmSync(site, { recursive: true });
  fs.renameSync(path.join(temporary, 'site-' + index), site);
}

const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.md': 'text/markdown', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.txt': 'text/plain' };
const server = http.createServer((request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    if (pathname === '/') {
      response.writeHead(302, { Location: prefix });
      response.end();
      return;
    }
    if (!pathname.startsWith(prefix)) throw new Error('Outside the site');
    let file = path.resolve(site, '.' + pathname.slice(prefix.length - 1));
    if (file !== site && !file.startsWith(site + path.sep)) throw new Error('Outside the site');
    if (fs.statSync(file).isDirectory()) {
      if (!pathname.endsWith('/')) {
        response.writeHead(301, { Location: pathname + '/' });
        response.end();
        return;
      }
      file = path.join(file, 'index.html');
    }
    const type = types[path.extname(file)] ?? 'application/octet-stream';
    // A preview is rebuilt often, so nothing of it may be served from the browser cache.
    response.writeHead(200, { 'Content-Type': /^(text|application\/json|image\/svg)/.test(type) ? type + '; charset=utf-8' : type, 'Cache-Control': 'no-store' });
    response.end(fs.readFileSync(file));
  } catch {
    response.writeHead(404);
    response.end('Not found');
  }
});
server.listen(port, '127.0.0.1', () => console.log('Documentation site: http://127.0.0.1:' + port + prefix));

function close() {
  server.close();
  fs.rmSync(temporary, { recursive: true, force: true });
  process.exit(0);
}
process.on('SIGTERM', close);
process.on('SIGINT', close);
