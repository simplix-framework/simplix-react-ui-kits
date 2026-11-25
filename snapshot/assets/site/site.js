/*
 * The shared behaviour of every SimpliX documentation site: the header with the library, version
 * and language switches, the collapsible sidebar, and the Docsify settings.
 * Reads window.SIMPLIX_SITE (this site), window.SIMPLIX_PRODUCTS (every library) and
 * window.SimplixVersions (the path arithmetic of version folders).
 */
(function () {
  'use strict';

  var SITE = window.SIMPLIX_SITE || {};
  var PRODUCTS = window.SIMPLIX_PRODUCTS || [];
  var FOLDER = window.SIMPLIX_FOLDER || {};
  var VERSIONS = window.SimplixVersions || null;
  var LANGUAGES = (FOLDER.languages && FOLDER.languages.length ? FOLDER.languages : SITE.languages) || ['en'];
  var LANGUAGE_KEY = 'simplix-docs-language';
  var GROUPS_KEY = 'simplix-docs-groups:' + (SITE.id || '');
  var LANGUAGE_NAMES = { en: 'English', ko: '한국어' };
  var TEXT = {
    en: {
      search: 'Search the documents', noData: 'No results', previous: 'Previous', next: 'Next',
      copy: 'Copy', copied: 'Copied', copyError: 'Error', version: 'Version', development: 'Development',
      language: 'Language', libraries: 'Libraries', expand: 'Expand all', collapse: 'Collapse all',
      repository: 'Repository on GitHub', menu: 'Navigation'
    },
    ko: {
      search: '문서 검색', noData: '결과 없음', previous: '이전', next: '다음',
      copy: '복사', copied: '완료', copyError: '오류', version: '버전', development: '개발 버전',
      language: '언어', libraries: '라이브러리', expand: '모두 펼치기', collapse: '모두 접기',
      repository: 'GitHub 저장소', menu: '탐색'
    }
  };

  function currentProduct() {
    for (var i = 0; i < PRODUCTS.length; i++) if (PRODUCTS[i].id === SITE.id) return PRODUCTS[i];
    return { id: SITE.id, name: SITE.title, accent: '#0f766e' };
  }

  function routeLanguage(hash) {
    var match = /^#\/([a-z]{2})(?:\/|$|\?)/.exec(hash || '');
    return match && LANGUAGES.indexOf(match[1]) >= 0 ? match[1] : null;
  }

  function preferredLanguage() {
    var stored = null;
    try { stored = window.localStorage.getItem(LANGUAGE_KEY); } catch (error) { stored = null; }
    if (stored && LANGUAGES.indexOf(stored) >= 0) return stored;
    var browser = (window.navigator.language || '').slice(0, 2).toLowerCase();
    return LANGUAGES.indexOf(browser) >= 0 ? browser : LANGUAGES[0];
  }

  function language() {
    return routeLanguage(window.location.hash) || preferredLanguage();
  }

  function text() {
    return TEXT[language()] || TEXT.en;
  }

  function rememberLanguage(value) {
    try { window.localStorage.setItem(LANGUAGE_KEY, value); } catch (error) { /* a private window keeps no preference */ }
  }

  /* A route without a language opens the home of the preferred language. */
  function normaliseRoute() {
    if (!routeLanguage(window.location.hash)) window.location.replace('#/' + preferredLanguage() + '/');
  }

  function element(tag, className, content) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (content) node.textContent = content;
    return node;
  }

  /* The file a route names, for asking whether another language or version has the page. */
  function routeFile(hash) {
    var value = (hash || '').replace(/^#/, '').split('?')[0];
    var match = /^\/([a-z]{2})\/((?:[A-Za-z0-9._-]+\/)*)([A-Za-z0-9._-]+)?$/.exec(value);
    if (!match) return null;
    var name = match[3] ? match[3].replace(/\.md$/, '') : 'README';
    return match[1] + '/' + match[2] + name + '.md';
  }

  function exists(url) {
    return window.fetch(url, { method: 'HEAD', cache: 'no-cache' })
      .then(function (response) { return response.ok; })
      .catch(function () { return false; });
  }

  // ---------------------------------------------------------------- header

  var header = null;
  var versionEntries = [];

  function buildHeader() {
    if (header) return;
    header = element('header', 'sx-header');

    var menu = element('button', 'sx-menu');
    menu.type = 'button';
    menu.innerHTML = '<span></span><span></span><span></span>';
    menu.addEventListener('click', function (event) {
      // Docsify closes the sidebar on any click that reaches the body of a narrow screen.
      event.stopPropagation();
      document.body.classList.toggle('close');
    });
    header.appendChild(menu);

    var brand = element('a', 'sx-brand');
    var logo = element('img');
    logo.src = 'assets/site/simplix-logo.png';
    logo.alt = 'SimpliX';
    brand.appendChild(logo);
    header.appendChild(brand);

    // A div, not a nav: the base theme positions every nav element as its own top bar.
    var products = element('div', 'sx-products');
    products.setAttribute('role', 'navigation');
    PRODUCTS.forEach(function (item) {
      var link = element('a', null, item.name);
      link.dataset.product = item.id;
      link.style.setProperty('--sx-dot', item.accent);
      if (item.id === SITE.id) link.setAttribute('aria-current', 'true');
      products.appendChild(link);
    });
    header.appendChild(products);

    var tools = element('div', 'sx-tools');
    var version = element('select', 'sx-select sx-version');
    version.hidden = true;
    version.addEventListener('change', function () { openVersion(version.value); });
    tools.appendChild(version);

    var languages = element('div', 'sx-languages');
    LANGUAGES.forEach(function (code) {
      var button = element('button', null, code === 'ko' ? '한국어' : code.toUpperCase());
      button.type = 'button';
      button.dataset.language = code;
      button.title = LANGUAGE_NAMES[code] || code;
      button.addEventListener('click', function () { openLanguage(code); });
      languages.appendChild(button);
    });
    if (LANGUAGES.length > 1) tools.appendChild(languages);

    if (SITE.repository) {
      var repository = element('a', 'sx-repository');
      repository.href = SITE.repository;
      repository.target = '_blank';
      repository.rel = 'noopener';
      repository.innerHTML = '<svg viewBox="0 0 16 16" width="20" height="20" aria-hidden="true"><path fill="currentColor" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8z"/></svg>';
      tools.appendChild(repository);
    }
    header.appendChild(tools);
    document.body.insertBefore(header, document.body.firstChild);
    document.documentElement.style.setProperty('--sx-accent', currentProduct().accent);
    loadVersions();
  }

  function updateHeader() {
    if (!header) return;
    var lang = language();
    var words = text();
    header.querySelector('.sx-brand').href = '#/' + lang + '/';
    header.querySelector('.sx-products').setAttribute('aria-label', words.libraries);
    Array.prototype.forEach.call(header.querySelectorAll('.sx-products a'), function (link) {
      var item = PRODUCTS.filter(function (entry) { return entry.id === link.dataset.product; })[0];
      link.href = item.id === SITE.id ? '#/' + lang + '/' : item.url + '#/' + lang + '/';
      link.title = item.kind ? (item.kind[lang] || item.kind.en) : item.name;
    });
    Array.prototype.forEach.call(header.querySelectorAll('.sx-languages button'), function (button) {
      button.setAttribute('aria-pressed', button.dataset.language === lang ? 'true' : 'false');
    });
    var languages = header.querySelector('.sx-languages');
    if (languages) languages.setAttribute('aria-label', words.language);
    var repository = header.querySelector('.sx-repository');
    if (repository) { repository.title = words.repository; repository.setAttribute('aria-label', words.repository); }
    renderVersions();
  }

  // ---------------------------------------------------------------- versions

  function versionContext() {
    return VERSIONS ? VERSIONS.context(window.location.href) : null;
  }

  function loadVersions() {
    var context = versionContext();
    if (!context) return; // a local preview of one build has no sibling versions
    window.fetch(new URL('versions.json', context.base), { cache: 'no-cache' })
      .then(function (response) { return response.ok ? response.json() : null; })
      .then(function (manifest) {
        if (!manifest) return;
        versionEntries = VERSIONS.versions(manifest);
        renderVersions();
      })
      .catch(function () { versionEntries = []; });
  }

  function renderVersions() {
    var context = versionContext();
    var select = header && header.querySelector('.sx-version');
    if (!select || !context) return;
    var options = versionEntries.slice();
    if (options.indexOf(context.current) < 0) options.unshift(context.current);
    select.innerHTML = '';
    options.forEach(function (name) {
      var option = element('option', null, name === 'snapshot' ? text().development : 'v' + name);
      option.value = name;
      option.selected = name === context.current;
      select.appendChild(option);
    });
    select.title = text().version;
    select.setAttribute('aria-label', text().version);
    select.hidden = options.length < 2;
  }

  function openVersion(name) {
    var context = versionContext();
    if (!context || name === context.current) return;
    var folder = new URL(name + '/', context.base);
    var file = routeFile(window.location.hash);
    var home = '#/' + language() + '/';
    (file ? exists(new URL(file, folder)) : Promise.resolve(false)).then(function (found) {
      folder.hash = found ? window.location.hash : home;
      window.location.assign(folder.href);
    });
  }

  // ---------------------------------------------------------------- languages

  function openLanguage(code) {
    rememberLanguage(code);
    if (code === language()) return;
    var hash = window.location.hash.split('?')[0].replace(/^#\/[a-z]{2}(?=\/|$)/, '#/' + code);
    var file = routeFile(hash);
    (file ? exists(file) : Promise.resolve(false)).then(function (found) {
      window.location.hash = found ? hash : '#/' + code + '/';
    });
  }

  // ---------------------------------------------------------------- sidebar

  function storedGroups() {
    try { return JSON.parse(window.sessionStorage.getItem(GROUPS_KEY) || '{}'); } catch (error) { return {}; }
  }

  function storeGroup(title, open) {
    var groups = storedGroups();
    groups[title] = open;
    try { window.sessionStorage.setItem(GROUPS_KEY, JSON.stringify(groups)); } catch (error) { /* no storage */ }
  }

  function setGroup(item, open) {
    item.classList.toggle('sx-open', open);
    var button = item.querySelector(':scope > .sx-group-title');
    if (button) button.setAttribute('aria-expanded', open ? 'true' : 'false');
  }

  /* Every top-level entry with children becomes a group that opens and closes. */
  function enhanceSidebar() {
    var nav = document.querySelector('.sidebar-nav');
    if (!nav) return;
    var list = nav.querySelector(':scope > ul');
    if (!list) return;
    var stored = storedGroups();
    var groups = [];
    // A short sidebar is shown whole; a long one opens the group of the page being read.
    var short = nav.querySelectorAll('a').length <= 40;
    Array.prototype.forEach.call(list.children, function (item) {
      var children = item.querySelector(':scope > ul');
      if (!children) return;
      var heading = item.querySelector(':scope > strong, :scope > p');
      var title = heading ? heading.textContent.trim() : '';
      if (!title) return;
      var button = item.querySelector(':scope > .sx-group-title');
      if (!button) {
        button = element('button', 'sx-group-title', title);
        button.type = 'button';
        button.addEventListener('click', function () {
          var open = !item.classList.contains('sx-open');
          setGroup(item, open);
          storeGroup(title, open);
        });
        item.insertBefore(button, item.firstChild);
        if (heading) heading.remove();
      }
      item.classList.add('sx-group');
      var active = !!item.querySelector('li.active, a.active');
      setGroup(item, active || stored[title] === true || (stored[title] === undefined && short));
      groups.push({ item: item, title: title });
    });

    var controls = nav.querySelector('.sx-tree-controls');
    if (!controls && groups.length > 1) {
      controls = element('div', 'sx-tree-controls');
      [true, false].forEach(function (open) {
        var button = element('button');
        button.type = 'button';
        button.dataset.open = String(open);
        button.addEventListener('click', function () {
          Array.prototype.forEach.call(nav.querySelectorAll('.sx-group'), function (item) {
            setGroup(item, open);
            var label = item.querySelector(':scope > .sx-group-title');
            if (label) storeGroup(label.textContent, open);
          });
        });
        controls.appendChild(button);
      });
      nav.insertBefore(controls, nav.firstChild);
    }
    if (controls) {
      controls.querySelector('[data-open="true"]').textContent = text().expand;
      controls.querySelector('[data-open="false"]').textContent = text().collapse;
    }
    if (!nav.querySelector('.sx-group.sx-open') && groups.length > 0) setGroup(groups[0].item, true);
    var current = nav.querySelector('li.active');
    if (current && current.scrollIntoView && !isVisibleIn(current, document.querySelector('.sidebar'))) {
      current.scrollIntoView({ block: 'center' });
    }
  }

  function isVisibleIn(node, container) {
    if (!container) return true;
    var inner = node.getBoundingClientRect();
    var outer = container.getBoundingClientRect();
    return inner.top >= outer.top && inner.bottom <= outer.bottom;
  }

  // ---------------------------------------------------------------- page

  function decoratePage() {
    var section = document.querySelector('.markdown-section');
    if (!section) return;
    // A table wider than the page scrolls inside its own box.
    Array.prototype.forEach.call(section.querySelectorAll(':scope > table'), function (table) {
      var box = element('div', 'sx-table');
      table.parentNode.insertBefore(box, table);
      box.appendChild(table);
    });
    // A note that opens with a status symbol takes the colour of that symbol.
    Array.prototype.forEach.call(section.querySelectorAll('blockquote'), function (quote) {
      var first = quote.textContent.trim().charAt(0);
      if (first === '\u26A0') quote.classList.add('sx-warning');
      else if (first === '\u2139') quote.classList.add('sx-note');
    });
    Array.prototype.forEach.call(section.querySelectorAll('a[href^="http"]'), function (link) {
      if (link.host !== window.location.host) { link.target = '_blank'; link.rel = 'noopener'; }
    });
  }

  function updateTexts() {
    var words = text();
    document.documentElement.lang = language();
    var input = document.querySelector('.search input[type="search"]');
    if (input) input.placeholder = words.search;
    var previous = document.querySelector('.pagination-item--previous .pagination-item-label span');
    var next = document.querySelector('.pagination-item--next .pagination-item-label span');
    if (previous) previous.textContent = words.previous;
    if (next) next.textContent = words.next;
    var menu = document.querySelector('.sx-menu');
    if (menu) { menu.setAttribute('aria-label', words.menu); menu.title = words.menu; }
  }

  /* On a narrow screen the sidebar covers the page, so choosing a page closes it. */
  function closeSidebarOnNarrowScreens() {
    if (window.matchMedia('(max-width: 768px)').matches) document.body.classList.remove('close');
  }

  // ---------------------------------------------------------------- docsify

  function aliases() {
    var map = {};
    LANGUAGES.forEach(function (code) {
      map['/' + code + '/(.*/)?_sidebar.md'] = code + '/_sidebar.md';
    });
    map['/(.*/)?_sidebar.md'] = LANGUAGES[0] + '/_sidebar.md';
    return map;
  }

  function byLanguage(key, fallbackKey) {
    var map = {};
    LANGUAGES.forEach(function (code) { map['/' + code + '/'] = (TEXT[code] || TEXT.en)[key]; });
    map['/'] = TEXT[LANGUAGES[0]] ? TEXT[LANGUAGES[0]][key] : TEXT.en[fallbackKey || key];
    return map;
  }

  normaliseRoute();
  window.addEventListener('hashchange', normaliseRoute);
  window.addEventListener('keydown', function (event) {
    var target = event.target;
    var typing = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);
    if (event.key === '/' && !typing) {
      var input = document.querySelector('.search input[type="search"]');
      if (input) { event.preventDefault(); input.focus(); }
    }
  });

  var words = text();
  window.$docsify = {
    name: SITE.title || 'SimpliX',
    nameLink: '#/' + language() + '/',
    loadSidebar: true,
    loadNavbar: false,
    coverpage: false,
    auto2top: true,
    maxLevel: 4,
    subMaxLevel: 2,
    noEmoji: true,
    themeColor: currentProduct().accent,
    homepage: preferredLanguage() + '/README.md',
    alias: aliases(),
    search: {
      maxAge: 86400000,
      paths: 'auto',
      placeholder: byLanguage('search'),
      noData: byLanguage('noData'),
      depth: 3,
      hideOtherSidebarContent: true,
      namespace: (SITE.id || 'simplix') + '-docs-' + window.location.pathname.replace(/index\.html$/, ''),
      pathNamespaces: LANGUAGES.map(function (code) { return '/' + code; })
    },
    pagination: { previousText: words.previous, nextText: words.next, crossChapter: true, crossChapterText: true },
    copyCode: { buttonText: words.copy, errorText: words.copyError, successText: words.copied },
    plugins: [
      function (hook) {
        hook.init(buildHeader);
        hook.doneEach(function () {
          var route = routeLanguage(window.location.hash);
          if (route) rememberLanguage(route);
          updateHeader();
          enhanceSidebar();
          decoratePage();
          updateTexts();
          closeSidebarOnNarrowScreens();
        });
        hook.ready(function () {
          enhanceSidebar();
          updateTexts();
        });
      }
    ]
  };
})();
