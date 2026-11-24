import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { buildDocs, docsifyIds, githubIds } from '../build-docs.mjs';
import { navigation, prepareDocs } from '../prepare-docs.mjs';

const temporary = t => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'docs-site-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  return root;
};
const put = (root, file, text) => {
  fs.mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
  fs.writeFileSync(path.join(root, file), text);
};

test('version context supports project sites, root sites and explicit index pages', () => {
  for (const url of ['https://example.test/project/1.1.1/', 'https://example.test/project/1.1.1/index.html']) {
    const result = navigation.context(url);
    assert.equal(result.current, '1.1.1');
    assert.equal(result.base.href, 'https://example.test/project/');
  }
  assert.equal(navigation.context('https://example.test/snapshot/').current, 'snapshot');
  assert.equal(navigation.context('http://localhost:3000/'), null);
  assert.equal(navigation.context('https://example.test/project/'), null);
});

test('manifest validation excludes traversal, prereleases and duplicates and sorts numerically', () => {
  assert.deepEqual(navigation.versions({ releases: ['1.9.0', '1.10.0', '../evil', '1.10.0', '2.0.0-RC1', 42], snapshot: 'snapshot' }),
    ['snapshot', '1.10.0', '1.9.0']);
  assert.deepEqual(navigation.versions({ releases: [], snapshot: '//evil.test' }), []);
  assert.throws(() => navigation.versions({ releases: '1.0.0' }));
});

test('a route names a page in any folder of a language and refuses anything else', () => {
  assert.equal(navigation.route('#/ko/').file, 'ko/README.md');
  assert.equal(navigation.route('#/ko/guides/').file, 'ko/guides/README.md');
  assert.equal(navigation.route('#/en/guides/form-hooks?id=step-1').file, 'en/guides/form-hooks.md');
  assert.equal(navigation.route('#/en/packages/gantt-core/README.md').file, 'en/packages/gantt-core/README.md');
  for (const hash of ['#/ko/../../secret', '#/ko/guides/../../../secret', '#/de/guides/', '#/ko/a.b/c', '#//evil.test/x']) {
    assert.deepEqual(navigation.route(hash), { hash: '#/en/', file: 'en/README.md', language: 'en' });
  }
});

test('navigation preserves language, document and heading within the deployment prefix', () => {
  const base = new URL('https://example.test/project/');
  assert.equal(navigation.target(base, '1.10.0', '#/ko/guides/form-hooks.md?id=search').href,
    'https://example.test/project/1.10.0/#/ko/guides/form-hooks.md?id=search');
  assert.throws(() => navigation.target(base, '../evil', '#/ko/'));
});

test('release deployment retains snapshot, replaces same version and updates archived navigation', t => {
  const root = temporary(t);
  const previous = path.join(root, 'previous'), built = path.join(root, 'built'), output = path.join(root, 'output');
  const html = '<html><head><title>Project Documentation</title></head><body><!-- Docsify core --><script src="https://cdn.test/docsify@4"></script><!-- Version selector --><script>oldSelector();</script></body></html>';
  for (const directory of [path.join(previous, 'snapshot'), path.join(previous, '1.9.0'), path.join(previous, '1.10.0'), built]) {
    put(directory, 'index.html', html);
  }
  put(previous, '1.10.0/obsolete.md', 'old');
  put(built, 'new.md', 'new');
  assert.deepEqual(prepareDocs({ previous, built, output, version: '1.10.0' }), { releases: ['1.10.0', '1.9.0'], snapshot: 'snapshot' });
  assert.ok(fs.existsSync(path.join(output, 'snapshot', 'index.html')));
  assert.ok(!fs.existsSync(path.join(output, '1.10.0', 'obsolete.md')));
  assert.ok(fs.existsSync(path.join(output, '1.10.0', 'new.md')));
  const archived = fs.readFileSync(path.join(output, '1.9.0', 'index.html'), 'utf8');
  assert.ok(!archived.includes('oldSelector'));
  assert.ok(archived.indexOf('assets/version-selector.js') < archived.indexOf('<!-- Docsify core -->'));
  const redirect = fs.readFileSync(path.join(output, 'index.html'), 'utf8');
  assert.match(redirect, /location\.hash/);
  assert.match(redirect, /\.\/1\.10\.0\//);
  assert.match(redirect, /<title>Project Documentation<\/title>/);
  assert.throws(() => prepareDocs({ previous, built, output, version: '../outside' }));
});

test('a heading has one id on the repository host and another in Docsify', () => {
  const headings = ['1. Colours, fonts (and radius)', 'Layout  ·  behaviour', 'Using `useList`', 'Setup', 'Setup', '[Linked](./x.md) title', "Don't return `Promise<T>` & **more**", 'The snake_case key'];
  assert.deepEqual(githubIds(headings), ['1-colours-fonts-and-radius', 'layout----behaviour', 'using-uselist', 'setup', 'setup-1', 'linked-title', 'dont-return-promiset--more', 'the-snake_case-key']);
  assert.deepEqual(docsifyIds(headings), ['_1-colours-fonts-and-radius', 'layout-·-behaviour', 'using-uselist', 'setup', 'setup-1', 'linked-title', 'don39t-return-promiselttgt-amp-more', 'the-snake_case-key']);
});

/** A repository with two languages, one document that has both and one that has English only. */
function fixture(t, sidebar = { en: ['README', 'guides/README', 'guides/usage', 'packages/kit/README', 'tools/cli/README'] }) {
  const root = temporary(t);
  put(root, 'package.json', JSON.stringify({ version: '1.2.3-SNAPSHOT' }));
  put(root, 'docs/site.json', JSON.stringify({
    name: 'project', description: 'A project', repository: 'https://example.test/owner/project', branch: 'main',
    title: 'Project', badge: ['Pro-ject', 'UI Kit'], languages: ['en', 'ko'], homes: ['README.md'], documents: ['packages/*/README.md', 'tools/cli/README.md'],
    theme: { color: '#112233', cover: '#eee', coverTitle: '#111', coverText: '#222', button: '#333', buttonHover: '#444' },
  }));
  put(root, 'docs/index.html', '<html><head><title>{{TITLE}} Documentation</title></head><body>{{NAME}} {{HOME}} {{THEME_COLOR}} {{BADGE}}<!-- Docsify core --><script src="https://cdn.test/docsify@4"></script></body></html>');
  put(root, 'docs/_coverpage.md', '# {{NAME}} {{VERSION}} {{VERSION_BADGE}}\n');
  put(root, 'docs/_navbar.md', '* [English](/en/README.md)\n');
  put(root, 'docs/assets/figure.en.svg', '<svg/>');
  put(root, 'docs/assets/logo.png', 'png');
  put(root, 'docs/en/notes.txt', 'notes');
  put(root, 'README.md', '# Project\n');
  put(root, 'LICENSE', 'licence');
  put(root, 'docs/en/README.md', '# Home\n\n[Guides](./guides/README.md) [Kit](../../packages/kit/README.md) [CLI](../../tools/cli/README.md) [Notes](./notes.txt) [Licence](../../LICENSE) [Source](../../packages/kit)\n');
  put(root, 'docs/ko/README.md', '# 홈\n');
  put(root, 'docs/en/guides/README.md', '# Guides\n\n[Usage](./usage.md#2-run-it)\n');
  put(root, 'docs/ko/guides/README.md', '# 가이드\n\n[사용](./usage.md#2-실행하기)\n');
  put(root, 'docs/en/guides/usage.md', [
    '# Usage', '', '**English** | [한국어](../../ko/guides/usage.md)', '', '[Step two](#2-run-it) [Home](../../../README.md) `[kept](./missing.md)`',
    '', '![Figure with items[]](../../assets/figure.en.svg)', '', '<img src="../../assets/logo.png" alt="logo" />', '',
    '## 1. Install it', '', '```md', '[kept](./missing.md)', '```', '', '## 2. Run it', '',
  ].join('\n'));
  put(root, 'docs/ko/guides/usage.md', '# 사용\n\n## 1. 설치하기\n\n## 2. 실행하기\n');
  put(root, 'packages/kit/README.md', '# kit\n\n[English](./README.md) | [한국어](./README.ko.md) [Usage](../../docs/en/guides/usage.md)\n');
  put(root, 'packages/kit/README.ko.md', '# kit\n\n[사용](../../docs/ko/guides/usage.md)\n');
  put(root, 'tools/cli/README.md', '# cli\n\n[Run it](../../docs/en/guides/usage.md#2-run-it) [Kit](../../packages/kit/README.md)\n');
  for (const language of ['en', 'ko']) {
    const order = sidebar[language] ?? sidebar.en;
    put(root, 'docs/' + language + '/_sidebar.md', order.map(name => '* [' + name + '](/' + language + '/' + name + '.md)').join('\n') + '\n');
  }
  return root;
}

test('the build places every document and rewrites every link to its place in the site', t => {
  const root = fixture(t);
  const result = buildDocs({ root });
  assert.deepEqual(result.problems, []);
  assert.equal(result.ref, 'main');
  const page = file => fs.readFileSync(path.join(root, 'build-docs', file), 'utf8');

  const home = page('en/README.md');
  assert.match(home, /\[Guides\]\(\/en\/guides\/README\.md\)/);
  assert.match(home, /\[Kit\]\(\/en\/packages\/kit\/README\.md\)/);
  assert.match(home, /\[Notes\]\(en\/notes\.txt ':ignore'\)/);
  assert.match(home, /\[Licence\]\(https:\/\/example\.test\/owner\/project\/blob\/main\/LICENSE\)/);
  assert.match(home, /\[Source\]\(https:\/\/example\.test\/owner\/project\/tree\/main\/packages\/kit\)/);

  const usage = page('en/guides/usage.md');
  assert.match(usage, /\[한국어\]\(\/ko\/guides\/usage\.md\)/);
  assert.match(usage, /\[Step two\]\(#_2-run-it\)/);
  assert.match(usage, /\[Home\]\(\/en\/README\.md\)/);
  assert.match(usage, /!\[Figure with items\[\]\]\(\.\.\/\.\.\/assets\/figure\.en\.svg\)/);
  assert.match(usage, /<img src="assets\/logo\.png" alt="logo" \/>/);
  assert.equal(usage.split('[kept](./missing.md)').length - 1, 2, 'code is left as written');
  assert.match(usage, /blob\/main\/docs\/en\/guides\/usage\.md" target="_blank" rel="noopener noreferrer">Edit on GitHub</);

  assert.match(page('en/guides/README.md'), /\[Usage\]\(\/en\/guides\/usage\.md#_2-run-it\)/);
  assert.match(page('ko/guides/README.md'), /\[사용\]\(\/ko\/guides\/usage\.md#_2-실행하기\)/);
  assert.match(page('en/packages/kit/README.md'), /\[English\]\(\/en\/packages\/kit\/README\.md\) \| \[한국어\]\(\/ko\/packages\/kit\/README\.md\)/);
  assert.match(page('ko/packages/kit/README.md'), /blob\/main\/packages\/kit\/README\.ko\.md/);

  // A document with no Korean file is published in Korean as written, and leads to Korean pages.
  const cli = page('ko/tools/cli/README.md');
  assert.match(cli, /\[Run it\]\(\/ko\/guides\/usage\.md#_2-실행하기\)/);
  assert.match(cli, /\[Kit\]\(\/ko\/packages\/kit\/README\.md\)/);
  assert.match(page('en/tools/cli/README.md'), /\[Run it\]\(\/en\/guides\/usage\.md#_2-run-it\)/);

  assert.equal(page('index.html').includes('{{'), false);
  assert.match(page('index.html'), /<title>Project Documentation<\/title>/);
  assert.match(page('index.html'), /badge\/Pro--ject-UI_Kit-112233\?style=for-the-badge/);
  assert.match(page('_coverpage.md'), /1\.2\.3-SNAPSHOT 1\.2\.3--SNAPSHOT/);
  assert.equal(page('_sidebar.md'), page('en/_sidebar.md'));
  assert.ok(fs.existsSync(path.join(root, 'build-docs', '.nojekyll')));
});

test('a release build links to the sources of its tag', t => {
  const result = buildDocs({ root: fixture(t), version: '1.2.3' });
  assert.equal(result.ref, 'v1.2.3');
});

test('the build reports a link that leads nowhere, a missing heading and a sidebar that disagrees', t => {
  const root = fixture(t, { en: ['README', 'guides/README', 'guides/usage', 'packages/kit/README', 'tools/cli/README'], ko: ['README', 'guides/usage', 'guides/README', 'packages/kit/README'] });
  put(root, 'docs/en/guides/README.md', '# Guides\n\n[Gone](./gone.md) [No heading](./usage.md#3-nothing) [Root](/en/README.md)\n');
  const { problems } = buildDocs({ root });
  assert.deepEqual(problems, [
    'docs/en/guides/README.md: ./gone.md leads nowhere',
    'docs/en/guides/README.md: no heading for ./usage.md#3-nothing',
    'docs/en/guides/README.md: /en/README.md starts at the site root: write a relative path',
    'docs/ko/_sidebar.md: lists /ko/tools/cli/README.md 0 times',
    'docs/ko/_sidebar.md: the order differs from docs/en/_sidebar.md',
  ]);
});
