/* Каркас: маршрутизация по hash, оболочки «сайт» и «кабинет», делегирование действий. */
(function () {
  const I = U.icon;
  U.pages = U.pages || {};
  U.actions = U.actions || {};
  const ROUTES = [
    ['', 'home'], ['join', 'join'], ['sources', 'sources'],
    ['creators', 'catalog'], ['creators/:id', 'creator'],
    ['orders', 'orders'], ['orders/:id', 'order'],
    ['campaigns', 'campaigns'], ['campaigns/new', 'builder'], ['campaigns/:id', 'campaign'],
    ['studio', 'studio'], ['studio/profile', 'studioProfile'], ['studio/settings', 'studioSettings'],
    ['messages', 'messages'], ['messages/:id', 'messages'], ['library', 'library'],
    ['payments', 'payments'], ['admin', 'admin'], ['admin/ticket/:order/:id', 'ticket'],
  ];

  function parse() {
    const raw = location.hash.replace(/^#\/?/, '');
    const [path, qs] = raw.split('?');
    const parts = path.split('/').filter(Boolean);
    const query = Object.fromEntries(new URLSearchParams(qs || ''));
    for (const [pattern, name] of ROUTES) {
      const pp = pattern.split('/').filter(Boolean);
      if (pp.length !== parts.length) continue;
      const params = {};
      let ok = true;
      pp.forEach((seg, i) => {
        if (seg.startsWith(':')) params[seg.slice(1)] = decodeURIComponent(parts[i]);
        else if (seg !== parts[i]) ok = false;
      });
      if (ok) return { name, params, query, path };
    }
    return { name: 'notfound', params: {}, query, path };
  }

  U.go = (path) => { location.hash = '#/' + path.replace(/^#?\/?/, ''); };
  U.route = null;

  /* ---------- Логотип ---------- */
  U.logo = function (dark) {
    return '<a class="logo' + (dark ? ' logo-dark' : '') + '" href="#/" aria-label="' + U.esc(U.config.brandName) + ' — на главную">' +
      '<span class="logo-mark" aria-hidden="true"><span></span></span>' +
      '<span class="logo-word">' + U.esc(U.config.brandName) + '</span></a>';
  };

  /* ---------- Полоса прототипа ---------- */
  function protoBar() {
    const s = U.store.s;
    const role = s.role;
    const r = (id, t) => '<button type="button" aria-pressed="' + (role === id) + '" data-action="set-role" data-role="' + id + '">' + t + '</button>';
    const me = U.q.creator(s.creatorSelf);
    return '<div class="protobar on-dark" role="region" aria-label="Режим прототипа">' +
      '<div class="protobar-in">' +
      '<span class="protobar-flag" title="Прототип: данные демонстрационные">' + I('flag', 'icon-sm') + '<span class="long">Прототип · данные демонстрационные</span><span class="short" aria-hidden="true">Демо</span><span class="sr-only">Прототип, данные демонстрационные</span></span>' +
      '<div class="protobar-role"><span class="protobar-label" id="role-l">Смотреть как</span>' +
      '<div class="segmented segmented-dark" role="group" aria-labelledby="role-l">' + r('brand', 'Заказчик') + r('creator', 'Креатор') + r('admin', 'Админ') + '</div></div>' +
      '<span class="protobar-who">' + (role === 'brand' ? 'Северный уход' : role === 'creator' ? U.esc(me.name) : 'Модератор') + '</span>' +
      '<button type="button" class="protobar-reset" data-action="reset-demo" aria-label="Сбросить демо-данные">' + I('refresh', 'icon-sm') + '<span aria-hidden="true">Сбросить данные</span></button>' +
      '</div></div>';
  }

  /* ---------- Оболочка сайта ---------- */
  function siteHeader() {
    return '<header class="site-header"><div class="wrap site-header-in">' + U.logo() +
      '<nav class="site-nav" aria-label="Основная навигация">' +
      '<a href="#/?s=examples" data-scroll="examples">Примеры</a>' +
      '<a href="#/creators">Креаторы</a>' +
      '<a href="#/?s=how" data-scroll="how">Как это работает</a>' +
      '<a href="#/?s=pricing" data-scroll="pricing">Стоимость</a>' +
      '<a href="#/?s=for-creators" data-scroll="for-creators">Креаторам</a></nav>' +
      '<div class="site-header-actions"><a class="btn btn-ghost btn-sm hide-sm" href="#/orders">Кабинет</a>' +
      '<a class="btn btn-primary btn-sm" href="#/campaigns/new">Заказать видео</a>' +
      '<button class="btn btn-ghost btn-icon btn-sm show-sm" type="button" data-action="site-menu" aria-label="Меню" aria-expanded="false">' + I('menu') + '</button></div>' +
      '</div></header>';
  }
  function siteFooter() {
    return '<footer class="site-footer on-dark"><div class="wrap">' +
      '<div class="footer-grid">' +
      '<div>' + U.logo(true) + '<p class="footer-note">Рабочее название — временное обозначение для прототипа. Все люди, компании, заказы и суммы на сайте вымышлены и показаны для демонстрации.</p></div>' +
      '<nav aria-label="Разделы"><h2 class="footer-h">Заказчикам</h2><a href="#/campaigns/new">Заказать видео</a><a href="#/creators">Каталог креаторов</a><a href="#/orders/o-1048">Пример заказа</a></nav>' +
      '<nav aria-label="Креаторам"><h2 class="footer-h">Креаторам</h2><a href="#/join">Стать креатором</a><a href="#/studio" data-action="as-creator">Кабинет креатора</a></nav>' +
      '<nav aria-label="Прототип"><h2 class="footer-h">Прототип</h2><a href="#/sources">Источники фото и видео</a><a href="#/admin" data-action="as-admin">Админ-панель</a></nav>' +
      '</div><p class="footer-bottom">© ' + new Date().getFullYear() + ' ' + U.esc(U.config.brandName) + ' · прототип интерфейса</p></div></footer>';
  }

  /* ---------- Оболочка кабинета ---------- */
  const NAV = {
    brand: [['campaigns', 'Кампании', 'layers'], ['creators', 'Креаторы', 'users'], ['orders', 'Заказы', 'briefcase'], ['library', 'Материалы', 'film'], ['messages', 'Сообщения', 'message'], ['payments', 'Платежи', 'wallet']],
    creator: [['studio', 'Мой кабинет', 'grid'], ['orders', 'Заказы', 'briefcase'], ['studio/profile', 'Профиль и услуги', 'user'], ['studio/settings', 'Адрес и выплаты', 'settings'], ['messages', 'Сообщения', 'message'], ['payments', 'Выплаты', 'wallet']],
    admin: [['admin', 'Модерация', 'shield'], ['orders', 'Все заказы', 'briefcase'], ['payments', 'Платежи', 'wallet'], ['creators', 'Креаторы', 'users']],
  };
  function navCount(key) {
    const s = U.store.s;
    const role = s.role;
    if (key === 'studio') {
      const n = s.offers.filter((x) => x.creatorId === s.creatorSelf && x.status === 'pending').length;
      return n ? '<span class="nav-count num" aria-label="' + n + ' новых приглашений">' + n + '</span>' : '';
    }
    if (key === 'orders') {
      const n = U.q.ordersFor(role).filter((o) => U.q.actor(o) === role).length;
      return n ? '<span class="nav-count num" aria-label="' + n + ' требуют действия">' + n + '</span>' : '';
    }
    if (key === 'admin') {
      let tk = 0;
      s.orders.forEach((o) => (o.tickets || []).forEach((t) => { if (t.status !== 'resolved') tk++; }));
      const n = s.signups.filter((x) => x.status === 'pending').length + s.creators.filter((c) => c.verification === 'pending').length + s.orders.filter((o) => o.payment.payoutStatus === 'processing').length + tk;
      return n ? '<span class="nav-count num">' + n + '</span>' : '';
    }
    return '';
  }
  function appNav(route) {
    const role = U.store.s.role;
    const p = route.path;
    const cur = (key) => (key.includes('/') ? p === key : p.split('/')[0] === key && !(key === 'studio' && p !== 'studio'));
    return NAV[role].map(([key, label, icon]) =>
      '<a class="nav-item" href="#/' + key + '"' + (cur(key) ? ' aria-current="page"' : '') + '>' + I(icon) + '<span>' + label + '</span>' + navCount(key) + '</a>'
    ).join('');
  }
  function appShell(route, page, html) {
    const role = U.store.s.role;
    return '<div class="app">' +
      '<aside class="app-side" aria-label="Навигация кабинета">' + U.logo() +
      '<nav class="app-nav">' + appNav(route) + '</nav>' +
      (role === 'brand' ? '<a class="btn btn-primary btn-block" href="#/campaigns/new">' + I('plus') + 'Новая кампания</a>' : '') +
      '<a class="app-side-foot" href="#/">' + I('arrow-left', 'icon-sm') + 'На главную</a></aside>' +
      '<div class="app-main">' +
      '<div class="app-topbar"><button class="btn btn-ghost btn-icon btn-sm show-md" type="button" data-action="app-menu" aria-label="Открыть навигацию">' + I('menu') + '</button>' +
      '<span class="show-md">' + U.logo() + '</span></div>' +
      '<main id="main" tabindex="-1">' + html + '</main></div></div>';
  }

  /* Русская типографика: короткие предлоги и союзы не остаются в конце строки */
  const SHORT = /(^|[\s(«])(в|во|и|к|с|со|у|о|об|а|на|не|ни|по|за|до|из|от|без|для|что|как|при|или|но|же)\s+/gi;
  U.typograph = function (root) {
    root.querySelectorAll('h1, h2, h3, p, .t-lead, dd, li, .hint').forEach((el) => {
      const w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
      let n;
      while ((n = w.nextNode())) {
        if (n.nodeValue.length > 2) n.nodeValue = n.nodeValue.replace(SHORT, '$1$2 ').replace(SHORT, '$1$2 ');
      }
    });
  };

  /* ---------- Рендер ---------- */
  function render(keepScroll) {
    const route = parse();
    U.route = route;
    const page = U.pages[route.name] || U.pages.notfound;
    let html;
    try { html = page.render(route.params, route.query); }
    catch (e) { console.error(e); html = U.pages.notfound.render({}, {}, 'Не удалось открыть страницу: ' + U.esc(e.message)); }
    const root = document.getElementById('root');
    const y = window.scrollY;
    const focusId = keepScroll && document.activeElement ? document.activeElement.id : null;
    root.innerHTML = protoBar() + (page.shell === 'site'
      ? siteHeader() + '<main id="main" tabindex="-1">' + html + '</main>' + siteFooter()
      : appShell(route, page, html));
    U.typograph(root);
    document.title = (page.title ? (typeof page.title === 'function' ? page.title(route.params) : page.title) + ' — ' : '') + U.config.brandName;
    page.mount && page.mount(root.querySelector('#main'), route.params, route.query);
    if (keepScroll) {
      window.scrollTo(0, y);
      if (focusId) { const f = document.getElementById(focusId); if (f) f.focus({ preventScroll: true }); }
    } else {
      const sec = route.query.s && document.getElementById(route.query.s);
      if (sec) sec.scrollIntoView();
      else window.scrollTo(0, 0);
    }
  }
  U.rerender = () => render(true);
  let lastPath = null;
  window.addEventListener('hashchange', () => {
    const p = parse();
    const samePage = lastPath === p.path && p.name === 'home';
    lastPath = p.path;
    if (samePage && p.query.s) { const el = document.getElementById(p.query.s); if (el) { el.scrollIntoView({ behavior: U.reduceMotion() ? 'auto' : 'smooth' }); return; } }
    render(false);
    const h = document.querySelector('#main h1');
    if (h) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); }
  });

  /* ---------- Делегирование действий ---------- */
  document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-action]');
    if (!el) return;
    const fn = U.actions[el.dataset.action];
    if (fn) fn(el, e);
  });

  Object.assign(U.actions, {
    'set-role'(el) {
      const role = el.dataset.role;
      U.store.update((s) => { s.role = role; });
      const name = U.route.name;
      // Страницы, которые зависят от роли, перерисовываем; разделы чужой роли — переводим
      const own = { studio: 'creator', studioProfile: 'creator', studioSettings: 'creator', admin: 'admin', ticket: 'admin', campaigns: 'brand', builder: 'brand', campaign: 'brand', library: 'brand' };
      if (own[name] && own[name] !== role && !(own[name] === 'brand' && role === 'admin' && name !== 'builder')) {
        U.go(role === 'creator' ? 'studio' : role === 'admin' ? 'admin' : 'campaigns');
      } else U.rerender();
      U.toast('Роль переключена', role === 'brand' ? 'Вы смотрите как заказчик «Северный уход»' : role === 'creator' ? 'Вы смотрите как креатор ' + U.q.creator(U.store.s.creatorSelf).name : 'Вы смотрите как модератор платформы');
    },
    'as-creator'() { U.store.update((s) => { s.role = 'creator'; }); },
    'as-admin'() { U.store.update((s) => { s.role = 'admin'; }); },
    async 'reset-demo'() {
      const ok = await U.confirm({ title: 'Сбросить демо-данные?', text: 'Все изменения в заказах, кампаниях и сообщениях вернутся к исходному состоянию прототипа.', ok: 'Сбросить' });
      if (!ok) return;
      U.store.reset();
      U.rerender();
      U.toast('Данные сброшены', 'Прототип вернулся к исходному сценарию');
    },
    play(el) { U.lightbox(el.dataset.media, el.dataset.caption); },
    'app-menu'() {
      const side = document.querySelector('.app-side').cloneNode(true);
      openDrawer('Навигация', side.innerHTML, 'left');
    },
    'site-menu'() {
      const links = document.querySelector('.site-nav').innerHTML;
      openDrawer('Меню', '<nav class="drawer-nav" aria-label="Меню">' + links + '<a href="#/orders">Кабинет</a><a href="#/join">Стать креатором</a></nav>', 'right');
    },
  });

  /* Простая выдвижная панель (для мобильной навигации) */
  function openDrawer(title, html, side) {
    const opener = document.activeElement;
    const back = document.createElement('div');
    back.className = 'drawer-backdrop';
    const d = document.createElement('div');
    d.className = 'drawer' + (side === 'left' ? ' drawer-left' : '');
    d.setAttribute('role', 'dialog'); d.setAttribute('aria-modal', 'true'); d.setAttribute('aria-label', title);
    d.innerHTML = '<div class="drawer-head"><h2>' + title + '</h2><button class="btn btn-ghost btn-icon btn-sm" type="button" data-close aria-label="Закрыть">' + I('x') + '</button></div><div class="drawer-body drawer-nav-wrap">' + html + '</div>';
    document.body.append(back, d);
    const close = () => { back.remove(); d.remove(); document.removeEventListener('keydown', onKey); if (opener) opener.focus(); };
    const onKey = (e) => { if (e.key === 'Escape') close(); trapTab(e, d); };
    back.addEventListener('click', close);
    d.addEventListener('click', (e) => { if (e.target.closest('[data-close]') || e.target.closest('a')) close(); });
    document.addEventListener('keydown', onKey);
    d.querySelector('[data-close]').focus();
    return { el: d, close };
  }
  U.openDrawer = openDrawer;
  function trapTab(e, root) {
    if (e.key !== 'Tab') return;
    const f = [...root.querySelectorAll('a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])')].filter((x) => x.offsetParent !== null);
    if (!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
  U.trapTab = trapTab;

  /* 404 */
  U.pages.notfound = {
    shell: 'site', title: 'Страница не найдена',
    render: (p, q, msg) => '<section class="wrap page-pad"><div class="empty">' + I('search') + '<h1 class="t-h2">Страница не найдена</h1><p>' + (msg || 'Возможно, ссылка устарела или заказ был удалён при сбросе демо-данных.') + '</p><a class="btn btn-primary" href="#/">На главную</a></div></section>',
  };

  /* Старт */
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  document.addEventListener('DOMContentLoaded', () => {
    U.store.init();
    lastPath = parse().path;
    render(false);
    if (!U.store.storageOk()) U.toast('Состояние не сохраняется', 'Браузер запретил локальное хранилище — изменения пропадут после обновления', 'error');
  });
})();
