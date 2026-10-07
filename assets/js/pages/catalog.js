/* Каталог креаторов: фильтры и сортировка меняют выдачу, состояние — в адресе. */
(function () {
  const I = U.icon, E = U.esc;
  const LANGS = ['русский', 'английский', 'татарский', 'башкирский', 'корейский'];
  const SORTS = [['rec', 'Рекомендуемые'], ['rating', 'По рейтингу'], ['price-asc', 'Сначала дешевле'], ['price-desc', 'Сначала дороже'], ['orders', 'Больше заказов']];
  const DEF = { q: '', fmt: 'ugc', topics: [], city: '', lang: '', presence: [], max: '', verified: false, sort: 'rec' };

  function readFilters(query) {
    return {
      q: query.q || '', fmt: query.fmt || 'ugc',
      topics: query.topics ? query.topics.split(',') : [], city: query.city || '', lang: query.lang || '',
      presence: query.presence ? query.presence.split(',') : [], max: query.max || '',
      verified: query.verified === '1', sort: query.sort || 'rec',
    };
  }
  function toQuery(f) {
    const p = new URLSearchParams();
    if (f.q) p.set('q', f.q);
    if (f.fmt !== 'ugc') p.set('fmt', f.fmt);
    if (f.topics.length) p.set('topics', f.topics.join(','));
    if (f.city) p.set('city', f.city);
    if (f.lang) p.set('lang', f.lang);
    if (f.presence.length) p.set('presence', f.presence.join(','));
    if (f.max) p.set('max', f.max);
    if (f.verified) p.set('verified', '1');
    if (f.sort !== 'rec') p.set('sort', f.sort);
    const s = p.toString();
    return s ? '?' + s : '';
  }
  function apply(f) {
    const q = f.q.trim().toLowerCase();
    let list = U.store.s.creators.filter((c) => {
      if (q && !(c.name.toLowerCase().includes(q) || c.topics.join(' ').toLowerCase().includes(q) || c.city.toLowerCase().includes(q))) return false;
      if (f.fmt === 'publish' && !U.q.minPrice(c, 'publish')) return false;
      if (f.topics.length && !f.topics.some((t) => c.topics.includes(t))) return false;
      if (f.city && c.city !== f.city) return false;
      if (f.lang && !c.langs.includes(f.lang)) return false;
      if (f.presence.length && !f.presence.every((p) => c.presence.includes(p))) return false;
      if (f.max && priceOf(c, f) > Number(f.max)) return false;
      if (f.verified && c.verification !== 'verified') return false;
      return true;
    });
    const by = {
      rec: (a, b) => (b.verification === 'verified') - (a.verification === 'verified') || (b.rating || 0) * Math.log(b.completed + 2) - (a.rating || 0) * Math.log(a.completed + 2),
      rating: (a, b) => (b.rating || 0) - (a.rating || 0) || b.completed - a.completed,
      'price-asc': (a, b) => priceOf(a, f) - priceOf(b, f),
      'price-desc': (a, b) => priceOf(b, f) - priceOf(a, f),
      orders: (a, b) => b.completed - a.completed,
    }[f.sort] || (() => 0);
    return list.sort(by);
  }
  /* Цена той услуги, которую выбрал заказчик: UGC или публикация */
  function priceOf(c, f) { return (f.fmt === 'publish' ? U.q.minPrice(c, 'publish') : U.q.ugcPrice(c).price) || 0; }
  function activeCount(f) {
    return f.topics.length + f.presence.length + (f.city ? 1 : 0) + (f.lang ? 1 : 0) + (f.max ? 1 : 0) + (f.verified ? 1 : 0) + (f.fmt !== 'ugc' ? 1 : 0);
  }

  function filterForm(px, f) {
    const cities = [...new Set(U.store.s.creators.map((c) => c.city))].sort();
    const cnt = (pred) => U.store.s.creators.filter(pred).length;
    return '<form class="filters" data-filters novalidate onsubmit="return false">' +
      '<fieldset><legend>Формат</legend><div class="segmented" role="group" aria-label="Формат">' +
      '<button type="button" data-fmt="ugc" aria-pressed="' + (f.fmt === 'ugc') + '">Без публикации</button>' +
      '<button type="button" data-fmt="publish" aria-pressed="' + (f.fmt === 'publish') + '">С публикацией</button></div>' +
      '<span class="hint">' + (f.fmt === 'ugc' ? 'Видео остаются у вас — главное портфолио.' : 'Креатор публикует ролик у себя — важна аудитория.') + '</span></fieldset>' +
      '<fieldset><legend>Тематика</legend><div class="chips">' + U.TOPICS.map((t) => {
        const n = cnt((c) => c.topics.includes(t));
        return n ? '<button type="button" class="chip" data-topic="' + E(t) + '" aria-pressed="' + f.topics.includes(t) + '">' + E(t) + ' <span class="count">' + n + '</span></button>' : '';
      }).join('') + '</div></fieldset>' +
      '<fieldset><legend>Подача в кадре</legend>' + Object.entries(U.PRESENCE).map(([k, v]) =>
        '<label class="check"><input type="checkbox" name="presence" value="' + k + '"' + (f.presence.includes(k) ? ' checked' : '') + '>' + v + '</label>').join('') + '</fieldset>' +
      '<div class="field"><label for="' + px + 'city">Город</label><select class="select" id="' + px + 'city" name="city"><option value="">Любой</option>' + cities.map((c) => '<option' + (f.city === c ? ' selected' : '') + '>' + E(c) + '</option>').join('') + '</select></div>' +
      '<div class="field"><label for="' + px + 'lang">Язык</label><select class="select" id="' + px + 'lang" name="lang"><option value="">Любой</option>' + LANGS.map((c) => '<option' + (f.lang === c ? ' selected' : '') + '>' + c + '</option>').join('') + '</select></div>' +
      '<div class="field"><label for="' + px + 'max">Гонорар до</label><div class="input-group"><input class="input num" id="' + px + 'max" name="max" type="number" inputmode="numeric" min="0" step="500" placeholder="Без ограничений" value="' + E(f.max) + '"><span class="input-affix">₽</span></div><span class="hint">' + (f.fmt === 'publish' ? 'Цена услуги с публикацией у креатора' : 'Цена видео без публикации') + '</span></div>' +
      '<label class="check"><input type="checkbox" name="verified"' + (f.verified ? ' checked' : '') + '>Только с завершённой проверкой</label>' +
      '<button type="button" class="btn btn-sm" data-reset-filters' + (activeCount(f) ? '' : ' disabled') + '>Сбросить фильтры</button>' +
      '</form>';
  }

  function card(c, f) {
    const pub = f.fmt === 'publish' && c.audience;
    const works = c.portfolio.slice(0, 3);
    const pubList = pub ? '<ul class="svc-list" aria-label="Услуги с публикацией">' + U.q.services(c, 'publish').map((x) => '<li><span>' + E(x.title) + '</span>' + U.money(x.price) + '</li>').join('') + '</ul>' : '';
    const audience = c.audience ? '<dl class="audience audience-2" aria-label="Аудитория (демо)"><div><dt>Подписчики · ' + E(c.audience.platform) + '</dt><dd>' + U.num(c.audience.followers) + '</dd></div><div><dt>Средний охват</dt><dd>' + U.num(c.audience.reach) + '</dd></div></dl><span class="audience-geo">География: ' + E(c.audience.geo) + ' · демо-данные</span>' : '';
    return '<article class="ccard">' +
      '<div class="ccard-works">' + works.map((w, i) => U.frame(w.media, { w: i === 0 ? 400 : 240, cls: i ? 'frame-sm' : '', caption: w.title, zoom: true, creator: c.id, label: i === 0 ? E(w.format) : '' })).join('') + '</div>' +
      '<div class="ccard-body">' +
      '<div class="ccard-name">' + U.avatar(c, 40) + '<div style="min-width:0"><h2>' + E(c.name) + '</h2><span class="muted">' + I('pin', 'icon-sm') + E(c.city) + '</span></div></div>' +
      (pub ? audience + pubList : '') +
      '<div class="row-wrap">' + c.topics.map((t) => '<span class="tag">' + E(t) + '</span>').join('') + '</div>' +
      '<div class="ccard-meta"><span class="row" style="gap:6px">' + I('lang', 'icon-sm') + E(c.langs.join(', ')) + '</span><span class="muted">' + c.presence.map((p) => U.PRESENCE[p]).join(' · ') + '</span></div>' +
      '<div class="ccard-meta">' + U.ratingLine(c) + '</div>' +
      U.verifyLine(c) +
      (!pub && U.q.minPrice(c, 'publish') ? '<span class="small muted">Также есть публикация: ' + E(c.audience.platform) + ', от ' + U.moneyText(U.q.minPrice(c, 'publish')) + '</span>' : '') +
      (!U.q.canShipTo(c) ? '<p class="notice notice-warning small">' + I('alert') + '<span>Заказ с отправкой товара — после проверки документов</span></p>' : '') +
      '</div>' +
      '<div class="ccard-foot"><div class="ccard-price">' + (f.fmt === 'publish' ? 'С публикацией' : U.q.ugcPrice(c).label) + '<b>от ' + U.money(priceOf(c, f)) + '</b></div>' +
      '<a class="btn btn-dark btn-sm" href="#/creators/' + c.id + '">Посмотреть профиль</a></div>' +
      '</article>';
  }

  function results(f) {
    const list = apply(f);
    const chips = [];
    if (f.fmt !== 'ugc') chips.push(['fmt', '', 'С публикацией']);
    f.topics.forEach((t) => chips.push(['topics', t, t]));
    f.presence.forEach((p) => chips.push(['presence', p, U.PRESENCE[p]]));
    if (f.city) chips.push(['city', '', f.city]);
    if (f.lang) chips.push(['lang', '', 'Язык: ' + f.lang]);
    if (f.max) chips.push(['max', '', 'До ' + U.moneyText(Number(f.max))]);
    if (f.verified) chips.push(['verified', '', 'Проверенные']);
    if (f.q) chips.push(['q', '', '«' + f.q + '»']);
    const chipHtml = chips.length ? '<div class="active-filters" aria-label="Активные фильтры">' + chips.map(([k, v, t]) =>
      '<button type="button" class="chip" data-remove="' + k + '" data-value="' + E(v) + '" aria-label="Убрать фильтр: ' + E(t) + '">' + E(t) + I('x') + '</button>').join('') +
      '<button type="button" class="btn btn-ghost btn-sm" data-reset-filters>Сбросить всё</button></div>' : '';
    const body = list.length
      ? '<div class="cards">' + list.map((c) => card(c, f)).join('') + '</div>'
      : '<div class="empty">' + I('search') + '<h3>Никого не нашли</h3><p>Под выбранные условия нет креаторов. Попробуйте убрать часть фильтров или увеличить гонорар.</p><button class="btn btn-primary" type="button" data-reset-filters>Сбросить фильтры</button></div>';
    return chipHtml + '<p class="result-count" role="status" style="margin-bottom:12px">Найдено: <b class="num">' + list.length + '</b> ' + U.plural(list.length, ['креатор', 'креатора', 'креаторов']) + (f.fmt === 'publish' ? ' с публикацией' : '') + '</p>' + body;
  }

  let F = Object.assign({}, DEF);

  U.pages.catalog = {
    shell: 'app',
    title: 'Каталог креаторов',
    render(p, query) {
      F = readFilters(query);
      return '<div class="page"><div class="page-head"><div><h1>Креаторы</h1><p class="sub">Выбирайте по работам: откройте кадр, чтобы посмотреть видео целиком.</p></div></div>' +
        '<div class="catalog"><aside class="filters-desktop" aria-label="Фильтры">' + filterForm('fd-', F) + '</aside>' +
        '<section aria-label="Результаты"><div class="catalog-bar">' +
        '<div class="search">' + I('search') + '<label class="sr-only" for="cat-q">Поиск по имени, тематике или городу</label><input class="input" id="cat-q" type="search" placeholder="Имя, тематика или город" value="' + E(F.q) + '" autocomplete="off"></div>' +
        '<button class="btn filters-mobile" type="button" data-open-filters>' + I('sliders') + 'Фильтры' + (activeCount(F) ? ' <span class="nav-count">' + activeCount(F) + '</span>' : '') + '</button>' +
        '<label class="sr-only" for="cat-sort">Сортировка</label><select class="select" id="cat-sort">' + SORTS.map(([v, t]) => '<option value="' + v + '"' + (F.sort === v ? ' selected' : '') + '>' + t + '</option>').join('') + '</select></div>' +
        '<div id="cat-results">' + results(F) + '</div></section></div></div>';
    },
    mount(root) {
      const set = (patch, opts = {}) => {
        F = Object.assign({}, F, patch);
        history.replaceState(null, '', '#/creators' + toQuery(F));
        root.querySelector('#cat-results').innerHTML = results(F);
        if (!opts.keepForm) {
          document.querySelectorAll('form[data-filters]').forEach((form) => {
            const px = form.closest('.drawer') ? 'fm-' : 'fd-';
            const tmp = document.createElement('div');
            tmp.innerHTML = filterForm(px, F);
            form.replaceWith(tmp.firstChild);
          });
          bindForms(document);
        }
        const mb = root.querySelector('[data-open-filters]');
        if (mb) mb.innerHTML = I('sliders') + 'Фильтры' + (activeCount(F) ? ' <span class="nav-count">' + activeCount(F) + '</span>' : '');
        if (drawer) drawer.el.querySelector('[data-show-n]').textContent = 'Показать: ' + apply(F).length;
      };
      U.catalogSet = set;
      function bindForms(scope) {
        scope.querySelectorAll('form[data-filters]').forEach((form) => {
          if (form.dataset.bound) return;
          form.dataset.bound = '1';
          form.addEventListener('click', (e) => {
            const fmt = e.target.closest('[data-fmt]');
            const tp = e.target.closest('[data-topic]');
            if (fmt) { set({ fmt: fmt.dataset.fmt }); focusSame(fmt, '[data-fmt="' + fmt.dataset.fmt + '"]'); }
            if (tp) {
              const t = tp.dataset.topic;
              set({ topics: F.topics.includes(t) ? F.topics.filter((x) => x !== t) : F.topics.concat(t) });
              focusSame(tp, '[data-topic="' + CSS.escape(t) + '"]');
            }
          });
          form.addEventListener('change', (e) => {
            const el = e.target;
            if (el.name === 'presence') set({ presence: [...form.querySelectorAll('[name=presence]:checked')].map((x) => x.value) }, { keepForm: true });
            if (el.name === 'city') set({ city: el.value }, { keepForm: true });
            if (el.name === 'lang') set({ lang: el.value }, { keepForm: true });
            if (el.name === 'verified') set({ verified: el.checked }, { keepForm: true });
            syncReset();
          });
          form.querySelector('[name=max]').addEventListener('input', (e) => {
            const v = e.target.value;
            if (v === '' || Number(v) >= 0) { set({ max: v }, { keepForm: true }); syncReset(); }
          });
        });
      }
      function syncReset() {
        document.querySelectorAll('form[data-filters] [data-reset-filters]').forEach((b) => { b.disabled = !activeCount(F); });
      }
      function focusSame(el, sel) {
        const inDrawer = !!el.closest('.drawer');
        const scope = inDrawer ? document.querySelector('.drawer') : root.querySelector('.filters-desktop');
        const n = scope && scope.querySelector(sel);
        if (n) n.focus();
      }
      bindForms(root);
      let t;
      root.querySelector('#cat-q').addEventListener('input', (e) => { clearTimeout(t); t = setTimeout(() => set({ q: e.target.value }, { keepForm: true }), 150); });
      root.querySelector('#cat-sort').addEventListener('change', (e) => set({ sort: e.target.value }, { keepForm: true }));
      let drawer = null;
      document.addEventListener('click', onDoc);
      function onDoc(e) {
        if (!document.body.contains(root)) { document.removeEventListener('click', onDoc); return; }
        if (e.target.closest('[data-reset-filters]')) {
          set(Object.assign({}, DEF, { q: '' }));
          root.querySelector('#cat-q').value = '';
          syncReset();
          U.toast('Фильтры сброшены', 'Показаны все креаторы');
        }
        const rm = e.target.closest('[data-remove]');
        if (rm) {
          const k = rm.dataset.remove, v = rm.dataset.value;
          const patch = {};
          if (k === 'topics' || k === 'presence') patch[k] = F[k].filter((x) => x !== v);
          else if (k === 'fmt') patch.fmt = 'ugc';
          else if (k === 'verified') patch.verified = false;
          else patch[k] = '';
          if (k === 'q') root.querySelector('#cat-q').value = '';
          set(patch);
          const next = root.querySelector('#cat-results [data-remove]') || root.querySelector('#cat-q');
          next.focus();
        }
        if (e.target.closest('[data-open-filters]')) {
          drawer = U.openDrawer('Фильтры', filterForm('fm-', F), 'right');
          const foot = document.createElement('div');
          foot.className = 'drawer-foot';
          foot.innerHTML = '<button class="btn btn-primary btn-block" type="button" data-close data-show-n>Показать: ' + apply(F).length + '</button>';
          drawer.el.appendChild(foot);
          foot.querySelector('button').addEventListener('click', () => { drawer.close(); drawer = null; });
          bindForms(drawer.el);
        }
      }
    },
  };
})();
