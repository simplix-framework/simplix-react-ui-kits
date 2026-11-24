#!/usr/bin/env node
/**
 * Assembles the Docsify site under build-docs/ from the documents of the repository.
 *
 *   docs/{language}/**   -> {language}/**
 *   docs/assets/**       -> assets/**
 *   a document that docs/site.json lists under "documents", such as packages/x/README.md with
 *   its packages/x/README.ko.md beside it
 *                        -> {language}/packages/x/README.md
 *
 * A listed document that has no file of a language is published under that language as written.
 * Every link and image is resolved against the source file it is written in and rewritten to the
 * place its target takes in the site, so a document reads the same on the repository host and on
 * the site. A link to a heading is rewritten from the anchor of the repository host to the id
 * Docsify gives that heading. A link whose target exists nowhere fails the build.
 *
 *   node scripts/build-docs.mjs        DOCS_VERSION overrides the version of package.json
 */

import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, posix } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const REPOSITORY_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SOURCE_LINK = { en: 'Edit on GitHub', ko: 'GitHub에서 편집' };
const EXTERNAL = /^([a-z][a-z0-9+.-]*:|\/\/)/i;
// The text of a link may hold one level of brackets: an image, or a name such as items[].
const LINK = /(!?)\[((?:[^[\]]|\[[^[\]]*\])*)\]\(\s*<?([^)\s>]+)>?(\s+"[^"]*")?\s*\)/g;
const IMAGE_TAG = /(<img\b[^>]*?\bsrc=")([^"]+)(")/g;
const CODE_SPAN = /(`+)[\s\S]*?\1/g;
const DOCSIFY_REMOVED = /[\u2000-\u206F\u2E00-\u2E7F\\'!"#$%&()*+,./:;<=>?@[\]^`{|}~]/g;

// A character of the private use area stands in for a code span while the links of a line are read.
const MASK = String.fromCharCode(0xe000);
const MASKED = new RegExp(MASK + '(\\d+)' + MASK, 'g');

const read = path => readFileSync(path, 'utf8');
const isFile = path => existsSync(path) && statSync(path).isFile();
const isPage = path => path.endsWith('.md') && !posix.basename(path).startsWith('_');
const escapeRegExp = text => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** The files under a folder, as paths from the repository root. */
function filesUnder(root, dir) {
  const full = join(root, dir);
  if (!existsSync(full)) return [];
  return readdirSync(full, { withFileTypes: true })
    .filter(entry => !entry.name.startsWith('.'))
    .sort((a, b) => (a.name < b.name ? -1 : 1))
    .flatMap(entry => (entry.isDirectory() ? filesUnder(root, posix.join(dir, entry.name)) : [posix.join(dir, entry.name)]));
}

/** The files a pattern of "documents" names. A star stands for one folder or file name. */
function expand(root, pattern) {
  const paths = pattern.split('/').reduce(
    (bases, segment) =>
      bases.flatMap(base => {
        if (!segment.includes('*')) return existsSync(join(root, base, segment)) ? [posix.join(base, segment)] : [];
        const dir = join(root, base);
        if (!existsSync(dir) || !statSync(dir).isDirectory()) return [];
        const name = new RegExp('^' + segment.split('*').map(escapeRegExp).join('[^/]*') + '$');
        return readdirSync(dir)
          .filter(entry => name.test(entry) && entry !== 'node_modules' && !entry.startsWith('.'))
          .sort()
          .map(entry => posix.join(base, entry));
      }),
    [''],
  );
  return paths.filter(path => isFile(join(root, path)));
}

/** Applies a change to every line of a document that is outside a fenced block. */
function mapProse(text, change) {
  let fence = null;
  return text
    .split('\n')
    .map(line => {
      const mark = /^\s*(`{3,}|~{3,})(.*)$/.exec(line);
      if (fence === null && mark) {
        fence = mark[1];
        return line;
      }
      if (fence !== null) {
        if (mark && mark[1].startsWith(fence) && mark[2].trim() === '') fence = null;
        return line;
      }
      return change(line);
    })
    .join('\n');
}

/** The heading texts of a document, in order. */
export function headingsOf(text) {
  const headings = [];
  mapProse(text, line => {
    const heading = /^ {0,3}#{1,6}\s+(.*?)\s*#*\s*$/.exec(line);
    if (heading) headings.push(heading[1]);
    return line;
  });
  return headings;
}

const numbered = slugs => {
  const seen = new Map();
  return slugs.map(slug => {
    const count = seen.get(slug) ?? 0;
    seen.set(slug, count + 1);
    return count === 0 ? slug : slug + '-' + count;
  });
};

/** The anchors the repository host gives the headings of a document. */
export function githubIds(headings) {
  return numbered(
    headings.map(text =>
      text
        .replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1')
        .replace(/[`*~]|(?<![\p{L}\p{N}])_+|_+(?![\p{L}\p{N}])/gu, '')
        .trim()
        .toLowerCase()
        .replace(/[^\p{L}\p{N}\p{M}\s_-]/gu, '')
        .replace(/\s/g, '-'),
    ),
  );
}

const ENTITIES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
const entities = (text, pattern) => text.replace(pattern, character => ENTITIES[character]);

/** A heading as the HTML Docsify's Markdown renderer hands to its heading renderer. */
function headingHtml(text) {
  const kept = [];
  const keep = html => MASK + (kept.push(html) - 1) + MASK;
  return text
    .replace(CODE_SPAN, span => {
      const code = span.replace(/^`+ ?| ?`+$/g, '');
      return keep('<code>' + entities(code, /[&<>"']/g) + '</code>');
    })
    .replace(/!\[[^\]]*\]\([^)]*\)/g, () => keep('<img>'))
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/<\/?[A-Za-z][^>]*>/g, keep)
    .replace(/\*\*|~~|\*|(?<![\p{L}\p{N}])_+|_+(?![\p{L}\p{N}])/gu, '')
    .replace(/[<>"']|&(?!#?\w+;)/g, character => ENTITIES[character])
    .replace(MASKED, (_, index) => kept[Number(index)]);
}

/** The ids Docsify 4 gives the headings of a document (its slugify, applied to the heading as HTML). */
export function docsifyIds(headings) {
  return numbered(
    headings.map(text =>
      headingHtml(text)
        .trim()
        .replace(/[A-Z]+/g, upper => upper.toLowerCase())
        .replace(/<[^>]+>/g, '')
        .replace(DOCSIFY_REMOVED, '')
        .replace(/\s/g, '-')
        .replace(/-+/g, '-')
        .replace(/^(\d)/, '_$1'),
    ),
  );
}

export function loadConfig(root) {
  const config = JSON.parse(read(join(root, 'docs/site.json')));
  for (const key of ['name', 'title', 'badge', 'description', 'repository', 'branch', 'languages', 'theme']) {
    if (config[key] === undefined) throw new Error('docs/site.json has no "' + key + '"');
  }
  return { documents: [], homes: [], keywords: '', ...config };
}

/** Every page of the site with the file it is written in, and every file copied as it is. */
export function planSite(root, config) {
  const [primary, ...others] = config.languages;
  const pages = [];
  const files = new Map();
  for (const source of filesUnder(root, 'docs/assets')) files.set(source, source.slice('docs/'.length));
  for (const language of config.languages) {
    for (const source of filesUnder(root, 'docs/' + language)) {
      const site = source.slice('docs/'.length);
      if (isPage(source)) pages.push({ source, language, written: language, site });
      else files.set(source, site);
    }
  }
  for (const pattern of config.documents) {
    for (const base of expand(root, pattern)) {
      if (others.some(language => base.endsWith('.' + language + '.md'))) continue;
      for (const language of config.languages) {
        const own = language === primary ? base : base.replace(/\.md$/, '.' + language + '.md');
        const source = isFile(join(root, own)) ? own : base;
        pages.push({ source, language, written: source === own ? language : primary, site: language + '/' + base });
      }
    }
  }
  const taken = new Set();
  for (const { site } of pages) {
    if (taken.has(site)) throw new Error('Two documents take the site path ' + site);
    taken.add(site);
  }
  return { pages, files };
}

function createSite(root, config, version) {
  const { pages, files } = planSite(root, config);
  const places = new Map();
  for (const page of pages) {
    if (!places.has(page.source)) places.set(page.source, new Map());
    places.get(page.source).set(page.language, page.site);
  }
  const ids = new Map();
  const idsOf = source => {
    if (!ids.has(source)) {
      const headings = headingsOf(read(join(root, source)));
      ids.set(source, { github: githubIds(headings), docsify: docsifyIds(headings) });
    }
    return ids.get(source);
  };
  const ref = /^\d+\.\d+\.\d+$/.test(version) ? 'v' + version : config.branch;
  return { root, config, version, ref, pages, files, places, idsOf, problems: [] };
}

/** The same document in another language, as a path from the repository root. */
function twinOf(source, language, config) {
  const [primary, ...others] = config.languages;
  const inDocs = /^docs\/([^/]+)\/(.*)$/.exec(source);
  if (inDocs && config.languages.includes(inDocs[1])) return 'docs/' + language + '/' + inDocs[2];
  const written = others.find(other => source.endsWith('.' + other + '.md'));
  const base = written ? source.slice(0, -('.' + written + '.md').length) + '.md' : source;
  return language === primary ? base : base.replace(/\.md$/, '.' + language + '.md');
}

/** Where a path of the repository is found by a reader of one page of the site. */
function locate(target, page, site) {
  const { root, config, places, files } = site;
  const [primary, ...others] = config.languages;
  const own = places.get(target);
  if (own) {
    if (own.has(page.language)) return { page: own.get(page.language), source: target };
    // A page published in a language it is not written in leads to that language where it can.
    const twin = twinOf(target, page.language, config);
    if (page.written !== page.language && places.get(twin)?.has(page.language)) {
      return { page: places.get(twin).get(page.language), source: twin, linked: target };
    }
    const [[, first]] = own;
    return { page: first, source: target };
  }
  const written = others.find(other => target.endsWith('.' + other + '.md'));
  if (config.homes.includes(twinOf(target, primary, config))) return { page: (written ?? page.language) + '/README.md' };
  if (files.has(target)) return { file: files.get(target) };
  const full = join(root, target);
  if (!existsSync(full)) return null;
  return { url: config.repository + (statSync(full).isDirectory() ? '/tree/' : '/blob/') + site.ref + '/' + target };
}

/** The Docsify id of the heading a repository-host anchor names. */
function headingId(found, anchor, site) {
  const wanted = decodeURIComponent(anchor).toLowerCase();
  const linked = site.idsOf(found.linked ?? found.source);
  const index = linked.github.indexOf(wanted);
  if (index < 0) return null;
  const shown = site.idsOf(found.source);
  // The same heading of the other language stands at the same position.
  return shown.docsify.length === linked.docsify.length ? shown.docsify[index] : null;
}

function rewriteLine(line, page, site) {
  const spans = [];
  const masked = line.replace(CODE_SPAN, span => MASK + (spans.push(span) - 1) + MASK);
  const problem = message => site.problems.push(page.source + ': ' + message);
  const resolve = path => posix.normalize(posix.join(posix.dirname(page.source), decodeURI(path))).replace(/\/$/, '');
  let read = 0;

  const rewriteLinks = text =>
    text.replace(LINK, (whole, bang, label, target, title = '') => {
      read += 1;
      const inner = label.includes('](') ? rewriteLinks(label) : label;
      const link = to => bang + '[' + inner + '](' + to + ')';
      if (EXTERNAL.test(target)) return link(target + title);
      const cut = target.indexOf('#');
      const path = cut < 0 ? target : target.slice(0, cut);
      const anchor = cut < 0 ? '' : target.slice(cut + 1);
      if (path === '') {
        const id = headingId({ source: page.source }, anchor, site);
        if (id === null) problem('no heading for ' + target);
        return link(id === null ? target + title : '#' + id + title);
      }
      if (path.startsWith('/')) {
        problem(target + ' starts at the site root: write a relative path');
        return link(target + title);
      }
      const found = locate(resolve(path), page, site);
      if (found === null) {
        problem(target + ' leads nowhere');
        return link(target + title);
      }
      if (found.url) return link(found.url + (anchor ? '#' + anchor : '') + title);
      if (found.file) return link(bang ? posix.relative(posix.dirname(page.site), found.file) + title : found.file + " ':ignore'");
      if (bang) {
        problem(target + ' is a document, not an image');
        return link(target + title);
      }
      if (anchor === '' || found.source === undefined) return link('/' + found.page + title);
      const id = headingId(found, anchor, site);
      if (id === null) problem('no heading for ' + target);
      return link(id === null ? target + title : '/' + found.page + '#' + id + title);
    });
  let result = rewriteLinks(masked);
  if (masked.split('](').length - 1 !== read) problem('a link the build cannot read in: ' + line.trim().slice(0, 80));

  result = result.replace(IMAGE_TAG, (whole, open, target, close) => {
    if (EXTERNAL.test(target) || target.startsWith('/')) return whole;
    const found = locate(resolve(target), page, site);
    if (found?.file) return open + found.file + close;
    if (found?.url) return open + found.url.replace('/blob/', '/raw/') + close;
    problem(target + ' leads nowhere');
    return whole;
  });
  return result.replace(MASKED, (_, index) => spans[Number(index)]);
}

function renderPage(page, site) {
  const body = mapProse(read(join(site.root, page.source)), line => rewriteLine(line, page, site));
  const url = site.config.repository + '/blob/' + site.ref + '/' + page.source;
  const label = SOURCE_LINK[page.language] ?? SOURCE_LINK.en;
  return body.replace(/\s*$/, '') + '\n\n---\n\n<p class="page-source"><a href="' + url + '" target="_blank" rel="noopener noreferrer">' + label + '</a></p>\n';
}

/** Each sidebar lists every page of its language once, and the sidebars agree on the order. */
function checkSidebars(site) {
  const orders = [];
  for (const language of site.config.languages) {
    const file = 'docs/' + language + '/_sidebar.md';
    if (!isFile(join(site.root, file))) {
      site.problems.push(file + ': missing');
      continue;
    }
    const listed = [...read(join(site.root, file)).matchAll(/\]\((\/[^)\s]+)\)/g)].map(found => found[1].slice(1));
    const pages = site.pages.filter(page => page.language === language).map(page => page.site);
    for (const entry of listed) if (!pages.includes(entry)) site.problems.push(file + ': /' + entry + ' is not a page of the site');
    for (const entry of pages) {
      const times = listed.filter(other => other === entry).length;
      if (times !== 1) site.problems.push(file + ': lists /' + entry + ' ' + times + ' times');
    }
    orders.push({ file, order: listed.map(entry => entry.slice(language.length + 1)) });
  }
  for (const { file, order } of orders.slice(1)) {
    if (order.join('\n') !== orders[0].order.join('\n')) site.problems.push(file + ': the order differs from ' + orders[0].file);
  }
}

/** A word of a shields.io badge: a hyphen and an underscore are doubled, and a space is an underscore. */
const badgeText = text => encodeURIComponent(text.replaceAll('-', '--').replaceAll('_', '__').replaceAll(' ', '_'));

const fill = (text, values, file) =>
  text.replace(/\{\{([A-Z_]+)\}\}/g, (whole, key) => {
    if (values[key] === undefined) throw new Error(file + ' names the unknown value ' + whole);
    return values[key];
  });

export function buildDocs({ root = REPOSITORY_ROOT, out = join(root, 'build-docs'), version } = {}) {
  const config = loadConfig(root);
  const built = version ?? process.env.DOCS_VERSION ?? JSON.parse(read(join(root, 'package.json'))).version;
  const site = createSite(root, config, built);
  const [primary] = config.languages;
  const values = {
    NAME: config.name,
    DESCRIPTION: config.description,
    KEYWORDS: config.keywords,
    REPOSITORY: config.repository,
    HOME: primary + '/README.md',
    VERSION: built,
    // shields.io reads a hyphen in a badge value as a separator, so it is doubled.
    VERSION_BADGE: built.replaceAll('-', '--'),
    TITLE: config.title,
    // A shields.io badge with the two words of the name, in the theme colour.
    BADGE: 'https://img.shields.io/badge/' + config.badge.map(badgeText).join('-') + '-' + config.theme.color.replace('#', '') + '?style=for-the-badge',
    THEME_COLOR: config.theme.color,
    THEME_COVER: config.theme.cover,
    THEME_COVER_TITLE: config.theme.coverTitle,
    THEME_COVER_TEXT: config.theme.coverText,
    THEME_BUTTON: config.theme.button,
    THEME_BUTTON_HOVER: config.theme.buttonHover,
  };

  rmSync(out, { recursive: true, force: true });
  mkdirSync(out, { recursive: true });
  writeFileSync(join(out, '.nojekyll'), '');
  for (const file of ['index.html', '_coverpage.md', '_navbar.md']) {
    writeFileSync(join(out, file), fill(read(join(root, 'docs', file)), values, 'docs/' + file));
  }
  for (const page of site.pages) {
    mkdirSync(dirname(join(out, page.site)), { recursive: true });
    writeFileSync(join(out, page.site), renderPage(page, site));
  }
  for (const [source, target] of site.files) {
    mkdirSync(dirname(join(out, target)), { recursive: true });
    cpSync(join(root, source), join(out, target));
  }
  checkSidebars(site);
  // The site opens in the first language, so its sidebar is also the one of the root.
  const sidebar = join(root, 'docs', primary, '_sidebar.md');
  if (isFile(sidebar)) cpSync(sidebar, join(out, '_sidebar.md'));
  return { version: built, ref: site.ref, pages: site.pages.length, files: site.files.size, problems: site.problems };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const result = buildDocs();
  console.log('Documentation site for ' + result.version + ': ' + result.pages + ' pages, ' + result.files + ' other files, in build-docs/');
  for (const problem of result.problems) console.error('  ' + problem);
  if (result.problems.length > 0) {
    console.error('\u2716 ' + result.problems.length + ' problems');
    process.exit(1);
  }
}
